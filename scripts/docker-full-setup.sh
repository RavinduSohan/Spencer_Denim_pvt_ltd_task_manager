#!/bin/bash
# Spencer Denim Task Manager - Complete Docker Setup Script

echo "🚀 Spencer Denim Task Manager - Docker Setup"
echo "=============================================="

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker Desktop first."
    exit 1
fi

echo "✅ Docker is running"

# Stop any existing containers
echo "🛑 Stopping existing containers..."
docker-compose down -v

# Clean up old images (optional)
read -p "🧹 Do you want to clean up old Docker images? (y/N): " cleanup
if [[ $cleanup =~ ^[Yy]$ ]]; then
    echo "🧹 Cleaning up Docker system..."
    docker system prune -f
fi

# Build and start services
echo "🏗️  Building and starting services..."
docker-compose up --build -d

# Wait for services to be healthy
echo "⏳ Waiting for services to be ready..."
sleep 30

# Check service status
echo "📊 Service Status:"
docker-compose ps

# Run database migrations
echo "🗄️  Running database migrations..."
docker-compose exec app npx prisma migrate dev --name init

# Seed database
echo "🌱 Seeding database..."
docker-compose exec app npx prisma db seed

echo ""
echo "🎉 Setup Complete!"
echo "==================="
echo "🌐 Application: http://localhost:3000"
echo "🗄️  Database (PgAdmin): http://localhost:5050"
echo "   📧 Email: admin@spencer-denim.com"
echo "   🔑 Password: admin123"
echo "📊 Redis: localhost:6379"
echo ""
echo "📝 Useful Commands:"
echo "   docker-compose logs -f app    # View app logs"
echo "   docker-compose logs -f postgres # View DB logs"
echo "   docker-compose down          # Stop all services"
echo "   docker-compose up -d         # Start all services"
echo ""
