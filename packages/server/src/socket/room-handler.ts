import type { Server, Socket } from 'socket.io';
import type {
  ServerToClientEvents,
  ClientToServerEvents,
  RoomCreatePayload,
  RoomCreatedPayload,
  RoomJoinPayload,
  RoomJoinedPayload,
  RoomErrorPayload,
} from '@yacht/shared';
import type { RoomManager } from '../game/room-manager.js';

type TypedSocket = Socket<ClientToServerEvents, ServerToClientEvents>;
type TypedServer = Server<ClientToServerEvents, ServerToClientEvents>;

export function registerRoomHandlers(
  _io: TypedServer,
  socket: TypedSocket,
  roomManager: RoomManager,
): void {
  // ルーム作成
  socket.on(
    'room:create',
    (
      payload: RoomCreatePayload,
      callback: (response: RoomCreatedPayload | RoomErrorPayload) => void,
    ) => {
      try {
        const room = roomManager.createRoom(
          socket.id,
          payload.nickname,
          payload.maxPlayers,
        );
        void socket.join(room.id);
        callback({ room, playerId: socket.id });
      } catch (error) {
        const message =
          typeof error === 'string' ? error : 'ルームの作成に失敗しました。';
        callback({ message });
      }
    },
  );

  // ルーム参加
  socket.on(
    'room:join',
    (
      payload: RoomJoinPayload,
      callback: (response: RoomJoinedPayload | RoomErrorPayload) => void,
    ) => {
      try {
        const room = roomManager.joinRoom(
          payload.roomId,
          socket.id,
          payload.nickname,
        );
        void socket.join(room.id);
        callback({ room, playerId: socket.id });

        // ルーム内の他プレイヤーに通知
        socket.to(room.id).emit('room:player-joined', {
          playerId: socket.id,
          nickname: payload.nickname,
        });
      } catch (error) {
        const message =
          typeof error === 'string' ? error : 'ルームへの参加に失敗しました。';
        callback({ message });
      }
    },
  );

  // ルーム退出
  socket.on('room:leave', () => {
    handleLeave(socket, roomManager);
  });
}

/**
 * プレイヤーの退出処理（明示的退出・切断共通）
 */
export function handleLeave(
  socket: TypedSocket,
  roomManager: RoomManager,
): void {
  const result = roomManager.leaveRoom(socket.id);
  if (!result) {
    return;
  }

  const { room, removedPlayerId } = result;

  if (room) {
    void socket.leave(room.id);
    socket.to(room.id).emit('room:player-left', {
      playerId: removedPlayerId,
      newHostId: room.hostId,
    });
  }
}
