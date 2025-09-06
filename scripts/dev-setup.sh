#!/bin/bash
# Spencer Denim Task Manager - Development Setup Script

echo "🚀 Starting Spencer Denim Task Manager Development Environment..."

# Copy environment file
if [ ! -f .env ]; then
    echo "📋 Copying development environment variables..."
    cp .env.docker .env
fi

# Build and start services
echo "🔨 Building and starting Docker services..."
docker-compose up --build -d

# Wait for database to be ready
echo "⏳ Waiting for database to be ready..."
sleep 10

# Run database migrations
echo "🗄️ Running database migrations..."
docker-compose exec app npx prisma migrate dev --name init

# Seed the database
echo "🌱 Seeding database with initial data..."
docker-compose exec app npm run db:seed

echo "✅ Development environment is ready!"
echo ""
echo "🌐 Application: http://localhost:3000"
echo "🗄️ pgAdmin: http://localhost:5050"
echo "   - Email: admin@spencerdenim.com"
echo "   - Password: admin123"
echo ""
echo "📊 Database Connection:"
echo "   - Host: localhost"
echo "   - Port: 5432"
echo "   - Database: spencer_denim_db"
echo "   - User: spencer_user"
echo "   - Password: spencer_password_2024"
echo ""
echo "To stop the environment: npm run docker:stop"
echo "To view logs: npm run docker:logs"
