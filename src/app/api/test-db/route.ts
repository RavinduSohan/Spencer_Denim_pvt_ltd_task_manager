import { NextRequest, NextResponse } from 'next/server';
import { getDatabaseClient, getDatabaseType } from '@/lib/server-database';

export async function GET(request: NextRequest) {
  try {
    console.log('=== Database Test API ===');
    
    const dbType = getDatabaseType(request);
    console.log('Database type:', dbType);
    
    const db = getDatabaseClient(request);
    console.log('Database client obtained');
    
    // Test database connection
    await db.$connect();
    console.log('Database connected successfully');
    
    // Test a simple query
    const userCount = await db.user.count();
    console.log('User count:', userCount);
    
    // Test task count
    const taskCount = await db.task.count();
    console.log('Task count:', taskCount);
    
    // Test order count  
    const orderCount = await db.order.count();
    console.log('Order count:', orderCount);
    
    await db.$disconnect();
    console.log('Database disconnected');
    
    return NextResponse.json({
      success: true,
      databaseType: dbType,
      counts: {
        users: userCount,
        tasks: taskCount,
        orders: orderCount
      },
      message: 'Database test successful'
    });
    
  } catch (error) {
    console.error('Database test error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    return NextResponse.json({
      success: false,
      error: errorMessage,
      stack: errorStack
    }, { status: 500 });
  }
}