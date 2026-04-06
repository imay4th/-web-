import { useCallback } from 'react';
import { diceThemes } from '../../theme/theme-presets';
import styles from './DiceArea.module.css';

interface DieProps {
  value: number;
  kept: boolean;
  isMyTurn: boolean;
  canToggle: boolean;
  rolling: boolean;
  index: number;
  diceThemeId?: string;
  isYacht?: boolean;
  displayIndex?: number;   // ロールエリア内の表示順（アニメーション遅延用）
  isGhost?: boolean;       // ゴースト表示
  isNewlyKept?: boolean;   // 新規キープ強調
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

export function Die({ value, kept, isMyTurn, canToggle, rolling, index, diceThemeId, isYacht, displayIndex, isGhost, isNewlyKept, onToggleKeep }: DieProps) {
  const handleClick = useCallback(() => {
    if (isMyTurn && canToggle) {
      onToggleKeep();
    }
  }, [isMyTurn, canToggle, onToggleKeep]);

  const currentTheme = diceThemes.find(t => t.id === (diceThemeId ?? 'classic'));
  const imagePath = currentTheme?.imagePath;
  const dots = DOT_POSITIONS[value] ?? [];
  const interactive = isMyTurn && canToggle;

  const classNames = [
    styles.die,
    imagePath ? styles.dieImageMode : '',
    kept ? styles.dieKept : '',
    rolling && !kept ? styles.dieRolling : '',
    interactive ? styles.dieInteractive : '',
    isYacht ? styles.dieYacht : '',
    isGhost ? styles.dieGhost : '',
    isNewlyKept ? styles.dieNewlyKept : '',
  ]
    .filter(Boolean)
    .join(' ');

  const animDelay = displayIndex ?? index;
  const animStyle = rolling && !kept ? { animationDelay: `${animDelay * 60}ms` } : undefined;

  return (
    <button
      type="button"
      className={classNames}
      style={animStyle}
      onClick={handleClick}
      disabled={!interactive || isGhost}
      aria-label={`ダイス ${value}${kept ? ' (キープ中)' : ''}`}
    >
      {imagePath ? (
        <img
          src={`${imagePath}/${value}.png`}
          alt={`ダイス${value}`}
          className={styles.dieImage}
          draggable={false}
        />
      ) : (
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
      )}
    </button>
  );
}
