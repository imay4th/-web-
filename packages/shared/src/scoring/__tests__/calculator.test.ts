import { describe, it, expect } from 'vitest';
import {
  calculateScore,
  calculatePossibleScores,
  calculateTotalScore,
  calculateUpperSubtotal,
  calculateBonus,
} from '../calculator.js';
import type { ScoreCard } from '../../types/game.js';

describe('calculateScore', () => {
  // ========== 上段（数字カテゴリ） ==========

  describe('ones', () => {
    it('1が含まれる場合、1の個数分を返す', () => {
      expect(calculateScore([1, 1, 3, 4, 5], 'ones')).toBe(2);
    });

    it('1が0個の場合、0を返す', () => {
      expect(calculateScore([2, 3, 4, 5, 6], 'ones')).toBe(0);
    });

    it('全て1の場合、5を返す', () => {
      expect(calculateScore([1, 1, 1, 1, 1], 'ones')).toBe(5);
    });
  });

  describe('twos', () => {
    it('2の個数×2を返す', () => {
      expect(calculateScore([2, 2, 2, 4, 5], 'twos')).toBe(6);
    });

    it('2が0個の場合、0を返す', () => {
      expect(calculateScore([1, 3, 4, 5, 6], 'twos')).toBe(0);
    });
  });

  describe('threes', () => {
    it('3の個数×3を返す', () => {
      expect(calculateScore([3, 3, 1, 2, 4], 'threes')).toBe(6);
    });
  });

  describe('fours', () => {
    it('4の個数×4を返す', () => {
      expect(calculateScore([4, 4, 4, 4, 1], 'fours')).toBe(16);
    });
  });

  describe('fives', () => {
    it('5の個数×5を返す', () => {
      expect(calculateScore([5, 5, 5, 5, 5], 'fives')).toBe(25);
    });

    it('5が0個の場合、0を返す', () => {
      expect(calculateScore([1, 2, 3, 4, 6], 'fives')).toBe(0);
    });
  });

  describe('sixes', () => {
    it('6の個数×6を返す', () => {
      expect(calculateScore([6, 6, 1, 2, 3], 'sixes')).toBe(12);
    });

    it('全て6の場合、30を返す', () => {
      expect(calculateScore([6, 6, 6, 6, 6], 'sixes')).toBe(30);
    });
  });

  // ========== 下段（役カテゴリ） ==========

  describe('fullHouse', () => {
    it('3個+2個の正常ケース: 全ダイス合計を返す', () => {
      expect(calculateScore([1, 1, 1, 2, 2], 'fullHouse')).toBe(7);
    });

    it('別の正常ケース', () => {
      expect(calculateScore([5, 5, 3, 3, 3], 'fullHouse')).toBe(19);
    });

    it('4個+1個は不正: 0を返す', () => {
      expect(calculateScore([1, 1, 1, 1, 2], 'fullHouse')).toBe(0);
    });

    it('全て同じ5個は不正: 0を返す', () => {
      expect(calculateScore([3, 3, 3, 3, 3], 'fullHouse')).toBe(0);
    });

    it('バラバラは不正: 0を返す', () => {
      expect(calculateScore([1, 2, 3, 4, 5], 'fullHouse')).toBe(0);
    });
  });

  describe('fourOfAKind', () => {
    it('4個同じ: その目×4を返す', () => {
      expect(calculateScore([3, 3, 3, 3, 1], 'fourOfAKind')).toBe(12);
    });

    it('5個同じも4個としてカウント: その目×4を返す', () => {
      expect(calculateScore([2, 2, 2, 2, 2], 'fourOfAKind')).toBe(8);
    });

    it('3個以下は不正: 0を返す', () => {
      expect(calculateScore([3, 3, 3, 1, 2], 'fourOfAKind')).toBe(0);
    });
  });

  describe('littleStraight', () => {
    it('1,2,3,4,5で15点', () => {
      expect(calculateScore([1, 2, 3, 4, 5], 'littleStraight')).toBe(15);
    });

    it('順序がバラバラでも成立', () => {
      expect(calculateScore([5, 3, 1, 4, 2], 'littleStraight')).toBe(15);
    });

    it('4連続があれば成立（1-2-3-4）', () => {
      expect(calculateScore([1, 2, 3, 4, 6], 'littleStraight')).toBe(15);
    });

    it('4連続があれば成立（2-3-4-5）', () => {
      expect(calculateScore([2, 3, 4, 5, 5], 'littleStraight')).toBe(15);
    });

    it('4連続があれば成立（3-4-5-6）', () => {
      expect(calculateScore([3, 3, 4, 5, 6], 'littleStraight')).toBe(15);
    });

    it('2,3,4,5,6も4連続を含むので成立', () => {
      expect(calculateScore([2, 3, 4, 5, 6], 'littleStraight')).toBe(15);
    });

    it('3連続以下は不正: 0を返す', () => {
      expect(calculateScore([1, 2, 3, 5, 6], 'littleStraight')).toBe(0);
    });

    it('バラバラは不正: 0を返す', () => {
      expect(calculateScore([1, 3, 5, 2, 6], 'littleStraight')).toBe(0);
    });
  });

  describe('bigStraight', () => {
    it('2,3,4,5,6で30点', () => {
      expect(calculateScore([2, 3, 4, 5, 6], 'bigStraight')).toBe(30);
    });

    it('1,2,3,4,5で30点', () => {
      expect(calculateScore([1, 2, 3, 4, 5], 'bigStraight')).toBe(30);
    });

    it('順序がバラバラでも成立', () => {
      expect(calculateScore([6, 4, 2, 5, 3], 'bigStraight')).toBe(30);
    });

    it('4連続では不正: 0を返す', () => {
      expect(calculateScore([1, 2, 3, 4, 6], 'bigStraight')).toBe(0);
    });

    it('重複ありで5連続に満たない場合: 0を返す', () => {
      expect(calculateScore([1, 2, 3, 4, 4], 'bigStraight')).toBe(0);
    });
  });

  describe('choice', () => {
    it('常に全ダイス合計を返す', () => {
      expect(calculateScore([1, 2, 3, 4, 5], 'choice')).toBe(15);
    });

    it('全て同じでも合計を返す', () => {
      expect(calculateScore([6, 6, 6, 6, 6], 'choice')).toBe(30);
    });

    it('最小値の場合', () => {
      expect(calculateScore([1, 1, 1, 1, 1], 'choice')).toBe(5);
    });
  });

  describe('yacht', () => {
    it('5個全同じで50点', () => {
      expect(calculateScore([4, 4, 4, 4, 4], 'yacht')).toBe(50);
    });

    it('1が5個でも50点', () => {
      expect(calculateScore([1, 1, 1, 1, 1], 'yacht')).toBe(50);
    });

    it('4個同じは不正: 0を返す', () => {
      expect(calculateScore([4, 4, 4, 4, 1], 'yacht')).toBe(0);
    });

    it('バラバラは不正: 0を返す', () => {
      expect(calculateScore([1, 2, 3, 4, 5], 'yacht')).toBe(0);
    });
  });
});

