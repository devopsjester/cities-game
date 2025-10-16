# Contributing to Cities Game

Thank you for your interest in contributing to Cities Game! This document provides guidelines and information for contributors.

## 🚀 Getting Started

### Prerequisites
- Node.js 18 or higher
- Git
- MongoDB (local installation or Atlas account)
- Basic knowledge of TypeScript, React, and Node.js

### Development Setup

1. **Fork and Clone**
   ```bash
   git clone https://github.com/YOUR_USERNAME/cities-game.git
   cd cities-game
   ```

2. **Install Dependencies**
   ```bash
   # Backend
   cd backend && npm install
   
   # Frontend  
   cd ../frontend && npm install
   ```

3. **Environment Setup**
   ```bash
   # Copy environment templates
   cp backend/.env.example backend/.env
   cp frontend/.env.example frontend/.env.local
   ```

4. **Database Setup**
   ```bash
   # Start MongoDB locally or update connection string
   # Run initial city database build
   cd backend && npm run build:city-database
   ```

5. **Start Development**
   ```bash
   # Terminal 1: Backend
   cd backend && npm run dev
   
   # Terminal 2: Frontend
   cd frontend && npm run dev
   ```

## 📋 Contribution Guidelines

### Code Style

#### TypeScript Standards
- **Strict Mode**: Always use TypeScript strict mode
- **No Any**: Avoid `any` types, use proper typing
- **Interfaces**: Define clear interfaces for data structures
- **Enums**: Use enums for constants and fixed values

#### Naming Conventions
```typescript
// Variables and functions: camelCase
const gameState = 'active';
const validateCity = (name: string) => {};

// Classes: PascalCase
class GameController {}

// Constants: UPPER_SNAKE_CASE
const MAX_PLAYERS = 8;

// Interfaces: PascalCase with 'I' prefix (optional)
interface GameState {}
```

#### File Organization
```
src/
├── components/          # React components (PascalCase)
│   └── GameBoard.tsx
├── hooks/              # Custom hooks (camelCase, use- prefix)  
│   └── useGameState.ts
├── services/           # Business logic (camelCase)
│   └── gameService.ts
├── types/              # TypeScript definitions
│   └── game.types.ts
└── utils/              # Helper functions (camelCase)
    └── cityNormalizer.ts
```

### Testing Requirements

#### Unit Tests
- **Coverage**: Minimum 80% code coverage
- **Location**: Tests alongside source files or in `__tests__` folders
- **Naming**: `*.test.ts` or `*.spec.ts`

```typescript
// Example test structure
describe('CityValidator', () => {
  describe('validateCity', () => {
    it('should validate a real city', () => {
      // Test implementation
    });
    
    it('should reject invalid input', () => {
      // Test implementation  
    });
  });
});
```

#### Integration Tests
- Test API endpoints with real requests
- Test WebSocket communication
- Test database operations

#### E2E Tests
- Test complete user workflows
- Use Playwright for browser automation
- Cover critical game paths

### Git Workflow

#### Branch Naming
```bash
# Features
feature/add-spectator-mode
feature/improve-city-search

# Bug fixes  
fix/duplicate-city-detection
fix/websocket-reconnection

# Documentation
docs/update-setup-guide
docs/add-api-examples

# Refactoring
refactor/game-state-management
refactor/city-validation-service
```

#### Commit Messages
Follow conventional commits format:

```
type(scope): description

[optional body]

[optional footer]
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
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

## 🎯 Types of Contributions

### 🐛 Bug Reports

When reporting bugs, please include:

```markdown
**Bug Description**
Clear description of the issue

**Steps to Reproduce**
1. Go to...
2. Click on...
3. See error...

**Expected Behavior** 
What should happen

**Actual Behavior**
What actually happens

**Environment**
- OS: [e.g., macOS 13.0]
- Browser: [e.g., Chrome 118] 
- Node.js: [e.g., 18.17.0]

**Screenshots**
If applicable

**Additional Context**
Any other relevant information
```

### ✨ Feature Requests

For new features, please provide:

```markdown
**Feature Description**
Clear description of the proposed feature

**Problem Statement**
What problem does this solve?

**Proposed Solution**  
How should this feature work?

**Alternatives Considered**
Other approaches you've thought about

**Additional Context**
Mockups, examples, or other details
```

### 🌍 City Database Contributions

#### Adding Cities via Admin Panel
1. Run the project locally
2. Access `/admin` 
3. Use "Add Custom City" form
4. Provide: name, country, region (optional)
5. Submit for approval

#### Adding Cities via Code
1. Edit `backend/data/custom-cities.json`
2. Follow existing format:
   ```json
   {
     "name": "Example City",
     "normalizedName": "example city", 
     "country": "Example Country",
     "region": "Example Region",
     "population": 50000,
     "source": "manual"
   }
   ```
3. Create pull request with changes

### 📚 Documentation

#### Types of Documentation
- **Setup guides**: Help users get started
- **API documentation**: Endpoint descriptions and examples  
- **Architecture docs**: System design and decisions
- **Tutorials**: Step-by-step learning materials

#### Documentation Standards
- Use clear, concise language
- Include code examples
- Add screenshots for UI elements
- Keep information up-to-date

## 🔧 Development Guidelines

### Backend Development

#### API Design
- **RESTful**: Follow REST principles
- **Consistent**: Use consistent response formats
- **Documented**: Document all endpoints
- **Validated**: Validate all inputs

```typescript
// Example API response format
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

