import { PrismaClient } from '../generated/prisma-sqlite';

// Global variable to store the SQLite Prisma instance in development
const globalForSQLitePrisma = globalThis as unknown as {
  sqlitePrisma: PrismaClient | undefined;
};

export const sqliteDb =
  globalForSQLitePrisma.sqlitePrisma ??
  new PrismaClient({
    log: ['query', 'error', 'warn'],
  });

if (process.env.NODE_ENV !== 'production') globalForSQLitePrisma.sqlitePrisma = sqliteDb;

// Database helper functions for SQLite
export async function connectSQLiteDB() {
  try {
    await sqliteDb.$connect();
    console.log('✅ SQLite Database connected successfully');
  } catch (error) {
    console.error('❌ SQLite Database connection failed:', error);
    throw error;
  }
}

export async function disconnectSQLiteDB() {
  try {
    await sqliteDb.$disconnect();
    console.log('✅ SQLite Database disconnected successfully');
  } catch (error) {
    console.error('❌ SQLite Database disconnection failed:', error);
    throw error;
  }
}