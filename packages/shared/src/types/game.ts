export type GamePhase = 'WAITING' | 'PLAYING' | 'FINISHED';
export type TurnPhase = 'ROLLING' | 'SCORING';

export interface Player {
  id: string;
  nickname: string;
  isConnected: boolean;
  isNPC?: boolean;
  npcDifficulty?: NpcDifficulty;
}

export type NpcDifficulty = 'easy' | 'normal' | 'hard' | 'expert';

export interface Die {
  value: number; // 1-6
  kept: boolean;
}

export type Category =
  | 'ones'
  | 'twos'
  | 'threes'
  | 'fours'
  | 'fives'
  | 'sixes'
  | 'fullHouse'
  | 'fourOfAKind'
  | 'littleStraight'
  | 'bigStraight'
  | 'choice'
  | 'yacht';

export type ScoreCard = Record<Category, number | null>;

export interface GameState {
  roomId: string;
  phase: GamePhase;
  players: Player[];
  currentPlayerIndex: number;
  turnPhase: TurnPhase;
  rollCount: number;
  dice: Die[];
  scoreCards: Record<string, ScoreCard>; // playerId -> ScoreCard
  round: number;
  totalRounds: number;
}

export interface RankingEntry {
  playerId: string;
  nickname: string;
  totalScore: number;
  rank: number;
}
