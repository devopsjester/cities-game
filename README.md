# 🌍 Cities Game

A real-time multiplayer word game where players take turns naming cities, towns, and communities from around the world. Each player must name a location that begins with the same letter the previous player's location ended with.

![Game Status](https://img.shields.io/badge/status-in%20development-yellow)
![License](https://img.shields.io/badge/license-MIT-blue)
![Node.js](https://img.shields.io/badge/node.js-18%2B-green)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0%2B-blue)

## 🎮 Game Rules

### Basic Gameplay
1. **Turn-based Play**: Players take turns entering the name of a city, town, village, or any community
2. **Letter Chaining**: Each entry must start with the same letter that the previous player's entry ended with
3. **Global Communities**: All entries must be valid communities that exist anywhere in the world
4. **Case Insensitive**: Entries are not case-sensitive

### Special Rules
- **"City" Suffix Rule**: If a location ends with "city" (e.g., "New York City"), the word "City" is ignored for the next starting letter
  - Example: "Mexico City" → next player starts with "O" (from "Mexico"), not "Y"
- **No Duplicates**: Each city can only be used once per game
- **Invalid Entries**: Players can retry if they enter an invalid location (no penalty)

### Example Game Flow
```
Player 1: Aberdeen
Player 2: Newark     (starts with 'N', ends Aberdeen)
Player 3: Kinshasa   (starts with 'K', ends Newark)  
Player 4: Ann Arbor  (starts with 'A', ends Kinshasa)
Player 1: Rochester  (starts with 'R', ends Ann Arbor)
```

## 🏗️ Architecture

### Technology Stack
- **Frontend**: React.js + TypeScript + Vite
- **Backend**: Node.js + Express.js + TypeScript
- **Database**: MongoDB + In-Memory City Database
- **Real-time**: Socket.io for WebSocket communication
- **Deployment**: Azure Container Apps + GitHub Actions
- **Testing**: Jest + Playwright + React Testing Library

### Key Features
- **Ultra-fast Validation**: < 1ms city validation using in-memory database
- **Real-time Multiplayer**: Instant game updates via WebSocket
- **Custom Cities**: Admin panel for adding missing locations
- **Smart Suggestions**: Fuzzy matching for typo correction
- **Game History**: Full move history with expand/collapse view
- **Duplicate Prevention**: Automatic checking for repeated cities

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- MongoDB (local or Atlas)
- Git

### Local Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/devopsjester/cities-game.git
   cd cities-game
   ```

2. **Install dependencies**
   ```bash
   # Install backend dependencies
   cd backend
   npm install
   
   # Install frontend dependencies  
   cd ../frontend
   npm install
   ```

3. **Set up environment variables**
   ```bash
   # Backend (.env)
   cp backend/.env.example backend/.env
   
   # Frontend (.env.local)
   cp frontend/.env.example frontend/.env.local
   ```

4. **Build the city database** (first time only)
   ```bash
   cd backend
   npm run build:city-database
   ```

5. **Start the development servers**
   ```bash
   # Terminal 1: Start backend
   cd backend
   npm run dev
   
   # Terminal 2: Start frontend
   cd frontend  
   npm run dev
   ```

6. **Open the game**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3001
   - Admin Panel: http://localhost:5173/admin

## 🛠️ Development

### Project Structure
```
cities-game/
├── backend/                 # Node.js + Express API
│   ├── src/
│   │   ├── controllers/     # Route handlers
│   │   ├── services/        # Business logic
│   │   ├── models/          # Database models
│   │   ├── middleware/      # Express middleware
│   │   ├── utils/           # Utilities
│   │   └── data-pipeline/   # City database ETL
│   ├── tests/              # Backend tests
│   └── city-data/          # City database files
├── frontend/               # React + TypeScript
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── hooks/          # Custom hooks
│   │   ├── services/       # API services
│   │   ├── store/          # State management
│   │   └── utils/          # Frontend utilities
│   └── tests/             # Frontend tests
├── docs/                  # Documentation
├── .github/               # GitHub Actions workflows
└── docker/               # Docker configurations
```

### Available Scripts

#### Backend
```bash
npm run dev          # Start development server with hot reload
npm run build        # Build TypeScript to JavaScript  
npm run start        # Start production server
npm run test         # Run unit tests
npm run test:watch   # Run tests in watch mode
npm run lint         # Run ESLint
npm run build:city-database  # Build city database from sources
```

#### Frontend  
```bash
npm run dev          # Start Vite dev server
npm run build        # Build for production
npm run preview      # Preview production build
npm run test         # Run unit tests
npm run test:e2e     # Run end-to-end tests
npm run lint         # Run ESLint
```

### Testing

#### Unit Tests
```bash
# Backend tests
cd backend && npm test

# Frontend tests  
cd frontend && npm test
```

#### Integration Tests
```bash
# Full test suite
npm run test:integration
```

#### End-to-End Tests
```bash
# E2E tests with Playwright
cd frontend && npm run test:e2e
```

### Environment Variables

#### Backend Environment Variables
```bash
# Server Configuration
PORT=3001
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/cities-game
REDIS_URL=redis://localhost:6379

# External APIs (for city database building)
GEONAMES_USERNAME=your_username
OPENSTREETMAP_API_KEY=optional

# Security
JWT_SECRET=your-super-secret-key
CORS_ORIGIN=http://localhost:5173

# Admin
ADMIN_PASSWORD=secure-admin-password
```

#### Frontend Environment Variables  
```bash
# API Configuration
VITE_API_URL=http://localhost:3001
VITE_SOCKET_URL=http://localhost:3001

# Features
VITE_ENABLE_ADMIN_PANEL=true
VITE_ENABLE_ANALYTICS=false
```

## 🚢 Deployment

### Local Deployment with Docker

1. **Build and run with Docker Compose**
   ```bash
   # Build all services
   docker-compose build
   
   # Start all services
   docker-compose up -d
   
   # View logs
   docker-compose logs -f
   ```

2. **Access the application**
   - Game: http://localhost:3000
   - API: http://localhost:3001
   - MongoDB: localhost:27017

### Azure Deployment

#### Prerequisites
- Azure CLI installed and logged in
- Azure Container Registry (ACR) 
- Azure Container Apps environment

#### Automated Deployment
```bash
# Deploy using GitHub Actions
# Push to main branch to trigger deployment
git push origin main
```

#### Manual Deployment
```bash
# Build and push Docker images
./scripts/build-and-push.sh

# Deploy to Azure Container Apps
./scripts/deploy-azure.sh
```

#### Azure Resources Created
- **Azure Container Apps**: Frontend and backend containers
- **Azure Cosmos DB**: MongoDB-compatible database
- **Azure Cache for Redis**: Session storage and caching
- **Azure Application Insights**: Monitoring and analytics
- **Azure Container Registry**: Docker image storage

### Environment-Specific Configurations

#### Staging
- **URL**: https://cities-game-staging.azurecontainerapps.io
- **Database**: Staging MongoDB instance
- **Features**: All features enabled for testing

#### Production  
- **URL**: https://cities-game.azurecontainerapps.io
- **Database**: Production MongoDB with backups
- **Features**: Optimized for performance and reliability

## 🤝 Contributing

We welcome contributions! Please follow these guidelines:

### Getting Started
1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Make your changes** following our coding standards
4. **Write tests** for new functionality
5. **Run the test suite**: `npm test`
6. **Commit changes**: `git commit -m 'Add amazing feature'`
7. **Push to branch**: `git push origin feature/amazing-feature`  
8. **Open a Pull Request**

### Coding Standards
- **TypeScript**: Strict mode enabled, no `any` types
- **ESLint**: Follow the configured rules
- **Prettier**: Code formatting is automatically applied
- **Testing**: Minimum 80% code coverage required
- **Documentation**: Update docs for new features

### Types of Contributions

#### 🐛 Bug Fixes
- Fix gameplay issues
- Resolve UI/UX problems  
- Address performance issues
- Security vulnerability patches

#### ✨ New Features
- Game enhancements (new rules, game modes)
- UI improvements
- Admin panel features
- Performance optimizations

#### 🌍 City Database
- Add missing cities to the custom database
- Improve city name normalization
- Enhance fuzzy matching algorithms
- Add geographic metadata

#### 📚 Documentation
- Improve setup instructions
- Add code examples
- Update API documentation
- Create tutorials

### City Database Contributions
To add missing cities:

1. **Via Admin Panel** (preferred):
   - Access `/admin` when running locally
   - Use "Add Custom City" form
   - Cities require admin approval

2. **Via Pull Request**:
   - Add cities to `backend/data/custom-cities.json`
   - Include: name, country, region (optional)
   - Follow existing format

### Development Workflow

#### Issue Reporting
- Use GitHub Issues for bugs and feature requests
- Provide detailed reproduction steps
- Include screenshots for UI issues
- Tag issues appropriately

#### Pull Request Process
- Ensure all tests pass
- Update documentation if needed
- Add/update tests for new features
- Request review from maintainers

#### Code Review Checklist
- [ ] Code follows style guidelines
- [ ] Tests are included and passing
- [ ] Documentation is updated
- [ ] No breaking changes (or properly documented)
- [ ] Performance impact considered

## 📊 Monitoring & Analytics

### Application Monitoring
- **Health Checks**: `/health` endpoint
- **Performance Metrics**: Response times, memory usage
- **Error Tracking**: Sentry integration
- **Uptime Monitoring**: External monitoring service

### Game Analytics
- Active games and players
- Popular cities and countries
- Game completion rates
- Average game duration
- City validation success rates

### Admin Dashboard
- Real-time game statistics
- City database management
- User activity monitoring
- System health overview

## 🔒 Security

### Security Measures
- **Input Validation**: All user inputs sanitized
- **Rate Limiting**: API endpoints protected
- **CORS**: Configured for allowed origins only
- **Authentication**: JWT tokens for admin access
- **Data Protection**: No personal data stored

### Reporting Security Issues
Please email security issues to: [security@yourdomain.com]

Do not create public GitHub issues for security vulnerabilities.

## 📋 Roadmap

### Phase 1 (Current) - MVP
- [x] Basic multiplayer gameplay
- [x] City validation with duplicate prevention
- [x] Real-time updates via WebSocket
- [x] Move history with expand/collapse
- [ ] Admin panel for city management
- [ ] Automated deployment pipeline

### Phase 2 - Enhanced Features  
- [ ] Player statistics and achievements
- [ ] Game history analytics
- [ ] Spectator mode
- [ ] Custom game rules (time limits, themes)
- [ ] Improved city suggestions

### Phase 3 - Advanced Features
- [ ] Tournament mode with brackets
- [ ] Global leaderboards  
- [ ] Social features (friends, private rooms)
- [ ] Mobile app with offline mode
- [ ] AI opponent for practice

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **GeoNames**: Global city data source
- **OpenStreetMap**: Community-driven geographic data
- **Contributors**: Thanks to all contributors who help improve the game
- **Community**: Special thanks to players providing feedback

## 📞 Support

### Getting Help
- **Documentation**: Check the [docs/](docs/) folder
- **GitHub Issues**: Report bugs and request features
- **Discussions**: Join GitHub Discussions for questions
- **Discord**: Join our community Discord server [coming soon]

### Frequently Asked Questions

**Q: How many cities are in the database?**
A: The database contains 1.5+ million cities, towns, and communities worldwide, sourced from GeoNames, OpenStreetMap, and custom additions.

**Q: Can I play offline?**  
A: The game requires an internet connection for real-time multiplayer, but we're planning an offline practice mode.

**Q: How do I add a missing city?**
A: Use the admin panel to suggest cities, or create a GitHub issue with the city details.

**Q: Is there a mobile app?**
A: Currently web-only, but a mobile app is planned for Phase 3.

---

**Made with ❤️ by the Cities Game community**

*Let's explore the world, one city at a time!* 🌍