import { useEffect, useRef } from 'react';
import { useAudio } from '../../audio/useAudio';
import styles from './AudioPanel.module.css';

interface AudioPanelProps {
  onClose: () => void;
}

export function AudioPanel({ onClose }: AudioPanelProps) {
  const audio = useAudio();
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    // Use setTimeout to avoid the panel being immediately closed
    // by the same click that opened it
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
      <div className={styles.row}>
        <span className={styles.label}>BGM</span>
        <button
          type="button"
          className={`${styles.toggleBtn} ${!audio.muted ? styles.toggleOn : ''}`}
          onClick={audio.toggleMute}
        >
          {audio.muted ? 'OFF' : 'ON'}
        </button>
      </div>
      <div className={styles.row}>
        <span className={styles.label}>BGM音量</span>
        <input
          type="range"
          min="0"
          max="1"
          step="0.05"
          value={audio.bgmVolume}
          onChange={(e) => audio.setBgmVolume(Number(e.target.value))}
          className={styles.slider}
        />
      </div>
      <div className={styles.row}>
        <span className={styles.label}>SE音量</span>
        <input
          type="range"
          min="0"
          max="1"
          step="0.05"
          value={audio.seVolume}
          onChange={(e) => audio.setSeVolume(Number(e.target.value))}
          className={styles.slider}
        />
      </div>
    </div>
  );
}
