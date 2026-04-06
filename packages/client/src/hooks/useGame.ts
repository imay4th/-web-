import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import type {
  Room,
  GameState,
  RankingEntry,
  Category,
  NpcDifficulty,
  PlayerJoinedPayload,
  PlayerLeftPayload,
  RoomErrorPayload,
  GameStartedPayload,
  GameStateUpdatePayload,
  GameRolledPayload,
  GameScoredPayload,
  GameTurnChangedPayload,
  GameFinishedPayload,
  PlayerDisconnectedPayload,
  PlayerReconnectedPayload,
} from '@yacht/shared';
import { MAX_ROLLS } from '@yacht/shared';
import { socket } from '../socket';
import { useSocket } from './useSocket';

type Screen = 'home' | 'lobby' | 'waitingRoom' | 'npcSelect' | 'game';

export interface UseGameReturn {
  screen: Screen;
  nickname: string;
  playerId: string | null;
  room: Room | null;
  gameState: GameState | null;
  rankings: RankingEntry[] | null;
  lastScoredEvent: GameScoredPayload | null;
  error: string | null;
  isConnected: boolean;
  isMyTurn: boolean;
  npcDifficulty: NpcDifficulty | null;
  showResumeOverlay: boolean;

  setNickname: (name: string) => void;
  createRoom: () => void;
  joinRoom: (roomId: string) => void;
  leaveRoom: () => void;
  startGame: () => void;
  rollDice: (testDiceValues?: number[]) => void;
  toggleKeep: (dieIndex: number) => void;
  scoreCategory: (category: Category) => void;
  playAgain: () => void;
  backToLobby: () => void;
  showNpcSelect: () => void;
  startNpcGame: (difficulty: NpcDifficulty) => void;
  restartNpcGame: () => void;
  backToNpcSelect: () => void;
  resumeNpcGame: () => void;
}

