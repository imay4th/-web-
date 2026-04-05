import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import type {
  ServerToClientEvents,
  ClientToServerEvents,
} from '@yacht/shared';
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

// Socket.ioハンドラ設定
setupSocketHandlers(io);

httpServer.listen(PORT, () => {
  console.log(`サーバー起動: ポート ${PORT}`);
});