describe('calculatePossibleScores', () => {
  it('全カテゴリのスコアを一括計算する', () => {
    const dice = [1, 1, 1, 2, 2];
    const scores = calculatePossibleScores(dice);

    expect(scores.ones).toBe(3);
    expect(scores.twos).toBe(4);
    expect(scores.threes).toBe(0);
    expect(scores.fours).toBe(0);
    expect(scores.fives).toBe(0);
    expect(scores.sixes).toBe(0);
    expect(scores.fullHouse).toBe(7);
    expect(scores.fourOfAKind).toBe(0);
    expect(scores.littleStraight).toBe(0);
    expect(scores.bigStraight).toBe(0);
    expect(scores.choice).toBe(7);
    expect(scores.yacht).toBe(0);
  });

  it('ヨットの場合は複数カテゴリで得点', () => {
    const dice = [3, 3, 3, 3, 3];
    const scores = calculatePossibleScores(dice);

    expect(scores.threes).toBe(15);
    expect(scores.fourOfAKind).toBe(12);
    expect(scores.choice).toBe(15);
    expect(scores.yacht).toBe(50);
    expect(scores.fullHouse).toBe(0); // 5個同じはフルハウスではない
  });
});

describe('calculateUpperSubtotal', () => {
  it('上段6カテゴリの小計を返す', () => {
    const scoreCard: ScoreCard = {
      ones: 3,
      twos: 6,
      threes: 9,
      fours: 12,
      fives: 15,
      sixes: 18,
      fullHouse: 25,
      fourOfAKind: 20,
      littleStraight: 15,
      bigStraight: 30,
      choice: 23,
      yacht: 50,
    };
    expect(calculateUpperSubtotal(scoreCard)).toBe(63);
  });

  it('null混じりの場合、nullを0として計算する', () => {
    const scoreCard: ScoreCard = {
      ones: 3,
      twos: null,
      threes: 9,
      fours: null,
      fives: 15,
      sixes: null,
      fullHouse: null,
      fourOfAKind: null,
      littleStraight: null,
      bigStraight: null,
      choice: null,
      yacht: null,
    };
    expect(calculateUpperSubtotal(scoreCard)).toBe(27);
  });

  it('全てnullの場合、0を返す', () => {
    const scoreCard: ScoreCard = {
      ones: null,
      twos: null,
      threes: null,
      fours: null,
      fives: null,
      sixes: null,
      fullHouse: null,
      fourOfAKind: null,
      littleStraight: null,
      bigStraight: null,
      choice: null,
      yacht: null,
    };
    expect(calculateUpperSubtotal(scoreCard)).toBe(0);
  });
});

