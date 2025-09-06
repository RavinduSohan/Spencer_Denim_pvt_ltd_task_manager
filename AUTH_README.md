# Spencer Denim Task Manager - Authentication Setup

## Overview
This application now includes a complete authentication system with login/signup pages and role-based access control.

## Authentication Features

### 1. User Authentication
- **NextAuth.js** integration with credentials provider
- Secure password hashing using bcryptjs
- JWT-based session management
- Protected routes with middleware

### 2. User Roles
- **Admin**: Full access to all features including user management
- **Manager**: Can manage tasks, orders, and view reports
- **User**: Basic access to assigned tasks and personal dashboard

### 3. Security Features
- Password encryption with bcryptjs
- Route protection middleware
- Role-based API access control
- Session management with NextAuth

## Default Users
The following test users have been created:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@spencerdenim.com | admin123 |
| Manager | manager@spencerdenim.com | manager123 |
| User | user@spencerdenim.com | user123 |

## Getting Started

### 1. Environment Setup
Ensure your `.env` file contains:
```env
DATABASE_URL="your-database-url"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here-change-this-in-production"
```

### 2. Database Setup
```bash
# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push

# Seed initial users
npx tsx prisma/auth-seed.ts
```

### 3. Running the Application
```bash
npm run dev
```

Navigate to `http://localhost:3000` and you'll be redirected to the login page.

## Authentication Flow

### Login Process
1. User enters email and password on `/auth/signin`
2. Credentials are validated against the database
3. JWT token is created with user role information
4. User is redirected to the main dashboard

### Registration Process
1. New users can register at `/auth/signup`
2. Password is hashed before storing in database
3. User role is assigned (default: 'user')
4. Account is created and user can login

### Route Protection
- All routes except `/auth/*` are protected
- Unauthenticated users are redirected to login
- API routes check authentication before processing

## API Endpoints

### Authentication APIs
- `POST /api/auth/signup` - User registration
- `GET/POST /api/auth/[...nextauth]` - NextAuth endpoints
- `POST /api/auth/signin` - Login (handled by NextAuth)

### Protected APIs
- `GET /api/tasks` - Requires authentication
- `POST /api/tasks` - Requires authentication
- `GET /api/users` - Requires admin/manager role
- `POST /api/users` - Requires admin role

## Components

### Authentication Components
- `AuthWrapper` - Protects pages requiring authentication
- `Header` - Shows user info and logout option
- `Providers` - NextAuth session provider
- `useAuth` - Custom hook for authentication state

### Pages
- `/auth/signin` - Login page
- `/auth/signup` - Registration page
- `/` - Main dashboard (protected)

## Role-Based Features

### Admin Users Can:
- View and manage all users
- Create new user accounts
- Access all tasks and orders
- View system-wide analytics

### Manager Users Can:
- View and manage tasks/orders
- Assign tasks to users
- View team analytics
- Cannot manage users

### Regular Users Can:
- View assigned tasks
- Update task status
- View personal dashboard
- Cannot access admin features

## Security Considerations

### Production Deployment
1. Change `NEXTAUTH_SECRET` to a secure random string
2. Use environment variables for all sensitive data
3. Enable HTTPS in production
4. Set secure cookie options
5. Implement rate limiting for login attempts

### Password Policy
- Minimum 6 characters (can be increased)
- Passwords are hashed with bcryptjs
- Consider implementing password strength requirements

## Customization

### Adding New Roles
1. Update the User model role field in `prisma/schema.prisma`
2. Add role validation in `src/lib/auth-utils.ts`
3. Update API route protection as needed

### Custom Authentication Providers
NextAuth supports many providers (Google, GitHub, etc.). To add:
1. Install the provider package
2. Add provider configuration to `src/lib/auth.ts`
3. Update the signin page if needed

## Troubleshooting

### Common Issues
1. **Database Connection**: Ensure DATABASE_URL is correct
2. **NextAuth Secret**: Must be set in production
3. **Role Access**: Check user role assignments in database
4. **Session Issues**: Clear browser storage and re-login

### Development Tips
- Use Prisma Studio to view/edit users: `npx prisma studio`
- Check server logs for authentication errors
- Verify environment variables are loaded correctly

## File Structure
```
src/
├── app/
│   ├── api/auth/          # Authentication API routes
│   ├── auth/              # Login/signup pages
│   └── page.tsx           # Protected main page
├── components/
│   ├── AuthWrapper.tsx    # Route protection
│   ├── Header.tsx         # User navigation
│   └── Providers.tsx      # Session provider
├── hooks/
│   └── useAuth.ts         # Authentication hook
├── lib/
│   ├── auth.ts            # NextAuth configuration
│   └── auth-utils.ts      # API authentication helpers
├── middleware.ts          # Route protection middleware
└── types/
    └── auth.d.ts          # TypeScript declarations
```

This completes the authentication setup for the Spencer Denim Task Manager!
