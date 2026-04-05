import type { Room, Player } from '@yacht/shared';
import { MAX_PLAYERS } from '@yacht/shared';
import { generateRoomId } from '../utils/id-generator.js';

export class RoomManager {
  private rooms: Map<string, Room> = new Map();
  private playerRoomMap: Map<string, string> = new Map();

  createRoom(socketId: string, nickname: string, maxPlayers?: number): Room {
    const effectiveMaxPlayers = maxPlayers ?? MAX_PLAYERS;

    if (effectiveMaxPlayers < 2 || effectiveMaxPlayers > MAX_PLAYERS) {
      throw `最大プレイヤー数は2~${MAX_PLAYERS}の範囲で指定してください。`;
    }

    const existingIds = new Set(this.rooms.keys());
    const roomId = generateRoomId(existingIds);

    const player: Player = {
      id: socketId,
      nickname,
      isConnected: true,
    };

    const room: Room = {
      id: roomId,
      hostId: socketId,
      players: [player],
      maxPlayers: effectiveMaxPlayers,
      gameState: null,
      createdAt: Date.now(),
    };

    this.rooms.set(roomId, room);
    this.playerRoomMap.set(socketId, roomId);

    return room;
  }

  joinRoom(roomId: string, socketId: string, nickname: string): Room {
    const room = this.rooms.get(roomId);

    if (!room) {
      throw 'ルームが見つかりません。';
    }

    if (room.gameState !== null) {
      throw 'ゲームが既に開始されています。';
    }

    if (room.players.length >= room.maxPlayers) {
      throw 'ルームが満員です。';
    }

    const player: Player = {
      id: socketId,
      nickname,
      isConnected: true,
    };

    room.players.push(player);
    this.playerRoomMap.set(socketId, roomId);

    return room;
  }

  leaveRoom(
    socketId: string,
  ): { room: Room | null; removedPlayerId: string } | null {
    const roomId = this.playerRoomMap.get(socketId);
    if (!roomId) {
      return null;
    }

    const room = this.rooms.get(roomId);
    if (!room) {
      this.playerRoomMap.delete(socketId);
      return null;
    }

    // プレイヤーを削除
    room.players = room.players.filter((p) => p.id !== socketId);
    this.playerRoomMap.delete(socketId);

    // ルームが空になった場合は削除
    if (room.players.length === 0) {
      this.rooms.delete(roomId);
      return { room: null, removedPlayerId: socketId };
    }

    // ホストが抜けた場合は次のプレイヤーをホストに
    if (room.hostId === socketId) {
      room.hostId = room.players[0].id;
    }

    return { room, removedPlayerId: socketId };
  }

  getRoom(roomId: string): Room | undefined {
    return this.rooms.get(roomId);
  }

  getRoomBySocketId(socketId: string): Room | undefined {
    const roomId = this.playerRoomMap.get(socketId);
    if (!roomId) {
      return undefined;
    }
    return this.rooms.get(roomId);
  }

  createNpcRoom(hostSocketId: string, players: Player[]): Room {
    const existingIds = new Set(this.rooms.keys());
    const roomId = generateRoomId(existingIds);

    const room: Room = {
      id: roomId,
      hostId: hostSocketId,
      players,
      maxPlayers: 2,
      gameState: null,
      createdAt: Date.now(),
    };

    this.rooms.set(roomId, room);
    this.playerRoomMap.set(hostSocketId, roomId);

    return room;
  }

  removeEmptyRooms(): void {
    for (const [roomId, room] of this.rooms) {
      if (room.players.length === 0) {
        this.rooms.delete(roomId);
      }
    }
  }
}
