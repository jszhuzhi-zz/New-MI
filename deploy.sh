#!/bin/bash
# ============================================
# Link REIT Membership System - Docker Deploy
# ============================================
# Usage:
#   Local build & run:    ./deploy.sh local
#   Remote server deploy: SERVER_IP=x.x.x.x ./deploy.sh remote
#   Build images only:    ./deploy.sh build
#   Stop all services:    ./deploy.sh stop
#   View logs:            ./deploy.sh logs [service]
#   View status:          ./deploy.sh status

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_NAME="link-reit-membership"
DEPLOY_PATH="/opt/$PROJECT_NAME"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

log_info()  { echo -e "${GREEN}[INFO]${NC}  $1"; }
log_warn()  { echo -e "${YELLOW}[WARN]${NC}  $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }
log_step()  { echo -e "${CYAN}[STEP]${NC}  $1"; }

print_urls() {
    local ip="${1:-localhost}"
    echo ""
    echo -e "${GREEN}=========================================${NC}"
    echo -e "${GREEN}  Deployment Successful!${NC}"
    echo -e "${GREEN}=========================================${NC}"
    echo ""
    echo -e "  Landing Page:      ${CYAN}http://$ip/${NC}"
    echo -e "  Customer H5:       ${CYAN}http://$ip/customer/${NC}"
    echo -e "  Merchant Portal:   ${CYAN}http://$ip/merchant/${NC}"
    echo -e "  Mall Admin:        ${CYAN}http://$ip/mall/${NC}"
    echo -e "  Group Admin:       ${CYAN}http://$ip/group/${NC}"
    echo -e "  API Docs:          ${CYAN}http://$ip/api/docs${NC}"
    echo -e "  Backend API:       ${CYAN}http://$ip/api/${NC}"
    echo ""
}

# ============================================
# Command: build
# ============================================
cmd_build() {
    log_step "Building all Docker images..."
    cd "$SCRIPT_DIR"
    docker compose build
    log_info "All images built successfully."
}

# ============================================
# Command: local (build & run locally)
# ============================================
cmd_local() {
    cd "$SCRIPT_DIR"

    # Create ssl dir if missing
    mkdir -p nginx/ssl

    # Create .env if missing
    if [ ! -f .env ]; then
        log_info "Creating .env file..."
        cat > .env << 'ENVEOF'
DB_PASSWORD=postgres
JWT_SECRET=local-dev-jwt-secret-change-in-production
ENVEOF
    fi

    log_step "Building and starting all services..."
    docker compose up -d --build

    log_step "Waiting for services to initialize..."
    sleep 10

    # Database migration
    log_step "Running database migrations..."
    docker exec link-reit-backend npx prisma db push --accept-data-loss 2>/dev/null || log_warn "Migration skipped or failed, check manually"

    docker compose ps
    print_urls "localhost"
}

# ============================================
# Command: stop
# ============================================
cmd_stop() {
    cd "$SCRIPT_DIR"
    log_step "Stopping all services..."
    docker compose down
    log_info "All services stopped."
}

# ============================================
# Command: logs
# ============================================
cmd_logs() {
    cd "$SCRIPT_DIR"
    local service="${1:-}"
    if [ -n "$service" ]; then
        docker compose logs -f "$service"
    else
        docker compose logs -f
    fi
}

# ============================================
# Command: status
# ============================================
cmd_status() {
    cd "$SCRIPT_DIR"
    docker compose ps
}

# ============================================
# Command: remote (deploy to remote server)
# ============================================
cmd_remote() {
    local SERVER_IP="${SERVER_IP:-}"
    local SERVER_USER="${SERVER_USER:-root}"

    if [ -z "$SERVER_IP" ]; then
        log_error "SERVER_IP not set."
        echo "Usage: SERVER_IP=x.x.x.x ./deploy.sh remote"
        exit 1
    fi

    log_info "Deploying to $SERVER_USER@$SERVER_IP ..."

    # 1. Create package
    log_step "Creating deployment package..."
    PACKAGE_NAME="deploy-$(date +%Y%m%d-%H%M%S).tar.gz"

    tar --exclude='node_modules' \
        --exclude='.git' \
        --exclude='*.log' \
        --exclude='.next' \
        --exclude='dist' \
        --exclude='.turbo' \
        --exclude='coverage' \
        --exclude='screenshots' \
        -czf "/tmp/$PACKAGE_NAME" \
        -C "$SCRIPT_DIR" .

    log_info "Package: /tmp/$PACKAGE_NAME ($(du -h /tmp/$PACKAGE_NAME | cut -f1))"

    # 2. Upload
    log_step "Uploading to server..."
    scp "/tmp/$PACKAGE_NAME" "$SERVER_USER@$SERVER_IP:/tmp/"

    # 3. Deploy on server
    log_step "Deploying on server..."
    ssh "$SERVER_USER@$SERVER_IP" << ENDSSH
set -e

# Create deploy directory
mkdir -p $DEPLOY_PATH
cd $DEPLOY_PATH

# Backup current deployment
if [ -d "current" ]; then
    echo "[INFO] Backing up current deployment..."
    BACKUP_NAME="backup-\$(date +%Y%m%d-%H%M%S)"
    mv current "\$BACKUP_NAME"
    # Keep only last 3 backups
    ls -dt backup-* 2>/dev/null | tail -n +4 | xargs rm -rf 2>/dev/null || true
fi

# Extract
mkdir -p current && cd current
tar -xzf /tmp/$PACKAGE_NAME
rm -f /tmp/$PACKAGE_NAME

# Install Docker if not present
if ! command -v docker &> /dev/null; then
    echo "[INFO] Installing Docker..."
    curl -fsSL https://get.docker.com | sh
    systemctl enable docker && systemctl start docker
fi

# Ensure docker compose is available
if ! docker compose version &> /dev/null; then
    echo "[INFO] Installing Docker Compose plugin..."
    mkdir -p /usr/local/lib/docker/cli-plugins
    curl -SL "https://github.com/docker/compose/releases/latest/download/docker-compose-\$(uname -s)-\$(uname -m)" -o /usr/local/lib/docker/cli-plugins/docker-compose
    chmod +x /usr/local/lib/docker/cli-plugins/docker-compose
fi

# Create .env
if [ ! -f .env ]; then
    echo "[INFO] Creating .env..."
    JWT_SECRET=\$(openssl rand -base64 32)
    cat > .env << INNEREOF
DB_PASSWORD=\$(openssl rand -base64 16 | tr -dc 'a-zA-Z0-9' | head -c 20)
JWT_SECRET=\$JWT_SECRET
INNEREOF
fi

# Create ssl dir
mkdir -p nginx/ssl

# Stop old containers
docker compose down 2>/dev/null || true

# Build & start
echo "[INFO] Building Docker images (this may take a while)..."
docker compose build

echo "[INFO] Starting services..."
docker compose up -d

echo "[INFO] Waiting for services to start..."
sleep 12

# Database migration
echo "[INFO] Running database migrations..."
docker exec link-reit-backend npx prisma db push --accept-data-loss || echo "[WARN] Migration check needed"

# Show status
docker compose ps

echo ""
echo "=========================================="
echo "  Deployment Completed!"
echo "=========================================="
echo ""
echo "  Landing Page:      http://$SERVER_IP/"
echo "  Customer H5:       http://$SERVER_IP/customer/"
echo "  Merchant Portal:   http://$SERVER_IP/merchant/"
echo "  Mall Admin:        http://$SERVER_IP/mall/"
echo "  Group Admin:       http://$SERVER_IP/group/"
echo "  API Docs:          http://$SERVER_IP/api/docs"
echo ""
ENDSSH

    # Cleanup local package
    rm -f "/tmp/$PACKAGE_NAME"

    print_urls "$SERVER_IP"
}

# ============================================
# Main entry
# ============================================
case "${1:-local}" in
    build)   cmd_build ;;
    local)   cmd_local ;;
    stop)    cmd_stop ;;
    logs)    cmd_logs "$2" ;;
    status)  cmd_status ;;
    remote)  cmd_remote ;;
    *)
        echo "Usage: $0 {local|remote|build|stop|logs|status}"
        echo ""
        echo "Commands:"
        echo "  local         Build & run locally (default)"
        echo "  remote        Deploy to remote server (requires SERVER_IP)"
        echo "  build         Build Docker images only"
        echo "  stop          Stop all services"
        echo "  logs [svc]    View logs (optionally for a specific service)"
        echo "  status        Show service status"
        exit 1
        ;;
esac
