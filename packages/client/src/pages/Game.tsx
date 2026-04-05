import { useState, useCallback, useEffect } from 'react';
import type { GameState, Category, RankingEntry } from '@yacht/shared';
import { GameStatus } from '../components/GameStatus/GameStatus';
import { PlayerList } from '../components/PlayerList/PlayerList';
import { DiceArea } from '../components/DiceArea/DiceArea';
import { ScoreCard } from '../components/ScoreCard/ScoreCard';
import { TurnBanner } from '../components/TurnBanner/TurnBanner';
import { ResultModal } from '../components/ResultModal/ResultModal';
import { useAudio } from '../audio/useAudio';
import styles from './Game.module.css';

interface GameProps {
  gameState: GameState;
  playerId: string;
  isMyTurn: boolean;
  rankings: RankingEntry[] | null;
  onRoll: (testDiceValues?: number[]) => void;
  onToggleKeep: (dieIndex: number) => void;
  onScore: (category: Category) => void;
  onPlayAgain: () => void;
  onBackToLobby: () => void;
  isNpcGame?: boolean;
  onRestartNpc?: () => void;
  onBackToNpcSelect?: () => void;
}

export function Game({
  gameState,
  playerId,
  isMyTurn,
  rankings,
  onRoll,
  onToggleKeep,
  onScore,
  onPlayAgain,
  onBackToLobby,
  isNpcGame,
  onRestartNpc,
  onBackToNpcSelect,
}: GameProps) {
  const [testMode, setTestMode] = useState(false);
  const [testDiceValues, setTestDiceValues] = useState([1, 1, 1, 1, 1]);

  const handleTestDiceChange = useCallback((index: number, value: number) => {
    setTestDiceValues(prev => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  }, []);

  const currentPlayer = gameState.players[gameState.currentPlayerIndex];
  const currentPlayerName = currentPlayer?.nickname ?? '';
  const audio = useAudio();

  // Gameコンポーネントアンマウント時にBGM停止
  useEffect(() => {
    return () => {
      audio.stopBgm();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className={styles.container}>
      <button
        type="button"
        className={styles.muteBtn}
        onClick={audio.toggleMute}
        aria-label={audio.muted ? '音声ON' : '音声OFF'}
      >
        {audio.muted ? '\uD83D\uDD07' : '\uD83D\uDD0A'}
      </button>
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

      <TurnBanner isMyTurn={isMyTurn} gameStarted={true} />

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
    </div>
  );
}
