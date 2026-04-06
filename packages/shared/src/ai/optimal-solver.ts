/**
 * 最適戦略DPソルバー（後ろ向き帰納法）
 *
 * 状態: (filledBitmask, upperSubtotal)
 *   filledBitmask: 記入済みカテゴリの12bitマスク (0=未記入, 1=記入済み)
 *   upperSubtotal: 上段小計 0-63 (63以上はクランプ → ボーナス確定)
 *
 * V[bitmask][upperSub] = この状態から最適プレイした場合の残り期待得点（ボーナス含む）
 *
 * 構造的最適化:
 *   - 252種の5ダイス組合せをインデックス化
 *   - 462種のキープパターンに対するロール遷移を疎配列で事前計算
 *   - ベクトル化内積で各フェーズの期待値を一括算出
 */

import { calculateScore } from '../scoring/calculator.js';
import type { Category } from '../types/game.js';

// ----- 定数 -----

const ALL_CATEGORIES: Category[] = [
  'ones', 'twos', 'threes', 'fours', 'fives', 'sixes',
  'fullHouse', 'fourOfAKind', 'littleStraight', 'bigStraight', 'choice', 'yacht',
];

const NUM_CAT = 12;
const NUM_MASKS = 1 << NUM_CAT; // 4096
const UPPER_SUB_SIZE = 64;      // 0..63
const FACES = 6;
const NUM_DICE = 5;

// ----- 型 -----

interface SparseDistribution {
  indices: Uint16Array;
  probabilities: Float64Array;
}

export interface SolverProgress {
  phase: string;
  current: number;
  total: number;
}

// ----- ソート済み組合せ生成 -----

function generateSortedCombos(length: number, minVal: number, maxVal: number): number[][] {
  if (length === 0) return [[]];
  const result: number[][] = [];
  for (let v = minVal; v <= maxVal; v++) {
    for (const rest of generateSortedCombos(length - 1, v, maxVal)) {
      result.push([v, ...rest]);
    }
  }
  return result;
}

/** ソート済み組合せの多重度 (n! / ∏ci!) */
function computeMultiplicity(sorted: number[]): number {
  if (sorted.length === 0) return 1;
  const n = sorted.length;
  let numerator = 1;
  for (let k = 2; k <= n; k++) numerator *= k;
  let denom = 1;
  let i = 0;
  while (i < n) {
    let j = i + 1;
    while (j < n && sorted[j] === sorted[i]) j++;
    const cnt = j - i;
    for (let k = 2; k <= cnt; k++) denom *= k;
    i = j;
  }
  return numerator / denom;
}

/** 2つのソート済み配列をマージ */
function mergeSorted(a: number[], b: number[]): number[] {
  const result = new Array<number>(a.length + b.length);
  let i = 0, j = 0, k = 0;
  while (i < a.length && j < b.length) {
    result[k++] = a[i] <= b[j] ? a[i++] : b[j++];
  }
  while (i < a.length) result[k++] = a[i++];
  while (j < b.length) result[k++] = b[j++];
  return result;
}

// ----- 事前計算 -----

interface PrecomputedData {
  numFiveDice: number;
  numKeptTuples: number;
  scoreTable: Int16Array;           // [numFiveDice * NUM_CAT]
  rollDist: SparseDistribution[];   // [numKeptTuples]
  keepSubsets: Uint16Array[];       // [numFiveDice]
  initialDistIdx: number;
}

