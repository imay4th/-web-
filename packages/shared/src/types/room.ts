import type { Player, GameState } from './game.js';

export interface Room {
  id: string;
  hostId: string;
  players: Player[];
  maxPlayers: number;
  gameState: GameState | null;
  createdAt: number;
}
