import { useState, useCallback, useEffect } from 'react';
import type { GameState, Category, RankingEntry, GameScoredPayload } from '@yacht/shared';
import { CATEGORIES } from '@yacht/shared';
import { GameStatus } from '../components/GameStatus/GameStatus';
import { PlayerList } from '../components/PlayerList/PlayerList';
import { DiceArea } from '../components/DiceArea/DiceArea';
import { ScoreCard } from '../components/ScoreCard/ScoreCard';
import { TurnBanner } from '../components/TurnBanner/TurnBanner';
import { ResultModal } from '../components/ResultModal/ResultModal';
import { ScoreAnnounce } from '../components/ScoreAnnounce/ScoreAnnounce';
import styles from './Game.module.css';

interface GameProps {
  gameState: GameState;
  playerId: string;
  isMyTurn: boolean;
  rankings: RankingEntry[] | null;
  lastScoredEvent: GameScoredPayload | null;
  onRoll: (testDiceValues?: number[]) => void;
  onToggleKeep: (dieIndex: number) => void;
  onScore: (category: Category) => void;
  onPlayAgain: () => void;
  onBackToLobby: () => void;
  isNpcGame?: boolean;
  onRestartNpc?: () => void;
  onBackToNpcSelect?: () => void;
  showResumeOverlay?: boolean;
  onResumeNpc?: () => void;
}

export function Game({
  gameState,
  playerId,
  isMyTurn,
  rankings,
  lastScoredEvent,
  onRoll,
  onToggleKeep,
  onScore,
  onPlayAgain,
  onBackToLobby,
  isNpcGame,
  onRestartNpc,
  onBackToNpcSelect,
  showResumeOverlay,
  onResumeNpc,
}: GameProps) {
  const [testMode, setTestMode] = useState(false);
  const [testDiceValues, setTestDiceValues] = useState([1, 1, 1, 1, 1]);
  const [showScoreAnnounce, setShowScoreAnnounce] = useState(false);
  const [scoreAnnounceKey, setScoreAnnounceKey] = useState(0);
  const [scoreAnnounceData, setScoreAnnounceData] = useState<{
    playerName: string; categoryName: string; score: number;
  } | null>(null);

  const handleTestDiceChange = useCallback((index: number, value: number) => {
    setTestDiceValues(prev => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  }, []);

  useEffect(() => {
    if (!lastScoredEvent || !gameState) return;
    const player = gameState.players.find(p => p.id === lastScoredEvent.playerId);
    const categoryDef = CATEGORIES.find(c => c.id === lastScoredEvent.category);
    setScoreAnnounceData({
      playerName: player?.nickname ?? '???',
      categoryName: categoryDef?.name ?? String(lastScoredEvent.category),
      score: lastScoredEvent.score,
    });
    setShowScoreAnnounce(true);
    setScoreAnnounceKey(k => k + 1);
    const timer = setTimeout(() => setShowScoreAnnounce(false), 2500);
    return () => clearTimeout(timer);
  }, [lastScoredEvent]); // eslint-disable-line react-hooks/exhaustive-deps

  const currentPlayer = gameState.players[gameState.currentPlayerIndex];
  const currentPlayerName = currentPlayer?.nickname ?? '';

  return (
    <div className={styles.container}>
      <button
        type="button"
        className={styles.testModeBtn}
        onClick={() => setTestMode(prev => !prev)}
      >
        {testMode ? 'テストON' : 'テストOFF'}
      </button>
      <div className={styles.content}>
        <GameStatus
          gameState={gameState}
          playerId={playerId}
          isMyTurn={isMyTurn}
        />

        <PlayerList gameState={gameState} playerId={playerId} />

        <div className={styles.gameArea}>
          <div className={styles.scoreColumn}>
            <ScoreCard
              gameState={gameState}
              playerId={playerId}
              isMyTurn={isMyTurn}
              onScore={onScore}
            />
          </div>
          <div className={styles.diceColumn}>
            <DiceArea
              dice={gameState.dice}
              rollCount={gameState.rollCount}
              turnPhase={gameState.turnPhase}
              isMyTurn={isMyTurn}
              currentPlayerName={currentPlayerName}
              testMode={testMode}
              testDiceValues={testDiceValues}
              onTestDiceChange={handleTestDiceChange}
              onRoll={onRoll}
              onToggleKeep={onToggleKeep}
              scoreCard={gameState.scoreCards[currentPlayer?.id ?? playerId]}
            />
          </div>
        </div>
      </div>

      {!rankings && <TurnBanner isMyTurn={isMyTurn} gameStarted={true} />}

      {rankings && (
        <ResultModal
          rankings={rankings}
          playerId={playerId}
          onPlayAgain={onPlayAgain}
          onBackToLobby={onBackToLobby}
          isNpcGame={isNpcGame}
          onRestartNpc={onRestartNpc}
          onBackToNpcSelect={onBackToNpcSelect}
        />
      )}

      {showScoreAnnounce && scoreAnnounceData && (
        <ScoreAnnounce key={scoreAnnounceKey} {...scoreAnnounceData} />
      )}

      {showResumeOverlay && (
        <div className={styles.resumeOverlay}>
          <div className={styles.resumeCard}>
            <p className={styles.resumeTitle}>ゲームが一時停止しています</p>
            <p className={styles.resumeMessage}>画面がスリープしたため、ゲームを一時停止しました。</p>
            <button
              type="button"
              className={styles.resumeBtn}
              onClick={onResumeNpc}
            >
              再開する
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
