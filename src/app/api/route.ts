import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'Spencer Denim Task Management API',
    version: '1.0.0',
    endpoints: {
      tasks: '/api/tasks',
      orders: '/api/orders',
      documents: '/api/documents',
      users: '/api/users',
      activities: '/api/activities',
      dashboard: '/api/dashboard/stats',
    },
    documentation: 'https://github.com/spencerdenim/taskmanager/blob/main/README.md',
  });
}
