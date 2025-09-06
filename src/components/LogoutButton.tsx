'use client';

import { signOut } from 'next-auth/react';
import { useAuth } from '@/hooks/useAuth';

interface LogoutButtonProps {
  className?: string;
  children?: React.ReactNode;
}

export default function LogoutButton({ className = '', children }: LogoutButtonProps) {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) return null;

  return (
    <button
      onClick={() => signOut({ callbackUrl: '/auth/signin' })}
      className={`text-red-600 hover:text-red-800 transition-colors ${className}`}
    >
      {children || 'Sign Out'}
    </button>
  );
}
