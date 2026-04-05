import { describe, it, expect } from 'vitest';
import { getRollDistribution, getAllKeepMasks } from '../probability.js';
import { createNpcStrategy } from '../npc-strategy.js';
import type { ScoreCard, Category } from '../../types/game.js';

function emptyScoreCard(): ScoreCard {
  return {
    ones: null, twos: null, threes: null, fours: null, fives: null, sixes: null,
    fullHouse: null, fourOfAKind: null, littleStraight: null, bigStraight: null,
    choice: null, yacht: null,
  };
}

function almostFullScoreCard(openCategory: Category): ScoreCard {
  const card = emptyScoreCard();
  const allCategories: Category[] = [
    'ones', 'twos', 'threes', 'fours', 'fives', 'sixes',
    'fullHouse', 'fourOfAKind', 'littleStraight', 'bigStraight', 'choice', 'yacht',
  ];
  for (const cat of allCategories) {
    if (cat !== openCategory) {
      card[cat] = 0;
    }
  }
  return card;
}

// ===== probability.ts =====

describe('getRollDistribution', () => {
  it('1個のダイスで6パターン返す', () => {
    const dist = getRollDistribution(1);
    expect(dist.size).toBe(6);
    // 各パターンは1通りずつ
    for (const count of dist.values()) {
      expect(count).toBe(1);
    }
  });

  it('2個のダイスで21パターン返し合計36になる', () => {
    const dist = getRollDistribution(2);
    expect(dist.size).toBe(21);
    let total = 0;
    for (const count of dist.values()) {
      total += count;
    }
    expect(total).toBe(36);
  });

  it('0個のダイスで空文字キーの1パターンを返す', () => {
    const dist = getRollDistribution(0);
    expect(dist.size).toBe(1);
    expect(dist.get('')).toBe(1);
  });
});

describe('getAllKeepMasks', () => {
  it('32パターン返す', () => {
    const masks = getAllKeepMasks();
    expect(masks.length).toBe(32);
  });

  it('各マスクは5要素のboolean配列', () => {
    const masks = getAllKeepMasks();
    for (const mask of masks) {
      expect(mask.length).toBe(5);
      for (const val of mask) {
        expect(typeof val).toBe('boolean');
      }
    }
  });

  it('全false（全振り直し）と全true（全キープ）を含む', () => {
    const masks = getAllKeepMasks();
    expect(masks.some((m) => m.every((v) => !v))).toBe(true);
    expect(masks.some((m) => m.every((v) => v))).toBe(true);
  });
});

// ===== npc-strategy.ts =====

describe('createNpcStrategy', () => {
  const difficulties = ['easy', 'normal', 'hard', 'expert'] as const;

  for (const difficulty of difficulties) {
    describe(`${difficulty}`, () => {
      it('rollCount=3でtype="score"と空きカテゴリを返す', () => {
        const strategy = createNpcStrategy(difficulty);
        const scoreCard = emptyScoreCard();
        const decision = strategy.decide([1, 2, 3, 4, 5], 3, scoreCard);

        expect(decision.type).toBe('score');
        expect(decision.category).toBeDefined();
        // 空きカテゴリであること
        expect(scoreCard[decision.category!]).toBeNull();
      });

      it('rollCount=1でtype="keep"またはtype="score"を返す', () => {
        const strategy = createNpcStrategy(difficulty);
        const scoreCard = emptyScoreCard();
        const decision = strategy.decide([3, 3, 3, 2, 1], 1, scoreCard);

        expect(['keep', 'score']).toContain(decision.type);
        if (decision.type === 'keep') {
          expect(decision.keepMask).toBeDefined();
          expect(decision.keepMask!.length).toBe(5);
        } else {
          expect(decision.category).toBeDefined();
          expect(scoreCard[decision.category!]).toBeNull();
        }
      });

      it('カテゴリが1つだけ空いている場合、そのカテゴリに記入する', () => {
        const strategy = createNpcStrategy(difficulty);
        const scoreCard = almostFullScoreCard('choice');
        const decision = strategy.decide([1, 2, 3, 4, 5], 3, scoreCard);

        expect(decision.type).toBe('score');
        expect(decision.category).toBe('choice');
      });
    });
  }
});

describe('EasyStrategy', () => {
  it('rollCount=3で最低スコアのカテゴリを選ぶ', () => {
    const strategy = createNpcStrategy('easy');
    const scoreCard = emptyScoreCard();
    // [6,6,6,6,6] → sixes=30, yacht=50 が高い。easy は最低を選ぶ
    const decision = strategy.decide([6, 6, 6, 6, 6], 3, scoreCard);

    expect(decision.type).toBe('score');
    expect(decision.category).toBeDefined();
    // 0点のカテゴリ（fullHouse, littleStraight, bigStraightなど）を選ぶはず
    const zeroCategories: Category[] = [
      'ones', 'twos', 'threes', 'fours', 'fives',
      'fullHouse', 'littleStraight', 'bigStraight',
    ];
    expect(zeroCategories).toContain(decision.category!);
  });
});

describe('NormalStrategy', () => {
  it('rollCount=3で最高スコアのカテゴリを選ぶ', () => {
    const strategy = createNpcStrategy('normal');
    const scoreCard = emptyScoreCard();
    // [6,6,6,6,6] → yacht=50 が最高
    const decision = strategy.decide([6, 6, 6, 6, 6], 3, scoreCard);

    expect(decision.type).toBe('score');
    expect(decision.category).toBe('yacht');
  });

  it('[1,2,3,4,5]ではbigStraight(30)を選ぶ', () => {
    const strategy = createNpcStrategy('normal');
    const scoreCard = emptyScoreCard();
    const decision = strategy.decide([1, 2, 3, 4, 5], 3, scoreCard);

    expect(decision.type).toBe('score');
    expect(decision.category).toBe('bigStraight');
  });
});

describe('ExpertStrategy', () => {
  it('ヨットが出たらyachtカテゴリに記入する', () => {
    const strategy = createNpcStrategy('expert');
    const scoreCard = emptyScoreCard();
    const decision = strategy.decide([4, 4, 4, 4, 4], 3, scoreCard);

    expect(decision.type).toBe('score');
    expect(decision.category).toBe('yacht');
  });

  it('yachtが記入済みなら他のカテゴリを選ぶ', () => {
    const strategy = createNpcStrategy('expert');
    const scoreCard = emptyScoreCard();
    scoreCard.yacht = 50;
    const decision = strategy.decide([4, 4, 4, 4, 4], 3, scoreCard);

    expect(decision.type).toBe('score');
    expect(decision.category).not.toBe('yacht');
    expect(scoreCard[decision.category!]).toBeNull();
  });
});
