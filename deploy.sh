#!/bin/bash
# Deployment script for Link REIT Membership System
# Deploy to Tencent Cloud Server

set -e

# Configuration - Update these values
SERVER_IP="${SERVER_IP:-}"
SERVER_USER="${SERVER_USER:-root}"
DEPLOY_PATH="/opt/link-reit-membership"
PROJECT_NAME="link-reit-membership"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if server IP is provided
if [ -z "$SERVER_IP" ]; then
    log_error "Server IP not set. Usage: SERVER_IP=xxx.xxx.xxx.xxx ./deploy.sh"
    exit 1
fi

log_info "Starting deployment to $SERVER_USER@$SERVER_IP"

# Step 1: Create deployment package
log_info "Creating deployment package..."
PACKAGE_NAME="deploy-$(date +%Y%m%d-%H%M%S).tar.gz"

tar --exclude='node_modules' \
    --exclude='.git' \
    --exclude='*.log' \
    --exclude='.next' \
    --exclude='dist' \
    --exclude='.turbo' \
    --exclude='coverage' \
    -czvf "/tmp/$PACKAGE_NAME" \
    -C "$(dirname "$0")" .

log_info "Package created: /tmp/$PACKAGE_NAME"

# Step 2: Upload to server
log_info "Uploading package to server..."
scp "/tmp/$PACKAGE_NAME" "$SERVER_USER@$SERVER_IP:/tmp/"

# Step 3: Setup and deploy on server
log_info "Deploying on server..."
ssh "$SERVER_USER@$SERVER_IP" << ENDSSH
set -e

# Create deployment directory
mkdir -p $DEPLOY_PATH
cd $DEPLOY_PATH

# Backup current deployment
if [ -d "current" ]; then
    echo "Backing up current deployment..."
    mv current backup-\$(date +%Y%m%d-%H%M%S) || true
fi

# Extract new deployment
mkdir -p current
cd current
tar -xzf /tmp/$PACKAGE_NAME
rm /tmp/$PACKAGE_NAME

# Install Docker if not present
if ! command -v docker &> /dev/null; then
    echo "Installing Docker..."
    curl -fsSL https://get.docker.com | sh
    systemctl enable docker
    systemctl start docker
fi

# Install Docker Compose if not present
if ! command -v docker-compose &> /dev/null; then
    echo "Installing Docker Compose..."
    curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-\$(uname -s)-\$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
fi

# Configure environment
if [ ! -f apps/backend/.env ]; then
    echo "Creating .env file..."
    cp .env.example apps/backend/.env
    # Generate JWT secret
    JWT_SECRET=\$(openssl rand -base64 32)
    sed -i "s/JWT_SECRET=.*/JWT_SECRET=\$JWT_SECRET/" apps/backend/.env
fi

# Create nginx ssl directory
mkdir -p nginx/ssl

# Stop existing containers
docker-compose down || true

# Build and start
echo "Building Docker images..."
docker-compose build

echo "Starting services..."
docker-compose up -d

# Wait for services to start
echo "Waiting for services to start..."
sleep 10

# Run database migrations
echo "Running database migrations..."
docker exec link-reit-backend npx prisma db push --accept-data-loss || echo "Migration failed, please check manually"

# Show status
docker-compose ps

echo ""
echo "=========================================="
echo "Deployment completed successfully!"
echo "=========================================="
echo ""
echo "Services:"
echo "  - Backend API:       http://\$SERVER_IP:3000"
echo "  - Group Admin:       http://\$SERVER_IP:3001"
echo "  - Mall Admin:        http://\$SERVER_IP:3002"
echo "  - Merchant Portal:   http://\$SERVER_IP:3003"
echo ""
ENDSSH

log_info "Deployment completed!"
log_info ""
log_info "Access your services at:"
log_info "  - Backend API:       http://$SERVER_IP:3000"
log_info "  - Group Admin:       http://$SERVER_IP:3001"
log_info "  - Mall Admin:        http://$SERVER_IP:3002"
log_info "  - Merchant Portal:   http://$SERVER_IP:3003"
