import type { Server } from 'socket.io';
import type {
  ServerToClientEvents,
  ClientToServerEvents,
} from '@yacht/shared';
import { RoomManager } from '../game/room-manager.js';
import { GameEngine } from '../game/engine.js';
import { registerRoomHandlers, handleLeave } from './room-handler.js';
import { registerGameHandlers } from './game-handler.js';
import type { NpcInfo } from './game-handler.js';

type TypedServer = Server<ClientToServerEvents, ServerToClientEvents>;

const disconnectTimers = new Map<string, { timer: NodeJS.Timeout; roomId: string; socketId: string }>();

const GRACE_PERIOD_NPC = 5 * 60 * 1000;  // NPC対戦: 5分
const GRACE_PERIOD_PVP = 2 * 60 * 1000;  // 対人戦: 2分

export function setupSocketHandlers(io: TypedServer, optimalTable?: Float64Array): void {
  const roomManager = new RoomManager();
  const engines = new Map<string, GameEngine>();
  const npcControllers = new Map<string, NpcInfo>();

  io.on('connection', (socket) => {
    console.log(`クライアント接続: ${socket.id}`);

    // ルーム関連イベントを登録
    registerRoomHandlers(io, socket, roomManager);

    // ゲーム関連イベントを登録
    registerGameHandlers(io, socket, roomManager, engines, npcControllers, optimalTable);

    // 切断時の処理
    socket.on('disconnect', () => {
      console.log(`クライアント切断: ${socket.id}`);

      const room = roomManager.getRoomBySocketId(socket.id);

      if (room && room.gameState && room.gameState.phase === 'PLAYING') {
        // ゲーム中: グレースピリオドを設定
        const player = room.gameState.players.find((p) => p.id === socket.id);
        if (player) {
          player.isConnected = false;
        }

        // 他プレイヤーに切断を通知
        socket.to(room.id).emit('player:disconnected', { playerId: socket.id });

        // NPC対戦かどうか判定
        const isNpcGame = npcControllers.has(room.id);
        const gracePeriod = isNpcGame ? GRACE_PERIOD_NPC : GRACE_PERIOD_PVP;

        // グレースピリオドタイマー開始
        const timer = setTimeout(() => {
          disconnectTimers.delete(socket.id);

          // セッション期限切れを通知（ルーム内の接続中プレイヤーに）
          io.to(room.id).emit('game:session-expired');

          // 通常の退出処理
          handleLeave(socket, roomManager);
          roomManager.removeEmptyRooms();

          for (const [roomId] of engines) {
            if (!roomManager.getRoom(roomId)) {
              engines.delete(roomId);
              npcControllers.delete(roomId);
            }
          }
        }, gracePeriod);

        disconnectTimers.set(socket.id, { timer, roomId: room.id, socketId: socket.id });
      } else {
        // ゲーム中でない場合: 即座に退出
        handleLeave(socket, roomManager);
        roomManager.removeEmptyRooms();

        for (const [roomId] of engines) {
          if (!roomManager.getRoom(roomId)) {
            engines.delete(roomId);
            npcControllers.delete(roomId);
          }
        }
      }
    });

    // 再接続ハンドラ
    socket.on('game:rejoin', (payload, callback) => {
      try {
        const { nickname, roomId } = payload;

        const result = roomManager.rejoinRoom(socket.id, nickname, roomId);
        if (!result) {
          callback({ message: 'ゲームセッションが見つかりません。' });
          return;
        }

        const { room, oldSocketId } = result;

        // グレースピリオドタイマーをキャンセル
        const timerEntry = disconnectTimers.get(oldSocketId);
        if (timerEntry) {
          clearTimeout(timerEntry.timer);
          disconnectTimers.delete(oldSocketId);
        }

        // Socket.ioルームに参加
        socket.join(roomId);

        // gameStateのscoreCardsのキーも更新
        const engine = engines.get(roomId);
        if (engine) {
          const state = engine.getState();
          // scoreCardsのキー更新（oldSocketId → newSocketId）
          if (state.scoreCards[oldSocketId] !== undefined) {
            state.scoreCards[socket.id] = state.scoreCards[oldSocketId];
            delete state.scoreCards[oldSocketId];
          }
          room.gameState = state;
        }

        // コールバックで応答
        callback({
          gameState: room.gameState!,
          playerId: socket.id,
        });

        // 他プレイヤーに再接続を通知
        socket.to(roomId).emit('player:reconnected', { playerId: socket.id });

        console.log(`プレイヤー再接続: ${nickname} -> ${roomId} (${oldSocketId} → ${socket.id})`);
      } catch (error) {
        const message = typeof error === 'string' ? error : '再接続に失敗しました。';
        callback({ message });
      }
    });
  });
}
