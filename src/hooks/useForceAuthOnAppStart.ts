import { useEffect, useRef } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export const useForceAuthOnAppStart = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const hasProcessedInitialLoad = useRef(false);

  useEffect(() => {
    // Only process once per component mount
    if (hasProcessedInitialLoad.current || status === 'loading') {
      return;
    }

    const processAppStart = async () => {
      // Check for app restart markers
      const appSessionActive = sessionStorage.getItem('app-session-active');
      const lastAppClose = localStorage.getItem('last-app-close');
      const currentTime = Date.now();
      const isOnAuthPage = window.location.pathname.startsWith('/auth/');

      // If no session marker in sessionStorage, this is likely a fresh app start
      const isFreshAppStart = !appSessionActive;

      if (isFreshAppStart && !isOnAuthPage) {
        console.log('🔄 Fresh app start detected - redirecting to auth');
        
        // Clear any existing session only if we're not on auth pages
        if (session) {
          console.log('🚪 Clearing existing session and redirecting to auth');
          await signOut({ redirect: false });
        }
        
        // Mark that we've processed this load
        sessionStorage.setItem('app-session-active', 'true');
        localStorage.setItem('app-last-start', currentTime.toString());
        
        // Redirect to auth only if not already on auth page
        router.push('/auth/signin');
      } else if (session) {
        // App session is already active and user is logged in, or we're on auth pages
        console.log('✅ Continuing existing session or on auth page');
        sessionStorage.setItem('app-session-active', 'true');
      } else if (isOnAuthPage) {
        // We're on auth pages, mark session as potentially starting
        sessionStorage.setItem('app-session-active', 'true');
      }

      hasProcessedInitialLoad.current = true;
    };

    processAppStart();
  }, [session, status, router]);

  useEffect(() => {
    // Mark session as active when user successfully logs in
    if (session && hasProcessedInitialLoad.current) {
      sessionStorage.setItem('app-session-active', 'true');
      console.log('✅ Session marked as active after login');
    }
  }, [session]);

  useEffect(() => {
    // Handle app close/reload - only clear session markers on actual app close
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      // Only clear session markers if this is an actual app close, not a navigation
      localStorage.setItem('last-app-close', Date.now().toString());
      // Don't remove app-session-active on navigation - only on actual app close
      if (e.type === 'beforeunload') {
        sessionStorage.removeItem('app-session-active');
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        // App is being hidden/minimized
        localStorage.setItem('app-last-hidden', Date.now().toString());
      }
    };

    // Handle actual page unload (not just navigation)
    const handleUnload = () => {
      sessionStorage.removeItem('app-session-active');
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('unload', handleUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('unload', handleUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);
};