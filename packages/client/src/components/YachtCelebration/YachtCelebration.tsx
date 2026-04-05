import { useEffect, useState } from 'react';
import { useAudio } from '../../audio/useAudio';
import styles from './YachtCelebration.module.css';

interface YachtCelebrationProps {
  dieValue: number;
}

const CONFETTI_COUNT = 50;
const DURATION = 4000;

const CONFETTI_COLORS = ['#FFD700', '#c5a44e', '#FF6B6B', '#4ECDC4', '#f0d878', '#dbc06a', '#FF4500', '#00FF7F'];

export function YachtCelebration({ dieValue }: YachtCelebrationProps) {
  const audio = useAudio();
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    audio.play('yachtFanfare');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), DURATION);
    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.flash} />
      <div className={styles.confettiContainer}>
        {Array.from({ length: CONFETTI_COUNT }, (_, i) => (
          <div
            key={i}
            className={styles.confetti}
            style={{
              '--x': `${Math.random() * 100}vw`,
              '--delay': `${Math.random() * 1.5}s`,
              '--size': `${6 + Math.random() * 8}px`,
              '--color': CONFETTI_COLORS[i % CONFETTI_COLORS.length],
              '--drift': `${(Math.random() - 0.5) * 200}px`,
              '--rotation': `${Math.random() * 720}deg`,
            } as React.CSSProperties}
          />
        ))}
      </div>
      <div className={styles.textContainer}>
        <div className={styles.yachtText}>YACHT!</div>
        <div className={styles.scoreText}>50点獲得！</div>
      </div>
    </div>
  );
}
