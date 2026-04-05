import { calculatePossibleScores } from '../scoring/calculator.js';
import { getAllKeepMasks } from './probability.js';
import {
  getAvailableCategories,
  getBestAdjustedScore,
  computeExpectedValue,
} from './expected-value.js';
import type { Category, ScoreCard } from '../types/game.js';

export interface NpcDecision {
  type: 'keep' | 'score';
  keepMask?: boolean[];
  category?: Category;
}

export interface NpcStrategy {
  decide(dice: number[], rollCount: number, scoreCard: ScoreCard): NpcDecision;
}

export function createNpcStrategy(
  difficulty: 'easy' | 'normal' | 'hard' | 'expert',
): NpcStrategy {
  switch (difficulty) {
    case 'easy':
      return new EasyStrategy();
    case 'normal':
      return new NormalStrategy();
    case 'hard':
      return new HardStrategy();
    case 'expert':
      return new ExpertStrategy();
  }
}

// ===== EasyStrategy =====

class EasyStrategy implements NpcStrategy {
  decide(dice: number[], rollCount: number, scoreCard: ScoreCard): NpcDecision {
    const available = getAvailableCategories(scoreCard);
    if (available.length === 0) {
      return { type: 'score', category: 'choice' };
    }

    // 3回ロール済み: 最低スコアのカテゴリに記入
    if (rollCount >= 3) {
      return { type: 'score', category: this.pickWorstCategory(dice, available) };
    }

    // 30%の確率で早期スコア
    if (Math.random() < 0.3) {
      return { type: 'score', category: this.pickWorstCategory(dice, available) };
    }

    // ランダムに各ダイスの50%をキープ
    const keepMask = dice.map(() => Math.random() < 0.5);

    // 全キープの場合は1つ外す
    if (keepMask.every(Boolean)) {
      const randomIndex = Math.floor(Math.random() * 5);
      keepMask[randomIndex] = false;
    }

    return { type: 'keep', keepMask };
  }

  private pickWorstCategory(dice: number[], available: Category[]): Category {
    const scores = calculatePossibleScores(dice);
    let worstCategory = available[0];
    let worstScore = scores[available[0]];

    for (const cat of available) {
      if (scores[cat] < worstScore) {
        worstScore = scores[cat];
        worstCategory = cat;
      }
    }

    return worstCategory;
  }
}

// ===== NormalStrategy =====

class NormalStrategy implements NpcStrategy {
  decide(dice: number[], rollCount: number, scoreCard: ScoreCard): NpcDecision {
    const available = getAvailableCategories(scoreCard);
    if (available.length === 0) {
      return { type: 'score', category: 'choice' };
    }

    // 3回ロール済み: 最高スコアのカテゴリに記入（貪欲法）
    if (rollCount >= 3) {
      return { type: 'score', category: this.pickBestCategory(dice, available) };
    }

    // キープ戦略の判定
    const keepMask = this.decideKeep(dice, available);

    // 全キープ = 良い手がある → スコアリング
    if (keepMask.every(Boolean)) {
      return { type: 'score', category: this.pickBestCategory(dice, available) };
    }

    return { type: 'keep', keepMask };
  }

  private pickBestCategory(dice: number[], available: Category[]): Category {
    const scores = calculatePossibleScores(dice);
    let bestCategory = available[0];
    let bestScore = scores[available[0]];

    for (const cat of available) {
      if (scores[cat] > bestScore) {
        bestScore = scores[cat];
        bestCategory = cat;
      }
    }

    return bestCategory;
  }

