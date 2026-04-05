import { useRef, useEffect } from 'react';
import { useGame } from './hooks/useGame';
import { useAudio } from './audio/useAudio';
import { Home } from './pages/Home';
import { Lobby } from './pages/Lobby';
import { WaitingRoom } from './pages/WaitingRoom';
import { NpcSelect } from './pages/NpcSelect';
import { Game } from './pages/Game';
import { AudioToggleButton } from './components/AudioToggleButton/AudioToggleButton';
import './styles/theme.css';

export function App() {
  const game = useGame();
  const audio = useAudio();
  const audioInitializedRef = useRef(false);

  // 初回ユーザーインタラクションで音声初期化 + BGM開始（どの画面でも）
  useEffect(() => {
    const handleFirstInteraction = () => {
      if (audioInitializedRef.current) return;
      audioInitializedRef.current = true;
      audio.init();
      audio.startBgm();
      document.removeEventListener('click', handleFirstInteraction);
      document.removeEventListener('touchstart', handleFirstInteraction);
    };

    document.addEventListener('click', handleFirstInteraction);
    document.addEventListener('touchstart', handleFirstInteraction);
    return () => {
      document.removeEventListener('click', handleFirstInteraction);
      document.removeEventListener('touchstart', handleFirstInteraction);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const renderContent = () => {
    switch (game.screen) {
      case 'home':
        return <Home onSetNickname={game.setNickname} />;

      case 'lobby':
        return (
          <Lobby
            nickname={game.nickname}
            onCreateRoom={game.createRoom}
            onJoinRoom={game.joinRoom}
            onStartNpc={game.showNpcSelect}
            error={game.error}
          />
        );

      case 'waitingRoom':
        if (!game.room || !game.playerId) {
          return (
            <Lobby
              nickname={game.nickname}
              onCreateRoom={game.createRoom}
              onJoinRoom={game.joinRoom}
              onStartNpc={game.showNpcSelect}
              error={game.error}
            />
          );
        }
        return (
          <WaitingRoom
            room={game.room}
            playerId={game.playerId}
            onStartGame={game.startGame}
            onLeaveRoom={game.leaveRoom}
          />
        );

      case 'npcSelect':
        return (
          <NpcSelect
            onSelect={game.startNpcGame}
            onBack={game.backToLobby}
          />
        );

      case 'game':
        if (!game.gameState || !game.playerId) {
          return (
            <Lobby
              nickname={game.nickname}
              onCreateRoom={game.createRoom}
              onJoinRoom={game.joinRoom}
              onStartNpc={game.showNpcSelect}
              error={game.error}
            />
          );
        }
        return (
          <Game
            gameState={game.gameState}
            playerId={game.playerId}
            isMyTurn={game.isMyTurn}
            rankings={game.rankings}
            onRoll={game.rollDice}
            onToggleKeep={game.toggleKeep}
            onScore={game.scoreCategory}
            onPlayAgain={game.playAgain}
            onBackToLobby={game.backToLobby}
            isNpcGame={game.npcDifficulty !== null}
            onRestartNpc={game.restartNpcGame}
            onBackToNpcSelect={game.backToNpcSelect}
          />
        );

      default:
        return null;
    }
  };

  return (
    <>
      <AudioToggleButton />
      {renderContent()}
    </>
  );
}
