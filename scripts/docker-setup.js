#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting Spencer Denim Task Manager Development Environment...');
console.log('📡 Using Supabase PostgreSQL Database with Docker Host Network');
console.log('🔗 App will run in Docker container using host networking for Supabase access');

// Check if Docker is running
try {
  execSync('docker --version', { stdio: 'ignore' });
  console.log('✅ Docker is available');
} catch (error) {
  console.error('❌ Docker is not running or not installed');
  console.error('Please install Docker Desktop and make sure it\'s running');
  process.exit(1);
}

// Check if Docker Compose is available
try {
  execSync('docker-compose --version', { stdio: 'ignore' });
  console.log('✅ Docker Compose is available');
} catch (error) {
  console.error('❌ Docker Compose is not available');
  console.error('Please install Docker Compose');
  process.exit(1);
}

// Stop any existing containers
console.log('🛑 Stopping any existing containers...');
try {
  execSync('docker-compose down', { stdio: 'ignore' });
} catch (error) {
  // It's okay if nothing was running
}

// Build and start services
console.log('🔨 Building and starting Docker services...');
try {
  execSync('docker-compose up --build -d', { stdio: 'inherit' });
  console.log('✅ Docker services started');
} catch (error) {
  console.error('❌ Failed to start Docker services:', error.message);
  process.exit(1);
}

// Wait for services to be ready
console.log('⏳ Waiting for services to be ready...');
setTimeout(() => {
  
  // Check if we need to run migrations
  console.log('🗄️ Setting up database with Supabase...');
  try {
    // First, try to generate Prisma client
    execSync('docker-compose exec -T app npx prisma generate', { stdio: 'inherit' });
    
    // Then push database schema to Supabase
    console.log('📡 Syncing database schema with Supabase...');
    execSync('docker-compose exec -T app npx prisma db push', { stdio: 'inherit' });
    console.log('✅ Database schema synced with Supabase');
    
    // Try to seed the database
    console.log('🌱 Seeding database with initial data...');
    try {
      execSync('docker-compose exec -T app npm run db:seed', { stdio: 'inherit' });
      console.log('✅ Database seeded successfully');
    } catch (seedError) {
      console.warn('⚠️ Database seeding skipped (may already be seeded)');
    }
    
  } catch (error) {
    console.warn('⚠️ Database setup encountered issues:');
    console.warn(error.message);
    console.warn('You may need to run migrations manually with: npm run docker:db:migrate');
  }

  console.log('\n✅ Development environment is ready!\n');
  console.log('🌐 Application: http://localhost:3000');
  console.log('🗄️ pgAdmin: http://localhost:5050');
  console.log('   - Email: admin@spencerdenim.com');
  console.log('   - Password: admin123');
  console.log('   - Add Supabase server with your credentials\n');
  console.log('📡 Database: Supabase PostgreSQL');
  console.log('   - Connected to: db.xfzkkmbidevzowixapuh.supabase.co');
  console.log('   - Database: postgres\n');
  console.log('🔧 Useful commands:');
  console.log('   - Stop environment: npm run docker:stop');
  console.log('   - View logs: npm run docker:logs');
  console.log('   - Database migrations: npm run docker:db:migrate');
  console.log('   - Database studio: npm run docker:db:studio');
  
}, 15000); // Wait 15 seconds for services to start
