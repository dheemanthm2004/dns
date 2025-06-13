#!/bin/bash

echo "🚀 DheeNotifications - Enterprise Setup Script"
echo "=============================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    print_error "Node.js version 18+ required. Current version: $(node -v)"
    exit 1
fi

print_status "Node.js $(node -v) detected"

# Check if PostgreSQL is running
if ! command -v psql &> /dev/null; then
    print_warning "PostgreSQL not found. Please install PostgreSQL first."
else
    print_status "PostgreSQL detected"
fi

# Check if Redis is running
if ! command -v redis-cli &> /dev/null; then
    print_warning "Redis not found. Please install Redis first."
else
    if redis-cli ping &> /dev/null; then
        print_status "Redis is running"
    else
        print_warning "Redis is installed but not running. Please start Redis."
    fi
fi

echo ""
print_info "Installing backend dependencies..."
cd backend
if npm install; then
    print_status "Backend dependencies installed"
else
    print_error "Failed to install backend dependencies"
    exit 1
fi

echo ""
print_info "Installing frontend dependencies..."
cd ../frontend
if npm install; then
    print_status "Frontend dependencies installed"
else
    print_error "Failed to install frontend dependencies"
    exit 1
fi

echo ""
print_info "Setting up environment files..."

# Create backend .env if it doesn't exist
cd ../backend
if [ ! -f .env ]; then
    if [ -f .env.example ]; then
        cp .env.example .env
        print_status "Created backend/.env from example"
        print_warning "Please edit backend/.env with your credentials"
    else
        print_warning "No .env.example found in backend"
    fi
else
    print_status "Backend .env already exists"
fi

# Create frontend .env.local if it doesn't exist
cd ../frontend
if [ ! -f .env.local ]; then
    if [ -f .env.example ]; then
        cp .env.example .env.local
        print_status "Created frontend/.env.local from example"
    else
        echo "NEXT_PUBLIC_API_BASE_URL=http://localhost:4000/api" > .env.local
        print_status "Created frontend/.env.local"
    fi
else
    print_status "Frontend .env.local already exists"
fi

echo ""
print_info "Setting up database..."
cd ../backend

# Generate Prisma client
if npx prisma generate; then
    print_status "Prisma client generated"
else
    print_warning "Failed to generate Prisma client. Please check your database connection."
fi

# Run database migrations
if npx prisma migrate dev --name "initial_setup" --skip-generate; then
    print_status "Database migrations completed"
else
    print_warning "Database migrations failed. Please check your PostgreSQL connection and .env file."
fi

echo ""
echo "🎉 Setup completed!"
echo ""
echo "📋 Next Steps:"
echo "1. Edit backend/.env with your credentials (Gmail, Twilio, etc.)"
echo "2. Make sure PostgreSQL and Redis are running"
echo "3. Run the application:"
echo ""
echo "   Terminal 1 (Backend):"
echo "   cd backend && npm run dev"
echo ""
echo "   Terminal 2 (Worker):"
echo "   cd backend && npm run worker"
echo ""
echo "   Terminal 3 (Frontend):"
echo "   cd frontend && npm run dev"
echo ""
echo "4. Open http://localhost:3000 in your browser"
echo ""
echo "📚 For detailed setup instructions, see LOCAL_SETUP_GUIDE.md"
echo ""
print_status "Your enterprise notification platform is ready! 🚀"