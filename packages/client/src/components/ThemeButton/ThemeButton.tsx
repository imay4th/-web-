import { useState } from 'react';
import { ThemePanel } from '../ThemePanel/ThemePanel';
import styles from './ThemeButton.module.css';

export function ThemeButton() {
  const [showPanel, setShowPanel] = useState(false);

  return (
    <>
      <button
        type="button"
        className={styles.button}
        onClick={() => setShowPanel((p) => !p)}
        aria-label="テーマ設定"
      >
        🎨
      </button>
      {showPanel && <ThemePanel onClose={() => setShowPanel(false)} />}
    </>
  );
}
