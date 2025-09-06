import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { CreateUserSchema, PaginationSchema } from '@/lib/validations';
import { handleError, successResponse, getQueryParams, getPaginationMeta, createActivityLog, getUserIdFromRequest } from '@/lib/utils';

export async function GET(request: NextRequest) {
  try {
    const queryParams = getQueryParams(request);
    
    // Validate query parameters
    const pagination = PaginationSchema.parse({
      page: queryParams.page,
      limit: queryParams.limit,
    });

    const where: any = {};
    
    // Search functionality
    if (queryParams.search) {
      where.OR = [
        { name: { contains: queryParams.search, mode: 'insensitive' } },
        { email: { contains: queryParams.search, mode: 'insensitive' } },
      ];
    }

    // Get total count
    const total = await db.user.count({ where });

    // Get users with pagination
    const users = await db.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        phone: true,
        avatar: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            tasks: true,
            assignedTasks: true,
            documents: true,
            orders: true,
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
      users,
      pagination: paginationMeta,
    });
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = CreateUserSchema.parse(body);
    
    const currentUserId = await getUserIdFromRequest(request);
    if (!currentUserId) {
      return handleError(new Error('User not authenticated'));
    }

    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email: validatedData.email },
    });

    if (existingUser) {
      return handleError(new Error('User with this email already exists'));
    }

    // Create user
    const user = await db.user.create({
      data: validatedData,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        phone: true,
        avatar: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // Create activity log
    await createActivityLog(
      'USER_LOGIN',
      `User created: ${user.name}`,
      currentUserId,
      `New user registered with email ${user.email}`,
      { userId: user.id, email: user.email, role: user.role }
    );

    return successResponse(user, 'User created successfully');
  } catch (error) {
    return handleError(error);
  }
}
