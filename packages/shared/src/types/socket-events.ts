import type { GameState, RankingEntry, Die, Category, NpcDifficulty } from './game.js';
import type { Room } from './room.js';

// ----- Server -> Client -----

export interface ServerToClientEvents {
  'room:created': (payload: RoomCreatedPayload) => void;
  'room:joined': (payload: RoomJoinedPayload) => void;
  'room:player-joined': (payload: PlayerJoinedPayload) => void;
  'room:player-left': (payload: PlayerLeftPayload) => void;
  'room:error': (payload: RoomErrorPayload) => void;

  'game:started': (payload: GameStartedPayload) => void;
  'game:state-update': (payload: GameStateUpdatePayload) => void;
  'game:rolled': (payload: GameRolledPayload) => void;
  'game:scored': (payload: GameScoredPayload) => void;
  'game:turn-changed': (payload: GameTurnChangedPayload) => void;
  'game:finished': (payload: GameFinishedPayload) => void;
  'game:session-expired': () => void;

  'player:disconnected': (payload: PlayerDisconnectedPayload) => void;
  'player:reconnected': (payload: PlayerReconnectedPayload) => void;
}

// ----- Client -> Server -----

export interface ClientToServerEvents {
  'room:create': (
    payload: RoomCreatePayload,
    callback: (response: RoomCreatedPayload | RoomErrorPayload) => void,
  ) => void;
  'room:join': (
    payload: RoomJoinPayload,
    callback: (response: RoomJoinedPayload | RoomErrorPayload) => void,
  ) => void;
  'room:leave': () => void;

  'game:start': () => void;
  'game:roll': (payload?: GameRollPayload) => void;
  'game:toggle-keep': (payload: ToggleKeepPayload) => void;
  'game:score': (payload: ScorePayload) => void;
  'game:play-again': () => void;

  'game:start-npc': (
    payload: StartNpcPayload,
    callback: (response: GameStartedPayload | RoomErrorPayload) => void,
  ) => void;
  'game:restart-npc': () => void;
  'game:rejoin': (
    payload: GameRejoinPayload,
    callback: (response: GameRejoinedPayload | RoomErrorPayload) => void,
  ) => void;
  'game:resume-npc': () => void;
}

// ----- Payload 型定義 -----

// Room 関連
export interface RoomCreatePayload {
  nickname: string;
  maxPlayers?: number;
}

export interface RoomCreatedPayload {
  room: Room;
  playerId: string;
}

export interface RoomJoinPayload {
  roomId: string;
  nickname: string;
}

export interface RoomJoinedPayload {
  room: Room;
  playerId: string;
}

export interface PlayerJoinedPayload {
  playerId: string;
  nickname: string;
}

export interface PlayerLeftPayload {
  playerId: string;
  newHostId: string | null;
}

export interface RoomErrorPayload {
  message: string;
}

// Game 関連
export interface GameStartedPayload {
  gameState: GameState;
}

export interface GameStateUpdatePayload {
  gameState: GameState;
}

export interface GameRolledPayload {
  dice: Die[];
  rollCount: number;
}

export interface GameScoredPayload {
  playerId: string;
  category: Category;
  score: number;
}

export interface GameTurnChangedPayload {
  currentPlayerIndex: number;
  round: number;
}

export interface GameFinishedPayload {
  rankings: RankingEntry[];
  finalState: GameState;
}

// Player 関連
export interface PlayerDisconnectedPayload {
  playerId: string;
}

export interface PlayerReconnectedPayload {
  playerId: string;
}

// Client アクション
export interface ToggleKeepPayload {
  dieIndex: number;
}

export interface ScorePayload {
  category: Category;
}

export interface GameRollPayload {
  testDiceValues?: number[];
}

export interface StartNpcPayload {
  nickname: string;
  difficulty: NpcDifficulty;
}

export interface GameRejoinPayload {
  nickname: string;
  roomId: string;
}

export interface GameRejoinedPayload {
  gameState: GameState;
  playerId: string;
}
