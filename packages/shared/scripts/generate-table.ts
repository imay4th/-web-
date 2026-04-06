/**
 * 最適戦略テーブル生成スクリプト
 * 実行: npx tsx packages/shared/scripts/generate-table.ts
 * 出力: packages/shared/data/optimal-table.bin (~2MB)
 */
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { solveOptimalTable, serializeTable } from '../src/ai/optimal-solver.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT_PATH = resolve(__dirname, '../data/optimal-table.bin');

console.log('最適戦略テーブル生成を開始します...');
const startTime = Date.now();

const table = solveOptimalTable((progress) => {
  if (progress.phase === 'precompute') {
    console.log(`[事前計算] ${progress.current}/${progress.total}`);
  } else if (progress.phase === 'solve') {
    const pct = ((progress.current / progress.total) * 100).toFixed(1);
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(0);
    process.stdout.write(`\r[DP計算] ${pct}% (${progress.current}/${progress.total}) — ${elapsed}秒経過`);
  } else if (progress.phase === 'done') {
    process.stdout.write('\n');
    console.log(`[完了] 全${progress.total}状態を計算`);
  }
});

const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
console.log(`計算時間: ${elapsed}秒`);

// ゲーム開始時の期待値を表示 (bitmask=0, upperSub=0)
const expectedScore = table[0];
console.log(`ゲーム開始時の最適期待値: ${expectedScore.toFixed(2)}点`);

// ファイル書き出し
const serialized = serializeTable(table);
mkdirSync(dirname(OUTPUT_PATH), { recursive: true });
writeFileSync(OUTPUT_PATH, serialized);
console.log(`テーブルを保存しました: ${OUTPUT_PATH} (${(serialized.length / 1024).toFixed(0)} KB)`);
