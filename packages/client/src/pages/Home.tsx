import { useState, useEffect, type FormEvent } from 'react';
import styles from './Home.module.css';

interface HomeProps {
  onSetNickname: (nickname: string) => void;
}

const NICKNAME_STORAGE_KEY = 'yacht-nickname';

export function Home({ onSetNickname }: HomeProps) {
  const [nickname, setNickname] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem(NICKNAME_STORAGE_KEY);
    if (saved) {
      setNickname(saved);
    }
  }, []);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = nickname.trim();
    if (trimmed.length === 0) return;

    localStorage.setItem(NICKNAME_STORAGE_KEY, trimmed);
    onSetNickname(trimmed);
  };

  const isValid = nickname.trim().length > 0;

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.diceDecoration}>
          <span role="img" aria-label="dice">&#x2680;</span>
          <span role="img" aria-label="dice">&#x2681;</span>
          <span role="img" aria-label="dice">&#x2682;</span>
          <span role="img" aria-label="dice">&#x2683;</span>
          <span role="img" aria-label="dice">&#x2684;</span>
        </div>
        <h1 className={styles.title}>ヨット</h1>
        <p className={styles.subtitle}>オンラインダイスゲーム</p>
        <div className={styles.ornament} />
        <form className={styles.form} onSubmit={handleSubmit}>
          <label className={styles.label} htmlFor="nickname">
            ニックネーム
          </label>
          <input
            id="nickname"
            className={styles.input}
            type="text"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="ニックネームを入力"
            maxLength={12}
            autoComplete="off"
            autoFocus
          />
          <button
            type="submit"
            className={styles.submitBtn}
            disabled={!isValid}
          >
            はじめる
          </button>
        </form>
      </div>
    </div>
  );
}
