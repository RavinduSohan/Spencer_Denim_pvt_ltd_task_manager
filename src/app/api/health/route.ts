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
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: 'API health check failed',
      database: 'disconnected',
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}
