import { PrismaClient as PostgresPrismaClient } from '../generated/prisma';
import { PrismaClient as SQLitePrismaClient } from '../generated/prisma-sqlite';

export type DatabaseType = 'sqlite' | 'postgres';

class DatabaseService {
  private postgresClient: PostgresPrismaClient | null = null;
  private sqliteClient: SQLitePrismaClient | null = null;
  private currentDatabase: DatabaseType = 'postgres';

  constructor() {
    // Initialize with default database type from localStorage or default to postgres
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('database-type') as DatabaseType;
      this.currentDatabase = stored || 'postgres';
    }
  }

  private getPostgresClient(): PostgresPrismaClient {
    if (!this.postgresClient) {
      this.postgresClient = new PostgresPrismaClient({
        log: ['query', 'error', 'warn'],
      });
    }
    return this.postgresClient;
  }

  private getSQLiteClient(): SQLitePrismaClient {
    if (!this.sqliteClient) {
      this.sqliteClient = new SQLitePrismaClient({
        log: ['query', 'error', 'warn'],
      });
    }
    return this.sqliteClient;
  }

  public getClient(): PostgresPrismaClient | SQLitePrismaClient {
    if (this.currentDatabase === 'sqlite') {
      return this.getSQLiteClient();
    }
    return this.getPostgresClient();
  }

  public async switchDatabase(type: DatabaseType): Promise<void> {
    this.currentDatabase = type;
    
    // Store preference in localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('database-type', type);
    }

    // Connect to the new database
    await this.connect();
  }

  public getCurrentDatabaseType(): DatabaseType {
    return this.currentDatabase;
  }

  public async connect(): Promise<void> {
    try {
      const client = this.getClient();
      await client.$connect();
      console.log(`✅ ${this.currentDatabase.toUpperCase()} Database connected successfully`);
    } catch (error) {
      console.error(`❌ ${this.currentDatabase.toUpperCase()} Database connection failed:`, error);
      throw error;
    }
  }

  public async disconnect(): Promise<void> {
    try {
      if (this.postgresClient) {
        await this.postgresClient.$disconnect();
      }
      if (this.sqliteClient) {
        await this.sqliteClient.$disconnect();
      }
      console.log('✅ Database disconnected successfully');
    } catch (error) {
      console.error('❌ Database disconnection failed:', error);
      throw error;
    }
  }

  // Helper method to get database info for API headers
  public getDatabaseHeader(): string {
    return this.currentDatabase;
  }
}

// Global instance
const globalForDatabaseService = globalThis as unknown as {
  databaseService: DatabaseService | undefined;
};

export const databaseService =
  globalForDatabaseService.databaseService ?? new DatabaseService();

if (process.env.NODE_ENV !== 'production') {
  globalForDatabaseService.databaseService = databaseService;
}

// Legacy export for backward compatibility
export const db = databaseService.getClient();

// Helper functions
export async function connectDB() {
  return databaseService.connect();
}

export async function disconnectDB() {
  return databaseService.disconnect();
}

export function getCurrentDatabase() {
  return databaseService.getCurrentDatabaseType();
}

export async function switchDatabase(type: DatabaseType) {
  return databaseService.switchDatabase(type);
}