'use client';

import AuthWrapper from '@/components/AuthWrapper';
import EnhancedDashboard from '@/components/EnhancedDashboard';

export default function HomePage() {
  return (
    <AuthWrapper>
      <EnhancedDashboard />
    </AuthWrapper>
  );
}
