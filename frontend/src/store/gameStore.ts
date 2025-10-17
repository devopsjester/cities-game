import { create } from 'zustand';
import { Game, Player, GameMove } from '../types';

interface GameState {
  game: Game | null;
  playerId: string | null;
  playerNickname: string | null;
  error: string | null;
  isLoading: boolean;
  
  setGame: (game: Game | null) => void;
  setPlayerId: (playerId: string | null) => void;
  setPlayerNickname: (nickname: string | null) => void;
  setError: (error: string | null) => void;
  setIsLoading: (isLoading: boolean) => void;
  updateGameState: (updates: Partial<Game>) => void;
  addMove: (move: GameMove) => void;
  setRecentMoves: (moves: GameMove[]) => void;
  reset: () => void;
}

export const useGameStore = create<GameState>((set) => ({
  game: null,
  playerId: null,
  playerNickname: null,
  error: null,
  isLoading: false,

  setGame: (game) => set({ game }),
  
  setPlayerId: (playerId) => set({ playerId }),
  
  setPlayerNickname: (playerNickname) => set({ playerNickname }),
  
  setError: (error) => set({ error }),
  
  setIsLoading: (isLoading) => set({ isLoading }),
  
  updateGameState: (updates) =>
    set((state) => ({
      game: state.game ? { ...state.game, ...updates } : null,
    })),
  
  addMove: (move) =>
    set((state) => ({
      game: state.game
        ? {
            ...state.game,
            recentMoves: [...(state.game.recentMoves || []), move].slice(-10),
            totalMoves: (state.game.totalMoves || 0) + 1,
          }
        : null,
    })),
  
  setRecentMoves: (moves) =>
    set((state) => ({
      game: state.game
        ? {
            ...state.game,
            recentMoves: moves,
          }
        : null,
    })),
  
  reset: () =>
    set({
      game: null,
      playerId: null,
      playerNickname: null,
      error: null,
      isLoading: false,
    }),
}));
