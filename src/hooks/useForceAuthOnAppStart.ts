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

      // If no session marker in sessionStorage, this is likely a fresh app start
      const isFreshAppStart = !appSessionActive;

      if (isFreshAppStart) {
        console.log('🔄 Fresh app start detected');
        
        // Clear any existing session
        if (session) {
          console.log('🚪 Clearing existing session and redirecting to auth');
          await signOut({ redirect: false });
        }
        
        // Mark that we've processed this load
        sessionStorage.setItem('app-session-active', 'true');
        localStorage.setItem('app-last-start', currentTime.toString());
        
        // Redirect to auth
        router.push('/auth/signin');
      } else if (session) {
        // App session is already active and user is logged in
        console.log('✅ Continuing existing session');
      }

      hasProcessedInitialLoad.current = true;
    };

    processAppStart();
  }, [session, status, router]);

  useEffect(() => {
    // Mark session as active when user successfully logs in
    if (session && hasProcessedInitialLoad.current) {
      sessionStorage.setItem('app-session-active', 'true');
    }
  }, [session]);

  useEffect(() => {
    // Handle app close/reload
    const handleBeforeUnload = () => {
      localStorage.setItem('last-app-close', Date.now().toString());
      sessionStorage.removeItem('app-session-active');
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        // App is being hidden/minimized
        localStorage.setItem('app-last-hidden', Date.now().toString());
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);
};