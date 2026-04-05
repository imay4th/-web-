import { useState, useCallback } from 'react';
import type { Room } from '@yacht/shared';
import { MIN_PLAYERS } from '@yacht/shared';
import styles from './WaitingRoom.module.css';

interface WaitingRoomProps {
  room: Room;
  playerId: string;
  onStartGame: () => void;
  onLeaveRoom: () => void;
}

export function WaitingRoom({ room, playerId, onStartGame, onLeaveRoom }: WaitingRoomProps) {
  const [copied, setCopied] = useState(false);

  const isHost = room.hostId === playerId;
  const canStart = isHost && room.players.length >= MIN_PLAYERS;

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(room.id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // クリップボードAPIが使えない場合のフォールバック
      const textArea = document.createElement('textarea');
      textArea.value = room.id;
      textArea.style.position = 'fixed';
      textArea.style.opacity = '0';
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [room.id]);

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <p className={styles.roomLabel}>ルームID</p>
          <div className={styles.roomIdRow}>
            <span className={styles.roomId}>{room.id}</span>
            <button
              type="button"
              className={`${styles.copyBtn} ${copied ? styles.copyBtnCopied : ''}`}
              onClick={handleCopy}
              aria-label="ルームIDをコピー"
            >
              {copied ? '\u2713' : '\u2398'}
            </button>
          </div>
          <p className={styles.shareHint}>このIDを友達に共有してください</p>
        </div>

        <div className={styles.playerCount}>
          <span className={styles.playerCountLabel}>参加者</span>
          <span className={styles.playerCountValue}>
            {room.players.length}/{room.maxPlayers}人
          </span>
        </div>

        <ul className={styles.playerList}>
          {room.players.map((player) => (
            <li
              key={player.id}
              className={`${styles.playerItem} ${!player.isConnected ? styles.disconnected : ''}`}
            >
              <div className={styles.playerAvatar}>
                {player.nickname.charAt(0).toUpperCase()}
              </div>
              <span
                className={`${styles.playerName} ${player.id === playerId ? styles.playerSelf : ''}`}
              >
                {player.nickname}
                {player.id === playerId ? ' (あなた)' : ''}
              </span>
              {player.id === room.hostId && (
                <span className={styles.hostBadge} role="img" aria-label="ホスト">
                  &#x1F451;
                </span>
              )}
            </li>
          ))}
        </ul>

        <div className={styles.actions}>
          {isHost && (
            <button
              type="button"
              className={styles.startBtn}
              disabled={!canStart}
              onClick={onStartGame}
            >
              {canStart
                ? 'ゲームを開始'
                : `あと${MIN_PLAYERS - room.players.length}人必要`}
            </button>
          )}
          <button
            type="button"
            className={styles.leaveBtn}
            onClick={onLeaveRoom}
          >
            ルームを出る
          </button>
        </div>
      </div>
    </div>
  );
}
