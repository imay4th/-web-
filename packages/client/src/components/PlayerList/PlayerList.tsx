import type { GameState, ScoreCard } from '@yacht/shared';
import { calculateTotalScore } from '@yacht/shared';
import styles from './PlayerList.module.css';

interface PlayerListProps {
  gameState: GameState;
  playerId: string;
}

export function PlayerList({ gameState, playerId }: PlayerListProps) {
  const currentPlayer = gameState.players[gameState.currentPlayerIndex];

  return (
    <div className={styles.container}>
      {gameState.players.map((player) => {
        const scoreCard = gameState.scoreCards[player.id] as ScoreCard | undefined;
        const totalScore = scoreCard ? calculateTotalScore(scoreCard) : 0;
        const isCurrent = currentPlayer?.id === player.id;
        const isSelf = player.id === playerId;

        return (
          <div
            key={player.id}
            className={`${styles.player} ${isCurrent ? styles.current : ''} ${!player.isConnected ? styles.disconnected : ''}`}
          >
            <div className={styles.avatar}>
              {player.nickname.charAt(0).toUpperCase()}
            </div>
            <span className={`${styles.name} ${isSelf ? styles.self : ''}`}>
              {player.nickname}
              {isSelf ? '' : ''}
            </span>
            <span className={styles.score}>{totalScore}</span>
            {!player.isConnected && (
              <span className={styles.offlineIcon} aria-label="切断中">
                &#x26A0;
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
