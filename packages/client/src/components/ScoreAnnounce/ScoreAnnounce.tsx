import { useEffect, useState } from 'react';
import styles from './ScoreAnnounce.module.css';

interface ScoreAnnounceProps {
  playerName: string;
  categoryName: string;
  score: number;
}

const DURATION = 2500;

export function ScoreAnnounce({ playerName, categoryName, score }: ScoreAnnounceProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), DURATION);
    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.textContainer}>
        <div className={styles.playerText}>{playerName}</div>
        <div className={styles.categoryText}>{categoryName}</div>
        <div className={styles.scoreText}>{score}点</div>
      </div>
    </div>
  );
}
