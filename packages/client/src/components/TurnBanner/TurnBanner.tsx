import { useState, useEffect, useRef } from 'react';
import styles from './TurnBanner.module.css';

interface TurnBannerProps {
  isMyTurn: boolean;
  gameStarted: boolean;
}

export function TurnBanner({ isMyTurn, gameStarted }: TurnBannerProps) {
  const [visible, setVisible] = useState(false);
  const prevIsMyTurn = useRef(isMyTurn);
  const initialMount = useRef(true);

  useEffect(() => {
    if (!gameStarted) return;

    // 初回マウント時に自分のターンならバナー表示
    if (initialMount.current) {
      initialMount.current = false;
      if (isMyTurn) {
        setVisible(true);
        const timer = setTimeout(() => setVisible(false), 1600);
        return () => clearTimeout(timer);
      }
      return;
    }

    // isMyTurn が false → true に変化した時にバナー表示
    if (isMyTurn && !prevIsMyTurn.current) {
      setVisible(true);
      const timer = setTimeout(() => setVisible(false), 1600);
      return () => clearTimeout(timer);
    }
    prevIsMyTurn.current = isMyTurn;
  }, [isMyTurn, gameStarted]);

  if (!visible) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.banner}>あなたの番です!</div>
    </div>
  );
}