  private decideKeep(dice: number[], available: Category[]): boolean[] {
    const keepMask = [false, false, false, false, false];

    // 出目の出現回数をカウント
    const counts = new Map<number, number>();
    for (const d of dice) {
      counts.set(d, (counts.get(d) ?? 0) + 1);
    }

    // フルハウスパターン (3+2) チェック
    const countValues = [...counts.values()].sort();
    if (
      countValues.length === 2 && countValues[0] === 2 && countValues[1] === 3 &&
      available.includes('fullHouse')
    ) {
      return [true, true, true, true, true];
    }

    // ストレートパターンチェック
    const uniqueSorted = [...new Set(dice)].sort((a, b) => a - b);
    const straightDice = this.findStraightRun(uniqueSorted);
    if (
      straightDice.length >= 3 &&
      (available.includes('littleStraight') || available.includes('bigStraight'))
    ) {
      const straightSet = new Set(straightDice);
      for (let i = 0; i < 5; i++) {
        if (straightSet.has(dice[i])) {
          keepMask[i] = true;
          straightSet.delete(dice[i]);
        }
      }
      return keepMask;
    }

    // 最も多い出目をキープ
    let maxCount = 0;
    let maxValue = 0;
    for (const [value, count] of counts) {
      if (count > maxCount || (count === maxCount && value > maxValue)) {
        maxCount = count;
        maxValue = value;
      }
    }

    for (let i = 0; i < 5; i++) {
      if (dice[i] === maxValue) {
        keepMask[i] = true;
      }
    }

    return keepMask;
  }

  private findStraightRun(sorted: number[]): number[] {
    if (sorted.length < 3) return [];

    let bestRun: number[] = [sorted[0]];
    let currentRun: number[] = [sorted[0]];

    for (let i = 1; i < sorted.length; i++) {
      if (sorted[i] === sorted[i - 1] + 1) {
        currentRun.push(sorted[i]);
      } else {
        if (currentRun.length > bestRun.length) {
          bestRun = currentRun;
        }
        currentRun = [sorted[i]];
      }
    }
    if (currentRun.length > bestRun.length) {
      bestRun = currentRun;
    }

    return bestRun;
  }
}

// ===== HardStrategy =====

class HardStrategy implements NpcStrategy {
  decide(dice: number[], rollCount: number, scoreCard: ScoreCard): NpcDecision {
    const available = getAvailableCategories(scoreCard);
    if (available.length === 0) {
      return { type: 'score', category: 'choice' };
    }

    // 3回ロール済み: ボーナス調整スコアで最善選択
    if (rollCount >= 3) {
      const best = getBestAdjustedScore(dice, scoreCard);
      return { type: 'score', category: best.category };
    }

    // 1ロール先の期待値で最善キープパターンを選択
    const cache = new Map<string, number>();
    const keepMasks = getAllKeepMasks();

    let bestMask: boolean[] | null = null;
    let bestValue = -Infinity;

    for (const mask of keepMasks) {
      // 全部振り直し以外のパターンを含む
      const keptDice: number[] = [];
      for (let i = 0; i < 5; i++) {
        if (mask[i]) {
          keptDice.push(dice[i]);
        }
      }

      // 1ロール先の期待値（remainingRolls=1）
      const value = computeExpectedValue(keptDice, 1, scoreCard, cache);
      if (value > bestValue) {
        bestValue = value;
        bestMask = mask;
      }
    }

    // 即座にスコアした方が良い場合
    const currentBest = getBestAdjustedScore(dice, scoreCard);
    if (currentBest.adjustedScore >= bestValue) {
      return { type: 'score', category: currentBest.category };
    }

    // 全キープが最善 → スコアリング
    if (bestMask !== null && bestMask.every(Boolean)) {
      return { type: 'score', category: currentBest.category };
    }

    return { type: 'keep', keepMask: bestMask ?? [false, false, false, false, false] };
  }
}

// ===== ExpertStrategy =====

