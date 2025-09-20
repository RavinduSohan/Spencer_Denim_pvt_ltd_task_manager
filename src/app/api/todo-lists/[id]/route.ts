import { NextRequest } from 'next/server';
import { getDatabaseClient } from '@/lib/server-database';
import { handleError, successResponse } from '@/lib/utils';
import { requireAuth } from '@/lib/auth-utils';
import { z } from 'zod';

const UpdateTodoListSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  color: z.string().optional(),
  icon: z.string().optional(),
  isArchived: z.boolean().optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth(request);
    const { id } = await params;
    const db = getDatabaseClient(request);

    const todoList = await db.todoList.findUnique({
      where: { id },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        todos: {
          include: {
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
            _count: {
              select: {
                comments: true,
                attachments: true,
              },
            },
          },
          orderBy: [
            { priority: 'desc' },
            { dueDate: 'asc' },
            { createdAt: 'desc' },
          ],
        },
      },
    });

    if (!todoList) {
      return handleError(new Error('Todo list not found'));
    }

    return successResponse(todoList);
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
    const validatedData = UpdateTodoListSchema.parse(body);
    
    const db = getDatabaseClient(request);

    const todoList = await db.todoList.update({
      where: { id },
      data: validatedData,
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            todos: true,
          },
        },
      },
    });

    return successResponse(todoList, 'Todo list updated successfully');
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

    // Check if todo list exists
    const todoList = await db.todoList.findUnique({
      where: { id },
    });

    if (!todoList) {
      return handleError(new Error('Todo list not found'));
    }

    // Delete the todo list (this will cascade delete all todos and dependencies)
    await db.todoList.delete({
      where: { id },
    });

    return successResponse(null, 'Todo list deleted successfully');
  } catch (error) {
    return handleError(error);
  }
}