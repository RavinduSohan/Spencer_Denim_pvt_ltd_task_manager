'use client';

import React, { useState, useEffect } from 'react';
import { TableConfigService } from '@/lib/table-config-service';
import { DynamicTableViewer } from './DynamicTableViewer';
import { TableConfigManager } from './TableConfigManager';

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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Dynamic Tables</h1>
          <p className="text-gray-600 mt-1">
            Manage your custom database tables and data
          </p>
        </div>
        <button
          onClick={() => setShowConfigManager(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          Create Table
        </button>
      </div>

      {/* Tables Grid */}
      {tables.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <div className="text-gray-500 text-lg mb-4">No tables configured yet</div>
          <button
            onClick={() => setShowConfigManager(true)}
            className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors"
          >
            Create Your First Table
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tables.map(table => (
            <div
              key={table.name}
              className="bg-white rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => setSelectedTable(table.name)}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {table.config.displayName}
                  </h3>
                  {table.config.icon && (
                    <span className="text-2xl">{table.config.icon}</span>
                  )}
                </div>
                
                {table.config.description && (
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {table.config.description}
                  </p>
                )}

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Records:</span>
                    <div className="font-medium">
                      {table.stats ? table.stats.recordCount.toLocaleString() : 'N/A'}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-500">Fields:</span>
                    <div className="font-medium">
                      {Object.keys(table.config.fields).length}
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex justify-between items-center">
                  <div className="flex space-x-2">
                    {table.config.permissions?.create !== false && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Create
                      </span>
                    )}
                    {table.config.permissions?.export !== false && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        Export
                      </span>
                    )}
                  </div>
                  
                  <div className="text-xs text-gray-500">
                    {table.name}
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200 px-6 py-3 bg-gray-50 rounded-b-lg">
                <div className="flex justify-between items-center">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedTable(table.name);
                    }}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    View Data
                  </button>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      // TODO: Open config editor for this table
                    }}
                    className="text-gray-600 hover:text-gray-800 text-sm"
                  >
                    Configure
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Quick Stats */}
      {tables.length > 0 && (
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-4">Overview</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {tables.length}
              </div>
              <div className="text-sm text-gray-500">Total Tables</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {tables.reduce((sum, table) => sum + (table.stats?.recordCount || 0), 0).toLocaleString()}
              </div>
              <div className="text-sm text-gray-500">Total Records</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {tables.reduce((sum, table) => sum + Object.keys(table.config.fields).length, 0)}
              </div>
              <div className="text-sm text-gray-500">Total Fields</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {tables.filter(table => table.config.permissions?.export !== false).length}
              </div>
              <div className="text-sm text-gray-500">Exportable Tables</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}