export function useGame(): UseGameReturn {
  const { isConnected } = useSocket();

  const [screen, setScreen] = useState<Screen>('home');
  const [nickname, setNicknameState] = useState('');
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [room, setRoom] = useState<Room | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [rankings, setRankings] = useState<RankingEntry[] | null>(null);
  const [lastScoredEvent, setLastScoredEvent] = useState<GameScoredPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [npcDifficulty, setNpcDifficulty] = useState<NpcDifficulty | null>(null);
  const [showResumeOverlay, setShowResumeOverlay] = useState(false);

  // クロージャ問題を回避するための ref
  const npcDifficultyRef = useRef<NpcDifficulty | null>(null);
  npcDifficultyRef.current = npcDifficulty;

  // gameState から roomId を取得して保持
  const roomIdRef = useRef<string | null>(null);

  const isMyTurn = useMemo(() => {
    if (!gameState || !playerId) return false;
    const currentPlayer = gameState.players[gameState.currentPlayerIndex];
    return currentPlayer?.id === playerId;
  }, [gameState, playerId]);

  // --- Socket.io イベントリスナー ---
  useEffect(() => {
    const onPlayerJoined = (payload: PlayerJoinedPayload) => {
      setRoom((prev) => {
        if (!prev) return prev;
        const alreadyExists = prev.players.some((p) => p.id === payload.playerId);
        if (alreadyExists) return prev;
        return {
          ...prev,
          players: [
            ...prev.players,
            {
              id: payload.playerId,
              nickname: payload.nickname,
              isConnected: true,
            },
          ],
        };
      });
    };

    const onPlayerLeft = (payload: PlayerLeftPayload) => {
      setRoom((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          hostId: payload.newHostId ?? prev.hostId,
          players: prev.players.filter((p) => p.id !== payload.playerId),
        };
      });
    };

    const onRoomError = (payload: RoomErrorPayload) => {
      setError(payload.message);
    };

    const onGameStarted = (payload: GameStartedPayload) => {
      setGameState(payload.gameState);
      setRankings(null);
      setScreen('game');
    };

    const onGameStateUpdate = (payload: GameStateUpdatePayload) => {
      setGameState(payload.gameState);
    };

    const onGameRolled = (payload: GameRolledPayload) => {
      setGameState((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          dice: payload.dice,
          rollCount: payload.rollCount,
          turnPhase: payload.rollCount >= MAX_ROLLS ? 'SCORING' as const : prev.turnPhase,
        };
      });
    };

    const onGameScored = (payload: GameScoredPayload) => {
      setLastScoredEvent(payload);
      setGameState((prev) => {
        if (!prev) return prev;
        const updatedScoreCards = { ...prev.scoreCards };
        if (updatedScoreCards[payload.playerId]) {
          updatedScoreCards[payload.playerId] = {
            ...updatedScoreCards[payload.playerId],
            [payload.category]: payload.score,
          };
        }
        return {
          ...prev,
          scoreCards: updatedScoreCards,
        };
      });
    };

    const onGameTurnChanged = (payload: GameTurnChangedPayload) => {
      // スコア記入アニメーション完了を待つ
      setTimeout(() => {
        setGameState((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            currentPlayerIndex: payload.currentPlayerIndex,
            round: payload.round,
            rollCount: 0,
            turnPhase: 'ROLLING',
            dice: prev.dice.map((d) => ({ ...d, kept: false })),
          };
        });
      }, 800);
    };

    const onGameFinished = (payload: GameFinishedPayload) => {
      setRankings(payload.rankings);
      setGameState(payload.finalState);
    };

    const onPlayerDisconnected = (payload: PlayerDisconnectedPayload) => {
      setGameState((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          players: prev.players.map((p) =>
            p.id === payload.playerId ? { ...p, isConnected: false } : p,
          ),
        };
      });
      setRoom((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          players: prev.players.map((p) =>
            p.id === payload.playerId ? { ...p, isConnected: false } : p,
          ),
        };
      });
    };

    const onPlayerReconnected = (payload: PlayerReconnectedPayload) => {
      setGameState((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          players: prev.players.map((p) =>
            p.id === payload.playerId ? { ...p, isConnected: true } : p,
          ),
        };
      });
      setRoom((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          players: prev.players.map((p) =>
            p.id === payload.playerId ? { ...p, isConnected: true } : p,
          ),
        };
      });
    };

    const onSessionExpired = () => {
      if (npcDifficultyRef.current) {
        setScreen('npcSelect');
      } else {
        setScreen('lobby');
      }
      setGameState(null);
      setRankings(null);
      setRoom(null);
      setError('ゲームセッションの有効期限が切れました。');
    };

    socket.on('room:player-joined', onPlayerJoined);
    socket.on('room:player-left', onPlayerLeft);
    socket.on('room:error', onRoomError);
    socket.on('game:started', onGameStarted);
    socket.on('game:state-update', onGameStateUpdate);
    socket.on('game:rolled', onGameRolled);
    socket.on('game:scored', onGameScored);
    socket.on('game:turn-changed', onGameTurnChanged);
    socket.on('game:finished', onGameFinished);
    socket.on('player:disconnected', onPlayerDisconnected);
    socket.on('player:reconnected', onPlayerReconnected);
    socket.on('game:session-expired', onSessionExpired);

    return () => {
      socket.off('room:player-joined', onPlayerJoined);
      socket.off('room:player-left', onPlayerLeft);
      socket.off('room:error', onRoomError);
      socket.off('game:started', onGameStarted);
      socket.off('game:state-update', onGameStateUpdate);
      socket.off('game:rolled', onGameRolled);
      socket.off('game:scored', onGameScored);
      socket.off('game:turn-changed', onGameTurnChanged);
      socket.off('game:finished', onGameFinished);
      socket.off('player:disconnected', onPlayerDisconnected);
      socket.off('player:reconnected', onPlayerReconnected);
      socket.off('game:session-expired', onSessionExpired);
    };
  }, []);

  // gameState が更新されるたびに roomId を保持
  useEffect(() => {
    if (gameState?.roomId) {
      roomIdRef.current = gameState.roomId;
    }
  }, [gameState]);

  // 画面復帰時の再接続処理
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) return;
      if (screen !== 'game') return;
      if (socket.connected) return;

      const roomId = roomIdRef.current;
      if (!roomId || !nickname) return;

      socket.connect();
      socket.once('connect', () => {
        socket.emit('game:rejoin', { nickname, roomId }, (response: { gameState: GameState; playerId: string } | { message: string }) => {
          if ('message' in response) {
            // セッション切れ: ロビーに戻す
            if (npcDifficultyRef.current) {
              setScreen('npcSelect');
            } else {
              setScreen('lobby');
            }
            setGameState(null);
            setRankings(null);
            setError(response.message);
            return;
          }
          // 再接続成功
          setGameState(response.gameState);
          setPlayerId(response.playerId);
          if (npcDifficultyRef.current) {
            setShowResumeOverlay(true);
          }
        });
      });
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [screen, nickname]);

  // --- アクション ---
  const setNickname = useCallback((name: string) => {
    setNicknameState(name);
    setError(null);
    setScreen('lobby');
  }, []);

  const createRoom = useCallback(() => {
    setError(null);
    socket.emit('room:create', { nickname }, (response) => {
      if ('message' in response) {
        setError(response.message);
      } else {
        setRoom(response.room);
        setPlayerId(response.playerId);
        setScreen('waitingRoom');
      }
    });
  }, [nickname]);

  const joinRoom = useCallback(
    (roomId: string) => {
      setError(null);
      socket.emit('room:join', { roomId, nickname }, (response) => {
        if ('message' in response) {
          setError(response.message);
        } else {
          setRoom(response.room);
          setPlayerId(response.playerId);
          setScreen('waitingRoom');
        }
      });
    },
    [nickname],
  );

  const leaveRoom = useCallback(() => {
    socket.emit('room:leave');
    setRoom(null);
    setGameState(null);
    setRankings(null);
    setError(null);
    setScreen('lobby');
  }, []);

  const startGame = useCallback(() => {
    socket.emit('game:start');
  }, []);

  const rollDice = useCallback((testDiceValues?: number[]) => {
    if (testDiceValues) {
      socket.emit('game:roll', { testDiceValues });
    } else {
      socket.emit('game:roll');
    }
  }, []);

  const toggleKeep = useCallback((dieIndex: number) => {
    socket.emit('game:toggle-keep', { dieIndex });
  }, []);

  const scoreCategory = useCallback((category: Category) => {
    socket.emit('game:score', { category });
  }, []);

  const playAgain = useCallback(() => {
    socket.emit('game:play-again');
    setRankings(null);
  }, []);

  const backToLobby = useCallback(() => {
    socket.emit('room:leave');
    setRoom(null);
    setGameState(null);
    setRankings(null);
    setError(null);
    setNpcDifficulty(null);
    setScreen('lobby');
  }, []);

  const showNpcSelect = useCallback(() => {
    setScreen('npcSelect');
  }, []);

  const startNpcGame = useCallback(
    (difficulty: NpcDifficulty) => {
      setError(null);
      setNpcDifficulty(difficulty);
      socket.emit('game:start-npc', { nickname, difficulty }, (response) => {
        if ('message' in response) {
          setError(response.message);
        } else {
          setGameState(response.gameState);
          setPlayerId(socket.id ?? null);
          setRankings(null);
          setScreen('game');
        }
      });
    },
    [nickname],
  );

  const restartNpcGame = useCallback(() => {
    socket.emit('game:restart-npc');
    setRankings(null);
  }, []);

  const backToNpcSelect = useCallback(() => {
    socket.emit('room:leave');
    setRoom(null);
    setGameState(null);
    setRankings(null);
    setError(null);
    setNpcDifficulty(null);
    setScreen('npcSelect');
  }, []);

  const resumeNpcGame = useCallback(() => {
    socket.emit('game:resume-npc');
    setShowResumeOverlay(false);
  }, []);

  return {
    screen,
    nickname,
    playerId,
    room,
    gameState,
    rankings,
    lastScoredEvent,
    error,
    isConnected,
    isMyTurn,
    npcDifficulty,
    showResumeOverlay,
    setNickname,
    createRoom,
    joinRoom,
    leaveRoom,
    startGame,
    rollDice,
    toggleKeep,
    scoreCategory,
    playAgain,
    backToLobby,
    showNpcSelect,
    startNpcGame,
    restartNpcGame,
    backToNpcSelect,
    resumeNpcGame,
  };
}
