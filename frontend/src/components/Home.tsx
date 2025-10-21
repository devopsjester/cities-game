import { useState } from 'react';
import { gameSocketService } from '../services/gameSocket';
import { useGameStore } from '../store/gameStore';
import type { Game } from '../types';

export function Home() {
  const [nickname, setNickname] = useState('');
  const [gameCode, setGameCode] = useState('');
  const [mode, setMode] = useState<'menu' | 'create' | 'join'>('menu');
  const { setGame, setPlayerId, setPlayerNickname, setError, setIsLoading } = useGameStore();

  const handleCreateGame = () => {
    if (!nickname.trim()) {
      setError('Please enter a nickname');
      return;
    }

    setIsLoading(true);
    gameSocketService.createGame(nickname, (response) => {
      setIsLoading(false);
      if (response.success && response.game) {
        setGame(response.game as Game);
        setPlayerId(response.game.players?.[0]?.id || null);
        setPlayerNickname(nickname);
      } else {
        setError(response.error || 'Failed to create game');
      }
    });
  };

  const handleJoinGame = () => {
    if (!nickname.trim()) {
      setError('Please enter a nickname');
      return;
    }
    if (!gameCode.trim()) {
      setError('Please enter a game code');
      return;
    }

    setIsLoading(true);
    gameSocketService.joinGame(gameCode.toUpperCase(), nickname, (response) => {
      setIsLoading(false);
      if (response.success && response.game) {
        setGame(response.game as Game);
        const player = response.game.players?.find((p) => p.nickname === nickname);
        setPlayerId(player?.id || null);
        setPlayerNickname(nickname);
      } else {
        setError(response.error || 'Failed to join game');
      }
    });
  };

  if (mode === 'create') {
    return (
      <div className="container">
        <div className="card">
          <h1>Create Game</h1>
          <input
            type="text"
            placeholder="Enter your nickname"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            maxLength={20}
          />
          <div className="button-group">
            <button onClick={handleCreateGame} className="primary">
              Create Game
            </button>
            <button onClick={() => setMode('menu')}>Back</button>
          </div>
        </div>
      </div>
    );
  }

  if (mode === 'join') {
    return (
      <div className="container">
        <div className="card">
          <h1>Join Game</h1>
          <input
            type="text"
            placeholder="Enter your nickname"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            maxLength={20}
          />
          <input
            type="text"
            placeholder="Enter game code"
            value={gameCode}
            onChange={(e) => setGameCode(e.target.value.toUpperCase())}
            maxLength={4}
          />
          <div className="button-group">
            <button onClick={handleJoinGame} className="primary">
              Join Game
            </button>
            <button onClick={() => setMode('menu')}>Back</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="card">
        <h1>Cities Game</h1>
        <p>Name cities around the world!</p>
        <div className="button-group">
          <button onClick={() => setMode('create')} className="primary">
            Create New Game
          </button>
          <button onClick={() => setMode('join')}>Join Game</button>
        </div>
      </div>
    </div>
  );
}
