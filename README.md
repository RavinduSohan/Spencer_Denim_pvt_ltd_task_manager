<img width="1366" height="768" alt="Screenshot (34)" src="https://github.com/user-attachments/assets/f5ee724b-52ab-4cb5-abf6-1d1de37095ca" />

<img width="1366" height="768" alt="Screenshot (36)" src="https://github.com/user-attachments/assets/d83c9609-585e-43c6-a996-9eb93b859cbd" />

<img width="1366" height="768" alt="Screenshot (37)" src="https://github.com/user-attachments/assets/8dc1262a-7159-4ec0-9015-fd562b1d402a" />

<img width="1366" height="768" alt="Screenshot (38)" src="https://github.com/user-attachments/assets/f9a542dc-f295-4fe9-a3bd-d6faf8da3e39" />

<img width="1366" height="768" alt="Screenshot (39)" src="https://github.com/user-attachments/assets/6b03f2d9-de11-43d2-8105-b0ba1107b5c8" />

<img width="1366" height="768" alt="Screenshot (40)" src="https://github.com/user-attachments/assets/4dd20e6f-0006-4b2d-8b7d-90cdc8c9d29c" />

<img width="1366" height="768" alt="Screenshot (41)" src="https://github.com/user-attachments/assets/27deb068-9e84-45be-8e4e-a21f9b9e4ff7" />

<img width="1366" height="768" alt="Screenshot (42)" src="https://github.com/user-attachments/assets/4c6c1bdf-7123-48db-a3fe-1f8c8f7e51ff" />

<img width="1366" height="768" alt="Screenshot (43)" src="https://github.com/user-attachments/assets/aadb8d99-4409-46bf-a7d9-f11236c4a696" />


<img width="1366" height="768" alt="Screenshot (44)" src="https://github.com/user-attachments/assets/75cc5e8f-727a-4b0c-b4ff-97965b14af4e" />

<img width="1366" height="768" alt="Screenshot (45)" src="https://github.com/user-attachments/assets/11951324-48d2-49e6-82e3-16ff85fb2041" />

<img width="1366" height="768" alt="Screenshot (46)" src="https://github.com/user-attachments/assets/ff32a7d1-7b13-419a-bf63-ec26a7dfd1bc" />

<img width="1366" height="768" alt="Screenshot (47)" src="https://github.com/user-attachments/assets/6b2859de-dd86-44c3-91af-5a51619e7243" />


<img width="1366" height="768" alt="Screenshot (48)" src="https://github.com/user-attachments/assets/408ae01e-b3cc-47e0-82d4-b2c56464b94c" />


<img width="1366" height="768" alt="Screenshot (49)" src="https://github.com/user-attachments/assets/e459743b-2402-483c-aa6b-96550f09721e" />

<img width="1366" height="768" alt="Screenshot (50)" src="https://github.com/user-attachments/assets/d6363f11-21f0-4ced-b2ad-dc3c7596007a" />


<img width="1366" height="768" alt="Screenshot (51)" src="https://github.com/user-attachments/assets/90a69199-cb7a-4b9d-981b-b89436fbd059" />

<img width="1366" height="768" alt="Screenshot (52)" src="https://github.com/user-attachments/assets/bcb5b457-32f8-43cd-acd9-c2a2498ed448" />

<img width="1366" height="768" alt="Screenshot (53)" src="https://github.com/user-attachments/assets/c9dd6ff3-92f6-445a-a9dd-814bada1cc7b" />



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