#### Database Operations
- **Transactions**: Use transactions for multi-document operations
- **Indexes**: Create appropriate indexes for performance
- **Validation**: Validate data at the schema level
- **Migration**: Create migration scripts for schema changes

#### WebSocket Events
- **Typed**: Use TypeScript interfaces for events
- **Documented**: Document all event types
- **Error Handling**: Handle connection errors gracefully

### Frontend Development

#### Component Structure
```typescript
// Component template
interface ComponentProps {
  // Define props
}

export const Component: React.FC<ComponentProps> = ({ 
  // Destructure props
}) => {
  // Hooks at top
  // Event handlers  
  // Render logic
  
  return (
    // JSX
  );
};
```

#### State Management
- **Local State**: Use `useState` for component-specific state
- **Global State**: Use Redux Toolkit for shared state
- **Server State**: Use React Query for API data
- **Form State**: Use React Hook Form for forms

#### Performance
- **Memoization**: Use `useMemo` and `useCallback` appropriately
- **Code Splitting**: Implement lazy loading for routes
- **Bundle Size**: Monitor and optimize bundle size
- **Accessibility**: Follow WCAG guidelines

## 🧪 Testing Guidelines

### Testing Philosophy
- **Test Behavior**: Test what the code does, not how it's implemented
- **User-Focused**: Write tests from the user's perspective
- **Maintainable**: Keep tests simple and easy to understand
- **Fast**: Unit tests should run quickly

### Test Structure
```typescript
describe('Feature/Component Name', () => {
  // Setup and teardown
  beforeEach(() => {
    // Common setup
  });
  
  afterEach(() => {
    // Cleanup
  });
  
  // Group related tests
  describe('when condition X', () => {
    it('should do Y', () => {
      // Test implementation
    });
  });
});
```

### Mock Guidelines
- **Minimal Mocking**: Only mock external dependencies
- **Realistic Data**: Use realistic test data
- **Factory Functions**: Create test data factories

```typescript
// Test data factory example
const createMockGame = (overrides = {}) => ({
  id: 'test-game-id',
  code: 'TEST',
  players: [],
  status: 'waiting',
  ...overrides
});
```

## 🚀 Pull Request Process

### Before Submitting
1. **Tests Pass**: Ensure all tests pass locally
   ```bash
   npm run test
   npm run test:e2e
   ```

2. **Linting**: Fix any linting errors
   ```bash
   npm run lint
   ```

3. **Type Check**: Verify TypeScript compilation
   ```bash
   npm run type-check
   ```

4. **Build**: Ensure project builds successfully  
   ```bash
   npm run build
   ```

### Pull Request Template
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature  
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] E2E tests pass
- [ ] Manual testing completed

## Checklist  
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] Tests added/updated
```

### Review Process
1. **Automated Checks**: CI/CD pipeline runs automatically
2. **Code Review**: Maintainers review code and provide feedback
3. **Discussion**: Address any questions or concerns
4. **Approval**: Maintainer approval required for merge
5. **Merge**: Squash and merge to main branch

## 🏆 Recognition

### Contributors
All contributors are recognized in:
- GitHub contributors page
- Release notes for significant contributions  
- README acknowledgments section

### Maintainers
Active contributors may be invited to become maintainers with:
- Repository write access
- Pull request review responsibilities
- Community management duties

## 📞 Getting Help

### Communication Channels
- **GitHub Issues**: Bug reports and feature requests
- **GitHub Discussions**: Questions and general discussion
- **Discord**: Real-time chat (coming soon)
- **Email**: Direct contact for sensitive issues

### Response Times
- **Issues**: We aim to respond within 48 hours
- **Pull Requests**: Initial review within 72 hours  
- **Security Issues**: Response within 24 hours

## 🔒 Code of Conduct

We are committed to providing a welcoming and inclusive environment. All contributors are expected to:

- **Be Respectful**: Treat everyone with respect and kindness
- **Be Inclusive**: Welcome people of all backgrounds and identities
- **Be Collaborative**: Work together constructively
- **Be Patient**: Help others learn and grow
- **Be Professional**: Maintain professional conduct

### Enforcement
Violations of the code of conduct may result in:
- Warning for minor infractions
- Temporary suspension for repeated violations  
- Permanent ban for serious or persistent violations

Report issues to: conduct@yourdomain.com

---

**Thank you for contributing to Cities Game!** 🌍

Your contributions help make this project better for everyone. Whether you're fixing a bug, adding a feature, or improving documentation, every contribution matters.

*Happy coding!* 💻