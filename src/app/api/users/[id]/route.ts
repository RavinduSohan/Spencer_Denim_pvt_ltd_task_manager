import { NextRequest } from 'next/server';
import { sqliteDb } from '@/lib/db-sqlite';
import { UpdateUserSchema } from '@/lib/validations';
import { handleError, successResponse, createActivityLog, getUserIdFromRequest } from '@/lib/utils';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await sqliteDb.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        phone: true,
        avatar: true,
        createdAt: true,
        updatedAt: true,
        createdTasks: {
          take: 5,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            title: true,
            status: true,
            priority: true,
            category: true,
            dueDate: true,
          },
        },
        assignedTasks: {
          take: 5,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            title: true,
            status: true,
            priority: true,
            category: true,
            dueDate: true,
          },
        },
        _count: {
          select: {
            createdTasks: true,
            assignedTasks: true,
            documents: true,
            orders: true,
          },
        },
      },
    });

    if (!user) {
      return handleError(new Error('User not found'));
    }

    return successResponse(user);
  } catch (error) {
    return handleError(error);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await request.json();
    const validatedData = UpdateUserSchema.parse(body);
    
    const { id } = await params;
    const currentUserId = await getUserIdFromRequest(request);
    if (!currentUserId) {
      return handleError(new Error('User not authenticated'));
    }

    // Check if user exists
    const existingUser = await sqliteDb.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      return handleError(new Error('User not found'));
    }

    // Check if email is being changed and if it's already taken
    if (validatedData.email && validatedData.email !== existingUser.email) {
      const emailExists = await sqliteDb.user.findUnique({
        where: { email: validatedData.email },
      });

      if (emailExists) {
        return handleError(new Error('User with this email already exists'));
      }
    }

    // Update user
    const user = await sqliteDb.user.update({
      where: { id },
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
      `User updated: ${user.name}`,
      currentUserId,
      `User profile information updated`,
      { userId: user.id, changes: Object.keys(validatedData) }
    );

    return successResponse(user, 'User updated successfully');
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
    const currentUserId = await getUserIdFromRequest(request);
    if (!currentUserId) {
      return handleError(new Error('User not authenticated'));
    }

    // Check if user exists
    const user = await sqliteDb.user.findUnique({
      where: { id },
    });

    if (!user) {
      return handleError(new Error('User not found'));
    }

    // Prevent self-deletion
    if (id === currentUserId) {
      return handleError(new Error('Cannot delete your own account'));
    }

    // Delete user
    await sqliteDb.user.delete({
      where: { id },
    });

    // Create activity log
    await createActivityLog(
      'USER_LOGIN',
      `User deleted: ${user.name}`,
      currentUserId,
      `User account removed from system`,
      { userId: user.id, email: user.email }
    );

    return successResponse(null, 'User deleted successfully');
  } catch (error) {
    return handleError(error);
  }
}
