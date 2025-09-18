#!/bin/bash

# Spencer Denim Task Manager - Easy Launch Script

echo "🚀 Starting Spencer Denim Task Manager..."
echo "==============================================="

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Check if data directory exists
if [ ! -d "./data" ]; then
    echo "📁 Creating data directory..."
    mkdir -p ./data
fi

# Check if SQLite databases exist, if not create them
if [ ! -f "./data/dynamic-tables.db" ]; then
    echo "🗄️  Initializing main SQLite database..."
    touch ./data/dynamic-tables.db
fi

if [ ! -f "./prisma/sqlite-database.db" ]; then
    echo "🔐 Initializing auth SQLite database..."
    touch ./prisma/sqlite-database.db
fi

# Build and start the application
echo "🔨 Building and starting application..."
docker-compose up --build -d

# Wait for the application to be ready
echo "⏳ Waiting for application to start..."
sleep 10

# Check if the application is running
if curl -f http://localhost:3000 > /dev/null 2>&1; then
    echo "✅ Application is running successfully!"
    echo ""
    echo "🌐 Access your application at: http://localhost:3000"
    echo "🔑 Default login credentials:"
    echo "   Email: admin@spencer.com"
    echo "   Password: admin123"
    echo ""
    echo "📋 Useful commands:"
    echo "   Stop application: docker-compose down"
    echo "   View logs: docker-compose logs -f"
    echo "   Restart: docker-compose restart"
else
    echo "⚠️  Application might still be starting. Please check in a moment."
    echo "🌐 Try accessing: http://localhost:3000"
fi

echo ""
echo "==============================================="