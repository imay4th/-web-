import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { existsSync, readFileSync } from 'node:fs';
import type {
  ServerToClientEvents,
  ClientToServerEvents,
} from '@yacht/shared';
import { deserializeTable } from '@yacht/shared';
import { setupSocketHandlers } from './socket/handler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const httpServer = createServer(app);

const io = new Server<ClientToServerEvents, ServerToClientEvents>(httpServer, {
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    methods: ['GET', 'POST'],
  },
  pingTimeout: 60000,  // 60秒（デフォルト20秒から延長）
});

const PORT = process.env.PORT || 3000;

// CORS
app.use(cors());

// ヘルスチェック
app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// 静的ファイル配信
const publicPath = path.resolve(__dirname, '../public');
app.use(express.static(publicPath));

// SPAフォールバック（/api以外のGETリクエストをindex.htmlに）
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) {
    next();
    return;
  }
  res.sendFile(path.join(publicPath, 'index.html'));
});

// 最適戦略テーブルの読み込み（存在する場合のみ）
const tablePath = path.resolve(__dirname, '../../shared/data/optimal-table.bin');
let optimalTable: Float64Array | undefined;
if (existsSync(tablePath)) {
  try {
    const buf = readFileSync(tablePath);
    optimalTable = deserializeTable(new Uint8Array(buf.buffer, buf.byteOffset, buf.byteLength));
    console.log(`最適戦略テーブル読み込み完了 (${(buf.length / 1024).toFixed(0)} KB)`);
  } catch (e) {
    console.warn('最適戦略テーブルの読み込みに失敗:', e);
  }
}

// Socket.ioハンドラ設定
setupSocketHandlers(io, optimalTable);

httpServer.listen(PORT, () => {
  console.log(`サーバー起動: ポート ${PORT}`);
});
