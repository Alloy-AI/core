#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Starting Alloy Service Setup...${NC}"

# 1. Check for .env file
if [ ! -f .env ]; then
    echo -e "${RED}❌ Error: .env file not found!${NC}"
    echo "Please create .env with the following variables:"
    echo "PG_URI=postgres://user:password@localhost:5432/alloy"
    echo "GROQ_API_KEY=..."
    echo "GEMINI_API_KEY=..."
    echo "EVM_PRIVATE_KEY_SYNAPSE=0x..."
    echo "ALCHEMY_API_KEY=..."
    exit 1
fi

# Load env vars
export $(grep -v '^#' .env | xargs)

# 1.5 Install Dependencies
echo -e "${GREEN}📦 Installing dependencies...${NC}"
bun install
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Dependency installation failed!${NC}"
    exit 1
fi

# 2. Check DB Connection
DB_NAME=$(echo $PG_URI | sed -n 's/.*\/\([^?]*\).*/\1/p')

if command -v psql >/dev/null 2>&1; then
    if ! psql "$PG_URI" -c '\q' 2>/dev/null; then
        echo -e "${YELLOW}⚠️  Database connection failed. Attempting to create database '$DB_NAME'...${NC}"
        createdb $DB_NAME 2>/dev/null
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✅ Database '$DB_NAME' created.${NC}"
        else
            echo -e "${RED}❌ Could not create database. Ensure Postgres is running and your user has permissions.${NC}"
        fi
    else
        echo -e "${GREEN}✅ Database connection established.${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  psql not found, skipping DB check.${NC}"
fi

# 3. Run Migrations
echo -e "${GREEN}🔄 Running database migrations...${NC}"
bun run db:migrate
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Migration failed!${NC}"
    exit 1
fi

# 4. Start the Server
echo -e "${GREEN}✨ Starting server on port ${PORT:-3000}...${NC}"
bun run index.ts