function precompute(): PrecomputedData {
  // 1. 5ダイス組合せ (252種)
  const fiveDiceCombos = generateSortedCombos(NUM_DICE, 1, FACES);
  const numFiveDice = fiveDiceCombos.length;
  const fiveDiceIndex = new Map<string, number>();
  for (let i = 0; i < numFiveDice; i++) {
    fiveDiceIndex.set(fiveDiceCombos[i].join(','), i);
  }

  // 2. キープタプル (0〜5個、462種)
  const keptTuples: number[][] = [];
  for (let k = 0; k <= NUM_DICE; k++) {
    for (const combo of generateSortedCombos(k, 1, FACES)) {
      keptTuples.push(combo);
    }
  }
  const numKeptTuples = keptTuples.length;
  const keptIndex = new Map<string, number>();
  for (let i = 0; i < numKeptTuples; i++) {
    keptIndex.set(keptTuples[i].join(','), i);
  }

  // 3. 得点テーブル [numFiveDice * NUM_CAT]
  const scoreTable = new Int16Array(numFiveDice * NUM_CAT);
  for (let d = 0; d < numFiveDice; d++) {
    for (let c = 0; c < NUM_CAT; c++) {
      scoreTable[d * NUM_CAT + c] = calculateScore(fiveDiceCombos[d], ALL_CATEGORIES[c]);
    }
  }

  // 4. 長さ別ソート済み組合せ（ロール分布計算用）
  const combosByLength = new Map<number, { combo: number[]; multiplicity: number }[]>();
  for (let k = 0; k <= NUM_DICE; k++) {
    const combos = generateSortedCombos(k, 1, FACES);
    combosByLength.set(k, combos.map((c) => ({
      combo: c,
      multiplicity: computeMultiplicity(c),
    })));
  }

  // 5. ロール分布 [numKeptTuples] — 疎配列
  const rollDist: SparseDistribution[] = [];
  for (let ki = 0; ki < numKeptTuples; ki++) {
    const kept = keptTuples[ki];
    const numReroll = NUM_DICE - kept.length;

    if (numReroll === 0) {
      const idx = fiveDiceIndex.get(kept.join(','))!;
      rollDist.push({
        indices: new Uint16Array([idx]),
        probabilities: new Float64Array([1.0]),
      });
      continue;
    }

    const totalOutcomes = Math.pow(FACES, numReroll);
    const countMap = new Map<number, number>();

    for (const { combo: rolled, multiplicity } of combosByLength.get(numReroll)!) {
      const merged = mergeSorted(kept, rolled);
      const idx = fiveDiceIndex.get(merged.join(','))!;
      countMap.set(idx, (countMap.get(idx) ?? 0) + multiplicity);
    }

    const entries = [...countMap.entries()].sort((a, b) => a[0] - b[0]);
    rollDist.push({
      indices: new Uint16Array(entries.map((e) => e[0])),
      probabilities: new Float64Array(entries.map((e) => e[1] / totalOutcomes)),
    });
  }

  // 6. キープサブセット [numFiveDice] — 各5ダイスから到達可能なkeptTupleIdx集合
  const keepSubsets: Uint16Array[] = [];
  for (let d = 0; d < numFiveDice; d++) {
    const dice = fiveDiceCombos[d];
    const unique = new Set<number>();
    for (let mask = 0; mask < 32; mask++) {
      const kept: number[] = [];
      for (let bit = 0; bit < NUM_DICE; bit++) {
        if (mask & (1 << bit)) kept.push(dice[bit]);
      }
      kept.sort((a, b) => a - b);
      unique.add(keptIndex.get(kept.join(','))!);
    }
    keepSubsets.push(new Uint16Array([...unique].sort((a, b) => a - b)));
  }

  const initialDistIdx = keptIndex.get('')!;

  return {
    numFiveDice, numKeptTuples,
    scoreTable, rollDist, keepSubsets, initialDistIdx,
  };
}

// ----- popcount -----

function popcount(n: number): number {
  n = n - ((n >> 1) & 0x55555555);
  n = (n & 0x33333333) + ((n >> 2) & 0x33333333);
  return (((n + (n >> 4)) & 0x0f0f0f0f) * 0x01010101) >> 24;
}

// ----- メインDPソルバー -----

/**
 * 最適戦略テーブルを計算する。
 * @returns Float64Array[4096 * 64] — V[bitmask * 64 + upperSub]
 */
