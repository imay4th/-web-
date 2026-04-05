import { useCallback } from 'react';
import styles from './DiceArea.module.css';

interface DieProps {
  value: number;
  kept: boolean;
  isMyTurn: boolean;
  canToggle: boolean;
  rolling: boolean;
  index: number;
  isYacht?: boolean;
  onToggleKeep: () => void;
}

/** ダイスの目ごとのドット位置 */
const DOT_POSITIONS: Record<number, number[][]> = {
  1: [[1, 1]],
  2: [[0, 2], [2, 0]],
  3: [[0, 2], [1, 1], [2, 0]],
  4: [[0, 0], [0, 2], [2, 0], [2, 2]],
  5: [[0, 0], [0, 2], [1, 1], [2, 0], [2, 2]],
  6: [[0, 0], [1, 0], [2, 0], [0, 2], [1, 2], [2, 2]],
};

export function Die({ value, kept, isMyTurn, canToggle, rolling, index, isYacht, onToggleKeep }: DieProps) {
  const handleClick = useCallback(() => {
    if (isMyTurn && canToggle) {
      onToggleKeep();
    }
  }, [isMyTurn, canToggle, onToggleKeep]);

  const dots = DOT_POSITIONS[value] ?? [];
  const interactive = isMyTurn && canToggle;

  const classNames = [
    styles.die,
    kept ? styles.dieKept : '',
    rolling && !kept ? styles.dieRolling : '',
    interactive ? styles.dieInteractive : '',
    isYacht ? styles.dieYacht : '',
  ]
    .filter(Boolean)
    .join(' ');

  const animStyle = rolling && !kept ? { animationDelay: `${index * 60}ms` } : undefined;

  return (
    <button
      type="button"
      className={classNames}
      style={animStyle}
      onClick={handleClick}
      disabled={!interactive}
      aria-label={`ダイス ${value}${kept ? ' (キープ中)' : ''}`}
    >
      <div className={styles.dieGrid}>
        {[0, 1, 2].map((row) =>
          [0, 1, 2].map((col) => {
            const hasDot = dots.some(([r, c]) => r === row && c === col);
            return (
              <div
                key={`${row}-${col}`}
                className={`${styles.dotCell} ${hasDot ? styles.dotVisible : ''}`}
              >
                {hasDot && <div className={styles.dot} />}
              </div>
            );
          }),
        )}
      </div>
    </button>
  );
}
