export interface Player {
  id: string;
  nickname: string;
  socketId: string;
  isCreator: boolean;
  joinedAt: Date;
}

export interface Player {
  id: string;
  nickname: string;
  socketId: string;
  isCreator: boolean;
  joinedAt: Date;
}

export interface GameMove {
  playerId: string;
  playerNickname: string;
  cityName: string;
  normalizedCityName: string;
  nextStartingLetter: string;
  timestamp: Date;
  isValid: boolean;
  isDuplicate?: boolean;
  validationSource?: 'memory' | 'api_fallback' | 'custom';
}

export interface Game {
  code: string;
  players: Player[];
  status: 'waiting' | 'active' | 'completed';
  currentPlayerIndex: number;
  recentMoves: GameMove[];
  totalMoves: number;
}

export interface ValidationResult {
  isValid: boolean;
  normalizedName: string;
  displayName: string;
  nextStartingLetter: string;
  source: 'memory' | 'api_fallback' | 'custom';
  confidence: number;
  isDuplicate: boolean;
  duplicateMove?: GameMove;
  suggestions?: string[];
}
