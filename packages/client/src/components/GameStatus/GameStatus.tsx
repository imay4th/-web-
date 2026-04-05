import type { GameState } from '@yacht/shared';
import styles from './GameStatus.module.css';

interface GameStatusProps {
  gameState: GameState;
  playerId: string;
  isMyTurn: boolean;
}

export function GameStatus({ gameState }: GameStatusProps) {
  return (
    <div className={styles.container}>
      <span className={styles.round}>
        R{gameState.round}/{gameState.totalRounds}
      </span>
    </div>
  );
}
