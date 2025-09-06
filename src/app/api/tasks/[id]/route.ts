import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { UpdateTaskSchema } from '@/lib/validations';
import { handleError, successResponse, createActivityLog, getUserIdFromRequest } from '@/lib/utils';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const task = await db.task.findUnique({
      where: { id: params.id },
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

    if (!task) {
      return handleError(new Error('Task not found'));
    }

    return successResponse(task);
  } catch (error) {
    return handleError(error);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const validatedData = UpdateTaskSchema.parse(body);
    
    const userId = getUserIdFromRequest(request);
    if (!userId) {
      return handleError(new Error('User not authenticated'));
    }

    // Check if task exists
    const existingTask = await db.task.findUnique({
      where: { id: params.id },
    });

    if (!existingTask) {
      return handleError(new Error('Task not found'));
    }

    // Update task
    const task = await db.task.update({
      where: { id: params.id },
      data: {
        ...validatedData,
        dueDate: validatedData.dueDate ? new Date(validatedData.dueDate) : undefined,
        completedAt: validatedData.status === 'COMPLETED' ? new Date() : null,
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
    const activityTitle = validatedData.status === 'COMPLETED' 
      ? `Task completed: ${task.title}`
      : `Task updated: ${task.title}`;

    await createActivityLog(
      validatedData.status === 'COMPLETED' ? 'TASK_COMPLETED' : 'TASK_UPDATED',
      activityTitle,
      userId,
      `Task status changed to ${task.status}`,
      { taskId: task.id, oldStatus: existingTask.status, newStatus: task.status }
    );

    return successResponse(task, 'Task updated successfully');
  } catch (error) {
    return handleError(error);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = getUserIdFromRequest(request);
    if (!userId) {
      return handleError(new Error('User not authenticated'));
    }

    // Check if task exists
    const task = await db.task.findUnique({
      where: { id: params.id },
    });

    if (!task) {
      return handleError(new Error('Task not found'));
    }

    // Delete task
    await db.task.delete({
      where: { id: params.id },
    });

    // Create activity log
    await createActivityLog(
      'TASK_UPDATED',
      `Task deleted: ${task.title}`,
      userId,
      `Task removed from ${task.category} category`,
      { taskId: task.id, category: task.category }
    );

    return successResponse(null, 'Task deleted successfully');
  } catch (error) {
    return handleError(error);
  }
}
