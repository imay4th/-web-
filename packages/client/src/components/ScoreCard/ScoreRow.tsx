import { useCallback, useEffect, useRef, useState } from 'react';
import type { CategoryDefinition } from '@yacht/shared';
import styles from './ScoreCard.module.css';

interface PlayerScore {
  playerId: string;
  score: number | null;
}

interface ScoreRowProps {
  category: CategoryDefinition;
  allPlayerScores: PlayerScore[];
  myPlayerId: string;
  possibleScore?: number;
  canSelect: boolean;
  isPending: boolean;
  onSelect: () => void;
  onConfirm: () => void;
}

export function ScoreRow({
  category,
  allPlayerScores,
  myPlayerId,
  possibleScore,
  canSelect,
  isPending,
  onSelect,
  onConfirm,
}: ScoreRowProps) {
  // 各プレイヤーのスコア変化を検知するためのref
  const prevScoresRef = useRef<Map<string, number | null>>(new Map());
  const [justScoredPlayers, setJustScoredPlayers] = useState<Set<string>>(
    new Set()
  );
  const [rowJustScored, setRowJustScored] = useState(false);

  useEffect(() => {
    const newlyScored = new Set<string>();
    for (const { playerId, score } of allPlayerScores) {
      const prev = prevScoresRef.current.get(playerId);
      if (prev === null && score !== null) {
        newlyScored.add(playerId);
      }
      prevScoresRef.current.set(playerId, score);
    }

    if (newlyScored.size > 0) {
      setJustScoredPlayers(newlyScored);
      setRowJustScored(true);

      const timer = setTimeout(() => {
        setJustScoredPlayers(new Set());
        setRowJustScored(false);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [allPlayerScores]);

  const handleCellClick = useCallback(() => {
    if (canSelect) {
      onSelect();
    }
  }, [canSelect, onSelect]);

  const handleConfirmClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onConfirm();
    },
    [onConfirm]
  );

  const rowClassName = [
    styles.row,
    isPending ? styles.pendingRow : '',
    rowJustScored ? styles.rowJustScored : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <tr className={rowClassName} title={category.description}>
      <td className={`${styles.cell} ${styles.categoryCell}`}>
        {category.name}
      </td>
      {allPlayerScores.map(({ playerId, score }) => {
        const isMe = playerId === myPlayerId;
        const isRecorded = score !== null;
        const showPreview = isMe && !isRecorded && possibleScore !== undefined;
        const isJustScored = justScoredPlayers.has(playerId);

        // セルのクラス名を構築
        const cellClasses = [styles.cell];

        if (isMe) {
          cellClasses.push(styles.myScoreCell);
          if (canSelect) {
            cellClasses.push(styles.myScoreCellSelectable);
          }
          if (isPending) {
            cellClasses.push(styles.pendingCell);
          }
        }

        if (isRecorded) {
          if (score === 0) {
            cellClasses.push(styles.scoreZero);
          } else {
            cellClasses.push(styles.scoreRecorded);
          }
        } else if (!showPreview) {
          cellClasses.push(styles.scoreDash);
        }

        // 表示値を決定
        let displayContent: React.ReactNode;
        if (isRecorded) {
          displayContent = (
            <span className={isJustScored ? styles.scoreJustRecorded : ''}>
              {score}
            </span>
          );
        } else if (showPreview) {
          displayContent = (
            <span className={styles.scorePreview}>{possibleScore}</span>
          );
        } else {
          displayContent = '-';
        }

        // 確定ボタン（自分のペンディングセルのみ）
        const showConfirm = isMe && isPending;

        return (
          <td
            key={playerId}
            className={cellClasses.join(' ')}
            onClick={isMe ? handleCellClick : undefined}
          >
            {displayContent}
            {showConfirm && (
              <button
                type="button"
                className={styles.confirmBtn}
                onClick={handleConfirmClick}
              >
                確定
              </button>
            )}
          </td>
        );
      })}
    </tr>
  );
}
