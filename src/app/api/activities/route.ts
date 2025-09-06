import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { PaginationSchema } from '@/lib/validations';
import { handleError, successResponse, getQueryParams, getPaginationMeta } from '@/lib/utils';

export async function GET(request: NextRequest) {
  try {
    const queryParams = getQueryParams(request);
    
    // Validate query parameters
    const pagination = PaginationSchema.parse({
      page: queryParams.page,
      limit: queryParams.limit,
    });

    const where: any = {};
    
    // Filter by activity type
    if (queryParams.status) {
      where.type = queryParams.status;
    }

    // Search functionality
    if (queryParams.search) {
      where.OR = [
        { title: { contains: queryParams.search, mode: 'insensitive' } },
        { description: { contains: queryParams.search, mode: 'insensitive' } },
      ];
    }

    // Get total count
    const total = await db.activity.count({ where });

    // Get activities with pagination
    const activities = await db.activity.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip: (pagination.page - 1) * pagination.limit,
      take: pagination.limit,
    });

    const paginationMeta = getPaginationMeta(total, pagination.page, pagination.limit);

    return successResponse({
      activities,
      pagination: paginationMeta,
    });
  } catch (error) {
    return handleError(error);
  }
}