export function solveOptimalTable(
  onProgress?: (progress: SolverProgress) => void,
): Float64Array {
  onProgress?.({ phase: 'precompute', current: 0, total: 1 });
  const data = precompute();
  onProgress?.({ phase: 'precompute', current: 1, total: 1 });

  const {
    numFiveDice, numKeptTuples,
    scoreTable, rollDist, keepSubsets, initialDistIdx,
  } = data;
  const initialDist = rollDist[initialDistIdx];

  // V[bitmask * UPPER_SUB_SIZE + upperSub]
  const V = new Float64Array(NUM_MASKS * UPPER_SUB_SIZE);

  // 基底ケース: 全カテゴリ記入済み → ボーナスのみ
  const fullMask = NUM_MASKS - 1; // 0xFFF
  for (let u = 0; u < UPPER_SUB_SIZE; u++) {
    V[fullMask * UPPER_SUB_SIZE + u] = u >= 63 ? 35 : 0;
  }

  // ビットマスクをpopcount別にグループ化
  const masksByPc: number[][] = Array.from({ length: NUM_CAT + 1 }, () => []);
  for (let m = 0; m < NUM_MASKS; m++) {
    masksByPc[popcount(m)].push(m);
  }

  // 解決対象の総状態数 (pc=0..11)
  let totalStates = 0;
  for (let pc = 0; pc <= 11; pc++) totalStates += masksByPc[pc].length * UPPER_SUB_SIZE;

  // 作業配列（状態ごとに再利用）
  const v3 = new Float64Array(numFiveDice);
  const v2 = new Float64Array(numFiveDice);
  const v1 = new Float64Array(numFiveDice);
  const rerollExp = new Float64Array(numKeptTuples);

  let solved = 0;

  // pc=11 → pc=0 の順に処理（後ろ向き帰納法）
  for (let pc = NUM_CAT - 1; pc >= 0; pc--) {
    for (const bitmask of masksByPc[pc]) {
      // 空きカテゴリ一覧
      const available: number[] = [];
      for (let c = 0; c < NUM_CAT; c++) {
        if (!(bitmask & (1 << c))) available.push(c);
      }
      const numAvail = available.length;

      for (let upperSub = 0; upperSub < UPPER_SUB_SIZE; upperSub++) {
        // --- v3: 3投目後 → 最適カテゴリに記入 ---
        for (let d = 0; d < numFiveDice; d++) {
          let best = -Infinity;
          const base = d * NUM_CAT;
          for (let ai = 0; ai < numAvail; ai++) {
            const c = available[ai];
            const score = scoreTable[base + c];
            const newMask = bitmask | (1 << c);
            const newUpper = c < 6 ? Math.min(upperSub + score, 63) : upperSub;
            const val = score + V[newMask * UPPER_SUB_SIZE + newUpper];
            if (val > best) best = val;
          }
          v3[d] = best;
        }

        // --- rerollExp (v3版): 全keptTupleの再ロール期待値 ---
        for (let k = 0; k < numKeptTuples; k++) {
          const dist = rollDist[k];
          const idx = dist.indices;
          const prob = dist.probabilities;
          let sum = 0;
          for (let i = 0; i < idx.length; i++) {
            sum += prob[i] * v3[idx[i]];
          }
          rerollExp[k] = sum;
        }

        // --- v2: 2投目後（即記入 or 再ロール1回） ---
        for (let d = 0; d < numFiveDice; d++) {
          let best = v3[d]; // 即記入
          const subs = keepSubsets[d];
          for (let s = 0; s < subs.length; s++) {
            const val = rerollExp[subs[s]];
            if (val > best) best = val;
          }
          v2[d] = best;
        }

        // --- rerollExp (v2版) ---
        for (let k = 0; k < numKeptTuples; k++) {
          const dist = rollDist[k];
          const idx = dist.indices;
          const prob = dist.probabilities;
          let sum = 0;
          for (let i = 0; i < idx.length; i++) {
            sum += prob[i] * v2[idx[i]];
          }
          rerollExp[k] = sum;
        }

        // --- v1: 1投目後（即記入 or 再ロール最大2回） ---
        for (let d = 0; d < numFiveDice; d++) {
          let best = v3[d]; // 即記入
          const subs = keepSubsets[d];
          for (let s = 0; s < subs.length; s++) {
            const val = rerollExp[subs[s]];
            if (val > best) best = val;
          }
          v1[d] = best;
        }

        // --- ターン期待値: 初回ロール分布 × v1 ---
        let turnValue = 0;
        for (let i = 0; i < initialDist.indices.length; i++) {
          turnValue += initialDist.probabilities[i] * v1[initialDist.indices[i]];
        }

        V[bitmask * UPPER_SUB_SIZE + upperSub] = turnValue;

        solved++;
        if (solved % 5000 === 0) {
          onProgress?.({ phase: 'solve', current: solved, total: totalStates });
        }
      }
    }
  }

  onProgress?.({ phase: 'done', current: totalStates, total: totalStates });
  return V;
}

