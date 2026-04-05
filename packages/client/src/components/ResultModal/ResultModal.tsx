import { useEffect } from 'react';
import type { RankingEntry } from '@yacht/shared';
import { useAudio } from '../../audio/useAudio';
import styles from './ResultModal.module.css';

interface ResultModalProps {
  rankings: RankingEntry[];
  playerId: string;
  onPlayAgain: () => void;
  onBackToLobby: () => void;
  isNpcGame?: boolean;
  onRestartNpc?: () => void;
  onBackToNpcSelect?: () => void;
}

function getRankStyle(rank: number): string {
  switch (rank) {
    case 1:
      return styles.gold;
    case 2:
      return styles.silver;
    case 3:
      return styles.bronze;
    default:
      return '';
  }
}

function getRankIcon(rank: number): string {
  switch (rank) {
    case 1:
      return '\uD83E\uDD47';
    case 2:
      return '\uD83E\uDD48';
    case 3:
      return '\uD83E\uDD49';
    default:
      return `${rank}`;
  }
}

export function ResultModal({
  rankings,
  playerId,
  onPlayAgain,
  onBackToLobby,
  isNpcGame,
  onRestartNpc,
  onBackToNpcSelect,
}: ResultModalProps) {
  const audio = useAudio();

  useEffect(() => {
    audio.play('gameEnd');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const myEntry = rankings.find((e) => e.playerId === playerId);
  const isWinner = myEntry?.rank === 1;

  // 2人対戦時のスコア差計算
  const scoreDiff =
    rankings.length === 2 && myEntry
      ? (() => {
          const opponent = rankings.find((e) => e.playerId !== playerId);
          if (!opponent) return null;
          const diff = myEntry.totalScore - opponent.totalScore;
          return diff;
        })()
      : null;

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h2 className={styles.title}>ゲーム終了!</h2>

        {isWinner && (
          <p className={styles.congrats}>おめでとう!</p>
        )}

        <div className={styles.rankingList}>
          {rankings.map((entry) => {
            const isSelf = entry.playerId === playerId;
            const isFirst = entry.rank === 1;
            return (
              <div
                key={entry.playerId}
                className={`${styles.rankingItem} ${getRankStyle(entry.rank)} ${isSelf ? styles.self : ''} ${isFirst ? styles.winner : ''}`}
              >
                <span className={`${styles.rankBadge} ${isFirst ? styles.rankBadgeWinner : ''}`}>
                  {getRankIcon(entry.rank)}
                </span>
                <span className={styles.rankName}>
                  {entry.nickname}
                  {isSelf ? ' (あなた)' : ''}
                </span>
                <span className={`${styles.rankScore} ${isFirst ? styles.rankScoreWinner : ''}`}>
                  {entry.totalScore}点
                </span>
              </div>
            );
          })}
        </div>

        {scoreDiff !== null && scoreDiff > 0 && isWinner && (
          <p className={styles.scoreDiff}>+{scoreDiff}点差で勝利!</p>
        )}
        {scoreDiff !== null && scoreDiff < 0 && (
          <p className={styles.scoreDiffLose}>{scoreDiff}点差</p>
        )}

        <div className={styles.actions}>
          {isNpcGame ? (
            <>
              <button
                type="button"
                className={styles.playAgainBtn}
                onClick={onRestartNpc}
              >
                リスタート
              </button>
              <button
                type="button"
                className={styles.lobbyBtn}
                onClick={onBackToNpcSelect}
              >
                難易度を変える
              </button>
              <button
                type="button"
                className={styles.lobbyBtn}
                onClick={onBackToLobby}
              >
                ロビーに戻る
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                className={styles.playAgainBtn}
                onClick={onPlayAgain}
              >
                もう一度遊ぶ
              </button>
              <button
                type="button"
                className={styles.lobbyBtn}
                onClick={onBackToLobby}
              >
                ロビーに戻る
              </button>
            </>
          )}
        </div>

        <p className={styles.credit}>音楽: 魔王魂</p>
      </div>
    </div>
  );
}
