# Spencer Denim Task Management System - Backend API

A comprehensive task management system backend built with Next.js 15, Prisma, and PostgreSQL for Spencer Denim Industries.

## 🚀 Features

- **Task Management**: Create, update, delete, and track tasks with categories, priorities, and assignments
- **Order Management**: Manage production orders with progress tracking and status updates
- **Document Management**: Upload, organize, and manage documents related to orders and tasks
- **User Management**: User authentication and role-based access control
- **Activity Logging**: Track all system activities for audit trails
- **Dashboard Analytics**: Real-time statistics and insights
- **RESTful API**: Well-structured API endpoints with proper validation

## 🛠 Tech Stack

- **Framework**: Next.js 15 with App Router
- **Database**: PostgreSQL with Prisma ORM
- **Validation**: Zod for type-safe validation
- **TypeScript**: Full type safety
- **Architecture**: Clean API architecture with proper error handling

## 📦 Project Structure

```
src/
├── app/api/                 # API routes
│   ├── tasks/              # Task management endpoints
│   ├── orders/             # Order management endpoints
│   ├── documents/          # Document management endpoints
│   ├── users/              # User management endpoints
│   ├── activities/         # Activity logging endpoints
│   └── dashboard/          # Dashboard statistics
├── lib/                     # Utility libraries
│   ├── db.ts               # Database connection
│   ├── validations.ts      # Zod validation schemas
│   └── utils.ts            # Helper functions
└── generated/prisma/       # Generated Prisma client

prisma/
├── schema.prisma           # Database schema
└── seed.ts                 # Database seeding script
```

## 🗄 Database Schema

### Core Entities

- **Users**: System users with roles and permissions
- **Tasks**: Individual tasks with status, priority, and assignments
- **Orders**: Production orders with progress tracking
- **Documents**: File management with categorization
- **Activities**: System activity logs

### Relationships

- Users can create and be assigned to tasks
- Orders can have multiple tasks and documents
- All entities have proper foreign key relationships

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- PostgreSQL database
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   cd taskmanager
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` with your database connection string:
   ```
   DATABASE_URL="postgresql://username:password@localhost:5432/taskmanager"
   ```

4. **Generate Prisma client**
   ```bash
   npm run db:generate
   ```

5. **Push database schema**
   ```bash
   npm run db:push
   ```

6. **Seed the database (optional)**
   ```bash
   npm run db:seed
   ```

7. **Start the development server**
   ```bash
   npm run dev
   ```

The API will be available at `http://localhost:3000/api`

## 📚 API Endpoints

### Tasks
- `GET /api/tasks` - List all tasks with filtering and pagination
- `POST /api/tasks` - Create a new task
- `GET /api/tasks/[id]` - Get task by ID
- `PUT /api/tasks/[id]` - Update task
- `DELETE /api/tasks/[id]` - Delete task

### Orders
- `GET /api/orders` - List all orders with filtering and pagination
- `POST /api/orders` - Create a new order
- `GET /api/orders/[id]` - Get order by ID
- `PUT /api/orders/[id]` - Update order
- `DELETE /api/orders/[id]` - Delete order

### Documents
- `GET /api/documents` - List all documents with filtering and pagination
- `POST /api/documents` - Upload a new document
- `GET /api/documents/[id]` - Get document by ID
- `PUT /api/documents/[id]` - Update document
- `DELETE /api/documents/[id]` - Delete document

### Users
- `GET /api/users` - List all users with pagination
- `POST /api/users` - Create a new user
- `GET /api/users/[id]` - Get user by ID
- `PUT /api/users/[id]` - Update user
- `DELETE /api/users/[id]` - Delete user

### Activities
- `GET /api/activities` - List all activities with pagination

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics

## 🔍 Query Parameters

### Pagination
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10, max: 100)

### Filtering
- `search` - Search in title and description
- `status` - Filter by status
- `priority` - Filter by priority (tasks only)
- `category` - Filter by category
- `assignedToId` - Filter by assigned user (tasks only)
- `orderId` - Filter by order ID
- `client` - Filter by client name (orders only)

### Example Requests

```bash
# Get tasks with pagination and filtering
GET /api/tasks?page=1&limit=10&status=PENDING&category=PRODUCTION

# Get orders for a specific client
GET /api/orders?client=Fashion%20Retail%20Co.&status=PRODUCTION

# Search documents
GET /api/documents?search=tech%20pack&category=TECH_PACK
```

## 📝 Request/Response Format

### Standard Response Format
```json
{
  "success": true,
  "message": "Success",
  "data": { ... }
}
```

### Error Response Format
```json
{
  "success": false,
  "message": "Error message",
  "error": "Detailed error information"
}
```

## 🛡 Validation

All endpoints use Zod schemas for validation with proper error handling and type safety.

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production  
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:generate` - Generate Prisma client
- `npm run db:push` - Push schema to database
- `npm run db:migrate` - Run database migrations
- `npm run db:seed` - Seed database with sample data
- `npm run db:studio` - Open Prisma Studio

The API will be available at `http://localhost:3000/api`
