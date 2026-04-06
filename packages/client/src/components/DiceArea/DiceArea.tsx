import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import type { Die as DieType, ScoreCard, Category } from '@yacht/shared';
import { MAX_ROLLS, calculatePossibleScores } from '@yacht/shared';
import { Die } from './Die';
import { YachtCelebration } from '../YachtCelebration/YachtCelebration';
import { HandAnnounce } from '../HandAnnounce/HandAnnounce';
import { useAudio } from '../../audio/useAudio';
import { useTheme } from '../../theme/useTheme';
import styles from './DiceArea.module.css';

interface DiceAreaProps {
  dice: DieType[];
  rollCount: number;
  turnPhase: string;
  isMyTurn: boolean;
  currentPlayerName?: string;
  testMode: boolean;
  testDiceValues: number[];
  onTestDiceChange: (index: number, value: number) => void;
  onRoll: (testDiceValues?: number[]) => void;
  onToggleKeep: (dieIndex: number) => void;
  scoreCard?: ScoreCard;
}

export function DiceArea({
  dice,
  rollCount,
  turnPhase,
  isMyTurn,
  currentPlayerName,
  testMode,
  testDiceValues,
  onTestDiceChange,
  onRoll,
  onToggleKeep,
  scoreCard,
}: DiceAreaProps) {
  const audio = useAudio();
  const { selection } = useTheme();
  const audioRef = useRef(audio);
  audioRef.current = audio;
  const [rolling, setRolling] = useState(false);
  const [rollAnimKey, setRollAnimKey] = useState(0);
  const [justRolled, setJustRolled] = useState(false);
  const [ghostIndices, setGhostIndices] = useState<Set<number>>(new Set());
  const [newlyKeptIndices, setNewlyKeptIndices] = useState<Set<number>>(new Set());
  const prevRollCountRef = useRef(rollCount);
  const latestDiceRef = useRef(dice);
  latestDiceRef.current = dice;
  const latestScoreCardRef = useRef(scoreCard);
  latestScoreCardRef.current = scoreCard;

  // ヨット演出state
  const [showYachtCelebration, setShowYachtCelebration] = useState(false);
  const [yachtCelebrationKey, setYachtCelebrationKey] = useState(0);
  const celebrationTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // HandAnnounce演出state
  const [showHandAnnounce, setShowHandAnnounce] = useState(false);
  const [handAnnounceKey, setHandAnnounceKey] = useState(0);
  const handAnnounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ロールアニメーション + アニメーション完了時にヨット判定
  useEffect(() => {
    // ターン変更時（rollCount→0）: 両方クリア
    if (rollCount === 0 && prevRollCountRef.current !== 0) {
      setNewlyKeptIndices(new Set());
      setGhostIndices(new Set());
    }
    if (rollCount > 0 && rollCount !== prevRollCountRef.current) {
      setRolling(true);
      setRollAnimKey(k => k + 1);
      setJustRolled(false);
      setGhostIndices(new Set());
      audioRef.current.play('diceRoll');
      const timer = setTimeout(() => {
        setRolling(false);
        setJustRolled(true);
        // アニメーション完了時にヨット判定（refで最新dice参照）
        const d = latestDiceRef.current;
        const sc = latestScoreCardRef.current;
        const allSame = d.length === 5 && d.every((die) => die.value === d[0].value);
        if (allSame && (!sc || sc.yacht === null)) {
          if (celebrationTimerRef.current !== null) {
            clearTimeout(celebrationTimerRef.current);
          }
          setShowYachtCelebration(true);
          setYachtCelebrationKey((k) => k + 1);
          celebrationTimerRef.current = setTimeout(() => {
            setShowYachtCelebration(false);
            celebrationTimerRef.current = null;
          }, 4500);
        }
      }, 700);
      prevRollCountRef.current = rollCount;
      return () => clearTimeout(timer);
    }
    prevRollCountRef.current = rollCount;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rollCount]);

  // タイマーのクリーンアップ
  useEffect(() => {
    return () => {
      if (celebrationTimerRef.current !== null) {
        clearTimeout(celebrationTimerRef.current);
      }
      if (handAnnounceTimerRef.current !== null) {
        clearTimeout(handAnnounceTimerRef.current);
      }
    };
  }, []);

  // スコア記録時にjustRolledをリセット（HandAnnounce再表示防止）
  const prevScoreCardRef = useRef(scoreCard);
  useEffect(() => {
    if (prevScoreCardRef.current !== scoreCard) {
      setJustRolled(false);
      prevScoreCardRef.current = scoreCard;
    }
  }, [scoreCard]);

  const allKept = dice.length > 0 && dice.every((d) => d.kept);
  const canRoll =
    isMyTurn &&
    rollCount < MAX_ROLLS &&
    turnPhase !== 'SCORING' &&
    !allKept;
  const canToggle = isMyTurn && rollCount >= 1;

  // ヨット判定（ダイスグロー表示用）- yachtカテゴリが未記入の場合のみ
  const isYacht =
    rollCount > 0 &&
    !rolling &&
    dice.length === 5 &&
    dice.every((d) => d.value === dice[0].value) &&
    (!scoreCard || scoreCard.yacht === null);

  // フォーダイス以上の役名判定（ヨットは別演出のため除外）
  const detectedHand = useMemo(() => {
    if (!justRolled || rolling || rollCount < 1 || isYacht) return null;
    const diceValues = dice.map((d) => d.value);
    const scores = calculatePossibleScores(diceValues);

    // 優先度順にチェック（点数が高い順）
    const hands: { key: Category; name: string; score: number }[] = [
      { key: 'bigStraight', name: 'B.ストレート', score: scores.bigStraight },
      { key: 'fullHouse', name: 'フルハウス', score: scores.fullHouse },
      { key: 'fourOfAKind', name: 'フォーダイス', score: scores.fourOfAKind },
      { key: 'littleStraight', name: 'S.ストレート', score: scores.littleStraight },
    ];

    for (const hand of hands) {
      // スコアが0より大きく、かつそのカテゴリが未記入のときのみ演出
      if (hand.score > 0 && (!scoreCard || scoreCard[hand.key] === null)) {
        return { name: hand.name, score: hand.score };
      }
    }
    return null;
  }, [justRolled, rolling, rollCount, isYacht, dice, scoreCard]);

  // 役検出時にHandAnnounce表示
  useEffect(() => {
    if (detectedHand) {
      if (handAnnounceTimerRef.current !== null) {
        clearTimeout(handAnnounceTimerRef.current);
      }
      setShowHandAnnounce(true);
      setHandAnnounceKey((k) => k + 1);
      handAnnounceTimerRef.current = setTimeout(() => {
        setShowHandAnnounce(false);
        handAnnounceTimerRef.current = null;
      }, 2800);
    }
  }, [detectedHand, rollCount]);

  // スコア選択促し表示条件
  const showScoringPrompt =
    isMyTurn &&
    (rollCount >= MAX_ROLLS ||
      turnPhase === 'SCORING' ||
      (allKept && rollCount > 0));

  const handleRoll = useCallback(() => {
    if (canRoll) {
      if (testMode) {
        onRoll(testDiceValues);
      } else {
        onRoll();
      }
    }
  }, [canRoll, onRoll, testMode, testDiceValues]);

  const handleToggleKeep = useCallback((dieIndex: number) => {
    setJustRolled(false);
    audioRef.current.play('diceKeep');
    // keep方向: ゴースト追加 + 新規キープ追加
    if (!dice[dieIndex].kept) {
      setGhostIndices(prev => new Set(prev).add(dieIndex));
      setNewlyKeptIndices(prev => new Set(prev).add(dieIndex));
    } else {
      // unkeep方向: ゴースト削除 + 新規キープ削除
      setGhostIndices(prev => {
        const next = new Set(prev);
        next.delete(dieIndex);
        return next;
      });
      setNewlyKeptIndices(prev => {
        const next = new Set(prev);
        next.delete(dieIndex);
        return next;
      });
    }
    onToggleKeep(dieIndex);
  }, [onToggleKeep, dice]);

  const containerClass = `${styles.container}${!isMyTurn ? ` ${styles.notMyTurn}` : ''}`;

  return (
    <>
    <div className={containerClass}>
      {/* キープエリア */}
      <div className={styles.areaLabel}>キープ</div>
      <div className={styles.keptArea}>
        {(() => {
          const keptDice = dice
            .map((die, i) => ({ die, originalIndex: i }))
            .filter(({ die }) => die.kept)
            .sort((a, b) => a.die.value - b.die.value);
          const slots = Array.from({ length: 5 }, (_, slotIndex) => {
            const entry = keptDice[slotIndex];
            if (entry) {
              return (
                <Die
                  key={`kept-${entry.originalIndex}-${rollAnimKey}`}
                  index={entry.originalIndex}
                  value={entry.die.value}
                  kept={true}
                  diceThemeId={selection.diceId}
                  isMyTurn={isMyTurn}
                  canToggle={canToggle}
                  rolling={rolling}
                  isYacht={isYacht}
                  isNewlyKept={newlyKeptIndices.has(entry.originalIndex)}
                  onToggleKeep={() => handleToggleKeep(entry.originalIndex)}
                />
              );
            }
            return <div key={`empty-${slotIndex}`} className={styles.emptySlot} />;
          });
          return (
            <>
              <div className={styles.diceRow}>
                {slots.slice(0, 3)}
              </div>
              <div className={styles.diceRow}>
                {slots.slice(3, 5)}
              </div>
            </>
          );
        })()}
      </div>

      <div className={styles.separator} />

      {/* ロールエリア */}
      <div className={styles.areaLabel}>ロール</div>
      <div className={styles.rollArea}>
        {rollCount === 0 ? (
          <div className={styles.preRollMessage}>ダイスを振ってください</div>
        ) : (
          (() => {
            let displayIdx = 0;
            const allSlots = dice.map((die, i) => {
              if (!die.kept) {
                // 通常のロールダイス
                const idx = displayIdx++;
                return (
                  <Die
                    key={`${i}-${rollAnimKey}`}
                    index={i}
                    displayIndex={idx}
                    value={die.value}
                    kept={false}
                    diceThemeId={selection.diceId}
                    isMyTurn={isMyTurn}
                    canToggle={canToggle}
                    rolling={rolling}
                    isYacht={isYacht}
                    onToggleKeep={() => handleToggleKeep(i)}
                  />
                );
              } else if (ghostIndices.has(i)) {
                // ゴーストダイス（キープ直後、次のロールまで残る）
                return (
                  <Die
                    key={`ghost-${i}-${rollAnimKey}`}
                    index={i}
                    displayIndex={0}
                    value={die.value}
                    kept={false}
                    diceThemeId={selection.diceId}
                    isMyTurn={false}
                    canToggle={false}
                    rolling={false}
                    isYacht={false}
                    isGhost={true}
                    onToggleKeep={() => {}}
                  />
                );
              } else {
                // 完全に非表示のスロット（レイアウト維持用）
                return <div key={`hidden-${i}`} className={styles.ghostSlot} />;
              }
            });
            return (
              <>
                <div className={styles.diceRow}>{allSlots.slice(0, 3)}</div>
                <div className={styles.diceRow}>{allSlots.slice(3, 5)}</div>
              </>
            );
          })()
        )}
      </div>

      {/* ロール残数ドット + ボタン or メッセージ */}
      {isMyTurn ? (
        <>
          {rollCount > 0 && (
            <div className={styles.rollDots}>
              {Array.from({ length: MAX_ROLLS }, (_, i) => (
                <div
                  key={i}
                  className={i < rollCount ? styles.dotFilled : styles.dotEmpty}
                />
              ))}
            </div>
          )}
          {testMode && (
            <div className={styles.testDicePanel}>
              <div className={styles.testDiceLabel}>出目を指定:</div>
              <div className={styles.testDiceSelectors}>
                {testDiceValues.map((val, i) => (
                  <select
                    key={i}
                    className={styles.testDiceSelect}
                    value={val}
                    onChange={(e) => onTestDiceChange(i, Number(e.target.value))}
                  >
                    {[1, 2, 3, 4, 5, 6].map((n) => (
                      <option key={n} value={n}>{n}</option>
                    ))}
                  </select>
                ))}
              </div>
            </div>
          )}
          {showScoringPrompt ? (
            <div className={styles.scoringPrompt}>↓ 得点を選んでください</div>
          ) : (
            <button
              type="button"
              className={styles.rollBtn}
              onClick={handleRoll}
              disabled={!canRoll}
            >
              {rollCount === 0 ? 'ダイスを振る' : 'もう一度振る'}
            </button>
          )}
        </>
      ) : (
        <div className={styles.opponentMessage}>
          {currentPlayerName ? `${currentPlayerName}のターン中...` : '相手のターン中...'}
        </div>
      )}
    </div>
    {showYachtCelebration && (
      <YachtCelebration key={yachtCelebrationKey} dieValue={dice[0].value} />
    )}
    {showHandAnnounce && detectedHand && (
      <HandAnnounce
        key={handAnnounceKey}
        handName={detectedHand.name}
        score={detectedHand.score}
      />
    )}
    </>
  );
}
