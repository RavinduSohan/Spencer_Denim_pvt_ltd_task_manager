'use client';

import { useEffect, useState } from 'react';
import { DashboardStats } from '@/types';
import { dashboardApi } from '@/lib/api';

export default function HomePage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const data = await dashboardApi.getStats();
      setStats(data);
      setError(null);
    } catch (err) {
      setError('Failed to load dashboard data');
      console.error('Error loading dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 mb-4">⚠️ {error}</div>
          <button
            onClick={loadDashboardData}
            className="btn btn-primary"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <header className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-primary-600 to-primary-700 rounded-lg flex items-center justify-center text-white font-bold text-lg">
                SD
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Spencer Denim Industries</h1>
                <p className="text-gray-600 text-sm">Professional Task Management System</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="font-medium text-gray-900">T. Madusanka</div>
                <div className="text-sm text-gray-600">Senior Merchandiser</div>
                <div className="text-xs text-gray-500">
                  <a href="mailto:madusanka@spencerdenimsl.com" className="text-primary-600">
                    madusanka@spencerdenimsl.com
                  </a>
                  {' • '}
                  <a href="tel:+94751591577" className="text-primary-600">
                    +94 75 1591 577
                  </a>
                </div>
              </div>
              <button className="btn btn-primary">
                🔔 Notifications
              </button>
            </div>
          </div>
        </header>

        {/* Stats Grid */}
        {stats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="card p-6 border-l-4 border-l-primary-600">
              <div className="flex justify-between items-start">
                <div>
                  <div className="text-2xl font-bold text-gray-900">{stats.overview.activeOrders}</div>
                  <div className="text-gray-600 text-sm">Active Orders</div>
                  <div className="text-green-600 text-xs mt-1">
                    ↗️ +{stats.growth.orderGrowthRate}% from last month
                  </div>
                </div>
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center text-primary-600">
                  📋
                </div>
              </div>
            </div>

            <div className="card p-6 border-l-4 border-l-yellow-500">
              <div className="flex justify-between items-start">
                <div>
                  <div className="text-2xl font-bold text-gray-900">{stats.overview.pendingTasks}</div>
                  <div className="text-gray-600 text-sm">Pending Tasks</div>
                  <div className="text-yellow-600 text-xs mt-1">
                    📝 {stats.overview.totalTasks} total tasks
                  </div>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center text-yellow-600">
                  ⏰
                </div>
              </div>
            </div>

            <div className="card p-6 border-l-4 border-l-red-500">
              <div className="flex justify-between items-start">
                <div>
                  <div className="text-2xl font-bold text-gray-900">{stats.overview.urgentTasks}</div>
                  <div className="text-gray-600 text-sm">Urgent Issues</div>
                  <div className="text-red-600 text-xs mt-1">
                    ⚠️ Requires immediate attention
                  </div>
                </div>
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center text-red-600">
                  🚨
                </div>
              </div>
            </div>

            <div className="card p-6 border-l-4 border-l-green-500">
              <div className="flex justify-between items-start">
                <div>
                  <div className="text-2xl font-bold text-gray-900">{stats.overview.onTimeDeliveryRate}%</div>
                  <div className="text-gray-600 text-sm">On-Time Delivery</div>
                  <div className="text-green-600 text-xs mt-1">
                    ✅ {stats.overview.completionRate}% completion rate
                  </div>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center text-green-600">
                  ✅
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Simple Task List */}
        <div className="card p-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Recent Tasks</h2>
            <button className="btn btn-primary">
              ➕ Add Task
            </button>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
              <input type="checkbox" className="w-5 h-5 text-primary-600" />
              <div className="flex-1">
                <div className="font-medium text-gray-900">Review tech pack for summer dress collection</div>
                <div className="text-gray-600 text-sm">Complete technical review of all specifications</div>
                <div className="flex gap-2 mt-2">
                  <span className="status-badge status-pending">Pending</span>
                  <span className="priority-urgent">High Priority</span>
                </div>
              </div>
              <div className="text-gray-500 text-sm">Due: Sep 15</div>
            </div>

            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
              <input type="checkbox" className="w-5 h-5 text-primary-600" />
              <div className="flex-1">
                <div className="font-medium text-gray-900">Quality inspection for batch #4582</div>
                <div className="text-gray-600 text-sm">Conduct thorough quality inspection</div>
                <div className="flex gap-2 mt-2">
                  <span className="status-badge status-in-progress">In Progress</span>
                  <span className="priority-urgent">Urgent</span>
                </div>
              </div>
              <div className="text-gray-500 text-sm">Due: Sep 10</div>
            </div>

            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg opacity-75">
              <input type="checkbox" checked className="w-5 h-5 text-primary-600" />
              <div className="flex-1">
                <div className="font-medium text-gray-900 line-through">Prepare shipping documentation</div>
                <div className="text-gray-600 text-sm">Generate all required shipping documents</div>
                <div className="flex gap-2 mt-2">
                  <span className="status-badge status-completed">Completed</span>
                  <span className="priority-medium">Medium</span>
                </div>
              </div>
              <div className="text-gray-500 text-sm">Completed</div>
            </div>
          </div>
        </div>

        {/* Quick Info */}
        <div className="text-center text-gray-600 text-sm">
          <p>Spencer Denim Task Management System v1.0.0</p>
          <p>Built with Next.js 15, TypeScript, and Tailwind CSS</p>
        </div>
      </div>
    </div>
  );
}
