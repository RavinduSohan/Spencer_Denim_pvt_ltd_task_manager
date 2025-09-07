import React, { useState } from 'react';
import { TaskStatus, Priority, TaskCategory, OrderStatus } from '@/types';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'tasks' | 'orders';
  onExport: (filters: any) => void;
}

export function ExportModal({ isOpen, onClose, type, onExport }: ExportModalProps) {
  const [filters, setFilters] = useState({
    dateFrom: '',
    dateTo: '',
    status: '',
    priority: '',
    category: '',
    client: '',
    assignedToId: '',
    orderId: '',
  });

  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      // Build search string with date filters
      let search = '';
      if (filters.dateFrom) search += `dateFrom:${filters.dateFrom},`;
      if (filters.dateTo) search += `dateTo:${filters.dateTo},`;
      
      const exportFilters = {
        search: search || undefined,
        status: filters.status || undefined,
        priority: type === 'tasks' ? (filters.priority || undefined) : undefined,
        category: type === 'tasks' ? (filters.category || undefined) : undefined,
        client: type === 'orders' ? (filters.client || undefined) : undefined,
        assignedToId: type === 'tasks' ? (filters.assignedToId || undefined) : undefined,
        orderId: type === 'tasks' ? (filters.orderId || undefined) : undefined,
      };

      await onExport(exportFilters);
      onClose();
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Export {type === 'tasks' ? 'Tasks' : 'Orders'}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4">
          {/* Date Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date Range (Optional)
            </label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => setFilters({...filters, dateFrom: e.target.value})}
                className="border border-gray-300 rounded px-3 py-2 text-sm"
                placeholder="From"
              />
              <input
                type="date"
                value={filters.dateTo}
                onChange={(e) => setFilters({...filters, dateTo: e.target.value})}
                className="border border-gray-300 rounded px-3 py-2 text-sm"
                placeholder="To"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status (Optional)
            </label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({...filters, status: e.target.value})}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
            >
              <option value="">All Statuses</option>
              {type === 'tasks' ? (
                Object.values(TaskStatus).map(status => (
                  <option key={status} value={status}>{status}</option>
                ))
              ) : (
                Object.values(OrderStatus).map(status => (
                  <option key={status} value={status}>{status}</option>
                ))
              )}
            </select>
          </div>

          {/* Task-specific filters */}
          {type === 'tasks' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Priority (Optional)
                </label>
                <select
                  value={filters.priority}
                  onChange={(e) => setFilters({...filters, priority: e.target.value})}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                >
                  <option value="">All Priorities</option>
                  {Object.values(Priority).map(priority => (
                    <option key={priority} value={priority}>{priority}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category (Optional)
                </label>
                <select
                  value={filters.category}
                  onChange={(e) => setFilters({...filters, category: e.target.value})}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                >
                  <option value="">All Categories</option>
                  {Object.values(TaskCategory).map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
            </>
          )}

          {/* Order-specific filters */}
          {type === 'orders' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Client (Optional)
              </label>
              <input
                type="text"
                value={filters.client}
                onChange={(e) => setFilters({...filters, client: e.target.value})}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                placeholder="Client name"
              />
            </div>
          )}

          {/* Export Info */}
          <div className="bg-blue-50 p-3 rounded text-sm text-blue-800">
            <p><strong>Export will include:</strong></p>
            <ul className="mt-1 space-y-1">
              {type === 'tasks' ? (
                <>
                  <li>• Task details, status, priority, category</li>
                  <li>• Assigned user and creator information</li>
                  <li>• Dates (created, due, completed)</li>
                  <li>• Associated order information</li>
                </>
              ) : (
                <>
                  <li>• Order details, client, product info</li>
                  <li>• Status, progress, ship date</li>
                  <li>• Creator information</li>
                  <li>• Task and document counts</li>
                </>
              )}
            </ul>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
            disabled={isExporting}
          >
            Cancel
          </button>
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="flex-1 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
          >
            {isExporting ? 'Exporting...' : '📊 Export to Excel'}
          </button>
        </div>
      </div>
    </div>
  );
}
