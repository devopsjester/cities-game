# GitHub Copilot Instructions for Cities Game

## Project Overview

Cities Game is a real-time multiplayer word game where players take turns naming cities, towns, and communities from around the world. Each player must name a location that begins with the same letter the previous player's location ended with.

**Note**: This project is currently in development. The backend and frontend directories are being set up according to the architecture described below.

## Architecture

### Technology Stack
- **Frontend**: React.js + TypeScript + Vite
- **Backend**: Node.js + Express.js + TypeScript
- **Database**: MongoDB + In-Memory City Database
- **Real-time Communication**: Socket.io for WebSocket
- **Testing**: Jest + Playwright + React Testing Library
- **Deployment**: Azure Container Apps + GitHub Actions

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
│   │   ├── components/     # React components (PascalCase)
│   │   ├── hooks/          # Custom hooks (camelCase, use- prefix)
│   │   ├── services/       # API services
│   │   ├── store/          # State management
│   │   └── utils/          # Frontend utilities
│   └── tests/             # Frontend tests
├── docs/                  # Documentation
├── .github/               # GitHub Actions workflows
└── scripts/               # Build and deployment scripts
```

## Code Style and Standards

### TypeScript Standards
- **Always use TypeScript strict mode**
- **Avoid `any` types** - use proper typing with interfaces and types
- **Define clear interfaces** for all data structures
- **Use enums** for constants and fixed values
- Minimum **80% code coverage** required for tests

### Naming Conventions
```typescript
// Variables and functions: camelCase
const gameState = 'active';
const validateCity = (name: string) => {};

// Classes: PascalCase
class GameController {}

// Constants: UPPER_SNAKE_CASE
const MAX_PLAYERS = 8;

// Interfaces: PascalCase
interface GameState {}

// React Components: PascalCase
const GameBoard: React.FC = () => {};

// Custom Hooks: camelCase with 'use' prefix
const useGameState = () => {};

// Files: Match the main export
// - Components: PascalCase (GameBoard.tsx)
// - Hooks: camelCase (useGameState.ts)
// - Services: camelCase (gameService.ts)
// - Types: camelCase (game.types.ts)
```

### File Organization
- Place tests alongside source files or in `__tests__` folders
- Use `*.test.ts` or `*.spec.ts` for test files
- Group related functionality in directories
- Keep components small and focused

## Testing Requirements

### Unit Tests
- Minimum 80% code coverage
- Test files: `*.test.ts` or `*.spec.ts`
- Use descriptive test names
- Follow the Arrange-Act-Assert pattern

```typescript
describe('FeatureName', () => {
  describe('functionName', () => {
    it('should do something specific', () => {
      // Arrange
      const input = 'test';
      
      // Act
      const result = functionName(input);
      
      // Assert
      expect(result).toBe('expected');
    });
  });
});
```

### Integration Tests
- Test API endpoints with real requests
- Test WebSocket communication
- Test database operations
- Use realistic test data

### E2E Tests
- Test complete user workflows
- Use Playwright for browser automation
- Cover critical game paths

## Backend Development Guidelines

### API Design
- Follow RESTful principles
- Use consistent response formats
- Validate all inputs
- Document all endpoints

```typescript
// Standard API response format
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
  meta?: {
    timestamp: string;
    requestId: string;
  };
}
```

### Database Operations
- Use transactions for multi-document operations
- Create appropriate indexes for performance
- Validate data at the schema level
- Create migration scripts for schema changes

### WebSocket Events
- Use TypeScript interfaces for all events
- Document all event types
- Handle connection errors gracefully
- Implement proper error handling and reconnection logic

## Frontend Development Guidelines

### Component Structure
```typescript
// Standard component template
interface ComponentProps {
  // Define props with clear types
}

export const Component: React.FC<ComponentProps> = ({ 
  // Destructure props
}) => {
  // 1. Hooks at top
  // 2. Event handlers
  // 3. Render logic
  
  return (
    // JSX
  );
};
```

### State Management
- **Local State**: Use `useState` for component-specific state
- **Global State**: Use Redux Toolkit for shared state
- **Server State**: Use React Query for API data
- **Form State**: Use React Hook Form for forms

### Performance Considerations
- Use `useMemo` and `useCallback` appropriately
- Implement lazy loading for routes with code splitting
- Monitor and optimize bundle size
- Follow WCAG accessibility guidelines

## Build and Development Commands

### Root Level
```bash
npm run dev          # Start both backend and frontend
npm run build        # Build both backend and frontend
npm run test         # Run all tests
npm run lint         # Lint all code
```

### Backend
```bash
cd backend
npm run dev          # Start development server with hot reload
npm run build        # Build TypeScript to JavaScript
npm run test         # Run unit tests
npm run lint         # Run ESLint
npm run build:city-database  # Build city database from sources
```

### Frontend
```bash
cd frontend
npm run dev          # Start Vite dev server
npm run build        # Build for production
npm run test         # Run unit tests
npm run test:e2e     # Run end-to-end tests
npm run lint         # Run ESLint
```

## Game-Specific Rules and Logic

### Core Game Rules
1. **Letter Chaining**: Each entry must start with the same letter that the previous entry ended with
2. **"City" Suffix Rule**: If a location ends with "city" (e.g., "New York City"), ignore "City" for the next starting letter
3. **No Duplicates**: Each city can only be used once per game
4. **Case Insensitive**: All entries are normalized to lowercase for comparison
5. **Ultra-fast Validation**: < 1ms city validation using in-memory database

### City Database
- 1.5+ million cities from GeoNames and OpenStreetMap
- In-memory database for fast validation
- Custom cities can be added via admin panel
- Fuzzy matching for typo correction
- Normalized names for consistent comparison

## Commit Message Format

Follow conventional commits:
```
type(scope): description

[optional body]

[optional footer]
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples:**
```
feat(game): add spectator mode functionality
fix(validation): resolve duplicate city detection issue
docs(readme): update deployment instructions
test(api): add integration tests for game endpoints
```

## Security Considerations

- Validate and sanitize all user inputs
- Use rate limiting on API endpoints
- Configure CORS for allowed origins only
- Use JWT tokens for admin access
- Never commit secrets or API keys
- Follow secure coding practices

## Additional Notes

- This is a monorepo with workspaces for backend and frontend
- Development requires Node.js 18+ and MongoDB
- The city database can be built using `npm run city-database:build` from the root directory
- Real-time communication uses Socket.io for instant game updates
- The admin panel is available at `/admin` for adding custom cities
- Docker Compose is available for local deployment
- CI/CD is configured with GitHub Actions for Azure deployment

## When Generating Code

1. **Always consider the existing patterns** in the codebase
2. **Write tests** for new functionality
3. **Follow TypeScript strict mode** - no `any` types
4. **Use existing utilities and services** before creating new ones
5. **Document complex logic** with comments
6. **Consider performance implications** for real-time features
7. **Handle errors gracefully** with proper error messages
8. **Ensure accessibility** in UI components
9. **Keep the bundle size minimal** by using code splitting
10. **Test multiplayer scenarios** for game-related features
