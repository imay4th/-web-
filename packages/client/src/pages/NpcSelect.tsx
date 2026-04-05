import type { NpcDifficulty } from '@yacht/shared';
import styles from './NpcSelect.module.css';

interface NpcSelectProps {
  onSelect: (difficulty: NpcDifficulty) => void;
  onBack: () => void;
}

const DIFFICULTIES: {
  key: NpcDifficulty;
  label: string;
  description: string;
}[] = [
  { key: 'easy', label: 'よわい', description: 'ランダムな判断をする初心者NPC' },
  {
    key: 'normal',
    label: 'ふつう',
    description: '基本的な戦略を使うNPC',
  },
  {
    key: 'hard',
    label: 'つよい',
    description: '期待値を計算する上級NPC',
  },
  {
    key: 'expert',
    label: 'さいきょう',
    description: '最善手を追求する最強NPC',
  },
];

export function NpcSelect({ onSelect, onBack }: NpcSelectProps) {
  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h2 className={styles.title}>NPC対戦</h2>
        <p className={styles.subtitle}>難易度を選んでください</p>

        <div className={styles.difficultyList}>
          {DIFFICULTIES.map((d) => (
            <button
              key={d.key}
              type="button"
              className={styles.difficultyCard}
              onClick={() => onSelect(d.key)}
            >
              <span className={styles.difficultyLabel}>{d.label}</span>
              <span className={styles.difficultyDesc}>{d.description}</span>
            </button>
          ))}
        </div>

        <button type="button" className={styles.backBtn} onClick={onBack}>
          戻る
        </button>
      </div>
    </div>
  );
}
