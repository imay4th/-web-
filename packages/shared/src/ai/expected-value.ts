import { calculatePossibleScores, calculateUpperSubtotal } from '../scoring/calculator.js';
import { getRollDistribution, getAllKeepMasks } from './probability.js';
import type { Category, ScoreCard } from '../types/game.js';

const ALL_CATEGORIES: Category[] = [
  'ones', 'twos', 'threes', 'fours', 'fives', 'sixes',
  'fullHouse', 'fourOfAKind', 'littleStraight', 'bigStraight', 'choice', 'yacht',
];

const UPPER_CATEGORIES: Category[] = ['ones', 'twos', 'threes', 'fours', 'fives', 'sixes'];

const PAR_VALUES: Record<string, number> = {
  ones: 3, twos: 6, threes: 9, fours: 12, fives: 15, sixes: 18,
};

/**
 * 空きカテゴリのリストを返す
 */
export function getAvailableCategories(scoreCard: ScoreCard): Category[] {
  return ALL_CATEGORIES.filter((cat) => scoreCard[cat] === null);
}

/**
 * 空きカテゴリのビットマスクを生成（メモ化キー用）
 */
function getAvailableBitmask(scoreCard: ScoreCard): number {
  let mask = 0;
  for (let i = 0; i < ALL_CATEGORIES.length; i++) {
    if (scoreCard[ALL_CATEGORIES[i]] === null) {
      mask |= (1 << i);
    }
  }
  return mask;
}

/**
 * 上段ボーナスの調整値を計算する
 * 上段カテゴリのパー超過/不足分をボーナス期待値として調整
 */
function computeBonusAdjustment(
  category: Category,
  score: number,
  scoreCard: ScoreCard,
): number {
  if (!UPPER_CATEGORIES.includes(category)) {
    return 0;
  }

  const currentSubtotal = calculateUpperSubtotal(scoreCard);
  const par = PAR_VALUES[category];
  const diff = score - par;

  // 上段の残り空きカテゴリ数（この記入分は除く）
  const remainingUpper = UPPER_CATEGORIES.filter(
    (c) => c !== category && scoreCard[c] === null,
  ).length;

  // パーとの差分をボーナスの寄与として調整
  // 63に到達するために必要な残りポイントと現在の達成度を考慮
  const neededForBonus = 63 - currentSubtotal;
  const remainingPar = UPPER_CATEGORIES
    .filter((c) => c !== category && scoreCard[c] === null)
    .reduce((sum, c) => sum + PAR_VALUES[c], 0);

  if (remainingUpper === 0) {
    // 最後の上段カテゴリ: ボーナス確定/不確定を直接計算
    return (currentSubtotal + score >= 63) ? 35 : 0;
  }

  // ボーナス期待値の近似: パーとの差分 × ボーナス/残りパー合計の比率
  if (remainingPar > 0) {
    const bonusContribution = (diff / remainingPar) * 35;
    return bonusContribution;
  }

  return diff > 0 ? 35 : 0;
}

/**
 * 指定されたダイスで各カテゴリの最善スコアを計算（ボーナス調整付き）
 */
export function getBestAdjustedScore(
  dice: number[],
  scoreCard: ScoreCard,
): { category: Category; score: number; adjustedScore: number } {
  const available = getAvailableCategories(scoreCard);
  const possibleScores = calculatePossibleScores(dice);

  let best: { category: Category; score: number; adjustedScore: number } | null = null;

  for (const cat of available) {
    const score = possibleScores[cat];
    const bonusAdj = computeBonusAdjustment(cat, score, scoreCard);
    const adjustedScore = score + bonusAdj;

    if (best === null || adjustedScore > best.adjustedScore) {
      best = { category: cat, score, adjustedScore };
    }
  }

  // 空きカテゴリがない場合は起こらないはずだが安全のため
  if (best === null) {
    return { category: 'choice', score: 0, adjustedScore: 0 };
  }

  return best;
}

/**
 * キープダイスと残りロール数から期待値を計算（メモ化付き）
 */
export function computeExpectedValue(
  keptDice: number[],
  remainingRolls: number,
  scoreCard: ScoreCard,
  cache: Map<string, number>,
): number {
  const sortedKept = [...keptDice].sort((a, b) => a - b);
  const bitmask = getAvailableBitmask(scoreCard);
  const cacheKey = `${sortedKept.join(',')}_${remainingRolls}_${bitmask}`;

  const cached = cache.get(cacheKey);
  if (cached !== undefined) {
    return cached;
  }

  // 残りロール0: 最善カテゴリに記入
  if (remainingRolls === 0) {
    const result = getBestAdjustedScore(keptDice, scoreCard).adjustedScore;
    cache.set(cacheKey, result);
    return result;
  }

  const numReroll = 5 - keptDice.length;

  if (numReroll === 0) {
    // 全ダイスキープ済み: ロールしないのと同じ
    const result = getBestAdjustedScore(keptDice, scoreCard).adjustedScore;
    cache.set(cacheKey, result);
    return result;
  }

  const distribution = getRollDistribution(numReroll);
  const totalOutcomes = Math.pow(6, numReroll);

  let expectedValue = 0;

  for (const [pattern, count] of distribution) {
    const newDice = pattern.length > 0
      ? [...keptDice, ...pattern.split(',').map(Number)]
      : [...keptDice];
    const probability = count / totalOutcomes;

    if (remainingRolls === 1) {
      // 最後のロール: 直接スコア計算
      const bestScore = getBestAdjustedScore(newDice, scoreCard).adjustedScore;
      expectedValue += probability * bestScore;
    } else {
      // まだロールが残っている: 全キープパターンを試して最善を選択
      const keepMasks = getAllKeepMasks();
      let bestKeepValue = -Infinity;

      for (const mask of keepMasks) {
        const nextKept: number[] = [];
        for (let i = 0; i < 5; i++) {
          if (mask[i]) {
            nextKept.push(newDice[i]);
          }
        }
        const value = computeExpectedValue(nextKept, remainingRolls - 1, scoreCard, cache);
        if (value > bestKeepValue) {
          bestKeepValue = value;
        }
      }

      expectedValue += probability * bestKeepValue;
    }
  }

  cache.set(cacheKey, expectedValue);
  return expectedValue;
}
