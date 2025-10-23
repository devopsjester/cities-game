// Mock nanoid before importing anything that uses it
jest.mock('nanoid', () => ({
  nanoid: jest.fn(() => 'mock-player-id-123'),
}));

// Mock the GameModel
jest.mock('../models/Game');

import { gameService } from './gameService';

describe('GameService - Input Validation', () => {
  describe('createGame', () => {
    it('should throw error if nickname is empty', async () => {
      await expect(gameService.createGame('', 'socket123')).rejects.toThrow('Nickname is required');
    });

    it('should throw error if nickname is only whitespace', async () => {
      await expect(gameService.createGame('   ', 'socket123')).rejects.toThrow(
        'Nickname is required'
      );
    });

    it('should throw error if nickname is too short', async () => {
      await expect(gameService.createGame('A', 'socket123')).rejects.toThrow(
        'Nickname must be at least 2 characters'
      );
    });

    it('should throw error if nickname is too long', async () => {
      const longNickname = 'A'.repeat(21);
      await expect(gameService.createGame(longNickname, 'socket123')).rejects.toThrow(
        'Nickname must be at most 20 characters'
      );
    });

    it('should throw error if socketId is empty', async () => {
      await expect(gameService.createGame('ValidName', '')).rejects.toThrow(
        'Socket ID is required'
      );
    });
  });

  describe('joinGame', () => {
    it('should throw error if nickname is empty', async () => {
      await expect(gameService.joinGame('ABCD', '', 'socket123')).rejects.toThrow(
        'Nickname is required'
      );
    });

    it('should throw error if nickname is only whitespace', async () => {
      await expect(gameService.joinGame('ABCD', '   ', 'socket123')).rejects.toThrow(
        'Nickname is required'
      );
    });

    it('should throw error if nickname is too short', async () => {
      await expect(gameService.joinGame('ABCD', 'A', 'socket123')).rejects.toThrow(
        'Nickname must be at least 2 characters'
      );
    });

    it('should throw error if nickname is too long', async () => {
      const longNickname = 'A'.repeat(21);
      await expect(gameService.joinGame('ABCD', longNickname, 'socket123')).rejects.toThrow(
        'Nickname must be at most 20 characters'
      );
    });

    it('should throw error if game code is empty', async () => {
      await expect(gameService.joinGame('', 'ValidName', 'socket123')).rejects.toThrow(
        'Game code is required'
      );
    });

    it('should throw error if game code is only whitespace', async () => {
      await expect(gameService.joinGame('   ', 'ValidName', 'socket123')).rejects.toThrow(
        'Game code is required'
      );
    });

    it('should throw error if socketId is empty', async () => {
      await expect(gameService.joinGame('ABCD', 'ValidName', '')).rejects.toThrow(
        'Socket ID is required'
      );
    });
  });
});
