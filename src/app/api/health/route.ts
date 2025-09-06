import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    // Test database connection
    await db.$queryRaw`SELECT 1`;
    
    const now = new Date().toISOString();
    
    return NextResponse.json({
      success: true,
      message: 'API is healthy',
      timestamp: now,
      database: 'connected',
      status: 'operational',
      services: {
        database: 'connected',
        app: 'running'
      },
      version: process.env.APP_VERSION || '1.0.0',
      environment: process.env.NODE_ENV || 'development'
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: 'API health check failed',
      database: 'disconnected',
      status: 'error',
      services: {
        database: 'disconnected',
        app: 'running'
      },
      error: error instanceof Error ? error.message : 'Unknown error',
      version: process.env.APP_VERSION || '1.0.0',
      environment: process.env.NODE_ENV || 'development'
    }, { status: 500 });
  }
}
