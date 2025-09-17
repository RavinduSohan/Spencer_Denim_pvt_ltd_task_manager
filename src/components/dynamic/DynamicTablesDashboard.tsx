'use client';

import React, { useState, useEffect } from 'react';
import { TableConfigService } from '@/lib/table-config-service';
import { DynamicTableViewer } from './DynamicTableViewer';
import { TableConfigManager } from './TableConfigManager';
import { 
  getTableColorTheme, 
  getPremiumCardClasses,
  getPremiumHeaderClasses,
  getPremiumButtonClasses,
  getPremiumBadgeClasses
} from '@/lib/premium-colors';

interface TableInfo {
  name: string;
  config: any;
  stats: {
    recordCount: number;
    columns: number;
  } | null;
}

export function DynamicTablesDashboard() {
  const [tables, setTables] = useState<TableInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [showConfigManager, setShowConfigManager] = useState(false);

  // Load available tables
  const loadTables = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/table-configs');
      const result = await response.json();

      if (result.success) {
        setTables(result.data.tables || []);
      } else {
        setError(result.error || 'Failed to load tables');
      }
    } catch (err) {
      setError('Failed to load tables');
      console.error('Error loading tables:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTables();
  }, []);

  // Handle table refresh
  const handleRefresh = () => {
    loadTables();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading tables...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        {error}
        <button
          onClick={loadTables}
          className="ml-2 text-red-800 hover:text-red-900 underline"
        >
          Retry
        </button>
      </div>
    );
  }

  // If a table is selected, show the table viewer
  if (selectedTable) {
    const table = tables.find(t => t.name === selectedTable);
    if (table) {
      return (
        <div>
          <div className="mb-4">
            <button
              onClick={() => setSelectedTable(null)}
              className="text-blue-600 hover:text-blue-800 flex items-center"
            >
              ← Back to Tables
            </button>
          </div>
          <DynamicTableViewer
            tableName={selectedTable}
            config={table.config}
            onRefresh={handleRefresh}
          />
        </div>
      );
    }
  }

  // Show config manager
  if (showConfigManager) {
    return (
      <div>
        <div className="mb-4">
          <button
            onClick={() => setShowConfigManager(false)}
            className="text-blue-600 hover:text-blue-800 flex items-center"
          >
            ← Back to Tables
          </button>
        </div>
        <TableConfigManager onSave={handleRefresh} />
      </div>
    );
  }

  // Show tables dashboard
  return (
    <div className="space-y-8 p-6">
      {/* Premium Header */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-2xl shadow-2xl p-8 text-white">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold mb-2">Dynamic Tables</h1>
            <p className="text-white/90 text-lg">
              Manage your custom database tables and data
            </p>
          </div>
          <button
            onClick={() => setShowConfigManager(true)}
            className="bg-white/20 backdrop-blur-sm text-white px-6 py-3 rounded-xl hover:bg-white/30 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl hover:scale-105 border border-white/20"
          >
            <span className="flex items-center space-x-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span>Create Table</span>
            </span>
          </button>
        </div>
      </div>

      {/* Tables Grid */}
      {tables.length === 0 ? (
        <div className="text-center py-16 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border-2 border-dashed border-gray-300">
          <svg className="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <div className="text-gray-500 text-xl font-medium mb-4">No tables configured yet</div>
          <p className="text-gray-400 mb-6">Create your first dynamic table to get started</p>
          <button
            onClick={() => setShowConfigManager(true)}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl hover:scale-105"
          >
            Create Your First Table
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tables.map(table => {
            const colorTheme = getTableColorTheme(table.name);
            
            return (
              <div
                key={table.name}
                className={`${getPremiumCardClasses(colorTheme)} cursor-pointer group hover:scale-[1.02] transition-all duration-300`}
                onClick={() => setSelectedTable(table.name)}
              >
                {/* Premium Header */}
                <div className={getPremiumHeaderClasses(colorTheme)}>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-white">
                        {table.config.displayName}
                      </h3>
                      {table.config.description && (
                        <p className="text-white/90 text-sm mt-1 line-clamp-1">
                          {table.config.description}
                        </p>
                      )}
                    </div>
                    {table.config.icon && (
                      <span className="text-3xl opacity-80">{table.config.icon}</span>
                    )}
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-6 bg-white rounded-b-xl">
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="text-center">
                      <div className={`text-2xl font-bold ${colorTheme.text}`}>
                        {table.stats ? table.stats.recordCount.toLocaleString() : 'N/A'}
                      </div>
                      <div className="text-sm text-gray-500 font-medium">Records</div>
                    </div>
                    <div className="text-center">
                      <div className={`text-2xl font-bold ${colorTheme.text}`}>
                        {Object.keys(table.config.fields).length}
                      </div>
                      <div className="text-sm text-gray-500 font-medium">Fields</div>
                    </div>
                  </div>

                  {/* Permission Badges */}
                  <div className="flex justify-between items-center">
                    <div className="flex space-x-2">
                      {table.config.permissions?.create !== false && (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800 border border-green-200">
                          ✓ Create
                        </span>
                      )}
                      {table.config.permissions?.export !== false && (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">
                          📊 Export
                        </span>
                      )}
                    </div>
                    
                    <div className="text-xs text-gray-400 font-mono bg-gray-100 px-2 py-1 rounded">
                      {table.name}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedTable(table.name);
                      }}
                      className={getPremiumButtonClasses(colorTheme, 'primary')}
                    >
                      <span className="flex items-center space-x-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        <span>View Data</span>
                      </span>
                    </button>
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        // TODO: Open config editor for this table
                      }}
                      className={getPremiumButtonClasses(colorTheme, 'secondary')}
                    >
                      <span className="flex items-center space-x-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span>Configure</span>
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Premium Quick Stats */}
      {tables.length > 0 && (
        <div className="bg-gradient-to-r from-white to-gray-50 rounded-2xl shadow-xl border border-gray-200 p-8">
          <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center space-x-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <span>Overview</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center p-4 bg-blue-50 rounded-xl border border-blue-200">
              <div className="text-3xl font-bold text-blue-600 mb-1">
                {tables.length}
              </div>
              <div className="text-sm font-medium text-blue-500">Total Tables</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-xl border border-green-200">
              <div className="text-3xl font-bold text-green-600 mb-1">
                {tables.reduce((sum, table) => sum + (table.stats?.recordCount || 0), 0).toLocaleString()}
              </div>
              <div className="text-sm font-medium text-green-500">Total Records</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-xl border border-purple-200">
              <div className="text-3xl font-bold text-purple-600 mb-1">
                {tables.reduce((sum, table) => sum + Object.keys(table.config.fields).length, 0)}
              </div>
              <div className="text-sm font-medium text-purple-500">Total Fields</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-xl border border-orange-200">
              <div className="text-3xl font-bold text-orange-600 mb-1">
                {tables.filter(table => table.config.permissions?.export !== false).length}
              </div>
              <div className="text-sm font-medium text-orange-500">Exportable Tables</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}