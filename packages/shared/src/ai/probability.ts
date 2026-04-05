/**
 * n個のダイスの全出目パターンを生成（重複組み合わせで圧縮）
 * @returns Map<string, number> — key: ソート済みダイス値のカンマ区切り, value: その出目の出現パターン数
 */
export function getRollDistribution(numDice: number): Map<string, number> {
  const distribution = new Map<string, number>();
  if (numDice === 0) {
    distribution.set('', 1);
    return distribution;
  }
  generateCombinations(numDice, [], distribution);
  return distribution;
}

function generateCombinations(
  remaining: number,
  current: number[],
  distribution: Map<string, number>,
): void {
  if (remaining === 0) {
    const sorted = [...current].sort((a, b) => a - b);
    const key = sorted.join(',');
    distribution.set(key, (distribution.get(key) ?? 0) + 1);
    return;
  }
  for (let face = 1; face <= 6; face++) {
    current.push(face);
    generateCombinations(remaining - 1, current, distribution);
    current.pop();
  }
}

/**
 * 5個のダイスから全キープパターン（2^5=32通り）のマスクを生成
 * @returns boolean[][] — 各要素は5要素のboolean配列
 */
export function getAllKeepMasks(): boolean[][] {
  const masks: boolean[][] = [];
  for (let i = 0; i < 32; i++) {
    const mask: boolean[] = [];
    for (let bit = 0; bit < 5; bit++) {
      mask.push((i & (1 << bit)) !== 0);
    }
    masks.push(mask);
  }
  return masks;
}
