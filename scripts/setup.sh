#!/bin/bash

# Cities Game - Quick Setup Script
# This script helps you get the Cities Game running locally

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${GREEN}"
echo "🌍 Cities Game - Local Setup Script"
echo "===================================="
echo -e "${NC}"

# Check prerequisites
echo -e "${BLUE}📋 Checking prerequisites...${NC}"

# Check Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed${NC}"
    echo "Please install Node.js 18 or higher from https://nodejs.org/"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo -e "${RED}❌ Node.js version is too old (found v$NODE_VERSION, need v18+)${NC}"
    echo "Please update Node.js to version 18 or higher"
    exit 1
fi

echo -e "${GREEN}✅ Node.js $(node -v) found${NC}"

# Check npm
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm is not installed${NC}"
    exit 1
fi

echo -e "${GREEN}✅ npm $(npm -v) found${NC}"

# Check Git
if ! command -v git &> /dev/null; then
    echo -e "${RED}❌ Git is not installed${NC}"
    echo "Please install Git from https://git-scm.com/"
    exit 1
fi

echo -e "${GREEN}✅ Git found${NC}"

# Check Docker (optional)
if command -v docker &> /dev/null; then
    echo -e "${GREEN}✅ Docker found (optional)${NC}"
    DOCKER_AVAILABLE=true
else
    echo -e "${YELLOW}⚠️  Docker not found (optional - you can still run locally)${NC}"
    DOCKER_AVAILABLE=false
fi

echo ""

# Install dependencies
echo -e "${BLUE}📦 Installing dependencies...${NC}"

echo "Installing root dependencies..."
npm install

echo "Installing backend dependencies..."
cd backend && npm install && cd ..

echo "Installing frontend dependencies..."
cd frontend && npm install && cd ..

echo -e "${GREEN}✅ All dependencies installed${NC}"
echo ""

# Setup environment files
echo -e "${BLUE}⚙️  Setting up environment files...${NC}"

# Backend environment
if [ ! -f backend/.env ]; then
    echo "Creating backend/.env file..."
    cat > backend/.env << EOL
# Development Environment Configuration
NODE_ENV=development
PORT=3001

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/cities-game-dev
REDIS_URL=redis://localhost:6379

# Security
JWT_SECRET=dev-secret-key-change-in-production
CORS_ORIGIN=http://localhost:5173

# External APIs (optional - for city database building)
GEONAMES_USERNAME=demo

# Admin Configuration
ADMIN_PASSWORD=admin123

# Features
ENABLE_ADMIN_PANEL=true
EOL
    echo -e "${GREEN}✅ Created backend/.env${NC}"
else
    echo -e "${YELLOW}⚠️  backend/.env already exists, skipping${NC}"
fi

# Frontend environment
if [ ! -f frontend/.env.local ]; then
    echo "Creating frontend/.env.local file..."
    cat > frontend/.env.local << EOL
# Frontend Development Configuration
VITE_API_URL=http://localhost:3001
VITE_SOCKET_URL=http://localhost:3001

# Feature Flags
VITE_ENABLE_ADMIN_PANEL=true
VITE_ENABLE_ANALYTICS=false

# Development
VITE_NODE_ENV=development
EOL
    echo -e "${GREEN}✅ Created frontend/.env.local${NC}"
else
    echo -e "${YELLOW}⚠️  frontend/.env.local already exists, skipping${NC}"
fi

echo ""

# Choose setup method
echo -e "${BLUE}🚀 Choose your setup method:${NC}"
echo "1. Docker Compose (recommended - includes MongoDB and Redis)"
echo "2. Local development (requires MongoDB and Redis installed)"
echo ""

