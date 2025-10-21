import { useEffect } from 'react';
import { Home } from './components/Home';
import { Lobby } from './components/Lobby';
import { GameBoard } from './components/GameBoard';
import { useGameStore } from './store/gameStore';
import { gameSocketService } from './services/gameSocket';
import './styles/App.css';

function App() {
  const { game, setError, updateGameState, addMove, setRecentMoves } = useGameStore();

  useEffect(() => {
    // Connect to socket server
    gameSocketService.connect();

    // Set up event listeners
    gameSocketService.onGameUpdated((data) => {
      updateGameState(data);
    });

    gameSocketService.onGameStarted((data) => {
      updateGameState(data);
    });

    gameSocketService.onMoveMade((data) => {
      if (data.move) {
        addMove(data.move);
      }
      if (data.currentPlayerIndex !== undefined) {
        updateGameState({ currentPlayerIndex: data.currentPlayerIndex });
      }
      if (data.recentMoves) {
        setRecentMoves(data.recentMoves);
      }
    });

    gameSocketService.onPlayerLeft((data) => {
      updateGameState({
        players: data.players,
        status: data.status as 'waiting' | 'active' | 'completed',
      });
      setError(`${data.playerNickname} has left the game`);
      setTimeout(() => setError(null), 3000);
    });

    // Cleanup
    return () => {
      gameSocketService.offAllListeners();
      gameSocketService.disconnect();
    };
  }, [updateGameState, addMove, setRecentMoves, setError]);

  return (
    <div className="App">
      {game?.status === 'active' && <GameBoard />}
      {game?.status === 'waiting' && <Lobby />}
      {!game && <Home />}

      {useGameStore.getState().error && (
        <div className="error-toast">{useGameStore.getState().error}</div>
      )}
    </div>
  );
}

export default App;
