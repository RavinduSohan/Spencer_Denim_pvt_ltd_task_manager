import { NextRequest } from 'next/server';
import { getDatabaseClient } from '@/lib/server-database';
import { handleError, successResponse } from '@/lib/utils';
import { requireAuth } from '@/lib/auth-utils';
import { z } from 'zod';

const CreateDependencySchema = z.object({
  dependsOnId: z.string(),
  blockedById: z.string(),
  type: z.enum(['FINISH_TO_START', 'START_TO_START', 'FINISH_TO_FINISH', 'START_TO_FINISH']).default('FINISH_TO_START'),
  lagDays: z.number().default(0),
});

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    const db = getDatabaseClient(request);
    const body = await request.json();
    
    const validatedData = CreateDependencySchema.parse(body);

    // Check if both todos exist
    const [dependsOn, blockedBy] = await Promise.all([
      db.todoItem.findUnique({ where: { id: validatedData.dependsOnId } }),
      db.todoItem.findUnique({ where: { id: validatedData.blockedById } }),
    ]);

    if (!dependsOn || !blockedBy) {
      return handleError(new Error('One or both todos not found'));
    }

    // Check if dependency already exists
    const existingDependency = await db.todoDependency.findUnique({
      where: {
        dependsOnId_blockedById: {
          dependsOnId: validatedData.dependsOnId,
          blockedById: validatedData.blockedById,
        },
      },
    });

    if (existingDependency) {
      return handleError(new Error('Dependency already exists'));
    }

    // Check for circular dependencies
    const wouldCreateCircle = await checkCircularDependency(
      db, 
      validatedData.dependsOnId, 
      validatedData.blockedById
    );

    if (wouldCreateCircle) {
      return handleError(new Error('This would create a circular dependency'));
    }

    const dependency = await db.todoDependency.create({
      data: validatedData,
      include: {
        dependsOn: {
          select: {
            id: true,
            title: true,
            status: true,
            dueDate: true,
          },
        },
        blockedBy: {
          select: {
            id: true,
            title: true,
            status: true,
            startDate: true,
          },
        },
      },
    });

    return successResponse(dependency, 'Dependency created successfully');
  } catch (error) {
    return handleError(error);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    const db = getDatabaseClient(request);
    const { searchParams } = new URL(request.url);
    
    const dependsOnId = searchParams.get('dependsOnId');
    const blockedById = searchParams.get('blockedById');

    if (!dependsOnId || !blockedById) {
      return handleError(new Error('Both dependsOnId and blockedById are required'));
    }

    const dependency = await db.todoDependency.findUnique({
      where: {
        dependsOnId_blockedById: {
          dependsOnId,
          blockedById,
        },
      },
    });

    if (!dependency) {
      return handleError(new Error('Dependency not found'));
    }

    await db.todoDependency.delete({
      where: {
        dependsOnId_blockedById: {
          dependsOnId,
          blockedById,
        },
      },
    });

    return successResponse(null, 'Dependency removed successfully');
  } catch (error) {
    return handleError(error);
  }
}

// Utility function to check for circular dependencies
async function checkCircularDependency(
  db: any, 
  dependsOnId: string, 
  blockedById: string, 
  visited: Set<string> = new Set()
): Promise<boolean> {
  if (visited.has(dependsOnId)) {
    return dependsOnId === blockedById;
  }

  visited.add(dependsOnId);

  const dependencies = await db.todoDependency.findMany({
    where: { blockedById: dependsOnId },
    select: { dependsOnId: true },
  });

  for (const dep of dependencies) {
    if (await checkCircularDependency(db, dep.dependsOnId, blockedById, visited)) {
      return true;
    }
  }

  return false;
}