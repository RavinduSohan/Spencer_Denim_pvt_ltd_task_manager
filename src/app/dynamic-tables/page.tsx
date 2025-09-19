'use client';

import { DynamicTablesDashboard } from '@/components/dynamic/DynamicTablesDashboard';

export default function DynamicTablesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <DynamicTablesDashboard />
      </div>
    </div>
  );
}