// ----- シリアライズ / デシリアライズ -----

const MAGIC = new Uint8Array([0x59, 0x4f, 0x50, 0x54]); // "YOPT"
const VERSION = 1;
const HEADER_SIZE = 8; // 4 magic + 1 version + 2 numBitmasks(LE) + 1 numUpperSub

export function serializeTable(table: Float64Array): Uint8Array {
  const dataBytes = table.length * 8;
  const buf = new ArrayBuffer(HEADER_SIZE + dataBytes);
  const bytes = new Uint8Array(buf);
  const view = new DataView(buf);

  bytes.set(MAGIC, 0);
  view.setUint8(4, VERSION);
  view.setUint16(5, NUM_MASKS, true);
  view.setUint8(7, UPPER_SUB_SIZE);

  const tableBytes = new Uint8Array(table.buffer, table.byteOffset, dataBytes);
  bytes.set(tableBytes, HEADER_SIZE);

  return bytes;
}

export function deserializeTable(buffer: Uint8Array): Float64Array {
  if (buffer.length < HEADER_SIZE) {
    throw new Error('Invalid optimal table: too short');
  }
  for (let i = 0; i < 4; i++) {
    if (buffer[i] !== MAGIC[i]) {
      throw new Error('Invalid optimal table: bad magic bytes');
    }
  }
  const view = new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength);
  if (view.getUint8(4) !== VERSION) {
    throw new Error(`Unsupported optimal table version: ${view.getUint8(4)}`);
  }

  const numMasks = view.getUint16(5, true);
  const numUpper = view.getUint8(7);
  const size = numMasks * numUpper;

  // アラインメント保証付きコピー
  const aligned = new ArrayBuffer(size * 8);
  new Uint8Array(aligned).set(buffer.subarray(HEADER_SIZE, HEADER_SIZE + size * 8));
  return new Float64Array(aligned);
}

// ----- テーブル参照 -----

/**
 * テーブルから期待値を参照する。
 * @param table - solveOptimalTable()の戻り値またはdeserializeTable()の結果
 * @param filledBitmask - 記入済みカテゴリのビットマスク (bit i = ALL_CATEGORIES[i])
 * @param upperSub - 上段小計 (63以上はクランプ)
 */
export function lookupValue(
  table: Float64Array, filledBitmask: number, upperSub: number,
): number {
  return table[filledBitmask * UPPER_SUB_SIZE + Math.min(upperSub, 63)];
}

// カテゴリ順序エクスポート（ExpertStrategy改修用）
export { ALL_CATEGORIES as OPTIMAL_CATEGORIES };
export const OPTIMAL_UPPER_SUB_SIZE = UPPER_SUB_SIZE;
