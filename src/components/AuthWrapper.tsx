'use client';

import { useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { useForceAuthOnAppStart } from '@/hooks/useForceAuthOnAppStart';

interface AuthWrapperProps {
  children: React.ReactNode;
}

export default function AuthWrapper({ children }: AuthWrapperProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  
  // Force authentication on fresh app starts
  useForceAuthOnAppStart();

  useEffect(() => {
    if (status === 'loading') return; // Still loading

    const isAuthPage = pathname?.startsWith('/auth/');

    // If no session and not on auth page, redirect to signin
    if (!session && !isAuthPage) {
      router.push('/auth/signin');
      return;
    }

    // If there's a session and we're on auth pages, redirect to dashboard
    if (session && isAuthPage) {
      console.log('✅ User logged in, redirecting to dashboard');
      router.push('/');
      return;
    }
  }, [session, status, router, pathname]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center gradient-luxury">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 backdrop-blur-sm rounded-2xl mb-4">
            <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          </div>
          <p className="text-white/80 font-light tracking-wide">Loading Spencer Denim...</p>
        </div>
      </div>
    );
  }

  // If no session and on auth page, show the auth page
  if (!session && pathname?.startsWith('/auth/')) {
    return <>{children}</>;
  }

  // If no session and not on auth page, show loading while redirecting
  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center gradient-luxury">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 backdrop-blur-sm rounded-2xl mb-4">
            <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          </div>
          <p className="text-white/80 font-light tracking-wide">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
