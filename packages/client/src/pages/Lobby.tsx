import { useState, useRef, type FormEvent } from 'react';
import styles from './Lobby.module.css';

interface LobbyProps {
  nickname: string;
  onCreateRoom: () => void;
  onJoinRoom: (roomId: string) => void;
  onStartNpc: () => void;
  error: string | null;
}

export function Lobby({ nickname, onCreateRoom, onJoinRoom, onStartNpc, error }: LobbyProps) {
  const [roomId, setRoomId] = useState('');
  const composingRef = useRef(false);

  const handleRoomIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (composingRef.current) return;
    const filtered = e.target.value.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
    setRoomId(filtered);
  };

  const handleCompositionStart = () => {
    composingRef.current = true;
  };

  const handleCompositionEnd = (e: React.CompositionEvent<HTMLInputElement>) => {
    composingRef.current = false;
    const filtered = (e.target as HTMLInputElement).value
      .replace(/[^A-Za-z0-9]/g, '').toUpperCase();
    setRoomId(filtered);
  };

  const handleBlur = () => {
    composingRef.current = false;
  };

  const handleJoinSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = roomId.trim().toUpperCase();
    if (trimmed.length === 0) return;
    onJoinRoom(trimmed);
  };

  const isRoomIdValid = roomId.trim().length > 0;

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <p className={styles.welcome}>
          ようこそ、<span className={styles.welcomeName}>{nickname}</span>さん
        </p>

        <div className={styles.createSection}>
          <button
            type="button"
            className={styles.createBtn}
            onClick={onCreateRoom}
          >
            ルームを作成
          </button>
        </div>

        <div className={styles.divider}>
          <span className={styles.dividerLine} />
          <span>または</span>
          <span className={styles.dividerLine} />
        </div>

        <div className={styles.joinSection}>
          <p className={styles.joinTitle}>ルームに参加</p>
          <form className={styles.joinForm} onSubmit={handleJoinSubmit}>
            <input
              className={styles.roomIdInput}
              type="text"
              inputMode="text"
              value={roomId}
              onChange={handleRoomIdChange}
              onCompositionStart={handleCompositionStart}
              onCompositionEnd={handleCompositionEnd}
              onBlur={handleBlur}
              placeholder="ルームID"
              maxLength={4}
              autoComplete="off"
              autoCapitalize="characters"
            />
            <button
              type="submit"
              className={styles.joinBtn}
              disabled={!isRoomIdValid}
            >
              参加
            </button>
          </form>
        </div>

        <div className={styles.npcSection}>
          <button type="button" className={styles.npcBtn} onClick={onStartNpc}>
            1人で遊ぶ
          </button>
        </div>

        {error && (
          <div className={styles.error}>{error}</div>
        )}
      </div>
    </div>
  );
}
