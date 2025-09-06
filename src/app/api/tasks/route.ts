import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { CreateTaskSchema, TaskFilterSchema, PaginationSchema } from '@/lib/validations';
import { handleError, successResponse, getQueryParams, getPaginationMeta, buildWhereClause, createActivityLog, getUserIdFromRequest } from '@/lib/utils';

export async function GET(request: NextRequest) {
  try {
    const queryParams = getQueryParams(request);
    
    // Validate query parameters
    const pagination = PaginationSchema.parse({
      page: queryParams.page,
      limit: queryParams.limit,
    });
    
    const filters = TaskFilterSchema.parse({
      status: queryParams.status,
      priority: queryParams.priority,
      category: queryParams.category,
      assignedToId: queryParams.assignedToId,
      orderId: queryParams.orderId,
      search: queryParams.search,
    });

    // Build where clause
    const where = buildWhereClause(filters);

    // Get total count
    const total = await db.task.count({ where });

    // Get tasks with pagination
    const tasks = await db.task.findMany({
      where,
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        order: {
          select: {
            id: true,
            orderNumber: true,
            client: true,
            product: true,
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
      tasks,
      pagination: paginationMeta,
    });
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = CreateTaskSchema.parse(body);
    
    const userId = getUserIdFromRequest(request);
    if (!userId) {
      return handleError(new Error('User not authenticated'));
    }

    // Create task
    const task = await db.task.create({
      data: {
        ...validatedData,
        dueDate: validatedData.dueDate ? new Date(validatedData.dueDate) : null,
        createdById: userId,
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        order: {
          select: {
            id: true,
            orderNumber: true,
            client: true,
            product: true,
          },
        },
      },
    });

    // Create activity log
    await createActivityLog(
      'TASK_CREATED',
      `Task created: ${task.title}`,
      userId,
      `New task created in ${task.category} category`,
      { taskId: task.id, category: task.category }
    );

    return successResponse(task, 'Task created successfully');
  } catch (error) {
    return handleError(error);
  }
}
