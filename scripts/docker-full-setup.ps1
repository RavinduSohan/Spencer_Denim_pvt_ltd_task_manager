# Spencer Denim Task Manager - Complete Docker Setup Script (Windows)

Write-Host "🚀 Spencer Denim Task Manager - Docker Setup" -ForegroundColor Green
Write-Host "==============================================" -ForegroundColor Green

# Check if Docker is running
try {
    docker info | Out-Null
    Write-Host "✅ Docker is running" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker is not running. Please start Docker Desktop first." -ForegroundColor Red
    exit 1
}

# Stop any existing containers
Write-Host "🛑 Stopping existing containers..." -ForegroundColor Yellow
docker-compose down -v

# Ask for cleanup
$cleanup = Read-Host "🧹 Do you want to clean up old Docker images? (y/N)"
if ($cleanup -eq "y" -or $cleanup -eq "Y") {
    Write-Host "🧹 Cleaning up Docker system..." -ForegroundColor Yellow
    docker system prune -f
}

# Build and start services
Write-Host "🏗️  Building and starting services..." -ForegroundColor Blue
docker-compose up --build -d

# Wait for services to be healthy
Write-Host "⏳ Waiting for services to be ready..." -ForegroundColor Yellow
Start-Sleep 30

# Check service status
Write-Host "📊 Service Status:" -ForegroundColor Cyan
docker-compose ps

# Run database migrations
Write-Host "🗄️  Running database migrations..." -ForegroundColor Magenta
docker-compose exec app npx prisma migrate dev --name init

# Seed database
Write-Host "🌱 Seeding database..." -ForegroundColor Green
docker-compose exec app npx prisma db seed

Write-Host ""
Write-Host "🎉 Setup Complete!" -ForegroundColor Green
Write-Host "===================" -ForegroundColor Green
Write-Host "🌐 Application: http://localhost:3000" -ForegroundColor Cyan
Write-Host "🗄️  Database (PgAdmin): http://localhost:5050" -ForegroundColor Cyan
Write-Host "   📧 Email: admin@spencer-denim.com" -ForegroundColor Gray
Write-Host "   🔑 Password: admin123" -ForegroundColor Gray
Write-Host "📊 Redis: localhost:6379" -ForegroundColor Cyan
Write-Host ""
Write-Host "📝 Useful Commands:" -ForegroundColor Yellow
Write-Host "   docker-compose logs -f app       # View app logs" -ForegroundColor Gray
Write-Host "   docker-compose logs -f postgres  # View DB logs" -ForegroundColor Gray
Write-Host "   docker-compose down             # Stop all services" -ForegroundColor Gray
Write-Host "   docker-compose up -d            # Start all services" -ForegroundColor Gray
Write-Host ""
