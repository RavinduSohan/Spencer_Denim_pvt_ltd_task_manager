# Spencer Denim Task Manager - Quick Start Guide

## 🚀 Easy Setup & Launch

The Spencer Denim Task Manager is now configured for simple local deployment using SQLite database. No complex database setup required!

### Prerequisites

- Docker Desktop installed and running
- Git (for cloning the repository)

### 🎯 One-Click Launch

#### For Windows Users:
```bash
# Simply double-click or run:
start.bat
```

#### For Linux/Mac Users:
```bash
# Make the script executable and run:
chmod +x start.sh
./start.sh
```

#### Manual Docker Launch:
```bash
# Build and start the application
docker-compose up --build -d

# Access at: http://localhost:3000
```

### 🔑 Default Login Credentials

After the application starts, use these credentials to log in:

- **Email**: `admin@spencer.com`
- **Password**: `admin123`

### 📊 What's Included

- ✅ **Premium Authentication UI** - Luxury login/signup pages
- ✅ **SQLite Database** - Local, file-based database (no external DB needed)
- ✅ **User Management** - Create users with different roles
- ✅ **Dynamic Tables** - Create and manage custom data tables
- ✅ **Task Management** - Full-featured task tracking system
- ✅ **Dashboard** - Beautiful, responsive dashboard
- ✅ **Docker Ready** - Containerized for easy deployment

### 🛠️ Application Structure

```
Spencer Task Manager/
├── data/                    # SQLite database files
├── src/                     # Application source code
│   ├── app/                # Next.js app router pages
│   ├── components/         # React components
│   ├── lib/               # Utility libraries
│   └── types/             # TypeScript definitions
├── prisma/                # Database schemas and migrations
├── docker-compose.yml     # Simple Docker setup
├── Dockerfile            # Application container
├── start.bat             # Windows launcher
└── start.sh              # Linux/Mac launcher
```

### 🔧 Development Commands

```bash
# Stop the application
docker-compose down

# View application logs
docker-compose logs -f

# Restart the application
docker-compose restart

# Rebuild and restart
docker-compose up --build -d

# Access container shell
docker exec -it spencer-taskmanager sh
```

### 🌐 Access Points

- **Main Application**: http://localhost:3000
- **Health Check**: http://localhost:3000/api/health

### 📱 Features Overview

1. **Authentication System**
   - Premium UI with luxury design
   - Role-based access control (User, Manager, Admin)
   - Secure session management

2. **Dynamic Tables**
   - Create custom tables on the fly
   - Define fields and data types
   - Import/export functionality

3. **Task Management**
   - Create, assign, and track tasks
   - Priority levels and due dates
   - Status tracking and updates

4. **Dashboard**
   - Overview of tasks and activities
   - Charts and analytics
   - Real-time updates

### 🔄 Database Information

The application uses SQLite databases stored locally:

- **Main Database**: `./data/dynamic-tables.db` (Application data)
- **Auth Database**: `./prisma/sqlite-database.db` (User authentication)

These files are automatically created when the application starts for the first time.

### 🎨 Premium Design

The application features an extremely premium design with:
- Luxury gradient backgrounds
- Glassmorphism effects
- Smooth animations and transitions
- Professional typography
- Responsive design for all devices

### 🚨 Troubleshooting

#### Application won't start:
1. Ensure Docker Desktop is running
2. Check if port 3000 is available
3. Run `docker-compose logs` to check for errors

#### Can't access the application:
1. Wait 30-60 seconds for full startup
2. Try refreshing your browser
3. Check if the container is running: `docker ps`

#### Database issues:
1. Delete the database files in `./data/` and `./prisma/`
2. Restart the application to recreate fresh databases

### 📞 Support

For issues or questions:
1. Check the application logs: `docker-compose logs -f`
2. Ensure all prerequisites are met
3. Try restarting Docker Desktop

---

**Spencer Denim Task Manager** - Built with Next.js, TypeScript, Prisma, and SQLite for maximum simplicity and performance.