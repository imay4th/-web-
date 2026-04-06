/**
 * 最適戦略テーブルのローダー
 * サーバー起動時に initOptimalTable() でテーブルを読み込み、
 * getOptimalTable() でキャッシュされたテーブルを取得する。
 */
import { deserializeTable, lookupValue } from './optimal-solver.js';

let cachedTable: Float64Array | null = null;

/**
 * テーブルを初期化する。バイナリバッファを渡す。
 * サーバー側で fs.readFileSync() した結果をここに渡す想定。
 */
export function initOptimalTable(buffer: Uint8Array): void {
  cachedTable = deserializeTable(buffer);
}

/** キャッシュされたテーブルを取得。未初期化なら null。 */
export function getOptimalTable(): Float64Array | null {
  return cachedTable;
}

/** テーブルが初期化済みか */
export function isOptimalTableLoaded(): boolean {
  return cachedTable !== null;
}

export { lookupValue };
