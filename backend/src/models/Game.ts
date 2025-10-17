import mongoose, { Schema, Document } from 'mongoose';

export interface IGame extends Document {
  code: string;
  players: Array<{
    id: string;
    nickname: string;
    socketId: string;
    isCreator: boolean;
    joinedAt: Date;
  }>;
  currentPlayerIndex: number;
  gameHistory: Array<{
    playerId: string;
    playerNickname: string;
    cityName: string;
    normalizedCityName: string;
    nextStartingLetter: string;
    timestamp: Date;
    isValid: boolean;
    isDuplicate?: boolean;
    validationSource?: string;
  }>;
  usedCities: string[];
  status: 'waiting' | 'active' | 'completed';
  createdAt: Date;
  updatedAt: Date;
}

const GameSchema = new Schema<IGame>(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      length: 4,
      uppercase: true,
    },
    players: [
      {
        id: { type: String, required: true },
        nickname: { type: String, required: true },
        socketId: { type: String, required: true },
        isCreator: { type: Boolean, default: false },
        joinedAt: { type: Date, default: Date.now },
      },
    ],
    currentPlayerIndex: {
      type: Number,
      default: 0,
    },
    gameHistory: [
      {
        playerId: { type: String, required: true },
        playerNickname: { type: String, required: true },
        cityName: { type: String, required: true },
        normalizedCityName: { type: String, required: true },
        nextStartingLetter: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
        isValid: { type: Boolean, default: true },
        isDuplicate: { type: Boolean, default: false },
        validationSource: { type: String },
      },
    ],
    usedCities: [String],
    status: {
      type: String,
      enum: ['waiting', 'active', 'completed'],
      default: 'waiting',
    },
  },
  {
    timestamps: true,
  }
);

GameSchema.index({ code: 1 });
GameSchema.index({ status: 1 });
GameSchema.index({ 'players.socketId': 1 });

export default mongoose.model<IGame>('Game', GameSchema);
