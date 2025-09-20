import { NextRequest } from 'next/server';
import { getDatabaseClient } from '@/lib/server-database';
import { handleError, successResponse } from '@/lib/utils';
import { requireAuth } from '@/lib/auth-utils';
import { z } from 'zod';

const UpdateTodoItemSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  status: z.enum(['PENDING', 'IN_PROGRESS', 'ON_HOLD', 'COMPLETED', 'CANCELLED', 'DELAYED']).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT', 'CRITICAL']).optional(),
  startDate: z.string().optional().transform(val => val ? new Date(val) : undefined),
  dueDate: z.string().optional().transform(val => val ? new Date(val) : undefined),
  progress: z.number().min(0).max(100).optional(),
  estimatedHours: z.number().optional(),
  actualHours: z.number().optional(),
  assignedToId: z.string().optional().transform(val => !val || val === '' ? undefined : val),
  tags: z.array(z.string()).optional(),
  isDelayed: z.boolean().optional(),
  delayReason: z.string().optional(),
});

// Date propagation utility
async function propagateDateChanges(db: any, todoId: string, oldDueDate: Date | null, newDueDate: Date | null) {
  if (!oldDueDate || !newDueDate) return;
  
  const daysDifference = Math.floor((newDueDate.getTime() - oldDueDate.getTime()) / (1000 * 60 * 60 * 24));
  
  if (daysDifference === 0) return;

  // Get all dependent todos (todos that depend on this one)
  const dependencies = await db.todoDependency.findMany({
    where: { dependsOnId: todoId },
    include: {
      blockedBy: true,
    },
  });

  // Update each dependent todo's dates
  for (const dependency of dependencies) {
    const dependentTodo = dependency.blockedBy;
    
    if (dependentTodo.startDate) {
      const newStartDate = new Date(dependentTodo.startDate);
      newStartDate.setDate(newStartDate.getDate() + daysDifference + dependency.lagDays);
      
      await db.todoItem.update({
        where: { id: dependentTodo.id },
        data: { 
          startDate: newStartDate,
          isDelayed: daysDifference > 0,
          delayReason: daysDifference > 0 ? `Delayed due to dependency` : null,
        },
      });
    }
    
    if (dependentTodo.dueDate) {
      const newDependentDueDate = new Date(dependentTodo.dueDate);
      newDependentDueDate.setDate(newDependentDueDate.getDate() + daysDifference + dependency.lagDays);
      
      await db.todoItem.update({
        where: { id: dependentTodo.id },
        data: { 
          dueDate: newDependentDueDate,
          isDelayed: daysDifference > 0,
          delayReason: daysDifference > 0 ? `Delayed due to dependency` : null,
        },
      });
      
      // Recursively propagate to further dependencies
      await propagateDateChanges(db, dependentTodo.id, dependentTodo.dueDate, newDependentDueDate);
    }
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth(request);
    const { id } = await params;
    const db = getDatabaseClient(request);

    const todo = await db.todoItem.findUnique({
      where: { id },
      include: {
        todoList: {
          select: {
            id: true,
            name: true,
            color: true,
            icon: true,
          },
        },
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        dependencies: {
          include: {
            dependsOn: {
              select: {
                id: true,
                title: true,
                status: true,
                dueDate: true,
              },
            },
          },
        },
        dependents: {
          include: {
            blockedBy: {
              select: {
                id: true,
                title: true,
                status: true,
                startDate: true,
              },
            },
          },
        },
        comments: {
          include: {
            author: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
        attachments: {
          include: {
            uploadedBy: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
          orderBy: {
            uploadedAt: 'desc',
          },
        },
      },
    });

    if (!todo) {
      return handleError(new Error('Todo not found'));
    }

    return successResponse(todo);
  } catch (error) {
    return handleError(error);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth(request);
    const { id } = await params;
    const body = await request.json();
    const validatedData = UpdateTodoItemSchema.parse(body);
    
    const db = getDatabaseClient(request);

    // Get the current todo to check for date changes
    const currentTodo = await db.todoItem.findUnique({
      where: { id },
    });

    if (!currentTodo) {
      return handleError(new Error('Todo not found'));
    }

    // Handle completion
    const updateData: any = { ...validatedData };
    if (validatedData.status === 'COMPLETED' && currentTodo.status !== 'COMPLETED') {
      updateData.completedAt = new Date();
      updateData.progress = 100;
    } else if (validatedData.status !== 'COMPLETED' && currentTodo.status === 'COMPLETED') {
      updateData.completedAt = null;
    }

    // Update the todo
    const todo = await db.todoItem.update({
      where: { id },
      data: updateData,
      include: {
        todoList: {
          select: {
            id: true,
            name: true,
            color: true,
          },
        },
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        dependencies: {
          include: {
            dependsOn: {
              select: {
                id: true,
                title: true,
                status: true,
              },
            },
          },
        },
        dependents: {
          include: {
            blockedBy: {
              select: {
                id: true,
                title: true,
                status: true,
              },
            },
          },
        },
      },
    });

    // Propagate date changes if due date changed
    if (validatedData.dueDate && currentTodo.dueDate) {
      await propagateDateChanges(db, id, currentTodo.dueDate, validatedData.dueDate);
    }

    return successResponse(todo, 'Todo updated successfully');
  } catch (error) {
    return handleError(error);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth(request);
    const { id } = await params;
    const db = getDatabaseClient(request);

    // Check if todo exists
    const todo = await db.todoItem.findUnique({
      where: { id },
    });

    if (!todo) {
      return handleError(new Error('Todo not found'));
    }

    // Delete dependencies first
    await db.todoDependency.deleteMany({
      where: {
        OR: [
          { dependsOnId: id },
          { blockedById: id },
        ],
      },
    });

    // Delete the todo item
    await db.todoItem.delete({
      where: { id },
    });

    return successResponse(null, 'Todo deleted successfully');
  } catch (error) {
    return handleError(error);
  }
}