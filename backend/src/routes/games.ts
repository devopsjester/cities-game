import express, { Request, Response, NextFunction } from 'express';
import { gameService } from '../services/gameService';

const router = express.Router();

// Health check
router.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Get game by code
router.get('/games/:code', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const game = await gameService.getGame(req.params.code);
    
    if (!game) {
      return res.status(404).json({ error: 'Game not found' });
    }
    
    const recentMoves = gameService.getRecentMoves(game, 10);
    
    res.json({
      code: game.code,
      players: game.players,
      status: game.status,
      currentPlayerIndex: game.currentPlayerIndex,
      recentMoves,
      totalMoves: game.gameHistory.length,
    });
  } catch (error) {
    next(error);
  }
});

// Get all moves for a game (with pagination)
router.get('/games/:code/moves', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const game = await gameService.getGame(req.params.code);
    
    if (!game) {
      return res.status(404).json({ error: 'Game not found' });
    }
    
    const page = req.query.page ? parseInt(req.query.page as string) : 1;
    const result = gameService.getAllMoves(game, page, 20);
    
    res.json(result);
  } catch (error) {
    next(error);
  }
});

export default router;
