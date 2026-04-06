import { useEffect, useRef } from 'react';
import { useTheme } from '../../theme/useTheme';
import { backgroundThemes, diceThemes, accentThemes } from '../../theme/theme-presets';
import styles from './ThemePanel.module.css';

interface ThemePanelProps {
  onClose: () => void;
}

export function ThemePanel({ onClose }: ThemePanelProps) {
  const theme = useTheme();
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    const timer = setTimeout(() => {
      document.addEventListener('mousedown', handleOutsideClick);
    }, 0);
    return () => {
      clearTimeout(timer);
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [onClose]);

  return (
    <div className={styles.panel} ref={panelRef}>
      {/* 背景セクション */}
      <div className={styles.section}>
        <span className={styles.sectionLabel}>背景</span>
        <div className={styles.options}>
          {backgroundThemes.map((bg) => (
            <button
              key={bg.id}
              type="button"
              className={`${styles.optionBtn} ${theme.selection.backgroundId === bg.id ? styles.optionSelected : ''}`}
              onClick={() => theme.setBackground(bg.id)}
              title={bg.name}
            >
              <span
                className={styles.bgPreview}
                style={{ background: bg.bodyBackground }}
              />
              <span className={styles.optionName}>{bg.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ダイスセクション */}
      <div className={styles.section}>
        <span className={styles.sectionLabel}>ダイス</span>
        <div className={styles.options}>
          {diceThemes.map((dice) => (
            <button
              key={dice.id}
              type="button"
              className={`${styles.optionBtn} ${theme.selection.diceId === dice.id ? styles.optionSelected : ''}`}
              onClick={() => theme.setDice(dice.id)}
              title={dice.name}
            >
              {dice.imagePath ? (
                <img
                  src={`${dice.imagePath}/1.png`}
                  alt={dice.name}
                  className={styles.dicePreviewImage}
                />
              ) : (
                <span
                  className={styles.dicePreview}
                  style={{ background: dice.vars['--die-bg'] }}
                >
                  <span
                    className={styles.diceDot}
                    style={{ background: dice.vars['--dot-bg'] }}
                  />
                </span>
              )}
              <span className={styles.optionName}>{dice.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* アクセントセクション */}
      <div className={styles.section}>
        <span className={styles.sectionLabel}>アクセント</span>
        <div className={styles.options}>
          {accentThemes.map((accent) => (
            <button
              key={accent.id}
              type="button"
              className={`${styles.optionBtn} ${theme.selection.accentId === accent.id ? styles.optionSelected : ''}`}
              onClick={() => theme.setAccent(accent.id)}
              title={accent.name}
            >
              <span
                className={styles.accentPreview}
                style={{ background: accent.vars['--accent'] }}
              />
              <span className={styles.optionName}>{accent.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
