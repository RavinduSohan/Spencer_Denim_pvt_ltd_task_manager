# Spencer Denim Task Manager - Development without Docker

## Quick Local Development (No Docker)

If you want to run the app locally without Docker containers:

```bash
# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Start Redis (optional, for caching)
# If you have Redis installed locally:
# redis-server

# Run development server
npm run dev
```

## Environment Variables

Make sure your `.env` file has:
```
DATABASE_URL="postgresql://postgres:khabibnurmagomedoV@db.xfzkkmbidevzowixapuh.supabase.co:5432/postgres?sslmode=prefer"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here-change-this-in-production"
```

## Access
- Application: http://localhost:3000

## Why might you choose this over Docker?
- Faster development (no container overhead)
- Direct database access (no networking issues)
- Easier debugging
- Simpler setup

## When to use Docker?
- Production deployment
- Team consistency
- Complex multi-service setups
- Testing deployment scenarios