while true; do
    read -p "Enter your choice (1 or 2): " choice
    case $choice in
        1)
            if [ "$DOCKER_AVAILABLE" = true ]; then
                echo ""
                echo -e "${BLUE}🐳 Starting services with Docker Compose...${NC}"
                
                # Build city database first (if needed)
                if [ ! -d "backend/data/processed" ]; then
                    echo "Building initial city database (this may take a few minutes)..."
                    # Create a minimal city database for development
                    mkdir -p backend/data/processed
                    echo '{"cities": [], "version": "dev", "buildDate": "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"}'> backend/data/processed/cities.json
                fi
                
                docker-compose -f docker-compose.dev.yml up -d
                
                echo ""
                echo -e "${GREEN}✅ Services started successfully!${NC}"
                echo ""
                echo "🌐 Application URLs:"
                echo "  Frontend: http://localhost:5173"
                echo "  Backend:  http://localhost:3001"
                echo "  Admin:    http://localhost:5173/admin"
                echo ""
                echo "📊 Database URLs:"
                echo "  MongoDB:  mongodb://dev:devpassword@localhost:27017"
                echo "  Redis:    redis://localhost:6379"
                echo ""
                echo -e "${YELLOW}📝 Next steps:${NC}"
                echo "1. Visit http://localhost:5173 to play the game"
                echo "2. Check logs: docker-compose -f docker-compose.dev.yml logs -f"
                echo "3. Stop services: docker-compose -f docker-compose.dev.yml down"
                
                break
            else
                echo -e "${RED}❌ Docker is not available${NC}"
                echo "Please install Docker or choose option 2"
            fi
            ;;
        2)
            echo ""
            echo -e "${BLUE}💻 Setting up for local development...${NC}"
            
            # Check for MongoDB
            echo "Checking for MongoDB..."
            if ! command -v mongod &> /dev/null && ! pgrep -x mongod &> /dev/null; then
                echo -e "${YELLOW}⚠️  MongoDB not found or not running${NC}"
                echo "Please install and start MongoDB:"
                echo "  - macOS: brew install mongodb-community && brew services start mongodb-community"
                echo "  - Ubuntu: sudo apt install mongodb && sudo systemctl start mongodb"
                echo "  - Windows: Download from https://www.mongodb.com/try/download/community"
                echo ""
            fi
            
            # Check for Redis
            echo "Checking for Redis..."
            if ! command -v redis-server &> /dev/null && ! pgrep -x redis-server &> /dev/null; then
                echo -e "${YELLOW}⚠️  Redis not found or not running${NC}"
                echo "Please install and start Redis:"
                echo "  - macOS: brew install redis && brew services start redis"
                echo "  - Ubuntu: sudo apt install redis-server && sudo systemctl start redis"
                echo "  - Windows: Download from https://redis.io/download"
                echo ""
            fi
            
            # Build city database
            echo "Building city database..."
            cd backend
            if [ ! -d "data/processed" ]; then
                mkdir -p data/processed
                echo '{"cities": [], "version": "dev", "buildDate": "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"}' > data/processed/cities.json
                echo -e "${GREEN}✅ Basic city database created${NC}"
            fi
            cd ..
            
            echo ""
            echo -e "${GREEN}✅ Local setup complete!${NC}"
            echo ""
            echo -e "${YELLOW}📝 To start development:${NC}"
            echo ""
            echo "1. Start the backend server:"
            echo "   cd backend && npm run dev"
            echo ""
            echo "2. In a new terminal, start the frontend:"
            echo "   cd frontend && npm run dev"
            echo ""
            echo "3. Visit http://localhost:5173 to play the game"
            echo ""
            echo -e "${BLUE}💡 Tip: Use 'npm run dev' from the root directory to start both services${NC}"
            
            break
            ;;
        *)
            echo "Please enter 1 or 2"
            ;;
    esac
done

echo ""
echo -e "${GREEN}🎉 Setup complete! Happy coding!${NC}"
echo ""
echo -e "${BLUE}📚 Useful resources:${NC}"
echo "  - Documentation: ./docs/game-specs.md"
echo "  - Contributing: ./CONTRIBUTING.md"
echo "  - Issues: https://github.com/YOUR_USERNAME/cities-game/issues"
echo ""