'use client';

import { useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';

export default function AppStartAuthCheck() {
  const { data: session } = useSession();

  useEffect(() => {
    // Run only once when the app starts
    const checkAppStart = () => {
      const isAppRestart = !sessionStorage.getItem('app-initialized');
      
      if (isAppRestart) {
        console.log('🚀 App restart detected - clearing any existing sessions');
        
        // Mark app as initialized for this browser session
        sessionStorage.setItem('app-initialized', 'true');
        
        // If there's an existing session from previous app instance, clear it
        if (session) {
          console.log('🧹 Clearing persistent session from previous app instance');
          signOut({ redirect: false });
        }
        
        // Clean up any previous app data
        localStorage.setItem('app-start-time', Date.now().toString());
      }
    };

    checkAppStart();

    // Cleanup when app closes
    const handleBeforeUnload = () => {
      sessionStorage.removeItem('app-initialized');
      sessionStorage.removeItem('app-session-active');
      localStorage.setItem('app-close-time', Date.now().toString());
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [session]);

  return null; // This component doesn't render anything
}