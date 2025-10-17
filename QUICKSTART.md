# Quick Start Guide

## Local Development

### Prerequisites
- Node.js 18+ and npm
- MongoDB (running locally or via Docker)

### Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**

   Backend (`backend/.env`):
   ```
   NODE_ENV=development
   PORT=3001
   MONGODB_URI=mongodb://localhost:27017/cities-game
   CORS_ORIGIN=http://localhost:5173
   ```

   Frontend (`frontend/.env`):
   ```
   VITE_API_URL=http://localhost:3001
   ```

3. **Start MongoDB** (if not already running):
   ```bash
   docker run -d -p 27017:27017 --name mongodb mongo:6.0
   ```

4. **Start the development servers:**
   ```bash
   npm run dev
   ```
   This will start both backend (port 3001) and frontend (port 5173).

5. **Access the application:**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3001
   - Health check: http://localhost:3001/api/health

## Docker Deployment

### Development with Docker Compose

```bash
npm run docker:dev
```

### Production with Docker Compose

```bash
npm run docker:up
```

Access the application at http://localhost:3000

## Building

### Build both frontend and backend
```bash
npm run build
```

### Build backend only
```bash
npm run build:backend
```

### Build frontend only
```bash
npm run build:frontend
```

## Testing

### Run all tests
```bash
npm test
```

### Run backend tests with coverage
```bash
npm run test:backend
```

## Game Rules

1. **Create or Join a Game**: Players can create a new game (generates a 4-letter code) or join an existing game
2. **Take Turns**: Each player names a city that starts with the same letter the previous city ended with
3. **"City" Suffix Rule**: If a city ends with "city" (e.g., "Kansas City"), the suffix is ignored (next city starts with "S")
4. **No Duplicates**: Each city can only be used once per game
5. **Valid Cities Only**: All entries must be real cities verified against the city database

## Project Structure

```
cities-game/
├── backend/           # Node.js/Express backend
│   ├── src/
│   │   ├── models/    # MongoDB models
│   │   ├── services/  # Business logic
│   │   ├── routes/    # API routes
│   │   ├── socket/    # WebSocket handlers
│   │   └── utils/     # Utility functions
│   └── data/          # City database
├── frontend/          # React frontend
│   ├── src/
│   │   ├── components/# React components
│   │   ├── services/  # API/Socket services
│   │   ├── store/     # State management
│   │   └── styles/    # CSS styles
│   └── public/        # Static assets
└── docs/              # Documentation
```

## Troubleshooting

### MongoDB Connection Issues
If you get connection errors, ensure MongoDB is running:
```bash
docker ps | grep mongo
```

### Port Already in Use
If ports 3001 or 5173 are in use, you can change them in the `.env` files.

### Build Errors
Clear node_modules and reinstall:
```bash
npm run clean
npm install
```

## Next Steps

- Review the full documentation in [README.md](../README.md)
- Check the technical specification in [docs/game-specs.md](../docs/game-specs.md)
- See [CONTRIBUTING.md](../CONTRIBUTING.md) for contribution guidelines
