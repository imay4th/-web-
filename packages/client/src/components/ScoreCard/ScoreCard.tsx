import { useMemo, useState, useEffect, useRef } from 'react';
import type { GameState, Category, ScoreCard as ScoreCardType } from '@yacht/shared';
import {
  CATEGORIES,
  calculatePossibleScores,
  calculateTotalScore,
  calculateUpperSubtotal,
  calculateBonus,
} from '@yacht/shared';
import { ScoreRow } from './ScoreRow';
import { useAudio } from '../../audio/useAudio';
import styles from './ScoreCard.module.css';

interface ScoreCardProps {
  gameState: GameState;
  playerId: string;
  isMyTurn: boolean;
  onScore: (category: Category) => void;
}

const UPPER_CATEGORIES = CATEGORIES.slice(0, 6);
const LOWER_CATEGORIES = CATEGORIES.slice(6);

const UPPER_KEYS: Category[] = [
  'ones',
  'twos',
  'threes',
  'fours',
  'fives',
  'sixes',
];

export function ScoreCard({
  gameState,
  playerId,
  isMyTurn,
  onScore,
}: ScoreCardProps) {
  const audio = useAudio();
  const myScoreCard = gameState.scoreCards[playerId] as
    | ScoreCardType
    | undefined;

  // 確認ステップ用の状態
  const [pendingCategory, setPendingCategory] = useState<Category | null>(null);

  // ダイスロール時にペンディングをリセット
  const prevRollCountRef = useRef(gameState.rollCount);
  useEffect(() => {
    if (gameState.rollCount !== prevRollCountRef.current) {
      setPendingCategory(null);
      prevRollCountRef.current = gameState.rollCount;
    }
  }, [gameState.rollCount]);

  // ボーナス達成演出
  const [bonusHighlight, setBonusHighlight] = useState(false);
  const prevBonusRef = useRef<number>(0);
  const myBonus = myScoreCard ? calculateBonus(myScoreCard) : 0;

  useEffect(() => {
    if (prevBonusRef.current === 0 && myBonus === 35) {
      setBonusHighlight(true);
      audio.play('bonusAchieved');
      const timer = setTimeout(() => setBonusHighlight(false), 1000);
      return () => clearTimeout(timer);
    }
    prevBonusRef.current = myBonus;
  }, [myBonus, audio]);

  // 可能スコアの計算
  const possibleScores = useMemo(() => {
    if (!isMyTurn || gameState.rollCount < 1) return null;
    const diceValues = gameState.dice.map((d) => d.value);
    return calculatePossibleScores(diceValues);
  }, [isMyTurn, gameState.rollCount, gameState.dice]);

  // 全プレイヤー情報
  const allPlayers = gameState.players;
  const currentPlayerId =
    gameState.players[gameState.currentPlayerIndex]?.id ?? '';

  const canSelectCategory = (categoryId: Category): boolean => {
    if (!isMyTurn || !myScoreCard || gameState.rollCount < 1) return false;
    return myScoreCard[categoryId] === null;
  };

  // カテゴリ選択ハンドラ
  const handleSelect = (category: Category) => {
    if (pendingCategory === category) {
      // 同じカテゴリを再タップ → 確定
      audio.play('scoreWrite');
      onScore(category);
      setPendingCategory(null);
    } else {
      // 別のカテゴリを選択
      setPendingCategory(category);
    }
  };

  // 確定ボタンハンドラ
  const handleConfirm = (category: Category) => {
    audio.play('scoreWrite');
    onScore(category);
    setPendingCategory(null);
  };

  // 各カテゴリに対する全プレイヤーのスコア配列を生成
  const getAllPlayerScores = (categoryId: Category) => {
    return allPlayers.map((p) => {
      const sc = gameState.scoreCards[p.id] as ScoreCardType | undefined;
      return {
        playerId: p.id,
        score: sc ? sc[categoryId] : null,
      };
    });
  };

  // 小計・ボーナス・合計の全プレイヤー値
  const getSubtotals = () =>
    allPlayers.map((p) => {
      const sc = gameState.scoreCards[p.id] as ScoreCardType | undefined;
      return sc ? calculateUpperSubtotal(sc) : 0;
    });

  const getBonusInfo = () =>
    allPlayers.map((p) => {
      const sc = gameState.scoreCards[p.id] as ScoreCardType | undefined;
      if (!sc) return { subtotal: 0, achieved: false, complete: false };
      const subtotal = calculateUpperSubtotal(sc);
      const complete = UPPER_KEYS.every((key) => sc[key] !== null);
      const achieved = subtotal >= 63;
      return { subtotal, achieved, complete };
    });

  const getTotals = () =>
    allPlayers.map((p) => {
      const sc = gameState.scoreCards[p.id] as ScoreCardType | undefined;
      return sc ? calculateTotalScore(sc) : 0;
    });

  const subtotals = getSubtotals();
  const bonusInfos = getBonusInfo();
  const totals = getTotals();
  const colCount = allPlayers.length + 1;

  return (
    <div className={styles.container}>
      <table className={styles.table}>
        <thead>
          <tr className={styles.headerRow}>
            <th
              className={`${styles.headerCell} ${styles.headerCellCategory}`}
            >
              カテゴリ
            </th>
            {allPlayers.map((p) => {
              const isCurrentTurn = p.id === currentPlayerId;
              return (
                <th
                  key={p.id}
                  className={`${styles.headerCell} ${styles.headerCellPlayer} ${isCurrentTurn ? styles.headerCellActive : ''}`}
                >
                  {p.id === playerId ? 'あなた' : p.nickname}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {/* 上段カテゴリ */}
          {UPPER_CATEGORIES.map((cat) => (
            <ScoreRow
              key={cat.id}
              category={cat}
              allPlayerScores={getAllPlayerScores(cat.id)}
              myPlayerId={playerId}
              possibleScore={possibleScores?.[cat.id]}
              canSelect={canSelectCategory(cat.id)}
              isPending={pendingCategory === cat.id}
              onSelect={() => handleSelect(cat.id)}
              onConfirm={() => handleConfirm(cat.id)}
            />
          ))}

          {/* 小計行 */}
          <tr className={styles.subtotalRow}>
            <td className={`${styles.cell} ${styles.categoryCell}`}>小計</td>
            {subtotals.map((val, i) => (
              <td key={allPlayers[i].id} className={styles.cell}>
                {val}
              </td>
            ))}
          </tr>

          {/* ボーナス行 */}
          <tr
            className={`${styles.bonusRow} ${bonusHighlight ? styles.bonusHighlight : ''}`}
          >
            <td className={`${styles.cell} ${styles.categoryCell}`}>
              <div>☆ボーナス</div>
              <div className={styles.bonusCondition}>63以上で+35</div>
            </td>
            {bonusInfos.map((info, i) => (
              <td
                key={allPlayers[i].id}
                className={`${styles.cell} ${info.achieved ? styles.bonusAchieved : ''}`}
              >
                <div className={styles.bonusProgress}>
                  {info.subtotal}/63
                </div>
                {info.complete && (
                  <div className={styles.bonusValue}>
                    {info.achieved ? '+35' : '0'}
                  </div>
                )}
              </td>
            ))}
          </tr>

          {/* 区切り行 */}
          <tr className={styles.separatorRow}>
            <td className={styles.cell} colSpan={colCount} />
          </tr>

          {/* 下段カテゴリ */}
          {LOWER_CATEGORIES.map((cat) => (
            <ScoreRow
              key={cat.id}
              category={cat}
              allPlayerScores={getAllPlayerScores(cat.id)}
              myPlayerId={playerId}
              possibleScore={possibleScores?.[cat.id]}
              canSelect={canSelectCategory(cat.id)}
              isPending={pendingCategory === cat.id}
              onSelect={() => handleSelect(cat.id)}
              onConfirm={() => handleConfirm(cat.id)}
            />
          ))}

          {/* 合計行 */}
          <tr className={styles.totalRow}>
            <td className={`${styles.cell} ${styles.categoryCell}`}>合計</td>
            {totals.map((val, i) => (
              <td
                key={allPlayers[i].id}
                className={`${styles.cell} ${styles.totalValue}`}
              >
                {val}
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
}
