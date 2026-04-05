import type { Category, ScoreCard } from '../types/game.js';

/**
 * 指定カテゴリのスコアを計算する純粋関数
 */
export function calculateScore(dice: number[], category: Category): number {
  switch (category) {
    case 'ones':
      return sumOfValue(dice, 1);
    case 'twos':
      return sumOfValue(dice, 2);
    case 'threes':
      return sumOfValue(dice, 3);
    case 'fours':
      return sumOfValue(dice, 4);
    case 'fives':
      return sumOfValue(dice, 5);
    case 'sixes':
      return sumOfValue(dice, 6);
    case 'fullHouse':
      return scoreFullHouse(dice);
    case 'fourOfAKind':
      return scoreFourOfAKind(dice);
    case 'littleStraight':
      return scoreLittleStraight(dice);
    case 'bigStraight':
      return scoreBigStraight(dice);
    case 'choice':
      return sumAll(dice);
    case 'yacht':
      return scoreYacht(dice);
  }
}

/**
 * 全カテゴリの仮スコアを一括計算
 */
export function calculatePossibleScores(
  dice: number[],
): Record<Category, number> {
  const categories: Category[] = [
    'ones',
    'twos',
    'threes',
    'fours',
    'fives',
    'sixes',
    'fullHouse',
    'fourOfAKind',
    'littleStraight',
    'bigStraight',
    'choice',
    'yacht',
  ];

  const result = {} as Record<Category, number>;
  for (const category of categories) {
    result[category] = calculateScore(dice, category);
  }
  return result;
}

/** 上段6カテゴリ（ones〜sixes）の小計を計算 */
export function calculateUpperSubtotal(scoreCard: ScoreCard): number {
  const upperCategories: Category[] = [
    'ones',
    'twos',
    'threes',
    'fours',
    'fives',
    'sixes',
  ];
  return upperCategories.reduce((sum, cat) => sum + (scoreCard[cat] ?? 0), 0);
}

/** ボーナスを計算（上段小計≧63なら35点、それ以外0） */
export function calculateBonus(scoreCard: ScoreCard): number {
  return calculateUpperSubtotal(scoreCard) >= 63 ? 35 : 0;
}

/**
 * スコアカードの合計点を計算（null は未記入として 0 扱い、ボーナス込み）
 */
export function calculateTotalScore(scoreCard: ScoreCard): number {
  const categoryTotal = (Object.keys(scoreCard) as Category[]).reduce(
    (sum, cat) => sum + (scoreCard[cat] ?? 0),
    0,
  );
  return categoryTotal + calculateBonus(scoreCard);
}

// ----- 内部ヘルパー -----

/** 特定の目の合計 */
function sumOfValue(dice: number[], target: number): number {
  return dice.filter((d) => d === target).length * target;
}

/** 全ダイスの合計 */
function sumAll(dice: number[]): number {
  return dice.reduce((sum, d) => sum + d, 0);
}

/** 各目の出現回数をカウント */
function countValues(dice: number[]): Map<number, number> {
  const counts = new Map<number, number>();
  for (const d of dice) {
    counts.set(d, (counts.get(d) ?? 0) + 1);
  }
  return counts;
}

/**
 * フルハウス: 3個+2個（異なる目）→ 全ダイス合計、不一致→0
 * 5個全同じはフルハウスではない
 */
function scoreFullHouse(dice: number[]): number {
  const counts = countValues(dice);
  const values = [...counts.values()].sort();
  // ちょうど2種類で、2個と3個の組み合わせ
  if (values.length === 2 && values[0] === 2 && values[1] === 3) {
    return sumAll(dice);
  }
  return 0;
}

/**
 * フォー・オブ・ア・カインド: 同じ目4個以上 → その目×4、不一致→0
 */
function scoreFourOfAKind(dice: number[]): number {
  const counts = countValues(dice);
  for (const [value, count] of counts) {
    if (count >= 4) {
      return value * 4;
    }
  }
  return 0;
}

/** S.ストレート: 4つ連続する数字 → 15点 */
function scoreLittleStraight(dice: number[]): number {
  const unique = [...new Set(dice)].sort((a, b) => a - b);
  let consecutive = 1;
  for (let i = 1; i < unique.length; i++) {
    if (unique[i] === unique[i - 1] + 1) {
      consecutive++;
      if (consecutive >= 4) return 15;
    } else {
      consecutive = 1;
    }
  }
  return 0;
}

/** B.ストレート: 5つ連続する数字 → 30点 */
function scoreBigStraight(dice: number[]): number {
  const unique = [...new Set(dice)].sort((a, b) => a - b);
  if (unique.length < 5) return 0;
  let consecutive = 1;
  for (let i = 1; i < unique.length; i++) {
    if (unique[i] === unique[i - 1] + 1) {
      consecutive++;
      if (consecutive >= 5) return 30;
    } else {
      consecutive = 1;
    }
  }
  return 0;
}

/** ヨット: 5個全同じ → 50点 */
function scoreYacht(dice: number[]): number {
  const counts = countValues(dice);
  if (counts.size === 1 && dice.length === 5) {
    return 50;
  }
  return 0;
}
