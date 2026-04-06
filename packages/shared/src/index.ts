// 型定義
export type {
  GamePhase,
  TurnPhase,
  Player,
  Die,
  Category,
  ScoreCard,
  GameState,
  RankingEntry,
  NpcDifficulty,
} from './types/game.js';

export type { Room } from './types/room.js';

export type {
  ServerToClientEvents,
  ClientToServerEvents,
  RoomCreatePayload,
  RoomCreatedPayload,
  RoomJoinPayload,
  RoomJoinedPayload,
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
  ToggleKeepPayload,
  ScorePayload,
  GameRollPayload,
  StartNpcPayload,
} from './types/socket-events.js';

// 定数
export {
  MAX_PLAYERS,
  MIN_PLAYERS,
  MAX_ROLLS,
  DICE_COUNT,
  TOTAL_CATEGORIES,
} from './constants/game.js';

export { CATEGORIES } from './constants/categories.js';
export type { CategoryDefinition } from './constants/categories.js';

// スコア計算
export {
  calculateScore,
  calculatePossibleScores,
  calculateTotalScore,
  calculateUpperSubtotal,
  calculateBonus,
} from './scoring/calculator.js';

// AI
export {
  getRollDistribution,
  getAllKeepMasks,
  computeExpectedValue,
  getBestAdjustedScore,
  getAvailableCategories,
  createNpcStrategy,
  solveOptimalTable,
  serializeTable,
  deserializeTable,
  lookupValue,
  OPTIMAL_CATEGORIES,
  OPTIMAL_UPPER_SUB_SIZE,
  initOptimalTable,
  getOptimalTable,
  isOptimalTableLoaded,
} from './ai/index.js';
export type { NpcDecision, NpcStrategy } from './ai/index.js';
export type { SolverProgress } from './ai/index.js';
