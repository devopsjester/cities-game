import React, { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { gameSocketService } from '../services/gameSocket';
import { MoveHistory } from './MoveHistory';

export const GameBoard: React.FC = () => {
  const { game, playerId } = useGameStore();
  const [cityInput, setCityInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!game) return null;

  const currentPlayer = game.players[game.currentPlayerIndex];
  const isMyTurn = currentPlayer?.id === playerId;
  const lastMove =
    game.recentMoves && game.recentMoves.length > 0
      ? game.recentMoves[game.recentMoves.length - 1]
      : null;
  const requiredLetter = lastMove?.nextStartingLetter || '';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!cityInput.trim()) {
      setError('Please enter a city name');
      return;
    }

    if (!playerId) {
      setError('Player ID not found');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    gameSocketService.submitMove(game.code, playerId, cityInput, (response) => {
      setIsSubmitting(false);

      if (response.success) {
        setCityInput('');
        setError(null);
      } else {
        const validation = response.validationResult;
        if (validation?.isDuplicate) {
          setError('This city has already been used in this game!');
        } else if (validation?.suggestions && validation.suggestions.length > 0) {
          setError(`Invalid city. Did you mean: ${validation.suggestions.join(', ')}?`);
        } else {
          setError(response.error || 'Invalid city name');
        }
      }
    });
  };

  return (
    <div className="container">
      <div className="card">
        <div className="game-header">
          <h1>Cities Game</h1>
          <div className="game-code">Code: {game.code}</div>
        </div>

        <div className="game-info">
          <h3>Current Turn: {currentPlayer?.nickname}</h3>
          {requiredLetter && (
            <p className="required-letter">
              Must start with: <strong>{requiredLetter}</strong>
            </p>
          )}
        </div>

        <div className="players-bar">
          {game.players.map((player, index) => (
            <div
              key={player.id}
              className={`player-item ${index === game.currentPlayerIndex ? 'active' : ''} ${
                player.id === playerId ? 'you' : ''
              }`}
            >
              {player.nickname}
            </div>
          ))}
        </div>

        <MoveHistory />

        {isMyTurn ? (
          <form onSubmit={handleSubmit} className="move-form">
            <input
              type="text"
              placeholder={
                requiredLetter
                  ? `Enter a city starting with "${requiredLetter}"...`
                  : 'Enter a city name...'
              }
              value={cityInput}
              onChange={(e) => setCityInput(e.target.value)}
              disabled={isSubmitting}
              autoFocus
            />
            <button type="submit" disabled={isSubmitting} className="primary">
              {isSubmitting ? 'Submitting...' : 'Submit'}
            </button>
            {error && <div className="error">{error}</div>}
          </form>
        ) : (
          <div className="waiting">
            <p>Waiting for {currentPlayer?.nickname} to make a move...</p>
          </div>
        )}
      </div>
    </div>
  );
};
