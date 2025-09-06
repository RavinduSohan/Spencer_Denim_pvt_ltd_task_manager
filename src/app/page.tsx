'use client';

import AuthWrapper from '@/components/AuthWrapper';
import Header from '@/components/Header';
import EnhancedDashboard from '@/components/EnhancedDashboard';

export default function HomePage() {
  return (
    <AuthWrapper>
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main>
          <EnhancedDashboard />
        </main>
      </div>
    </AuthWrapper>
  );
}
