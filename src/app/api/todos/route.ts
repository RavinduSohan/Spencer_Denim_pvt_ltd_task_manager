import { NextRequest } from 'next/server';
import { getDatabaseClient } from '@/lib/server-database';
import { handleError, successResponse } from '@/lib/utils';
import { requireAuth } from '@/lib/auth-utils';
import { z } from 'zod';

const CreateTodoItemSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT', 'CRITICAL']).default('MEDIUM'),
  startDate: z.string().optional().transform(val => val ? new Date(val) : undefined),
  dueDate: z.string().optional().transform(val => val ? new Date(val) : undefined),
  estimatedHours: z.number().optional(),
  assignedToId: z.string().optional().transform(val => !val || val === '' ? undefined : val),
  tags: z.array(z.string()).default([]).transform(val => JSON.stringify(val)), // Convert array to JSON string for SQLite
  todoListId: z.string(),
});

const UpdateTodoItemSchema = CreateTodoItemSchema.partial().extend({
  status: z.enum(['PENDING', 'IN_PROGRESS', 'ON_HOLD', 'COMPLETED', 'CANCELLED', 'DELAYED']).optional(),
  progress: z.number().min(0).max(100).optional(),
  actualHours: z.number().optional(),
  completedAt: z.string().optional().transform(val => val ? new Date(val) : null),
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
          delayReason: daysDifference > 0 ? `Delayed due to dependency on: ${oldDueDate.toDateString()}` : null,
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
          delayReason: daysDifference > 0 ? `Delayed due to dependency on: ${oldDueDate.toDateString()}` : null,
        },
      });
      
      // Recursively propagate to further dependencies
      await propagateDateChanges(db, dependentTodo.id, dependentTodo.dueDate, newDependentDueDate);
    }
  }
}

export async function GET(request: NextRequest) {
  try {
    console.log('Todos GET request received'); // Debug log
    const user = await requireAuth(request);
    console.log('User authenticated:', user.id); // Debug log
    
    const db = getDatabaseClient(request);
    const { searchParams } = new URL(request.url);
    
    const todoListId = searchParams.get('todoListId');
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    const assignedToId = searchParams.get('assignedToId');

    console.log('Query params:', { todoListId, status, priority, assignedToId }); // Debug log

    const where: any = {};
    
    if (todoListId) where.todoListId = todoListId;
    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (assignedToId) where.assignedToId = assignedToId;

    console.log('Where clause:', where); // Debug log

    const todos = await db.todoItem.findMany({
      where,
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
    });

    console.log('Found todos:', todos.length, todos); // Debug log

    const response = {
      todos,
      total: todos.length,
    };
    
    console.log('Returning response:', response); // Debug log
    return successResponse(response);
  } catch (error) {
    console.error('Todos GET error:', error); // Debug log
    return handleError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('Todo creation request received'); // Debug log
    const user = await requireAuth(request);
    console.log('User authenticated:', user.id); // Debug log
    
    const db = getDatabaseClient(request);
    const body = await request.json();
    console.log('Request body:', body); // Debug log
    
    const validatedData = CreateTodoItemSchema.parse(body);
    console.log('Validated data:', validatedData); // Debug log

    const todo = await db.todoItem.create({
      data: {
        ...validatedData,
        createdById: user.id,
      },
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
      },
    });

    console.log('Todo created successfully:', todo.id); // Debug log
    return successResponse(todo, 'Todo item created successfully');
  } catch (error) {
    console.error('Todo creation error:', error); // Debug log
    return handleError(error);
  }
}