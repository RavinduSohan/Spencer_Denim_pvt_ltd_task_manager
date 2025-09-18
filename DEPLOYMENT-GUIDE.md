# Spencer Denim Task Manager - Complete System Export & Deployment Guide

## 📦 System Export & Distribution Package

This guide covers how to export, distribute, and deploy the Spencer Denim Task Manager system for use by other teams or organizations.

---

## 🎯 Export Package Contents

### Core System Files
```
Spencer_Denim_Task_Manager/
├── src/                          # Application source code
├── prisma/                       # Database schemas & SQLite auth DB
├── data/                         # Main SQLite database files
├── public/                       # Static assets
├── package.json                  # Dependencies & scripts
├── docker-compose.yml            # Docker configuration
├── Dockerfile                    # Container build instructions
├── start.bat                     # Windows launcher
├── start.sh                      # Linux/Mac launcher
├── DEPLOYMENT-GUIDE.md           # This file
├── QUICK-START.md                # User setup guide
└── .env.example                  # Environment configuration template
```

### Database Files (Critical - Must Include)
- `./data/dynamic-tables.db` - Main application database
- `./data/dynamic-tables.db-shm` - SQLite shared memory file
- `./data/dynamic-tables.db-wal` - SQLite write-ahead log
- `./prisma/sqlite-database.db` - Authentication database

---

## 🚀 Deployment Instructions for Recipients

### Prerequisites
Recipients must have the following installed:
- **Docker Desktop** (latest version)
- **Git** (for version control - optional)
- **Network access** for Docker image downloads

### Step 1: System Setup

#### For Windows Users:
1. Extract the system package to desired directory
2. Open Command Prompt or PowerShell as Administrator
3. Navigate to the system directory
4. Run: `start.bat`

#### For Linux/Mac Users:
1. Extract the system package to desired directory
2. Open Terminal
3. Navigate to the system directory
4. Run: `chmod +x start.sh && ./start.sh`

#### Manual Docker Setup:
```bash
# Navigate to system directory
cd Spencer_Denim_Task_Manager

# Build and start the system
docker-compose up --build -d

# Verify deployment
docker ps
```

### Step 2: Network Access Configuration

#### Local Network Access (WiFi/LAN):
1. **Find Host IP Address:**
   ```bash
   # Windows
   ipconfig
   
   # Linux/Mac
   ifconfig
   ```

2. **Update Environment Configuration:**
   - Copy `.env.example` to `.env`
   - Update `NEXTAUTH_URL=http://YOUR_IP_ADDRESS:3000`
   - Example: `NEXTAUTH_URL=http://192.168.1.100:3000`

3. **Rebuild Container:**
   ```bash
   docker-compose down
   docker-compose up --build -d
   ```

4. **Firewall Configuration:**
   - **Windows**: Allow port 3000 through Windows Firewall
   - **Linux**: `sudo ufw allow 3000`
   - **Mac**: System Preferences > Security & Privacy > Firewall

#### Internet Access (Public Deployment):
1. **Domain Setup:**
   - Configure domain/subdomain pointing to server
   - Update `NEXTAUTH_URL=https://yourdomain.com`

