import { randomUUID } from 'crypto';
import type { Server, Socket } from 'socket.io';
import type {
  ServerToClientEvents,
  ClientToServerEvents,
  ToggleKeepPayload,
  ScorePayload,
  GameRollPayload,
  StartNpcPayload,
  NpcDifficulty,
} from '@yacht/shared';
import { MIN_PLAYERS, MAX_ROLLS } from '@yacht/shared';
import type { RoomManager } from '../game/room-manager.js';
import { GameEngine } from '../game/engine.js';
import { NpcController } from '../game/npc-controller.js';

type TypedSocket = Socket<ClientToServerEvents, ServerToClientEvents>;
type TypedServer = Server<ClientToServerEvents, ServerToClientEvents>;

const NPC_NAMES: Record<NpcDifficulty, string> = {
  easy: 'よわいNPC',
  normal: 'ふつうNPC',
  hard: 'つよいNPC',
  expert: 'さいきょうNPC',
};

export interface NpcInfo {
  controller: NpcController;
  npcId: string;
  difficulty: NpcDifficulty;
}

/**
 * NPCが次のプレイヤーの場合、自動でターンを実行する
 */
function triggerNpcTurnIfNeeded(
  io: TypedServer,
  engine: GameEngine,
  roomId: string,
  npcInfo: NpcInfo | undefined,
): void {
  if (!npcInfo) return;
  if (engine.isFinished()) return;

  const state = engine.getState();
  const nextPlayer = state.players[state.currentPlayerIndex];
  if (!nextPlayer?.isNPC) return;

  setTimeout(() => {
    npcInfo.controller
      .executeTurn(engine, npcInfo.npcId, (updatedState) => {
        io.to(roomId).emit('game:state-update', { gameState: updatedState });
      })
      .then(() => {
        const postState = engine.getState();
        if (engine.isFinished()) {
          const rankings = engine.getRankings();
          io.to(roomId).emit('game:finished', {
            rankings,
            finalState: postState,
          });
        } else {
          io.to(roomId).emit('game:turn-changed', {
            currentPlayerIndex: postState.currentPlayerIndex,
            round: postState.round,
          });
          // 次もNPCなら再帰的に実行（2人以上NPCの場合）
          triggerNpcTurnIfNeeded(io, engine, roomId, npcInfo);
        }
      });
  }, 500);
}

/**
 * ゲーム関連のSocket.ioイベントハンドラを登録する
 */
