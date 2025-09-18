# Spencer Denim Task Manager - Docker Setup

## 🎉 Clean Docker Setup

Your Docker configuration has been cleaned up and simplified! Here's what you now have:

### Files Structure
```
taskmanager/
├── Dockerfile                 # Production build
├── Dockerfile.dev            # Development build  
├── docker-compose.yml        # Development environment
├── docker-compose.prod.yml   # Production environment
└── docker-backup/           # Your old messy files (backed up)
```

## 🚀 Quick Start

### Development Environment
```bash
# Build and start development environment
npm run docker:dev

# Or start in detached mode
npm run docker:dev:detached

# View logs
npm run docker:logs

# Stop the environment
npm run docker:stop
```

### Production Environment
```bash
# Build and start production environment
npm run docker:prod

# Stop production environment
npm run docker:stop:prod
```

## 🔧 Available Commands

| Command | Description |
|---------|-------------|
| `npm run docker:dev` | Start development environment |
| `npm run docker:dev:detached` | Start development in background |
| `npm run docker:prod` | Start production environment |
| `npm run docker:stop` | Stop development environment |
| `npm run docker:stop:prod` | Stop production environment |
| `npm run docker:clean` | Clean up containers and images |
| `npm run docker:logs` | View logs |

## 🌐 Access Points

- **Application**: http://localhost:3000
- **Redis**: localhost:6379

## 🗄️ What's Included

### Development Environment
- Next.js app with hot reload
- Redis for caching
- Volume mounting for live code changes
- Turbopack for fast development

### Production Environment
- Optimized Next.js build
- Redis for caching
- Multi-stage build for smaller images
- Production-ready configuration

## 🧹 What Was Cleaned Up

Your old Docker files have been moved to the `docker-backup/` folder:
- docker-compose.backup.yml
- docker-compose.clean.yml
- docker-compose.local.yml
- docker-compose.services.yml
- docker-compose.simple.yml
- docker-compose.supabase.yml
- Dockerfile.simple

You can safely delete the `docker-backup/` folder when you're confident everything works correctly.

## ✅ Status

✅ **Currently Running**: Development environment  
✅ **Application**: http://localhost:3000  
✅ **Redis**: Available on localhost:6379  
✅ **Database**: Connected to Supabase  

Your application is now running cleanly with a much simpler Docker setup!
