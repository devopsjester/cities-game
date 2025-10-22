import { Server as HTTPServer } from 'http';
import { Socket, Server as SocketIOServer } from 'socket.io';
import { cityValidationService } from '../services/cityValidationService';
import { gameService } from '../services/gameService';
import logger from '../utils/logger';

// Socket Response Types
interface SuccessResponse<T = Record<string, unknown>> {
  success: true;
  data?: T;
}

interface ErrorResponse {
  success: false;
  error: string;
}

export function initializeSocketServer(httpServer: HTTPServer): SocketIOServer {
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket: Socket) => {
    logger.info(`Client connected: ${socket.id}`);

    // Create game
    socket.on(
      'create-game',
      async (
        data: { nickname: string },
        callback: (response: SuccessResponse | ErrorResponse) => void
      ) => {
        try {
          const game = await gameService.createGame(data.nickname, socket.id);
          socket.join(game.code);

          callback({
            success: true,
            data: {
              game: {
                code: game.code,
                players: game.players,
                status: game.status,
              },
            },
          });

          // Notify room
          io.to(game.code).emit('game-updated', {
            code: game.code,
            players: game.players,
            status: game.status,
            currentPlayerIndex: game.currentPlayerIndex,
          });
        } catch (error) {
          logger.error('Error creating game:', error);
          callback({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to create game',
          });
        }
      }
    );

    // Join game
    socket.on(
      'join-game',
      async (
        data: { code: string; nickname: string },
        callback: (response: SuccessResponse | ErrorResponse) => void
      ) => {
        try {
          const game = await gameService.joinGame(data.code, data.nickname, socket.id);
          socket.join(game.code);

          callback({
            success: true,
            data: {
              game: {
                code: game.code,
                players: game.players,
                status: game.status,
              },
            },
          });

          // Notify room
          io.to(game.code).emit('game-updated', {
            code: game.code,
            players: game.players,
            status: game.status,
            currentPlayerIndex: game.currentPlayerIndex,
          });
        } catch (error) {
          logger.error('Error joining game:', error);
          callback({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to join game',
          });
        }
      }
    );

    // Start game
    socket.on(
      'start-game',
      async (
        data: { code: string; playerId: string },
        callback: (response: SuccessResponse | ErrorResponse) => void
      ) => {
        try {
          const game = await gameService.startGame(data.code, data.playerId);

          callback({
            success: true,
          });

          // Notify room
          io.to(game.code).emit('game-started', {
            code: game.code,
            players: game.players,
            status: game.status,
            currentPlayerIndex: game.currentPlayerIndex,
          });
        } catch (error) {
          logger.error('Error starting game:', error);
          callback({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to start game',
          });
        }
      }
    );

    // Submit move
    socket.on(
      'submit-move',
      async (
        data: { code: string; playerId: string; cityName: string },
        callback: (response: SuccessResponse | ErrorResponse) => void
      ) => {
        try {
          logger.info(
            `Move submission attempt: ${data.cityName} by player ${data.playerId} in game ${data.code}`
          );
          const result = await gameService.submitMove(data.code, data.playerId, data.cityName);

          logger.info(
            `Validation result: isValid=${result.validationResult.isValid}, isDuplicate=${result.validationResult.isDuplicate}, suggestions=${result.validationResult.suggestions?.join(', ') || 'none'}`
          );

          if (result.validationResult.isValid && !result.validationResult.isDuplicate) {
            // Move was valid
            const recentMoves = gameService.getRecentMoves(result.game, 10);

            callback({
              success: true,
              data: {
                validationResult: result.validationResult,
              },
            });

            // Notify room of new move
            io.to(result.game.code).emit('move-made', {
              move: result.game.gameHistory[result.game.gameHistory.length - 1],
              currentPlayerIndex: result.game.currentPlayerIndex,
              recentMoves,
            });
          } else {
            // Move was invalid or duplicate
            callback({
              success: false,
              error: result.validationResult.isDuplicate
                ? 'City already used in this game'
                : 'Invalid city name',
            });
          }
        } catch (error) {
          logger.error('Error submitting move:', error);
          callback({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to submit move',
          });
        }
      }
    );

    // Get game state
    socket.on(
      'get-game-state',
      async (
        data: { code: string },
        callback: (response: SuccessResponse | ErrorResponse) => void
      ) => {
        try {
          const game = await gameService.getGame(data.code);

          if (!game) {
            callback({
              success: false,
              error: 'Game not found',
            });
            return;
          }

          const recentMoves = gameService.getRecentMoves(game, 10);

          callback({
            success: true,
            data: {
              game: {
                code: game.code,
                players: game.players,
                status: game.status,
                currentPlayerIndex: game.currentPlayerIndex,
                recentMoves,
                totalMoves: game.gameHistory.length,
              },
            },
          });
        } catch (error) {
          logger.error('Error getting game state:', error);
          callback({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to get game state',
          });
        }
      }
    );

    // Get all moves (for expand history)
    socket.on(
      'get-all-moves',
      async (
        data: { code: string; page?: number },
        callback: (response: SuccessResponse | ErrorResponse) => void
      ) => {
        try {
          const game = await gameService.getGame(data.code);

          if (!game) {
            callback({
              success: false,
              error: 'Game not found',
            });
            return;
          }

          const result = gameService.getAllMoves(game, data.page || 1, 20);

          callback({
            success: true,
            ...result,
          });
        } catch (error) {
          logger.error('Error getting all moves:', error);
          callback({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to get moves',
          });
        }
      }
    );

    // Validate city (for autocomplete/suggestions)
    socket.on(
      'validate-city',
      async (
        data: { cityName: string },
        callback: (response: SuccessResponse | ErrorResponse) => void
      ) => {
        try {
          const validationResult = cityValidationService.validateCity(data.cityName);

          callback({
            success: true,
            data: {
              validationResult,
            },
          });
        } catch (error) {
          logger.error('Error validating city:', error);
          callback({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to validate city',
          });
        }
      }
    );

    // Get city suggestions (for autocomplete)
    socket.on(
      'get-suggestions',
      async (
        data: { partialName: string },
        callback: (response: SuccessResponse | ErrorResponse) => void
      ) => {
        try {
          const suggestions = cityValidationService.getSuggestions(data.partialName, 10);

          callback({
            success: true,
            data: {
              suggestions,
            },
          });
        } catch (error) {
          logger.error('Error getting suggestions:', error);
          callback({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to get suggestions',
          });
        }
      }
    );

    // Disconnect
    socket.on('disconnect', async () => {
      logger.info(`Client disconnected: ${socket.id}`);

      try {
        // Find game by socket ID and remove player
        const game = await gameService.getGameBySocketId(socket.id);
        if (game) {
          const player = game.players.find((p) => p.socketId === socket.id);
          if (player) {
            await gameService.removePlayer(game.code, player.id);

            // Notify room
            const updatedGame = await gameService.getGame(game.code);
            if (updatedGame) {
              io.to(game.code).emit('player-left', {
                playerId: player.id,
                playerNickname: player.nickname,
                players: updatedGame.players,
                status: updatedGame.status,
              });
            }
          }
        }
      } catch (error) {
        logger.error('Error handling disconnect:', error);
      }
    });
  });

  return io;
}
