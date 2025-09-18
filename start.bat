@echo off
REM Spencer Denim Task Manager - Easy Launch Script (Windows)

echo 🚀 Starting Spencer Denim Task Manager...
echo ===============================================

REM Check if Docker is running
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker is not running. Please start Docker first.
    pause
    exit /b 1
)

REM Check if data directory exists
if not exist ".\data" (
    echo 📁 Creating data directory...
    mkdir ".\data"
)

REM Check if SQLite databases exist, if not create them
if not exist ".\data\dynamic-tables.db" (
    echo 🗄️  Initializing main SQLite database...
    type nul > ".\data\dynamic-tables.db"
)

if not exist ".\prisma\sqlite-database.db" (
    echo 🔐 Initializing auth SQLite database...
    type nul > ".\prisma\sqlite-database.db"
)

REM Build and start the application
echo 🔨 Building and starting application...
docker-compose up --build -d

REM Wait for the application to be ready
echo ⏳ Waiting for application to start...
timeout /t 15 /nobreak >nul

REM Check if the application is running
curl -f http://localhost:3000 >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Application is running successfully!
    echo.
    echo 🌐 Access your application at: http://localhost:3000
    echo 🔑 Default login credentials:
    echo    Email: admin@spencer.com
    echo    Password: admin123
    echo.
    echo 📋 Useful commands:
    echo    Stop application: docker-compose down
    echo    View logs: docker-compose logs -f
    echo    Restart: docker-compose restart
) else (
    echo ⚠️  Application might still be starting. Please check in a moment.
    echo 🌐 Try accessing: http://localhost:3000
)

echo.
echo ===============================================
echo Press any key to continue...
pause >nul