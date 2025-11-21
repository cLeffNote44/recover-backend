#!/bin/bash

# Database Setup Script for Recover Backend
# This script creates the PostgreSQL database and runs migrations

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  Recover Backend - Database Setup${NC}"
echo -e "${GREEN}========================================${NC}"

# Default values
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_NAME="${DB_NAME:-recover_db}"
DB_USER="${DB_USER:-recover_admin}"
DB_PASS="${DB_PASS:-RecoverSecure123!}"

echo ""
echo -e "${YELLOW}Configuration:${NC}"
echo "  Host: $DB_HOST"
echo "  Port: $DB_PORT"
echo "  Database: $DB_NAME"
echo "  User: $DB_USER"
echo ""

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo -e "${RED}Error: PostgreSQL is not installed.${NC}"
    echo ""
    echo "Install PostgreSQL:"
    echo "  macOS:   brew install postgresql@15"
    echo "  Ubuntu:  sudo apt install postgresql postgresql-contrib"
    echo "  Windows: Download from https://www.postgresql.org/download/windows/"
    exit 1
fi

# Check if PostgreSQL is running
if ! pg_isready -h $DB_HOST -p $DB_PORT > /dev/null 2>&1; then
    echo -e "${RED}Error: PostgreSQL is not running.${NC}"
    echo ""
    echo "Start PostgreSQL:"
    echo "  macOS:   brew services start postgresql@15"
    echo "  Ubuntu:  sudo systemctl start postgresql"
    echo "  Windows: Start PostgreSQL service from Services"
    exit 1
fi

echo -e "${GREEN}PostgreSQL is running${NC}"

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DB_DIR="$SCRIPT_DIR/../database"

# Create user and database
echo ""
echo -e "${YELLOW}Creating database user and database...${NC}"

# Try to create the user (ignore if exists)
psql -h $DB_HOST -p $DB_PORT -U postgres -c "CREATE USER $DB_USER WITH PASSWORD '$DB_PASS';" 2>/dev/null || true

# Try to create the database (ignore if exists)
psql -h $DB_HOST -p $DB_PORT -U postgres -c "CREATE DATABASE $DB_NAME OWNER $DB_USER;" 2>/dev/null || true

# Grant privileges
psql -h $DB_HOST -p $DB_PORT -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;" 2>/dev/null || true

echo -e "${GREEN}Database '$DB_NAME' ready${NC}"

# Run schema
echo ""
echo -e "${YELLOW}Running schema migrations...${NC}"
PGPASSWORD=$DB_PASS psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f "$DB_DIR/schema.sql"
echo -e "${GREEN}Schema created${NC}"

# Run seed data
echo ""
echo -e "${YELLOW}Seeding initial data...${NC}"
PGPASSWORD=$DB_PASS psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f "$DB_DIR/seed.sql"
echo -e "${GREEN}Seed data inserted${NC}"

# Create .env file if it doesn't exist
ENV_FILE="$SCRIPT_DIR/../api/.env"
if [ ! -f "$ENV_FILE" ]; then
    echo ""
    echo -e "${YELLOW}Creating .env file...${NC}"
    cat > "$ENV_FILE" << EOF
# Database
DATABASE_URL=postgresql://$DB_USER:$DB_PASS@$DB_HOST:$DB_PORT/$DB_NAME

# JWT
JWT_SECRET=$(openssl rand -base64 32)
JWT_REFRESH_SECRET=$(openssl rand -base64 32)

# Server
PORT=3000
NODE_ENV=development
EOF
    echo -e "${GREEN}.env file created${NC}"
fi

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  Setup Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "Default login credentials:"
echo "  Admin: admin@recoversystem.com / SuperAdmin123!"
echo "  Counselor: dr.martinez@hoperecovery.com / Counselor123!"
echo ""
echo "To start the API server:"
echo "  cd backend/api && npm install && npm run dev"
echo ""
