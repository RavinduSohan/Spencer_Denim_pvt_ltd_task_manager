import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { UpdateOrderSchema } from '@/lib/validations';
import { handleError, successResponse, createActivityLog, getUserIdFromRequest } from '@/lib/utils';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const order = await db.order.findUnique({
      where: { id },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        tasks: {
          include: {
            assignedTo: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        documents: {
          include: {
            uploadedBy: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
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

    if (!order) {
      return handleError(new Error('Order not found'));
    }

    return successResponse(order);
  } catch (error) {
    return handleError(error);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const validatedData = UpdateOrderSchema.parse(body);
    
    const userId = await getUserIdFromRequest(request);
    if (!userId) {
      return handleError(new Error('User not authenticated'));
    }

    // Check if order exists
    const existingOrder = await db.order.findUnique({
      where: { id },
    });

    if (!existingOrder) {
      return handleError(new Error('Order not found'));
    }

    // Update order
    const order = await db.order.update({
      where: { id },
      data: {
        ...validatedData,
        shipDate: validatedData.shipDate ? new Date(validatedData.shipDate) : undefined,
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
          include: {
            assignedTo: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        documents: {
          include: {
            uploadedBy: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
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
      'ORDER_UPDATED',
      `Order updated: ${order.orderNumber}`,
      userId,
      `Order status changed to ${order.status}`,
      { 
        orderId: order.id, 
        oldStatus: existingOrder.status, 
        newStatus: order.status,
        progress: order.progress 
      }
    );

    return successResponse(order, 'Order updated successfully');
  } catch (error) {
    return handleError(error);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = await getUserIdFromRequest(request);
    if (!userId) {
      return handleError(new Error('User not authenticated'));
    }

    // Check if order exists
    const order = await db.order.findUnique({
      where: { id },
    });

    if (!order) {
      return handleError(new Error('Order not found'));
    }

    // Delete order (cascade will handle related records)
    await db.order.delete({
      where: { id },
    });

    // Create activity log
    await createActivityLog(
      'ORDER_UPDATED',
      `Order deleted: ${order.orderNumber}`,
      userId,
      `Order removed for ${order.client}`,
      { orderId: order.id, client: order.client }
    );

    return successResponse(null, 'Order deleted successfully');
  } catch (error) {
    return handleError(error);
  }
}
