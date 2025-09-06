# 🐳 Spencer Denim Task Manager - Docker Setup

This document provides instructions for setting up and running the Spencer Denim Task Manager using Docker.

## 📋 Prerequisites

- Docker Desktop installed and running
- Docker Compose v2.0+
- At least 4GB RAM available for containers
- Ports 3000, 5432, 5050, and 6379 available

## 🚀 Quick Start

### Development Environment

1. **Clone and navigate to the project:**
   ```bash
   cd c:\sohan's\abarama\Spencer\taskmanager
   ```

2. **Start the development environment:**
   ```bash
   # Windows
   npm run docker:setup

   # Linux/macOS
   npm run docker:setup:linux
   ```

3. **Access the application:**
   - **Main App**: http://localhost:3000
   - **Database Admin (pgAdmin)**: http://localhost:5050
     - Email: `admin@spencerdenim.com`
     - Password: `admin123`

### Manual Development Setup

```bash
# Start all services
npm run docker:dev

# Or run in detached mode
npm run docker:dev:detached

# View logs
npm run docker:logs

# Stop services
npm run docker:stop
```

## 🏭 Production Environment

1. **Configure production environment:**
   ```bash
   # Copy and edit production environment variables
   cp .env.production .env.prod
   # Edit .env.prod with your production values
   ```

2. **Deploy to production:**
   ```bash
   npm run docker:prod
   ```

3. **Stop production:**
   ```bash
   npm run docker:stop:prod
   ```

## 🛠️ Available Docker Commands

### Development Commands
- `npm run docker:dev` - Start development environment
- `npm run docker:dev:detached` - Start in background
- `npm run docker:stop` - Stop all services
- `npm run docker:logs` - View all logs
- `npm run docker:logs:app` - View app logs only
- `npm run docker:shell` - Access app container shell

### Database Commands
- `npm run docker:db:migrate` - Run database migrations
- `npm run docker:db:seed` - Seed database with test data
- `npm run docker:db:studio` - Open Prisma Studio
- `npm run docker:backup` - Backup database

### Maintenance Commands
- `npm run docker:clean` - Clean up containers and volumes
- `docker system prune -a` - Full Docker cleanup

## 📊 Services Overview

### Application Stack
- **App Container**: Next.js application on port 3000
- **PostgreSQL**: Database on port 5432
- **Redis**: Caching and sessions on port 6379
- **pgAdmin**: Database management on port 5050
- **Nginx**: Reverse proxy on ports 80/443 (production only)

### Database Connections

#### Development Database
- **Host**: localhost
- **Port**: 5432
- **Database**: spencer_denim_db
- **Username**: spencer_user
- **Password**: spencer_password_2024

#### Production Database
- **Host**: localhost
- **Port**: 5432
- **Database**: spencer_denim_prod
- **Username**: spencer_prod_user
- **Password**: [Set in .env.production]

## 🔧 Troubleshooting

### Common Issues

1. **Port already in use:**
   ```bash
   # Check what's using the port
   netstat -ano | findstr :3000
   # Stop conflicting services or change ports in docker-compose.yml
   ```

2. **Database connection failed:**
   ```bash
   # Check if database is running
   docker-compose ps
   # View database logs
   docker-compose logs postgres
   ```

3. **App won't start:**
   ```bash
   # Rebuild containers
   docker-compose up --build --force-recreate
   ```

4. **Permission issues (Linux/macOS):**
   ```bash
   # Fix file permissions
   sudo chown -R $USER:$USER .
   ```

### Reset Everything
```bash
# Nuclear option - removes all data
npm run docker:clean
docker system prune -a --volumes
npm run docker:dev
```

## 🔒 Security Notes

### Development
- Default passwords are used for convenience
- All services are exposed on localhost
- SSL is disabled for simplicity

### Production
- **IMPORTANT**: Change all default passwords in `.env.production`
- Enable SSL certificates in nginx configuration
- Use environment variables for sensitive data
- Consider using Docker secrets for passwords
- Enable monitoring and logging

## 📈 Performance Optimization

### Resource Limits
You can add resource limits to containers in `docker-compose.yml`:

```yaml
services:
  app:
    deploy:
      resources:
        limits:
          memory: 512M
          cpus: '0.5'
```

### Scaling
Scale services horizontally:
```bash
docker-compose up --scale app=3
```

## 🔄 Updates and Maintenance

### Updating the Application
```bash
# Pull latest changes
git pull origin main

# Rebuild and restart
docker-compose up --build -d

# Run new migrations if any
npm run docker:db:migrate
```

### Backup Strategy
```bash
# Manual backup
npm run docker:backup

# Automated backup (set up cron job)
0 2 * * * cd /path/to/project && npm run docker:backup
```

## 📞 Support

For issues related to:
- **Docker setup**: Check Docker Desktop status and logs
- **Database issues**: Use pgAdmin at http://localhost:5050
- **Application bugs**: Check app logs with `npm run docker:logs:app`
- **Performance**: Monitor resource usage with `docker stats`

## 🎯 Next Steps

1. **Set up monitoring** with Docker health checks
2. **Configure automated backups** for production
3. **Set up CI/CD pipeline** with Docker
4. **Add SSL certificates** for production
5. **Configure log aggregation** for multiple containers

---

**Spencer Denim Industries - Task Management System v1.0.0**  
*Dockerized for scalable deployment* 🚀
