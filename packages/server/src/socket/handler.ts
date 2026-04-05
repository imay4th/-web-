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

export function setupSocketHandlers(io: TypedServer): void {
  const roomManager = new RoomManager();
  const engines = new Map<string, GameEngine>();
  const npcControllers = new Map<string, NpcInfo>();

  io.on('connection', (socket) => {
    console.log(`クライアント接続: ${socket.id}`);

    // ルーム関連イベントを登録
    registerRoomHandlers(io, socket, roomManager);

    // ゲーム関連イベントを登録
    registerGameHandlers(io, socket, roomManager, engines, npcControllers);

    // 切断時の処理
    socket.on('disconnect', () => {
      console.log(`クライアント切断: ${socket.id}`);

      // ゲーム中のプレイヤー切断処理
      const room = roomManager.getRoomBySocketId(socket.id);
      if (room && room.gameState && room.gameState.phase === 'PLAYING') {
        // プレイヤーのisConnectedをfalseに設定
        const player = room.gameState.players.find(
          (p) => p.id === socket.id,
        );
        if (player) {
          player.isConnected = false;
        }

        // ルーム内の他プレイヤーに切断を通知
        socket.to(room.id).emit('player:disconnected', {
          playerId: socket.id,
        });
      }

      handleLeave(socket, roomManager);
      roomManager.removeEmptyRooms();

      // 空になったルームのエンジンとNPCコントローラをクリーンアップ
      for (const [roomId] of engines) {
        if (!roomManager.getRoom(roomId)) {
          engines.delete(roomId);
          npcControllers.delete(roomId);
        }
      }
    });
  });
}
