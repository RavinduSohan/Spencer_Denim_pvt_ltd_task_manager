import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { CreateOrderSchema, OrderFilterSchema, PaginationSchema } from '@/lib/validations';
import { handleError, successResponse, getQueryParams, getPaginationMeta, buildWhereClause, createActivityLog, getUserIdFromRequest, generateOrderNumber } from '@/lib/utils';

export async function GET(request: NextRequest) {
  try {
    const queryParams = getQueryParams(request);
    
    // Validate query parameters
    const pagination = PaginationSchema.parse({
      page: queryParams.page,
      limit: queryParams.limit,
    });
    
    const filters = OrderFilterSchema.parse({
      status: queryParams.status,
      client: queryParams.client,
      search: queryParams.search,
    });

    // Build where clause
    const where = buildWhereClause(filters);
    
    // Handle client filter
    if (filters.client) {
      where.client = { contains: filters.client, mode: 'insensitive' };
    }

    // Get total count
    const total = await db.order.count({ where });

    // Get orders with pagination
    const orders = await db.order.findMany({
      where,
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        tasks: {
          select: {
            id: true,
            title: true,
            status: true,
            priority: true,
          },
        },
        documents: {
          select: {
            id: true,
            name: true,
            category: true,
          },
        },
        _count: {
          select: {
            tasks: true,
            documents: true,
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
      orders,
      pagination: paginationMeta,
    });
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = CreateOrderSchema.parse(body);
    
    const userId = await getUserIdFromRequest(request);
    if (!userId) {
      return handleError(new Error('User not authenticated'));
    }

    // Generate order number if not provided
    const orderNumber = validatedData.orderNumber || generateOrderNumber();

    // Create order
    const order = await db.order.create({
      data: {
        ...validatedData,
        orderNumber,
        shipDate: new Date(validatedData.shipDate),
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
        tasks: {
          select: {
            id: true,
            title: true,
            status: true,
            priority: true,
          },
        },
        documents: {
          select: {
            id: true,
            name: true,
            category: true,
          },
        },
        _count: {
          select: {
            tasks: true,
            documents: true,
          },
        },
      },
    });

    // Create activity log
    await createActivityLog(
      'ORDER_CREATED',
      `Order created: ${order.orderNumber}`,
      userId,
      `New order for ${order.client} - ${order.product}`,
      { orderId: order.id, client: order.client, product: order.product }
    );

    return successResponse(order, 'Order created successfully');
  } catch (error) {
    return handleError(error);
  }
}
