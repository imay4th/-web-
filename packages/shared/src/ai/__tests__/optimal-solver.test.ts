import { describe, it, expect, beforeAll } from 'vitest';
import {
  solveOptimalTable,
  serializeTable,
  deserializeTable,
  lookupValue,
} from '../optimal-solver.js';
import { createNpcStrategy } from '../npc-strategy.js';
import type { ScoreCard, Category } from '../../types/game.js';

function emptyScoreCard(): ScoreCard {
  return {
    ones: null, twos: null, threes: null, fours: null, fives: null, sixes: null,
    fullHouse: null, fourOfAKind: null, littleStraight: null, bigStraight: null,
    choice: null, yacht: null,
  };
}

// テーブル計算は一度だけ (~8秒)
let table: Float64Array;

beforeAll(() => {
  table = solveOptimalTable();
}, 60000);

// ===== ソルバー単体テスト =====

describe('solveOptimalTable', () => {
  it('基底ケース: 全カテゴリ記入済み + ボーナスあり → 35', () => {
    expect(lookupValue(table, 0xFFF, 63)).toBe(35);
  });

  it('基底ケース: 全カテゴリ記入済み + ボーナスなし → 0', () => {
    expect(lookupValue(table, 0xFFF, 0)).toBe(0);
    expect(lookupValue(table, 0xFFF, 62)).toBe(0);
  });

  it('ゲーム開始時の最適期待値が185〜200の範囲', () => {
    const startValue = lookupValue(table, 0, 0);
    expect(startValue).toBeGreaterThan(185);
    expect(startValue).toBeLessThan(200);
  });

  it('カテゴリ記入が増えると残り期待値が減少する', () => {
    const allOpen = lookupValue(table, 0, 0);
    const onesFilled = lookupValue(table, 0x001, 0);
    expect(allOpen).toBeGreaterThan(onesFilled);
  });

  it('上段小計63以上でボーナス35が反映される', () => {
    // 上段全記入済み (bits 0-5) でu=63のとき、下段の残り期待値にボーナス35が含まれる
    const upperFilled = 0b000000111111;
    const withBonus = lookupValue(table, upperFilled, 63);
    const withoutBonus = lookupValue(table, upperFilled, 62);
    expect(withBonus - withoutBonus).toBeCloseTo(35, 5);
  });

  it('同じbitmaskで上段小計が高い方が期待値が同等以上', () => {
    // 適当なbitmask（onesのみ記入済み）で比較
    const bitmask = 0x001;
    const low = lookupValue(table, bitmask, 0);
    const high = lookupValue(table, bitmask, 5);
    expect(high).toBeGreaterThanOrEqual(low);
  });

  it('対称性: 全カテゴリ空き + u=0 がテーブルの先頭', () => {
    expect(table[0]).toBe(lookupValue(table, 0, 0));
  });
});

// ===== シリアライズ =====

describe('serializeTable / deserializeTable', () => {
  it('ラウンドトリップでテーブル値が保持される', () => {
    const serialized = serializeTable(table);
    const restored = deserializeTable(serialized);

    expect(restored.length).toBe(table.length);
    // ゲーム開始時の値
    expect(restored[0]).toBeCloseTo(table[0], 10);
    // ボーナス基底ケース
    expect(restored[0xFFF * 64 + 63]).toBe(35);
    // ボーナスなし基底ケース
    expect(restored[0xFFF * 64 + 0]).toBe(0);
  });

  it('テーブルサイズが2MB (4096 * 64 * 8 + 8)', () => {
    const serialized = serializeTable(table);
    expect(serialized.length).toBe(4096 * 64 * 8 + 8);
  });

  it('不正なマジックバイトで例外', () => {
    const bad = new Uint8Array([0, 0, 0, 0, 1, 0, 16, 64]);
    expect(() => deserializeTable(bad)).toThrow('bad magic');
  });

  it('短すぎるバッファで例外', () => {
    const bad = new Uint8Array([0x59, 0x4F, 0x50]);
    expect(() => deserializeTable(bad)).toThrow('too short');
  });
});

// ===== lookupValue =====

describe('lookupValue', () => {
  it('upperSubが63超でも63にクランプされる', () => {
    expect(lookupValue(table, 0xFFF, 100)).toBe(lookupValue(table, 0xFFF, 63));
  });
});

// ===== ExpertStrategy + テーブル統合テスト =====

describe('ExpertStrategy with optimal table', () => {
  it('ヨット → yachtカテゴリに記入', () => {
    const strategy = createNpcStrategy('expert', table);
    const scoreCard = emptyScoreCard();
    const decision = strategy.decide([5, 5, 5, 5, 5], 3, scoreCard);
    expect(decision.type).toBe('score');
    expect(decision.category).toBe('yacht');
  });

  it('1カテゴリのみ空き → そのカテゴリに記入', () => {
    const strategy = createNpcStrategy('expert', table);
    const scoreCard = emptyScoreCard();
    const allCategories: Category[] = [
      'ones', 'twos', 'threes', 'fours', 'fives', 'sixes',
      'fullHouse', 'fourOfAKind', 'littleStraight', 'bigStraight', 'choice', 'yacht',
    ];
    for (const cat of allCategories) {
      if (cat !== 'choice') scoreCard[cat] = 0;
    }
    const decision = strategy.decide([3, 3, 4, 4, 5], 3, scoreCard);
    expect(decision.type).toBe('score');
    expect(decision.category).toBe('choice');
  });

  it('B.ストレート完成時にbigStraightを選択（空きなら）', () => {
    const strategy = createNpcStrategy('expert', table);
    const scoreCard = emptyScoreCard();
    const decision = strategy.decide([1, 2, 3, 4, 5], 3, scoreCard);
    expect(decision.type).toBe('score');
    expect(decision.category).toBe('bigStraight');
  });

  it('rollCount=1で有効な判断を返す', () => {
    const strategy = createNpcStrategy('expert', table);
    const scoreCard = emptyScoreCard();
    const decision = strategy.decide([1, 2, 3, 4, 5], 1, scoreCard);
    expect(['keep', 'score']).toContain(decision.type);
    if (decision.type === 'keep') {
      expect(decision.keepMask).toBeDefined();
      expect(decision.keepMask!.length).toBe(5);
    }
  });

  it('rollCount=2で有効な判断を返す', () => {
    const strategy = createNpcStrategy('expert', table);
    const scoreCard = emptyScoreCard();
    const decision = strategy.decide([3, 3, 3, 2, 1], 2, scoreCard);
    expect(['keep', 'score']).toContain(decision.type);
  });

  it('テーブルなし（フォールバック）でも正常動作', () => {
    const strategy = createNpcStrategy('expert');
    const scoreCard = emptyScoreCard();
    const decision = strategy.decide([4, 4, 4, 4, 4], 3, scoreCard);
    expect(decision.type).toBe('score');
    expect(decision.category).toBe('yacht');
  });
});
