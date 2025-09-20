import { PrismaClient as PostgresPrismaClient } from '../generated/prisma';
import { PrismaClient as SQLitePrismaClient } from '../generated/prisma-sqlite';

export type DatabaseType = 'sqlite' | 'postgres';

class ServerDatabaseService {
  private postgresClient: PostgresPrismaClient | null = null;
  private sqliteClient: SQLitePrismaClient | null = null;

  private getPostgresClient(): PostgresPrismaClient {
    if (!this.postgresClient) {
      this.postgresClient = new PostgresPrismaClient({
        log: ['error', 'warn'],
      });
    }
    return this.postgresClient;
  }

  private getSQLiteClient(): SQLitePrismaClient {
    if (!this.sqliteClient) {
      this.sqliteClient = new SQLitePrismaClient({
        log: ['error', 'warn'],
      });
    }
    return this.sqliteClient;
  }

  public getClient(type: DatabaseType): PostgresPrismaClient | SQLitePrismaClient {
    if (type === 'sqlite') {
      return this.getSQLiteClient();
    }
    return this.getPostgresClient();
  }

  public async connect(type: DatabaseType): Promise<void> {
    try {
      const client = this.getClient(type);
      await client.$connect();
      console.log(`✅ ${type.toUpperCase()} Database connected successfully`);
    } catch (error) {
      console.error(`❌ ${type.toUpperCase()} Database connection failed:`, error);
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
}

// Global instance for server-side use
const globalForServerDatabaseService = globalThis as unknown as {
  serverDatabaseService: ServerDatabaseService | undefined;
};

export const serverDatabaseService =
  globalForServerDatabaseService.serverDatabaseService ?? new ServerDatabaseService();

if (process.env.NODE_ENV !== 'production') {
  globalForServerDatabaseService.serverDatabaseService = serverDatabaseService;
}

// Helper function to get database client from request headers
export function getDatabaseClient(request: Request): any {
  const dbType = request.headers.get('x-database-type') as DatabaseType || 'sqlite'; // Default to SQLite
  console.log('Database type from header:', dbType);
  
  const client = serverDatabaseService.getClient(dbType);
  console.log('Database client type:', client.constructor.name);
  
  return client;
}

// Helper function to get database type from request headers
export function getDatabaseType(request: Request): DatabaseType {
  return (request.headers.get('x-database-type') as DatabaseType) || 'sqlite'; // Default to SQLite
}