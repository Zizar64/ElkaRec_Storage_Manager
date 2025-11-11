#!/bin/bash

###############################################################################
# ElkaRec Storage Manager - Production Deployment Script
# This script automates the deployment process on a Proxmox server
###############################################################################

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Script configuration
PROJECT_NAME="elkarec-storage-manager"
DEPLOY_DIR="/opt/${PROJECT_NAME}"
BACKUP_DIR="/opt/backups/${PROJECT_NAME}"

###############################################################################
# Helper Functions
###############################################################################

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root
check_root() {
    if [ "$EUID" -ne 0 ]; then
        log_error "This script must be run as root"
        exit 1
    fi
}

# Check if Docker is installed
check_docker() {
    if ! command -v docker &> /dev/null; then
        log_error "Docker is not installed. Please install Docker first."
        exit 1
    fi

    if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
        log_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi

    log_success "Docker and Docker Compose are installed"
}

# Check if .env.production exists
check_env_file() {
    if [ ! -f ".env.production" ]; then
        log_error ".env.production file not found!"
        log_info "Please copy .env.production.example to .env.production and configure it"
        exit 1
    fi
    log_success ".env.production file found"
}

# Create backup
create_backup() {
    if [ -d "$DEPLOY_DIR" ]; then
        log_info "Creating backup..."
        mkdir -p "$BACKUP_DIR"
        TIMESTAMP=$(date +%Y%m%d_%H%M%S)
        BACKUP_FILE="${BACKUP_DIR}/backup_${TIMESTAMP}.tar.gz"

        # Backup database
        if docker ps | grep -q "elkarec-db-prod"; then
            log_info "Backing up database..."
            docker exec elkarec-db-prod mysqldump -u root -p"${MYSQL_ROOT_PASSWORD}" --all-databases > "${BACKUP_DIR}/db_backup_${TIMESTAMP}.sql" || true
        fi

        # Backup application files
        tar -czf "$BACKUP_FILE" -C "$(dirname $DEPLOY_DIR)" "$(basename $DEPLOY_DIR)" 2>/dev/null || true
        log_success "Backup created at $BACKUP_FILE"
    fi
}

# Pull latest code
pull_latest_code() {
    log_info "Pulling latest code from Git..."
    if [ -d "$DEPLOY_DIR/.git" ]; then
        cd "$DEPLOY_DIR"
        git pull origin main || git pull origin master
    else
        log_warning "Not a git repository. Skipping git pull."
    fi
}

# Build and start containers
deploy_containers() {
    log_info "Building and starting Docker containers..."
    cd "$DEPLOY_DIR"

    # Stop existing containers
    docker-compose -f docker-compose.prod.yml --env-file .env.production down || true

    # Build new images
    docker-compose -f docker-compose.prod.yml --env-file .env.production build --no-cache

    # Start containers
    docker-compose -f docker-compose.prod.yml --env-file .env.production up -d

    log_success "Containers deployed successfully"
}

# Wait for services to be healthy
wait_for_services() {
    log_info "Waiting for services to be healthy..."

    # Wait for database
    log_info "Waiting for database..."
    for i in {1..30}; do
        if docker exec elkarec-db-prod mysqladmin ping -h localhost -u root -p"${MYSQL_ROOT_PASSWORD}" &> /dev/null; then
            log_success "Database is ready"
            break
        fi
        if [ $i -eq 30 ]; then
            log_error "Database failed to start"
            exit 1
        fi
        sleep 2
    done

    # Wait for backend
    log_info "Waiting for backend..."
    sleep 10

    # Wait for frontend
    log_info "Waiting for frontend..."
    sleep 5

    # Wait for nginx
    log_info "Waiting for nginx..."
    sleep 3

    log_success "All services are healthy"
}

# Run database migrations
run_migrations() {
    log_info "Running database migrations..."
    docker exec elkarec-backend-prod npx prisma migrate deploy
    log_success "Migrations completed"
}

# Create initial admin user (if needed)
create_admin_user() {
    log_info "Checking for admin user..."

    # This is optional - you can create an admin user via the API after deployment
    log_info "To create an admin user, run the following command after deployment:"
    echo ""
    echo "curl -X POST http://localhost/api/auth/register -H \"Content-Type: application/json\" -d '{\"email\":\"admin@elkarec.com\",\"password\":\"YourStrongPassword\",\"firstName\":\"Admin\",\"lastName\":\"ElkaRec\"}'"
    echo ""
}

# Show deployment status
show_status() {
    log_info "Deployment Status:"
    echo ""
    docker-compose -f docker-compose.prod.yml --env-file .env.production ps
    echo ""
    log_info "Access the application at: http://$(hostname -I | awk '{print $1}')"
}

# Cleanup old Docker images
cleanup() {
    log_info "Cleaning up old Docker images..."
    docker image prune -f
    log_success "Cleanup completed"
}

###############################################################################
# Main Deployment Flow
###############################################################################

main() {
    log_info "Starting deployment of ${PROJECT_NAME}..."
    echo ""

    # Pre-deployment checks
    check_root
    check_docker

    # Load environment variables
    if [ -f ".env.production" ]; then
        export $(cat .env.production | grep -v '^#' | xargs)
    fi

    check_env_file

    # Deployment steps
    create_backup
    # pull_latest_code  # Uncomment if deploying from git
    deploy_containers
    wait_for_services
    run_migrations
    create_admin_user
    cleanup

    echo ""
    log_success "Deployment completed successfully!"
    echo ""
    show_status
}

# Handle script arguments
case "${1:-}" in
    "backup")
        create_backup
        ;;
    "status")
        show_status
        ;;
    "logs")
        docker-compose -f docker-compose.prod.yml --env-file .env.production logs -f
        ;;
    "stop")
        docker-compose -f docker-compose.prod.yml --env-file .env.production down
        ;;
    "restart")
        docker-compose -f docker-compose.prod.yml --env-file .env.production restart
        ;;
    *)
        main
        ;;
esac
