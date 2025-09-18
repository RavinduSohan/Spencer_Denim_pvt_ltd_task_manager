'use client';

import { SessionProvider } from 'next-auth/react';
import { ReactNode } from 'react';
import AppStartAuthCheck from './AppStartAuthCheck';

interface ProvidersProps {
  children: ReactNode;
}

export default function Providers({ children }: ProvidersProps) {
  return (
    <SessionProvider>
      <AppStartAuthCheck />
      {children}
    </SessionProvider>
  );
}
