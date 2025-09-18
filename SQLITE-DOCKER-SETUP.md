# Spencer Denim Task Manager - SQLite Docker Setup

This guide helps you set up the Spencer Denim Task Manager using SQLite instead of PostgreSQL, eliminating the need for remote database connections.

## 🚀 Quick Start

### Option 1: Automated Setup (Recommended)

**Windows:**
```powershell
.\docker-sqlite-setup.bat
```

**Linux/Mac:**
```bash
chmod +x docker-sqlite-setup.sh
./docker-sqlite-setup.sh
```

### Option 2: Manual Setup

1. **Copy SQLite environment file:**
   ```bash
   cp .env.sqlite .env
   ```

2. **Build and start services:**
   ```bash
   docker-compose -f docker-compose.sqlite.yml up --build -d
   ```

3. **Check if services are running:**
   ```bash
   docker-compose -f docker-compose.sqlite.yml ps
   ```

## 📋 Available Services

- **Application:** http://localhost:3000
- **Redis:** localhost:6379
- **SQLite Database:** `./data/spencer.db`

## 🛠️ NPM Scripts

### SQLite Database Commands
```bash
# Generate Prisma client for SQLite
npm run db:sqlite:generate

# Push schema to SQLite database
npm run db:sqlite:push

# Seed SQLite database with sample data
npm run db:sqlite:seed

# Open Prisma Studio for SQLite
npm run db:sqlite:studio

# Migrate from PostgreSQL to SQLite
npm run db:sqlite:migrate
```

### Docker Commands
```bash
# Start SQLite services
npm run docker:sqlite

# Stop SQLite services
npm run docker:sqlite:stop

# View logs
npm run docker:sqlite:logs

# Clean up (remove containers and volumes)
npm run docker:sqlite:clean

# Automated setup
npm run docker:sqlite:setup
```

## 🔄 Migration from PostgreSQL

If you have existing data in PostgreSQL and want to migrate to SQLite:

1. **Ensure your PostgreSQL is accessible and set the connection:**
   ```bash
   export POSTGRES_DATABASE_URL="your_postgres_connection_string"
   ```

2. **Run the migration:**
   ```bash
   npm run db:sqlite:migrate
   ```

3. **Start SQLite services:**
   ```bash
   npm run docker:sqlite
   ```

## 📁 File Structure

```
├── docker-compose.sqlite.yml     # SQLite Docker Compose
├── Dockerfile.sqlite             # SQLite Dockerfile
├── .env.sqlite                   # SQLite environment variables
├── prisma/
│   └── schema.sqlite.prisma      # SQLite Prisma schema
├── scripts/
│   └── migrate-to-sqlite.ts      # Migration script
├── data/                         # SQLite database storage
│   └── spencer.db               # SQLite database file
└── docker-sqlite-setup.*        # Setup scripts
```

## 🗄️ Database Access

### Via Docker Container
```bash
# Access SQLite CLI inside container
docker exec -it spencer-app-sqlite sqlite3 /app/data/spencer.db

# SQLite commands:
.tables                    # List all tables
.schema users             # Show table schema
SELECT * FROM users;      # Query data
.quit                     # Exit
```

### Via Host Machine
```bash
# If you have sqlite3 installed locally
sqlite3 ./data/spencer.db

# Or use Prisma Studio
npm run db:sqlite:studio
```

## 🔧 Configuration

### Environment Variables (.env.sqlite)
- `DATABASE_URL`: SQLite database file path
- `SQLITE_DB_PATH`: Physical database file location
- `DB_TYPE`: Set to "sqlite"
- `ENABLE_SQLITE`: Set to "true"
- `ENABLE_POSTGRES`: Set to "false"

### Volume Mapping
The SQLite database is stored in a Docker volume `sqlite_data` which maps to `/app/data` inside the container and `./data` on your host machine.

## 🚨 Troubleshooting

### Services Won't Start
```bash
# Check logs
docker-compose -f docker-compose.sqlite.yml logs

# Rebuild containers
docker-compose -f docker-compose.sqlite.yml down
docker-compose -f docker-compose.sqlite.yml build --no-cache
docker-compose -f docker-compose.sqlite.yml up -d
```

### Database Issues
```bash
# Reset SQLite database
docker-compose -f docker-compose.sqlite.yml down -v
docker volume rm taskmanager_sqlite_data
docker-compose -f docker-compose.sqlite.yml up -d

# Or delete local database file
rm -rf ./data/spencer.db
```

### Permission Issues
```bash
# Fix data directory permissions
chmod 755 ./data
chown $USER:$USER ./data
```

## 📊 Monitoring

### Check Service Health
```bash
# View all containers
docker-compose -f docker-compose.sqlite.yml ps

# Check application health
curl http://localhost:3000/api/health

# View real-time logs
docker-compose -f docker-compose.sqlite.yml logs -f app
```

### Database Statistics
```bash
# Database size
docker exec spencer-app-sqlite du -h /app/data/spencer.db

# Table counts
docker exec spencer-app-sqlite sqlite3 /app/data/spencer.db "SELECT name, COUNT(*) as count FROM sqlite_master WHERE type='table';"
```

## 🔄 Switching Between Databases

You can easily switch between PostgreSQL and SQLite:

### Switch to SQLite
```bash
cp .env.sqlite .env
docker-compose -f docker-compose.sqlite.yml up -d
```

### Switch back to PostgreSQL
```bash
cp .env.example .env  # or your original .env
docker-compose up -d
```

## 🎯 Benefits of SQLite Setup

- ✅ **No remote database needed**
- ✅ **Faster development setup**
- ✅ **Data persistence in Docker volumes**
- ✅ **Easy backup and restore**
- ✅ **Lower resource usage**
- ✅ **Perfect for development and testing**

## 📝 Notes

- SQLite database file will be created automatically on first run
- All your dynamic tables will work seamlessly with SQLite
- Redis is still used for caching and sessions
- You can always migrate back to PostgreSQL when needed
- The application supports both databases through environment configuration

## 🔧 Advanced Usage

### Custom SQLite Configuration
Edit `prisma/schema.sqlite.prisma` to customize:
- Foreign key constraints
- Indexes
- Data types
- Relationships

### Performance Tuning
The SQLite configuration includes:
- WAL mode for better concurrency
- Optimized cache settings
- Foreign key support enabled
- Auto-vacuum for maintenance

Enjoy your self-contained SQLite development environment! 🎉