class ExpertStrategy implements NpcStrategy {
  decide(dice: number[], rollCount: number, scoreCard: ScoreCard): NpcDecision {
    const available = getAvailableCategories(scoreCard);
    if (available.length === 0) {
      return { type: 'score', category: 'choice' };
    }

    // 3回ロール済み: 機会コスト考慮で最善カテゴリ選択
    if (rollCount >= 3) {
      return { type: 'score', category: this.pickBestWithOpportunityCost(dice, scoreCard, available) };
    }

    // 残り全ロールの期待値を再帰的に計算
    const remainingRolls = 3 - rollCount;
    const cache = new Map<string, number>();
    const keepMasks = getAllKeepMasks();

    let bestMask: boolean[] | null = null;
    let bestValue = -Infinity;

    for (const mask of keepMasks) {
      const keptDice: number[] = [];
      for (let i = 0; i < 5; i++) {
        if (mask[i]) {
          keptDice.push(dice[i]);
        }
      }

      const value = computeExpectedValue(keptDice, remainingRolls, scoreCard, cache);
      if (value > bestValue) {
        bestValue = value;
        bestMask = mask;
      }
    }

    // 即座にスコアした方が良い場合
    const currentBest = getBestAdjustedScore(dice, scoreCard);
    if (currentBest.adjustedScore >= bestValue) {
      return { type: 'score', category: this.pickBestWithOpportunityCost(dice, scoreCard, available) };
    }

    // 全キープが最善 → スコアリング
    if (bestMask !== null && bestMask.every(Boolean)) {
      return {
        type: 'score',
        category: this.pickBestWithOpportunityCost(dice, scoreCard, available),
      };
    }

    return { type: 'keep', keepMask: bestMask ?? [false, false, false, false, false] };
  }

  private pickBestWithOpportunityCost(
    dice: number[],
    scoreCard: ScoreCard,
    available: Category[],
  ): Category {
    const scores = calculatePossibleScores(dice);

    // ヨットが出たらyachtに記入（未記入なら）
    if (scores.yacht === 50 && available.includes('yacht')) {
      return 'yacht';
    }

    // 各カテゴリの機会コスト推定
    let bestCategory = available[0];
    let bestNetValue = -Infinity;

    for (const cat of available) {
      const score = scores[cat];
      const opportunityCost = this.estimateOpportunityCost(cat, score, available, scoreCard);
      const netValue = score - opportunityCost;

      // 上段ボーナス調整
      const bonusAdj = this.computeUpperBonusValue(cat, score, scoreCard);
      const adjustedNet = netValue + bonusAdj;

      if (adjustedNet > bestNetValue) {
        bestNetValue = adjustedNet;
        bestCategory = cat;
      }
    }

    return bestCategory;
  }

  private estimateOpportunityCost(
    category: Category,
    score: number,
    available: Category[],
    scoreCard: ScoreCard,
  ): number {
    // 高価値カテゴリの保険的価値を推定
    const categoryValues: Record<Category, number> = {
      ones: 3, twos: 6, threes: 9, fours: 12, fives: 15, sixes: 18,
      fullHouse: 15, fourOfAKind: 16, littleStraight: 15, bigStraight: 30,
      choice: 20, yacht: 50,
    };

    // 平均期待値（そのカテゴリを将来使う場合の期待値）
    const expectedFutureValue = categoryValues[category] * 0.5;

    // choiceは保険として価値が高い
    if (category === 'choice') {
      const remainingCategories = available.length;
      // 残りカテゴリが多いほど保険価値が高い
      return Math.min(score * 0.3, remainingCategories * 1.5);
    }

    // スコアが0点のカテゴリは機会コストが低い
    if (score === 0) {
      return -expectedFutureValue * 0.5; // マイナスの機会コスト = 0点記入のインセンティブ
    }

    return 0;
  }

  private computeUpperBonusValue(
    category: Category,
    score: number,
    scoreCard: ScoreCard,
  ): number {
    const upperCategories: Category[] = ['ones', 'twos', 'threes', 'fours', 'fives', 'sixes'];
    if (!upperCategories.includes(category)) {
      return 0;
    }

    const parValues: Record<string, number> = {
      ones: 3, twos: 6, threes: 9, fours: 12, fives: 15, sixes: 18,
    };

    const par = parValues[category];
    const diff = score - par;

    // パー超過はボーナス獲得に寄与
    const remainingUpperSlots = upperCategories.filter(
      (c) => c !== category && scoreCard[c] === null,
    ).length;

    if (remainingUpperSlots === 0) {
      // 最後の上段: 直接ボーナス判定
      const currentSubtotal = Object.entries(scoreCard)
        .filter(([key]) => upperCategories.includes(key as Category))
        .reduce((sum, [, val]) => sum + (val ?? 0), 0);
      return (currentSubtotal + score >= 63) ? 35 : 0;
    }

    // ボーナスへの寄与度合い
    return diff * (35 / 63);
  }
}
