import { useEffect, useState } from 'react';
import { useAudio } from '../../audio/useAudio';
import styles from './HandAnnounce.module.css';

interface HandAnnounceProps {
  handName: string;
  score: number;
}

const DURATION = 2500;

export function HandAnnounce({ handName, score }: HandAnnounceProps) {
  const audio = useAudio();
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    audio.play('handAnnounce');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), DURATION);
    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.textContainer}>
        <div className={styles.handText}>{handName}</div>
        <div className={styles.scoreText}>{score}点</div>
      </div>
    </div>
  );
}
