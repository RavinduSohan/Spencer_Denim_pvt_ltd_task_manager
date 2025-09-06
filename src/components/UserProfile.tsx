'use client';

import { useAuth } from '@/hooks/useAuth';
import { UserCircleIcon } from '@heroicons/react/24/outline';

export default function UserProfile() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div className="animate-pulse bg-gray-200 h-8 w-32 rounded"></div>;
  }

  if (!user) return null;

  return (
    <div className="flex items-center space-x-3 bg-white p-4 rounded-lg shadow">
      <div className="flex-shrink-0">
        {user.image ? (
          <img
            className="h-10 w-10 rounded-full"
            src={user.image}
            alt={user.name || ''}
          />
        ) : (
          <UserCircleIcon className="h-10 w-10 text-gray-400" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-gray-900 truncate">
          {user.name || 'Unknown User'}
        </p>
        <p className="text-sm text-gray-500 truncate">{user.email}</p>
        <p className="text-xs text-indigo-600 font-medium capitalize">
          {user.role}
        </p>
      </div>
    </div>
  );
}
