import { io, Socket } from 'socket.io-client';
import { Game, GameMove, ValidationResult } from '../types';

class GameSocketService {
  private socket: Socket | null = null;
  private readonly serverUrl: string;

  constructor() {
    this.serverUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
  }

  connect(): void {
    if (this.socket?.connected) {
      return;
    }

    this.socket = io(this.serverUrl, {
      transports: ['websocket', 'polling'],
    });

    this.socket.on('connect', () => {
      console.log('Connected to game server');
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from game server');
    });

    this.socket.on('connect_error', (error) => {
      console.error('Connection error:', error);
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  createGame(
    nickname: string,
    callback: (response: { success: boolean; game?: Partial<Game>; error?: string }) => void
  ): void {
    this.socket?.emit('create-game', { nickname }, callback);
  }

  joinGame(
    code: string,
    nickname: string,
    callback: (response: { success: boolean; game?: Partial<Game>; error?: string }) => void
  ): void {
    this.socket?.emit('join-game', { code, nickname }, callback);
  }

  startGame(
    code: string,
    playerId: string,
    callback: (response: { success: boolean; error?: string }) => void
  ): void {
    this.socket?.emit('start-game', { code, playerId }, callback);
  }

  submitMove(
    code: string,
    playerId: string,
    cityName: string,
    callback: (response: {
      success: boolean;
      validationResult?: ValidationResult;
      error?: string;
    }) => void
  ): void {
    this.socket?.emit('submit-move', { code, playerId, cityName }, callback);
  }

  getGameState(
    code: string,
    callback: (response: { success: boolean; game?: Game; error?: string }) => void
  ): void {
    this.socket?.emit('get-game-state', { code }, callback);
  }

  getAllMoves(
    code: string,
    page: number,
    callback: (response: {
      success: boolean;
      moves?: GameMove[];
      total?: number;
      page?: number;
      totalPages?: number;
      error?: string;
    }) => void
  ): void {
    this.socket?.emit('get-all-moves', { code, page }, callback);
  }

  onGameUpdated(callback: (data: Partial<Game>) => void): void {
    this.socket?.on('game-updated', callback);
  }

  onGameStarted(callback: (data: Partial<Game>) => void): void {
    this.socket?.on('game-started', callback);
  }

  onMoveMade(
    callback: (data: {
      move: GameMove;
      currentPlayerIndex: number;
      recentMoves: GameMove[];
    }) => void
  ): void {
    this.socket?.on('move-made', callback);
  }

  onPlayerLeft(
    callback: (data: {
      playerId: string;
      playerNickname: string;
      players: Player[];
      status: string;
    }) => void
  ): void {
    this.socket?.on('player-left', callback);
  }

  offAllListeners(): void {
    this.socket?.off('game-updated');
    this.socket?.off('game-started');
    this.socket?.off('move-made');
    this.socket?.off('player-left');
  }
}

export const gameSocketService = new GameSocketService();
