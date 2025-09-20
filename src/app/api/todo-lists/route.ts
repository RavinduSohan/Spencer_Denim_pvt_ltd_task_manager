import { NextRequest } from 'next/server';
import { getDatabaseClient } from '@/lib/server-database';
import { handleError, successResponse } from '@/lib/utils';
import { requireAuth } from '@/lib/auth-utils';
import { z } from 'zod';

const CreateTodoListSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  color: z.string().default('#3B82F6'),
  icon: z.string().default('📝'),
});

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    const db = getDatabaseClient(request);

    const todoLists = await db.todoList.findMany({
      where: {
        isArchived: false,
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        todos: {
          select: {
            id: true,
            status: true,
            priority: true,
          },
        },
        _count: {
          select: {
            todos: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Add completion stats
    const todoListsWithStats = todoLists.map((list: any) => {
      console.log('Processing list:', list.id, 'with todos:', list.todos.length); // Debug log
      const stats = {
        total: list._count.todos,
        completed: list.todos.filter((todo: any) => todo.status === 'COMPLETED').length,
        pending: list.todos.filter((todo: any) => todo.status === 'PENDING').length,
        inProgress: list.todos.filter((todo: any) => todo.status === 'IN_PROGRESS').length,
        delayed: list.todos.filter((todo: any) => todo.status === 'DELAYED').length,
      };
      console.log('Calculated stats for list', list.id, ':', stats); // Debug log
      return {
        ...list,
        stats,
      };
    });

    console.log('Final todo lists with stats:', todoListsWithStats); // Debug log

    return successResponse({
      todoLists: todoListsWithStats,
      total: todoListsWithStats.length,
    });
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    const db = getDatabaseClient(request);
    const body = await request.json();
    
    const validatedData = CreateTodoListSchema.parse(body);

    const todoList = await db.todoList.create({
      data: {
        ...validatedData,
        createdById: user.id,
      },
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

    return successResponse(todoList, 'Todo list created successfully');
  } catch (error) {
    return handleError(error);
  }
}