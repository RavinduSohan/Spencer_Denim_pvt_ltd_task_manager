import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from './auth';

export async function getAuthenticatedUser(request: NextRequest) {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user) {
    return null;
  }

  return session.user;
}

export async function requireAuth(request: NextRequest) {
  const user = await getAuthenticatedUser(request);
  
  if (!user) {
    throw new Error('Authentication required');
  }

  return user;
}

export async function requireRole(request: NextRequest, requiredRoles: string[]) {
  const user = await requireAuth(request);
  
  if (!requiredRoles.includes(user.role)) {
    throw new Error('Insufficient permissions');
  }

  return user;
}
