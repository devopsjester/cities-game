import React, { useEffect } from 'react';
import { gameSocketService } from '../services/gameSocket';
import { useGameStore } from '../store/gameStore';

export const Lobby: React.FC = () => {
  const { game, playerId } = useGameStore();

  useEffect(() => {
    // Rejoin the game room when component mounts
    // This ensures the socket is in the correct room even after reconnections
    if (game && playerId) {
      console.log('[Lobby] Rejoining game room', { code: game.code, playerId });
      gameSocketService.rejoinGame(game.code, playerId);
    }
  }, [game?.code, playerId]);

  if (!game) return null;

  const currentPlayer = game.players.find((p) => p.id === playerId);
  const isCreator = currentPlayer?.isCreator || false;

  const handleStartGame = () => {
    if (!playerId) return;

    gameSocketService.startGame(game.code, playerId, (response) => {
      if (!response.success) {
        console.error('Failed to start game:', response.error);
      }
    });
  };

  return (
    <div className="container">
      <div className="card">
        <h1>Game Lobby</h1>
        <div className="game-code">
          <h2>Game Code: {game.code}</h2>
          <p>Share this code with your friends!</p>
        </div>

        <div className="players-list">
          <h3>Players ({game.players.length})</h3>
          <ul>
            {game.players.map((player) => (
              <li key={player.id}>
                {player.nickname}
                {player.isCreator && <span className="badge">Creator</span>}
                {player.id === playerId && <span className="badge">You</span>}
              </li>
            ))}
          </ul>
        </div>

        {isCreator && (
          <button onClick={handleStartGame} className="primary" disabled={game.players.length < 2}>
            {game.players.length < 2 ? 'Waiting for players...' : 'Start Game'}
          </button>
        )}

        {!isCreator && <p className="info">Waiting for the game creator to start the game...</p>}
      </div>
    </div>
  );
};