2. **SSL/HTTPS Configuration:**
   - Add reverse proxy (Nginx/Apache)
   - Configure SSL certificates (Let's Encrypt recommended)

3. **Production Environment:**
   - Change `NODE_ENV=production`
   - Update `NEXTAUTH_SECRET` to strong random value
   - Configure proper backup strategy

---

## 🔧 System Configuration

### Environment Variables (.env file)
```bash
# Application Settings
NODE_ENV=development
NEXT_TELEMETRY_DISABLED=1

# Authentication
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=change-this-to-random-secret-in-production

# Database (SQLite - No changes needed)
# Auth database: ./prisma/sqlite-database.db
# Main database: ./data/dynamic-tables.db
```

### Default User Accounts
```
Admin Account:
Email: admin@spencer.com
Password: admin123

Manager Account:
Email: manager@spencer.com  
Password: manager123

User Account:
Email: user@spencer.com
Password: user123
```

### Port Configuration
- **Application**: Port 3000
- **Health Check**: http://IP:3000/api/health
- **Database**: SQLite (file-based, no network ports)

---

## 📊 Database Management

### SQLite Database Locations
- **Authentication DB**: `./prisma/sqlite-database.db`
- **Application DB**: `./data/dynamic-tables.db`
- **Backup Files**: `./data/*.db-shm`, `./data/*.db-wal`

### Database Operations
```bash
# Backup databases
cp ./data/dynamic-tables.db ./backup/
cp ./prisma/sqlite-database.db ./backup/

# Restore databases
cp ./backup/dynamic-tables.db ./data/
cp ./backup/sqlite-database.db ./prisma/

# Reset databases (creates fresh with default users)
docker exec -it spencer-taskmanager npm run db:reset
```

### Database Seeding
```bash
# Seed authentication database with default users
docker exec -it spencer-taskmanager npx tsx prisma/sqlite-seed.ts

# Seed main database with sample data
docker exec -it spencer-taskmanager npx tsx prisma/seed.ts
```

---

## 🔄 CI/CD Pipeline Considerations

### Automated Deployment Pipeline (Recommended)
If distributing to multiple environments, consider implementing:

#### 1. GitHub Actions Workflow (.github/workflows/deploy.yml)
```yaml
# Automated testing and deployment
- Environment validation
- Database migration checks
- Security scanning
- Automated backups
- Health monitoring
```

#### 2. Quality Assurance Checks
- **Code Quality**: ESLint, Prettier, TypeScript checks
- **Security**: Dependency vulnerability scanning
- **Database**: Migration validation
- **Performance**: Load testing for multi-user access

#### 3. Deployment Automation
- **Staging Environment**: Test deployments
- **Production Rollout**: Blue-green deployment
- **Rollback Strategy**: Database and application versioning
- **Monitoring**: Application health and performance metrics

### Manual Deployment Checklist
If not using CI/CD:
- [ ] Backup existing databases before updates
- [ ] Test deployment in staging environment
- [ ] Verify all environment variables
- [ ] Test network accessibility
- [ ] Validate user authentication
- [ ] Check application functionality
- [ ] Monitor system performance

---

## 🛠️ Troubleshooting & Maintenance

### Common Issues

#### 1. Container Won't Start
```bash
# Check Docker status
docker ps -a

# View container logs
docker-compose logs spencer-taskmanager

# Rebuild container
docker-compose down
docker-compose up --build -d
```

#### 2. Network Access Issues
- Verify firewall settings
- Check IP address configuration
- Confirm port 3000 availability
- Test with `telnet IP_ADDRESS 3000`

#### 3. Database Corruption
```bash
# Check database integrity
docker exec -it spencer-taskmanager sqlite3 ./data/dynamic-tables.db "PRAGMA integrity_check;"

# Restore from backup
cp ./backup/dynamic-tables.db ./data/
docker-compose restart
```

### System Monitoring
```bash
# Container health
docker exec spencer-taskmanager curl -f http://localhost:3000/api/health

# Resource usage
docker stats spencer-taskmanager

# Application logs
docker-compose logs -f --tail=100
```

### Backup Strategy
```bash
# Daily backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p ./backups/$DATE
cp ./data/*.db ./backups/$DATE/
cp ./prisma/*.db ./backups/$DATE/
tar -czf ./backups/spencer_backup_$DATE.tar.gz ./backups/$DATE/
```

---

## 🔐 Security Considerations

### Production Deployment Security
- [ ] Change default passwords immediately
- [ ] Update `NEXTAUTH_SECRET` to cryptographically secure value
- [ ] Configure HTTPS/SSL certificates
- [ ] Set up firewall rules (allow only necessary ports)
- [ ] Regular security updates
- [ ] Database encryption (if handling sensitive data)
- [ ] User access auditing
- [ ] Regular backup verification

### Network Security
- [ ] VPN access for remote users (if required)
- [ ] Network segmentation
- [ ] Intrusion detection systems
- [ ] Regular security assessments

---

## 📞 Support & Documentation

### System Information
- **Version**: 1.0.0
- **Technology Stack**: Next.js, TypeScript, Prisma, SQLite
- **Container**: Docker with Alpine Linux
- **Database**: SQLite (local file-based)

### Support Contacts
- **Technical Issues**: Check application logs first
- **Database Problems**: Backup and restore procedures above
- **Network Issues**: Verify firewall and IP configuration
- **Security Concerns**: Follow security checklist above

### Additional Resources
- `QUICK-START.md` - User setup guide
- `docker-compose.yml` - Container configuration
- `package.json` - Dependencies and scripts
- Application logs: `docker-compose logs -f`

---

## ✅ Pre-Deployment Checklist

### Before Distribution
- [ ] All databases included and properly seeded
- [ ] Environment configuration template provided
- [ ] Docker configuration tested
- [ ] Network access instructions verified
- [ ] Default credentials documented
- [ ] Backup procedures tested
- [ ] Security configurations reviewed

### Recipient Verification
- [ ] Docker Desktop installed and running
- [ ] System extraction successful
- [ ] Application starts without errors
- [ ] Login with default credentials works
- [ ] Network access from other devices functional
- [ ] Basic functionality verified

---

**Spencer Denim Task Manager** - Production-ready deployment package with comprehensive SQLite database system and premium user interface.