import { nanoid } from 'nanoid';
import GameModel, { IGame } from '../models/Game';
import { Game, Player, GameMove, ValidationResult } from '../types';
import { generateGameCode, normalizeCityName, extractNextLetter, startsWithLetter } from '../utils/gameUtils';
import { cityValidationService } from './cityValidationService';
import logger from '../utils/logger';

export class GameService {
  /**
   * Create a new game
   */
  async createGame(creatorNickname: string, creatorSocketId: string): Promise<IGame> {
    const code = await this.generateUniqueGameCode();
    const playerId = nanoid();

    const game = new GameModel({
      code,
      players: [
        {
          id: playerId,
          nickname: creatorNickname,
          socketId: creatorSocketId,
          isCreator: true,
          joinedAt: new Date(),
        },
      ],
      currentPlayerIndex: 0,
      gameHistory: [],
      usedCities: [],
      status: 'waiting',
    });

    await game.save();
    logger.info(`Game created with code: ${code}`);
    return game;
  }

  /**
   * Join an existing game
   */
  async joinGame(
    gameCode: string,
    playerNickname: string,
    playerSocketId: string
  ): Promise<IGame> {
    const game = await GameModel.findOne({
      code: gameCode.toUpperCase(),
    });

    if (!game) {
      throw new Error('Game not found');
    }

    if (game.status !== 'waiting') {
      throw new Error('Game already started');
    }

    // Check if player already in game
    const existingPlayer = game.players.find((p) => p.nickname === playerNickname);
    if (existingPlayer) {
      throw new Error('Player with this nickname already in game');
    }

    const playerId = nanoid();
    game.players.push({
      id: playerId,
      nickname: playerNickname,
      socketId: playerSocketId,
      isCreator: false,
      joinedAt: new Date(),
    });

    await game.save();
    logger.info(`Player ${playerNickname} joined game ${gameCode}`);
    return game;
  }

  /**
   * Start a game
   */
  async startGame(gameCode: string, playerId: string): Promise<IGame> {
    const game = await GameModel.findOne({ code: gameCode.toUpperCase() });

    if (!game) {
      throw new Error('Game not found');
    }

    const player = game.players.find((p) => p.id === playerId);
    if (!player || !player.isCreator) {
      throw new Error('Only the game creator can start the game');
    }

    if (game.players.length < 2) {
      throw new Error('Need at least 2 players to start');
    }

    game.status = 'active';
    await game.save();

    logger.info(`Game ${gameCode} started with ${game.players.length} players`);
    return game;
  }

  /**
   * Submit a city name move
   */
  async submitMove(
    gameCode: string,
    playerId: string,
    cityName: string
  ): Promise<{ game: IGame; validationResult: ValidationResult; isCorrectPlayer: boolean }> {
    const game = await GameModel.findOne({ code: gameCode.toUpperCase() });

    if (!game) {
      throw new Error('Game not found');
    }

    if (game.status !== 'active') {
      throw new Error('Game is not active');
    }

    // Check if it's the player's turn
    const currentPlayer = game.players[game.currentPlayerIndex];
    const isCorrectPlayer = currentPlayer.id === playerId;

    if (!isCorrectPlayer) {
      throw new Error('Not your turn');
    }

    // Validate the city
    const usedCitiesSet = new Set(game.usedCities);
    const validationResult = cityValidationService.validateCity(
      cityName,
      usedCitiesSet,
      game.gameHistory
    );

    // Check if city starts with correct letter (if not first move)
    if (game.gameHistory.length > 0) {
      const lastMove = game.gameHistory[game.gameHistory.length - 1];
      const requiredLetter = lastMove.nextStartingLetter;
      
      if (!startsWithLetter(cityName, requiredLetter)) {
        validationResult.isValid = false;
        validationResult.suggestions = [
          `Must start with letter '${requiredLetter}'`,
        ];
      }
    }

    // Only process valid, non-duplicate moves
    if (validationResult.isValid && !validationResult.isDuplicate) {
      const move: GameMove = {
        playerId: currentPlayer.id,
        playerNickname: currentPlayer.nickname,
        cityName: validationResult.displayName,
        normalizedCityName: validationResult.normalizedName,
        nextStartingLetter: validationResult.nextStartingLetter,
        timestamp: new Date(),
        isValid: true,
        validationSource: validationResult.source,
      };

      game.gameHistory.push(move);
      game.usedCities.push(validationResult.normalizedName);

      // Move to next player
      game.currentPlayerIndex = (game.currentPlayerIndex + 1) % game.players.length;

      await game.save();
      logger.info(`Valid move submitted in game ${gameCode}: ${cityName}`);
    }

    return { game, validationResult, isCorrectPlayer };
  }

  /**
   * Get game by code
   */
  async getGame(gameCode: string): Promise<IGame | null> {
    return GameModel.findOne({ code: gameCode.toUpperCase() });
  }

  /**
   * Get game by socket ID
   */
  async getGameBySocketId(socketId: string): Promise<IGame | null> {
    return GameModel.findOne({ 'players.socketId': socketId });
  }

  /**
   * Update player socket ID (for reconnection)
   */
  async updatePlayerSocketId(
    gameCode: string,
    playerId: string,
    newSocketId: string
  ): Promise<IGame | null> {
    const game = await GameModel.findOne({ code: gameCode.toUpperCase() });

    if (!game) {
      return null;
    }

    const player = game.players.find((p) => p.id === playerId);
    if (player) {
      player.socketId = newSocketId;
      await game.save();
    }

    return game;
  }

  /**
   * Remove player from game
   */
  async removePlayer(gameCode: string, playerId: string): Promise<IGame | null> {
    const game = await GameModel.findOne({ code: gameCode.toUpperCase() });

    if (!game) {
      return null;
    }

    const playerIndex = game.players.findIndex((p) => p.id === playerId);
    if (playerIndex === -1) {
      return game;
    }

    game.players.splice(playerIndex, 1);

    // If no players left, mark as completed
    if (game.players.length === 0) {
      game.status = 'completed';
    } else if (game.players.length === 1 && game.status === 'active') {
      // If only one player left during active game, mark as completed
      game.status = 'completed';
    }

    await game.save();
    logger.info(`Player removed from game ${gameCode}`);
    return game;
  }

  /**
   * Generate unique game code
   */
  private async generateUniqueGameCode(): Promise<string> {
    let code: string;
    let attempts = 0;
    const maxAttempts = 10;

    do {
      code = generateGameCode();
      const existing = await GameModel.findOne({ code });
      if (!existing) {
        return code;
      }
      attempts++;
    } while (attempts < maxAttempts);

    throw new Error('Failed to generate unique game code');
  }

  /**
   * Get game statistics for last 10 moves
   */
  getRecentMoves(game: IGame, limit: number = 10): GameMove[] {
    const history = game.gameHistory || [];
    return history.slice(-limit);
  }

  /**
   * Get all moves with pagination
   */
  getAllMoves(game: IGame, page: number = 1, perPage: number = 20): {
    moves: GameMove[];
    total: number;
    page: number;
    totalPages: number;
  } {
    const history = game.gameHistory || [];
    const total = history.length;
    const totalPages = Math.ceil(total / perPage);
    const start = (page - 1) * perPage;
    const end = start + perPage;
    const moves = history.slice(start, end);

    return {
      moves,
      total,
      page,
      totalPages,
    };
  }
}

export const gameService = new GameService();
