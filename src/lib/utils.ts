import { NextRequest, NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { type ClassValue, clsx } from 'clsx';

// Utility function for merging class names
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

// Error handling utility
export function handleError(error: unknown) {
  console.error('API Error:', error);

  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        success: false,
        message: 'Validation error',
        error: error.issues.map((e: any) => `${e.path.join('.')}: ${e.message}`).join(', '),
      },
      { status: 400 }
    );
  }

  if (error instanceof Error) {
    return NextResponse.json(
      {
        success: false,
        message: 'Internal server error',
        error: error.message,
      },
      { status: 500 }
    );
  }

  return NextResponse.json(
    {
      success: false,
      message: 'Unknown error occurred',
      error: 'Unknown error',
    },
    { status: 500 }
  );
}

// Success response utility
export function successResponse(data: any, message = 'Success') {
  return NextResponse.json({
    success: true,
    message,
    data,
  });
}

// Get query parameters with defaults
export function getQueryParams(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  return {
    page: parseInt(searchParams.get('page') || '1'),
    limit: parseInt(searchParams.get('limit') || '10'),
    search: searchParams.get('search') || undefined,
    status: searchParams.get('status') || undefined,
    priority: searchParams.get('priority') || undefined,
    category: searchParams.get('category') || undefined,
    assignedToId: searchParams.get('assignedToId') || undefined,
    orderId: searchParams.get('orderId') || undefined,
    client: searchParams.get('client') || undefined,
  };
}

// Generate pagination metadata
export function getPaginationMeta(total: number, page: number, limit: number) {
  const totalPages = Math.ceil(total / limit);
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;

  return {
    total,
    page,
    limit,
    totalPages,
    hasNextPage,
    hasPrevPage,
  };
}

// Build dynamic where clause for Prisma
export function buildWhereClause(filters: Record<string, any>) {
  const where: Record<string, any> = {};

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      if (key === 'search') {
        where.OR = [
          { title: { contains: value, mode: 'insensitive' } },
          { description: { contains: value, mode: 'insensitive' } },
        ];
      } else {
        where[key] = value;
      }
    }
  });

  return where;
}

// Format date for API responses
export function formatDate(date: Date | string) {
  return new Date(date).toISOString();
}

// Generate unique order number
export function generateOrderNumber() {
  const timestamp = Date.now().toString();
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `ORD-${timestamp.slice(-6)}${random}`;
}

// Calculate progress percentage
export function calculateProgress(completed: number, total: number) {
  if (total === 0) return 0;
  return Math.round((completed / total) * 100);
}

// Validate file type and size
export function validateFile(file: File, allowedTypes: string[], maxSize: number) {
  const errors: string[] = [];

  if (!allowedTypes.includes(file.type)) {
    errors.push(`File type ${file.type} is not allowed`);
  }

  if (file.size > maxSize) {
    errors.push(`File size ${file.size} exceeds maximum allowed size of ${maxSize}`);
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

// Create activity log entry
export async function createActivityLog(
  type: string,
  title: string,
  userId: string,
  description?: string,
  metadata?: Record<string, any>
) {
  const { db } = await import('./db');
  
  return db.activity.create({
    data: {
      type: type as any,
      title,
      description,
      metadata,
      userId,
    },
  });
}

// Extract user ID from headers (for authentication)
export async function getUserIdFromRequest(request: NextRequest): Promise<string | null> {
  // This would typically extract from JWT token or session
  // For now, returning a default user ID
  const userId = request.headers.get('x-user-id');
  
  if (userId && userId !== 'default-user-id') {
    return userId;
  }
  
  // Fallback to first user in database
  try {
    const { db } = await import('./db');
    const firstUser = await db.user.findFirst();
    console.log('Using fallback user:', firstUser?.id, firstUser?.email);
    return firstUser?.id || null;
  } catch (error) {
    console.warn('Failed to get default user:', error);
    return null;
  }
}

// CORS headers
export function setCorsHeaders(response: NextResponse) {
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-user-id');
  return response;
}
