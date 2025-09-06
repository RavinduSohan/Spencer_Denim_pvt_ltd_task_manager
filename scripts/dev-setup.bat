@echo off
REM Spencer Denim Task Manager - Windows Development Setup Script

echo 🚀 Starting Spencer Denim Task Manager Development Environment...

REM Copy environment file
if not exist .env (
    echo 📋 Copying development environment variables...
    copy .env.docker .env
)

REM Build and start services
echo 🔨 Building and starting Docker services...
docker-compose up --build -d

REM Wait for database to be ready
echo ⏳ Waiting for database to be ready...
timeout /t 10 /nobreak

REM Run database migrations
echo 🗄️ Running database migrations...
docker-compose exec app npx prisma migrate dev --name init

REM Seed the database
echo 🌱 Seeding database with initial data...
docker-compose exec app npm run db:seed

echo ✅ Development environment is ready!
echo.
echo 🌐 Application: http://localhost:3000
echo 🗄️ pgAdmin: http://localhost:5050
echo    - Email: admin@spencerdenim.com
echo    - Password: admin123
echo.
echo 📊 Database Connection:
echo    - Host: localhost
echo    - Port: 5432
echo    - Database: spencer_denim_db
echo    - User: spencer_user
echo    - Password: spencer_password_2024
echo.
echo To stop the environment: npm run docker:stop
echo To view logs: npm run docker:logs

pause
