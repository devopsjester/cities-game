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
  id: string;
  code: string;
  players: Player[];
  currentPlayerIndex: number;
  gameHistory: GameMove[];
  usedCities: Set<string>;
  status: 'waiting' | 'active' | 'completed';
  createdAt: Date;
  updatedAt: Date;
}

export interface CityRecord {
  name: string;
  normalizedName: string;
  displayName: string;
  country?: string;
  region?: string;
  population?: number;
  latitude?: number;
  longitude?: number;
  source: 'geonames' | 'osm' | 'custom' | 'restcountries';
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
  city?: CityRecord;
}

export interface CustomCity {
  id: string;
  name: string;
  normalizedName: string;
  country?: string;
  region?: string;
  addedBy: string;
  isApproved: boolean;
  createdAt: Date;
  updatedAt: Date;
}
