// Mock nanoid before importing anything that uses it
let mockIdCounter = 0;
jest.mock('nanoid', () => ({
  nanoid: jest.fn(() => `mock-player-id-${++mockIdCounter}`),
}));

import { gameService } from './gameService';
import GameModel from '../models/Game';
import { connectDatabase } from '../config/database';
import mongoose from 'mongoose';

describe('GameService', () => {
  beforeEach(() => {
    // Reset the mock ID counter before each test
    mockIdCounter = 0;
  });
  beforeAll(async () => {
    // Connect to test database
    await connectDatabase();
  });

  afterAll(async () => {
    // Clean up and close connection
    await GameModel.deleteMany({});
    await mongoose.connection.close();
  });

  afterEach(async () => {
    // Clean up after each test
    await GameModel.deleteMany({});
  });

  describe('createGame', () => {
    it('should create a new game with a unique code', async () => {
      const nickname = 'TestPlayer';
      const socketId = 'socket123';

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

    it('should create games with different codes', async () => {
      const game1 = await gameService.createGame('Player1', 'socket1');
      const game2 = await gameService.createGame('Player2', 'socket2');

      expect(game1.code).not.toBe(game2.code);
    });

    it('should throw error if nickname is empty', async () => {
      await expect(gameService.createGame('', 'socket1')).rejects.toThrow();
    });
  });

  describe('joinGame', () => {
    it('should allow a player to join an existing game', async () => {
      // Create a game first
      const game = await gameService.createGame('Creator', 'socket1');

      // Join the game
      const updatedGame = await gameService.joinGame(game.code, 'Player2', 'socket2');

      expect(updatedGame.players).toHaveLength(2);
      expect(updatedGame.players[1].nickname).toBe('Player2');
      expect(updatedGame.players[1].isCreator).toBe(false);
    });

    it('should throw error if game does not exist', async () => {
      await expect(gameService.joinGame('XXXX', 'Player', 'socket1')).rejects.toThrow(
        'Game not found'
      );
    });

    it('should throw error if game already started', async () => {
      const game = await gameService.createGame('Creator', 'socket1');
      await gameService.joinGame(game.code, 'Player2', 'socket2');
      await gameService.startGame(game.code, game.players[0].id);

      await expect(gameService.joinGame(game.code, 'Player3', 'socket3')).rejects.toThrow(
        'Game already started'
      );
    });

    it('should throw error if player nickname already exists in game', async () => {
      const game = await gameService.createGame('Creator', 'socket1');

      await expect(gameService.joinGame(game.code, 'Creator', 'socket2')).rejects.toThrow(
        'Player with this nickname already in game'
      );
    });
  });

  describe('startGame', () => {
    it('should start a game with 2 or more players', async () => {
      const game = await gameService.createGame('Creator', 'socket1');
      await gameService.joinGame(game.code, 'Player2', 'socket2');

      const startedGame = await gameService.startGame(game.code, game.players[0].id);

      expect(startedGame.status).toBe('active');
    });

    it('should throw error if less than 2 players', async () => {
      const game = await gameService.createGame('Creator', 'socket1');

      await expect(gameService.startGame(game.code, game.players[0].id)).rejects.toThrow(
        'Need at least 2 players to start'
      );
    });

    it('should throw error if non-creator tries to start', async () => {
      const game = await gameService.createGame('Creator', 'socket1');
      const joinedGame = await gameService.joinGame(game.code, 'Player2', 'socket2');

      await expect(gameService.startGame(game.code, joinedGame.players[1].id)).rejects.toThrow(
        'Only the game creator can start the game'
      );
    });

    it('should throw error if game does not exist', async () => {
      await expect(gameService.startGame('XXXX', 'player123')).rejects.toThrow('Game not found');
    });
  });
});
