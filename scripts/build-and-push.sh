#!/bin/bash

# Cities Game - Build and Push Docker Images Script
# This script builds Docker images and pushes them to GitHub Container Registry

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
REGISTRY="ghcr.io"
REPO_OWNER="${GITHUB_REPOSITORY_OWNER:-YOUR_USERNAME}"
REPO_NAME="cities-game"
TAG="${1:-latest}"

echo -e "${GREEN}🏗️  Building and pushing Cities Game Docker images${NC}"
echo "Registry: $REGISTRY"
echo "Repository: $REPO_OWNER/$REPO_NAME"
echo "Tag: $TAG"
echo ""

# Check if logged in to registry
echo -e "${YELLOW}🔐 Checking registry login...${NC}"
if ! docker info | grep -q "Username"; then
    echo -e "${RED}❌ Not logged in to Docker registry${NC}"
    echo "Please run: docker login $REGISTRY"
    exit 1
fi

# Build Backend Image
echo -e "${YELLOW}🔨 Building backend image...${NC}"
cd backend
docker build -t $REGISTRY/$REPO_OWNER/$REPO_NAME/backend:$TAG .
cd ..

# Build Frontend Image
echo -e "${YELLOW}🔨 Building frontend image...${NC}"
cd frontend
docker build -t $REGISTRY/$REPO_OWNER/$REPO_NAME/frontend:$TAG .
cd ..

# Push Backend Image
echo -e "${YELLOW}📤 Pushing backend image...${NC}"
docker push $REGISTRY/$REPO_OWNER/$REPO_NAME/backend:$TAG

# Push Frontend Image  
echo -e "${YELLOW}📤 Pushing frontend image...${NC}"
docker push $REGISTRY/$REPO_OWNER/$REPO_NAME/frontend:$TAG

# Tag as latest if not already
if [ "$TAG" != "latest" ]; then
    echo -e "${YELLOW}🏷️  Tagging as latest...${NC}"
    docker tag $REGISTRY/$REPO_OWNER/$REPO_NAME/backend:$TAG $REGISTRY/$REPO_OWNER/$REPO_NAME/backend:latest
    docker tag $REGISTRY/$REPO_OWNER/$REPO_NAME/frontend:$TAG $REGISTRY/$REPO_OWNER/$REPO_NAME/frontend:latest
    
    docker push $REGISTRY/$REPO_OWNER/$REPO_NAME/backend:latest
    docker push $REGISTRY/$REPO_OWNER/$REPO_NAME/frontend:latest
fi

echo ""
echo -e "${GREEN}✅ Successfully built and pushed all images!${NC}"
echo ""
echo "Images available at:"
echo "  Backend:  $REGISTRY/$REPO_OWNER/$REPO_NAME/backend:$TAG"
echo "  Frontend: $REGISTRY/$REPO_OWNER/$REPO_NAME/frontend:$TAG"
echo ""
echo -e "${YELLOW}💡 To deploy, update your docker-compose.yml or Azure Container Apps configuration${NC}"