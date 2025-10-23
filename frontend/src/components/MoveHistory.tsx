import React, { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { gameSocketService } from '../services/gameSocket';
import { GameMove } from '../types';

export const MoveHistory: React.FC = () => {
  const { game } = useGameStore();
  const [isExpanded, setIsExpanded] = useState(false);
  const [allMoves, setAllMoves] = useState<GameMove[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  if (!game) return null;

  const recentMoves = game.recentMoves || [];

  const handleExpand = () => {
    if (!isExpanded && game.code) {
      setIsLoading(true);
      gameSocketService.getAllMoves(game.code, 1, (response) => {
        setIsLoading(false);
        if (response.success && response.moves) {
          setAllMoves(response.moves);
          setTotalPages(response.totalPages || 1);
          setIsExpanded(true);
        }
      });
    } else {
      setIsExpanded(false);
    }
  };

  const loadPage = (page: number) => {
    if (!game.code) return;

    setIsLoading(true);
    gameSocketService.getAllMoves(game.code, page, (response) => {
      setIsLoading(false);
      if (response.success && response.moves) {
        setAllMoves(response.moves);
        setCurrentPage(page);
      }
    });
  };

  const formatTime = (timestamp: Date) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const movesToDisplay = isExpanded ? allMoves : recentMoves;

  return (
    <div className="move-history">
      <div className="history-header">
        <h3>
          {isExpanded ? 'All Moves' : 'Recent Moves'}
          {game.totalMoves > 0 && ` (${game.totalMoves} total)`}
        </h3>
        {game.totalMoves > 10 && (
          <button onClick={handleExpand} className="expand-button">
            {isExpanded ? 'Show Recent Only' : 'Show All'}
          </button>
        )}
      </div>

      {movesToDisplay.length === 0 ? (
        <p className="no-moves">No moves yet. Be the first!</p>
      ) : (
        <div className="moves-list">
          {movesToDisplay.map((move, index) => (
            <div key={index} className="move-item">
              <div className="move-number">#{movesToDisplay.length - index}</div>
              <div className="move-content">
                <div className="move-city">{move.cityName}</div>
                <div className="move-meta">
                  <span className="move-player">{move.playerNickname}</span>
                  <span className="move-time">{formatTime(move.timestamp)}</span>
                  {move.validationSource === 'custom' && <span className="move-badge">Custom</span>}
                </div>
              </div>
              <div className="move-next-letter">{move.nextStartingLetter}</div>
            </div>
          ))}
        </div>
      )}

      {isExpanded && totalPages > 1 && (
        <div className="pagination">
          <button
            onClick={() => loadPage(currentPage - 1)}
            disabled={currentPage === 1 || isLoading}
          >
            Previous
          </button>
          <span>
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => loadPage(currentPage + 1)}
            disabled={currentPage === totalPages || isLoading}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};