export function registerGameHandlers(
  io: TypedServer,
  socket: TypedSocket,
  roomManager: RoomManager,
  engines: Map<string, GameEngine>,
  npcControllers: Map<string, NpcInfo>,
  optimalTable?: Float64Array,
): void {
  // ゲーム開始
  socket.on('game:start', () => {
    try {
      const room = roomManager.getRoomBySocketId(socket.id);
      if (!room) {
        socket.emit('room:error', { message: 'ルームに参加していません。' });
        return;
      }

      // ホスト権限チェック
      if (room.hostId !== socket.id) {
        socket.emit('room:error', {
          message: 'ホストのみがゲームを開始できます。',
        });
        return;
      }

      // 最少プレイヤー数チェック
      if (room.players.length < MIN_PLAYERS) {
        socket.emit('room:error', {
          message: `ゲーム開始には最低${MIN_PLAYERS}人のプレイヤーが必要です。`,
        });
        return;
      }

      // 既にゲームが進行中でないことを確認
      if (room.gameState && room.gameState.phase === 'PLAYING') {
        socket.emit('room:error', {
          message: 'ゲームは既に進行中です。',
        });
        return;
      }

      // GameEngine生成
      const engine = new GameEngine(room.id, room.players);
      engines.set(room.id, engine);

      // Roomのゲーム状態を更新
      room.gameState = engine.getState();

      // ルーム全体に通知
      io.to(room.id).emit('game:started', { gameState: engine.getState() });
    } catch (error) {
      const message =
        typeof error === 'string' ? error : 'ゲームの開始に失敗しました。';
      socket.emit('room:error', { message });
    }
  });

  // ダイスを振る
  socket.on('game:roll', (payload) => {
    try {
      const room = roomManager.getRoomBySocketId(socket.id);
      if (!room) {
        socket.emit('room:error', { message: 'ルームに参加していません。' });
        return;
      }

      const engine = engines.get(room.id);
      if (!engine) {
        socket.emit('room:error', { message: 'ゲームが開始されていません。' });
        return;
      }

      const dice = engine.roll(socket.id, payload?.testDiceValues);
      const state = engine.getState();

      // Roomのゲーム状態を更新
      room.gameState = state;

      // ルーム全体にロール結果を通知
      io.to(room.id).emit('game:rolled', {
        dice,
        rollCount: state.rollCount,
      });

      // 最大ロール数に達した場合、ターンフェーズ更新を通知
      if (state.rollCount >= MAX_ROLLS) {
        io.to(room.id).emit('game:state-update', { gameState: state });
      }
    } catch (error) {
      const message =
        typeof error === 'string' ? error : 'ダイスを振れませんでした。';
      socket.emit('room:error', { message });
    }
  });

  // ダイスのキープ切り替え
  socket.on('game:toggle-keep', (payload: ToggleKeepPayload) => {
    try {
      const room = roomManager.getRoomBySocketId(socket.id);
      if (!room) {
        socket.emit('room:error', { message: 'ルームに参加していません。' });
        return;
      }

      const engine = engines.get(room.id);
      if (!engine) {
        socket.emit('room:error', { message: 'ゲームが開始されていません。' });
        return;
      }

      engine.toggleKeep(socket.id, payload.dieIndex);
      const state = engine.getState();

      // Roomのゲーム状態を更新
      room.gameState = state;

      // ルーム全体に状態更新を通知
      io.to(room.id).emit('game:state-update', { gameState: state });
    } catch (error) {
      const message =
        typeof error === 'string'
          ? error
          : 'キープ状態の変更に失敗しました。';
      socket.emit('room:error', { message });
    }
  });

  // スコア記録
  socket.on('game:score', (payload: ScorePayload) => {
    try {
      const room = roomManager.getRoomBySocketId(socket.id);
      if (!room) {
        socket.emit('room:error', { message: 'ルームに参加していません。' });
        return;
      }

      const engine = engines.get(room.id);
      if (!engine) {
        socket.emit('room:error', { message: 'ゲームが開始されていません。' });
        return;
      }

      const score = engine.score(socket.id, payload.category);
      const state = engine.getState();

      // Roomのゲーム状態を更新
      room.gameState = state;

      // ルーム全体にスコア記録を通知
      io.to(room.id).emit('game:scored', {
        playerId: socket.id,
        category: payload.category,
        score,
      });

      // ゲーム終了判定
      if (engine.isFinished()) {
        const rankings = engine.getRankings();
        io.to(room.id).emit('game:finished', {
          rankings,
          finalState: state,
        });
      } else {
        // ターン変更を通知
        io.to(room.id).emit('game:turn-changed', {
          currentPlayerIndex: state.currentPlayerIndex,
          round: state.round,
        });

        // 次のプレイヤーがNPCなら自動実行
        triggerNpcTurnIfNeeded(
          io,
          engine,
          room.id,
          npcControllers.get(room.id),
        );
      }
    } catch (error) {
      const message =
        typeof error === 'string'
          ? error
          : 'スコアの記録に失敗しました。';
      socket.emit('room:error', { message });
    }
  });

  // もう一度遊ぶ
  socket.on('game:play-again', () => {
    try {
      const room = roomManager.getRoomBySocketId(socket.id);
      if (!room) {
        socket.emit('room:error', { message: 'ルームに参加していません。' });
        return;
      }

      // ホスト権限チェック
      if (room.hostId !== socket.id) {
        socket.emit('room:error', {
          message: 'ホストのみがゲームを再開できます。',
        });
        return;
      }

      // 新しいGameEngineを生成
      const engine = new GameEngine(room.id, room.players);
      engines.set(room.id, engine);

      // Roomのゲーム状態を更新
      room.gameState = engine.getState();

      // ルーム全体に通知
      io.to(room.id).emit('game:started', { gameState: engine.getState() });
    } catch (error) {
      const message =
        typeof error === 'string'
          ? error
          : 'ゲームの再開に失敗しました。';
      socket.emit('room:error', { message });
    }
  });

  // NPC対戦開始
  socket.on('game:start-npc', (payload: StartNpcPayload, callback) => {
    try {
      // 既存ルームに参加中なら離脱
      const existingRoom = roomManager.getRoomBySocketId(socket.id);
      if (existingRoom) {
        roomManager.leaveRoom(socket.id);
      }

      const { nickname, difficulty } = payload;

      // NPCプレイヤー生成
      const npcId = 'npc-' + randomUUID();
      const npcPlayer = {
        id: npcId,
        nickname: NPC_NAMES[difficulty],
        isConnected: true,
        isNPC: true,
        npcDifficulty: difficulty,
      };

      // 人間プレイヤー生成
      const humanPlayer = {
        id: socket.id,
        nickname,
        isConnected: true,
      };

      // NPC用ルーム作成
      const room = roomManager.createNpcRoom(socket.id, [
        humanPlayer,
        npcPlayer,
      ]);

      // socketをルームに参加させる
      socket.join(room.id);

      // GameEngine生成
      const engine = new GameEngine(room.id, room.players);
      engines.set(room.id, engine);

      // Roomのゲーム状態を更新
      room.gameState = engine.getState();

      // NpcController生成
      const controller = new NpcController(difficulty, optimalTable);
      npcControllers.set(room.id, {
        controller,
        npcId,
        difficulty,
      });

      // コールバックで通知
      callback({ gameState: engine.getState() });

      // NPCが先手の場合、自動実行を開始
      triggerNpcTurnIfNeeded(
        io,
        engine,
        room.id,
        npcControllers.get(room.id),
      );
    } catch (error) {
      const message =
        typeof error === 'string'
          ? error
          : 'NPC対戦の開始に失敗しました。';
      callback({ message });
    }
  });

  // NPC対戦リスタート
  socket.on('game:restart-npc', () => {
    try {
      const room = roomManager.getRoomBySocketId(socket.id);
      if (!room) {
        socket.emit('room:error', { message: 'ルームに参加していません。' });
        return;
      }

      const npcInfo = npcControllers.get(room.id);
      if (!npcInfo) {
        socket.emit('room:error', {
          message: 'NPC対戦ではありません。',
        });
        return;
      }

      // 新しいGameEngineを生成
      const engine = new GameEngine(room.id, room.players);
      engines.set(room.id, engine);

      // Roomのゲーム状態を更新
      room.gameState = engine.getState();

      // 同じ難易度でNpcControllerを再生成
      const newController = new NpcController(npcInfo.difficulty, optimalTable);
      npcControllers.set(room.id, {
        controller: newController,
        npcId: npcInfo.npcId,
        difficulty: npcInfo.difficulty,
      });

      // ルーム全体に通知（game:started イベントで応答）
      io.to(room.id).emit('game:started', { gameState: engine.getState() });

      // NPCが先手なら自動実行
      triggerNpcTurnIfNeeded(
        io,
        engine,
        room.id,
        npcControllers.get(room.id),
      );
    } catch (error) {
      const message =
        typeof error === 'string'
          ? error
          : 'NPC対戦の再開に失敗しました。';
      socket.emit('room:error', { message });
    }
  });

  // NPC対戦再開（画面復帰時）
  socket.on('game:resume-npc', () => {
    try {
      const room = roomManager.getRoomBySocketId(socket.id);
      if (!room) {
        socket.emit('room:error', { message: 'ルームに参加していません。' });
        return;
      }

      const engine = engines.get(room.id);
      if (!engine) {
        socket.emit('room:error', { message: 'ゲームが開始されていません。' });
        return;
      }

      const npcInfo = npcControllers.get(room.id);
      if (!npcInfo) {
        socket.emit('room:error', { message: 'NPC対戦ではありません。' });
        return;
      }

      // 現在の状態を送信
      io.to(room.id).emit('game:state-update', { gameState: engine.getState() });

      // NPCのターンなら実行
      triggerNpcTurnIfNeeded(io, engine, room.id, npcInfo);
    } catch (error) {
      const message = typeof error === 'string' ? error : 'NPC再開に失敗しました。';
      socket.emit('room:error', { message });
    }
  });
}
