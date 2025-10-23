// Mock nanoid before importing anything that uses it
let mockIdCounter = 0;
jest.mock('nanoid', () => ({
  nanoid: jest.fn(() => `mock-player-id-${++mockIdCounter}`),
}));

// Mock the GameModel
jest.mock('../models/Game');

import { gameService } from './gameService';
import GameModel from '../models/Game';

describe('GameService', () => {
  beforeEach(() => {
    // Reset the mock ID counter before each test
    mockIdCounter = 0;
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  describe('createGame', () => {
    it('should create a new game with a unique code', async () => {
      const nickname = 'TestPlayer';
      const socketId = 'socket123';

      const mockGame = {
        code: 'ABCD',
        players: [
          {
            id: 'mock-player-id-1',
            nickname,
            socketId,
            isCreator: true,
            joinedAt: new Date(),
          },
        ],
        status: 'waiting',
        save: jest.fn().mockResolvedValue(true),
      };

      (GameModel.findOne as jest.Mock).mockResolvedValue(null);
      (GameModel as any).mockImplementation(() => mockGame);

      const game = await gameService.createGame(nickname, socketId);

      expect(game).toBeDefined();
      expect(game.code).toBeDefined();
      expect(game.code).toHaveLength(4);
      expect(game.players).toHaveLength(1);
      expect(game.players[0].nickname).toBe(nickname);
      expect(game.players[0].socketId).toBe(socketId);
      expect(game.players[0].isCreator).toBe(true);
      expect(game.status).toBe('waiting');
    });

    it('should throw error if nickname is empty', async () => {
      await expect(gameService.createGame('', 'socket1')).rejects.toThrow('Nickname is required');
    });
  });

  describe('joinGame', () => {
    it('should allow a player to join an existing game', async () => {
      const mockGame = {
        code: 'ABCD',
        players: [
          {
            id: 'mock-player-id-1',
            nickname: 'Creator',
            socketId: 'socket1',
            isCreator: true,
            joinedAt: new Date(),
          },
        ],
        status: 'waiting',
        save: jest.fn().mockResolvedValue(true),
      };

      (GameModel.findOne as jest.Mock).mockResolvedValue(mockGame);

      const updatedGame = await gameService.joinGame('ABCD', 'Player2', 'socket2');

      expect(updatedGame.players).toHaveLength(2);
      expect(updatedGame.players[1].nickname).toBe('Player2');
      expect(updatedGame.players[1].isCreator).toBe(false);
      expect(mockGame.save).toHaveBeenCalled();
    });

    it('should throw error if game does not exist', async () => {
      (GameModel.findOne as jest.Mock).mockResolvedValue(null);

      await expect(gameService.joinGame('XXXX', 'Player', 'socket1')).rejects.toThrow(
        'Game not found'
      );
    });

    it('should throw error if game already started', async () => {
      const mockGame = {
        code: 'ABCD',
        players: [
          {
            id: 'mock-player-id-1',
            nickname: 'Creator',
            socketId: 'socket1',
            isCreator: true,
          },
          {
            id: 'mock-player-id-2',
            nickname: 'Player2',
            socketId: 'socket2',
            isCreator: false,
          },
        ],
        status: 'active',
      };

      (GameModel.findOne as jest.Mock).mockResolvedValue(mockGame);

      await expect(gameService.joinGame('ABCD', 'Player3', 'socket3')).rejects.toThrow(
        'Game already started'
      );
    });

    it('should throw error if player nickname already exists in game', async () => {
      const mockGame = {
        code: 'ABCD',
        players: [
          {
            id: 'mock-player-id-1',
            nickname: 'Creator',
            socketId: 'socket1',
            isCreator: true,
          },
        ],
        status: 'waiting',
      };

      (GameModel.findOne as jest.Mock).mockResolvedValue(mockGame);

      await expect(gameService.joinGame('ABCD', 'Creator', 'socket2')).rejects.toThrow(
        'Player with this nickname already in game'
      );
    });
  });

  describe('startGame', () => {
    it('should start a game with 2 or more players', async () => {
      const mockGame = {
        code: 'ABCD',
        players: [
          {
            id: 'mock-player-id-1',
            nickname: 'Creator',
            socketId: 'socket1',
            isCreator: true,
          },
          {
            id: 'mock-player-id-2',
            nickname: 'Player2',
            socketId: 'socket2',
            isCreator: false,
          },
        ],
        status: 'waiting',
        save: jest.fn().mockResolvedValue(true),
      };

      (GameModel.findOne as jest.Mock).mockResolvedValue(mockGame);

      const startedGame = await gameService.startGame('ABCD', 'mock-player-id-1');

      expect(startedGame.status).toBe('active');
      expect(mockGame.save).toHaveBeenCalled();
    });

    it('should throw error if less than 2 players', async () => {
      const mockGame = {
        code: 'ABCD',
        players: [
          {
            id: 'mock-player-id-1',
            nickname: 'Creator',
            socketId: 'socket1',
            isCreator: true,
          },
        ],
        status: 'waiting',
      };

      (GameModel.findOne as jest.Mock).mockResolvedValue(mockGame);

      await expect(gameService.startGame('ABCD', 'mock-player-id-1')).rejects.toThrow(
        'Need at least 2 players to start'
      );
    });

    it('should throw error if non-creator tries to start', async () => {
      const mockGame = {
        code: 'ABCD',
        players: [
          {
            id: 'mock-player-id-1',
            nickname: 'Creator',
            socketId: 'socket1',
            isCreator: true,
          },
          {
            id: 'mock-player-id-2',
            nickname: 'Player2',
            socketId: 'socket2',
            isCreator: false,
          },
        ],
        status: 'waiting',
      };

      (GameModel.findOne as jest.Mock).mockResolvedValue(mockGame);

      await expect(gameService.startGame('ABCD', 'mock-player-id-2')).rejects.toThrow(
        'Only the game creator can start the game'
      );
    });

    it('should throw error if game does not exist', async () => {
      (GameModel.findOne as jest.Mock).mockResolvedValue(null);

      await expect(gameService.startGame('XXXX', 'player123')).rejects.toThrow('Game not found');
    });
  });
});