describe('calculateBonus', () => {
  it('上段小計が63以上の場合、35を返す', () => {
    const scoreCard: ScoreCard = {
      ones: 3,
      twos: 6,
      threes: 9,
      fours: 12,
      fives: 15,
      sixes: 18,
      fullHouse: null,
      fourOfAKind: null,
      littleStraight: null,
      bigStraight: null,
      choice: null,
      yacht: null,
    };
    expect(calculateBonus(scoreCard)).toBe(35);
  });

  it('上段小計がちょうど63の場合、35を返す', () => {
    const scoreCard: ScoreCard = {
      ones: 3,
      twos: 6,
      threes: 9,
      fours: 12,
      fives: 15,
      sixes: 18,
      fullHouse: null,
      fourOfAKind: null,
      littleStraight: null,
      bigStraight: null,
      choice: null,
      yacht: null,
    };
    // 3+6+9+12+15+18 = 63
    expect(calculateBonus(scoreCard)).toBe(35);
  });

  it('上段小計が63未満の場合、0を返す', () => {
    const scoreCard: ScoreCard = {
      ones: 3,
      twos: 6,
      threes: 9,
      fours: 12,
      fives: 15,
      sixes: 17,
      fullHouse: null,
      fourOfAKind: null,
      littleStraight: null,
      bigStraight: null,
      choice: null,
      yacht: null,
    };
    // 3+6+9+12+15+17 = 62
    expect(calculateBonus(scoreCard)).toBe(0);
  });

  it('全てnullの場合、0を返す', () => {
    const scoreCard: ScoreCard = {
      ones: null,
      twos: null,
      threes: null,
      fours: null,
      fives: null,
      sixes: null,
      fullHouse: null,
      fourOfAKind: null,
      littleStraight: null,
      bigStraight: null,
      choice: null,
      yacht: null,
    };
    expect(calculateBonus(scoreCard)).toBe(0);
  });
});

describe('calculateTotalScore', () => {
  it('全て記入済みで上段ボーナスありの場合、合計+35を返す', () => {
    const scoreCard: ScoreCard = {
      ones: 3,
      twos: 6,
      threes: 9,
      fours: 12,
      fives: 15,
      sixes: 18,
      fullHouse: 25,
      fourOfAKind: 20,
      littleStraight: 15,
      bigStraight: 30,
      choice: 23,
      yacht: 50,
    };
    // カテゴリ合計: 3+6+9+12+15+18+25+20+15+30+23+50 = 226
    // 上段小計: 63 → ボーナス35
    // 合計: 226 + 35 = 261
    expect(calculateTotalScore(scoreCard)).toBe(261);
  });

  it('null混じりでボーナスなしの場合、カテゴリ合計のみを返す', () => {
    const scoreCard: ScoreCard = {
      ones: 3,
      twos: null,
      threes: 9,
      fours: null,
      fives: 15,
      sixes: null,
      fullHouse: null,
      fourOfAKind: null,
      littleStraight: null,
      bigStraight: null,
      choice: null,
      yacht: null,
    };
    // 上段小計: 27 → ボーナス0
    expect(calculateTotalScore(scoreCard)).toBe(27);
  });

  it('全てnullの場合、0を返す', () => {
    const scoreCard: ScoreCard = {
      ones: null,
      twos: null,
      threes: null,
      fours: null,
      fives: null,
      sixes: null,
      fullHouse: null,
      fourOfAKind: null,
      littleStraight: null,
      bigStraight: null,
      choice: null,
      yacht: null,
    };
    expect(calculateTotalScore(scoreCard)).toBe(0);
  });

  it('0点のカテゴリも正しく加算する（ボーナスなし）', () => {
    const scoreCard: ScoreCard = {
      ones: 0,
      twos: 0,
      threes: 0,
      fours: 0,
      fives: 0,
      sixes: 0,
      fullHouse: 0,
      fourOfAKind: 0,
      littleStraight: 0,
      bigStraight: 0,
      choice: 5,
      yacht: 0,
    };
    // 上段小計: 0 → ボーナス0
    expect(calculateTotalScore(scoreCard)).toBe(5);
  });
});
