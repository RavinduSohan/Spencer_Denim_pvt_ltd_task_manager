'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { TableConfig, FieldConfig, TableRecord, TableListResponse } from '@/types/table-config';
import { DynamicTableForm } from './DynamicTableForm';
import { DynamicTableFilters } from './DynamicTableFilters';

interface DynamicTableViewerProps {
  tableName: string;
  config: TableConfig;
  onRefresh?: () => void;
}

export function DynamicTableViewer({ tableName, config, onRefresh }: DynamicTableViewerProps) {
  const [records, setRecords] = useState<TableRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingRecord, setEditingRecord] = useState<TableRecord | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [filters, setFilters] = useState<Record<string, any>>({});
  const [sortField, setSortField] = useState<string>(config.defaultSort || '');
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>(
    config.defaultSortOrder?.toUpperCase() as 'ASC' | 'DESC' || 'ASC'
  );
  const [searchTerm, setSearchTerm] = useState('');
  
  const recordsPerPage = 20;

  // Determine which fields to display - memoized to prevent unnecessary re-renders
  const displayFields = useMemo(() => {
    return config.displayFields || Object.keys(config.fields);
  }, [config.displayFields, config.fields]);
  
  // Load records - memoized to prevent unnecessary re-creation
  const loadRecords = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      params.set('limit', recordsPerPage.toString());
      params.set('offset', ((currentPage - 1) * recordsPerPage).toString());
      
      if (sortField) {
        params.set('sort', sortField);
        params.set('sortOrder', sortOrder);
      }
      
      if (searchTerm) {
        params.set('search', searchTerm);
      }

      // Add filters
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== '' && value !== null && value !== undefined) {
          params.set(key, String(value));
        }
      });

      const response = await fetch(`/api/tables/${tableName}?${params}`);
      const result: TableListResponse = await response.json();

      if (result.success && result.data) {
        setRecords(result.data.records);
        setTotalRecords(result.metadata?.total || 0);
        setTotalPages(Math.ceil((result.metadata?.total || 0) / recordsPerPage));
      } else {
        setError(result.error || 'Failed to load records');
      }
    } catch (err) {
      setError('Failed to load records');
      console.error('Error loading records:', err);
    } finally {
      setLoading(false);
    }
  }, [tableName, currentPage, filters, sortField, sortOrder, searchTerm, recordsPerPage]);

  // Load records when dependencies change
  useEffect(() => {
    loadRecords();
  }, [loadRecords]);

  // Handle record deletion
  const handleDelete = async (record: TableRecord) => {
    const primaryKeyField = Object.keys(config.fields).find(field => 
      config.fields[field].primaryKey
    );
    
    if (!primaryKeyField || !record[primaryKeyField]) {
      setError('Cannot delete record: Primary key not found');
      return;
    }

    if (!confirm('Are you sure you want to delete this record?')) {
      return;
    }

    try {
      const response = await fetch(`/api/tables/${tableName}?id=${record[primaryKeyField]}`, {
        method: 'DELETE',
      });

      const result = await response.json();
      if (result.success) {
        loadRecords();
        onRefresh?.();
      } else {
        setError(result.error || 'Failed to delete record');
      }
    } catch (err) {
      setError('Failed to delete record');
      console.error('Error deleting record:', err);
    }
  };

  // Handle sorting
  const handleSort = (fieldName: string) => {
    if (sortField === fieldName) {
      setSortOrder(sortOrder === 'ASC' ? 'DESC' : 'ASC');
    } else {
      setSortField(fieldName);
      setSortOrder('ASC');
    }
    setCurrentPage(1);
  };

  // Handle Excel export
  const handleExport = async () => {
    try {
      const params = new URLSearchParams();
      
      if (sortField) {
        params.set('sort', sortField);
        params.set('sortOrder', sortOrder);
      }
      
      if (searchTerm) {
        params.set('search', searchTerm);
      }

      // Add filters
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== '' && value !== null && value !== undefined) {
          params.set(key, String(value));
        }
      });

      const response = await fetch(`/api/tables/${tableName}/export?${params}`);
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${tableName}-export.xlsx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        setError('Failed to export data');
      }
    } catch (err) {
      setError('Failed to export data');
      console.error('Error exporting data:', err);
    }
  };

  // Format field value for display
  const formatFieldValue = (value: any, fieldConfig: FieldConfig): string => {
    if (value === null || value === undefined) return '';

    switch (fieldConfig.type) {
      case 'date':
        return new Date(value).toLocaleDateString();
      case 'timestamp':
        return new Date(value).toLocaleString();
      case 'number':
        if (fieldConfig.format === 'currency') {
          return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
          }).format(Number(value));
        } else if (fieldConfig.format === 'percentage') {
          return `${Number(value)}%`;
        }
        return String(value);
      case 'boolean':
        return value ? 'Yes' : 'No';
      case 'multiselect':
        return Array.isArray(value) ? value.join(', ') : String(value);
      default:
        return String(value);
    }
  };

  // Handle form submission
  const handleFormSubmit = () => {
    setShowForm(false);
    setEditingRecord(null);
    loadRecords();
    onRefresh?.();
  };

  if (loading && records.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading {config.displayName}...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">{config.displayName}</h2>
          {config.description && (
            <p className="text-gray-600 mt-1">{config.description}</p>
          )}
          <p className="text-sm text-gray-500 mt-1">
            {totalRecords} record{totalRecords !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex space-x-2">
          {config.permissions?.export !== false && (
            <button
              onClick={handleExport}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
              disabled={loading || records.length === 0}
            >
              Export Excel
            </button>
          )}
          {config.permissions?.create !== false && (
            <button
              onClick={() => setShowForm(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              Add Record
            </button>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Filters */}
      <DynamicTableFilters
        config={config}
        filters={filters}
        onFiltersChange={setFilters}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onReset={() => {
          setFilters({});
          setSearchTerm('');
          setCurrentPage(1);
        }}
      />

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {displayFields.map(fieldName => {
                  const fieldConfig = config.fields[fieldName];
                  if (!fieldConfig) return null;

                  return (
                    <th
                      key={fieldName}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort(fieldName)}
                    >
                      <div className="flex items-center space-x-1">
                        <span>{fieldConfig.displayName}</span>
                        {sortField === fieldName && (
                          <span className="text-blue-500">
                            {sortOrder === 'ASC' ? '↑' : '↓'}
                          </span>
                        )}
                      </div>
                    </th>
                  );
                })}
                {(config.permissions?.update !== false || config.permissions?.delete !== false) && (
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {records.map((record, index) => {
                const primaryKeyField = Object.keys(config.fields).find(field => 
                  config.fields[field].primaryKey
                );
                const recordId = primaryKeyField ? record[primaryKeyField] : index;

                return (
                  <tr key={recordId} className="hover:bg-gray-50">
                    {displayFields.map(fieldName => {
                      const fieldConfig = config.fields[fieldName];
                      if (!fieldConfig) return null;

                      return (
                        <td key={fieldName} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div className="max-w-xs truncate" title={formatFieldValue(record[fieldName], fieldConfig)}>
                            {formatFieldValue(record[fieldName], fieldConfig)}
                          </div>
                        </td>
                      );
                    })}
                    {(config.permissions?.update !== false || config.permissions?.delete !== false) && (
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          {config.permissions?.update !== false && (
                            <button
                              onClick={() => setEditingRecord(record)}
                              className="text-blue-600 hover:text-blue-900 transition-colors"
                            >
                              Edit
                            </button>
                          )}
                          {config.permissions?.delete !== false && (
                            <button
                              onClick={() => handleDelete(record)}
                              className="text-red-600 hover:text-red-900 transition-colors"
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing{' '}
                  <span className="font-medium">{(currentPage - 1) * recordsPerPage + 1}</span>
                  {' '}to{' '}
                  <span className="font-medium">
                    {Math.min(currentPage * recordsPerPage, totalRecords)}
                  </span>
                  {' '}of{' '}
                  <span className="font-medium">{totalRecords}</span>
                  {' '}results
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        page === currentPage
                          ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      {records.length === 0 && !loading && (
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg">No records found</div>
          {Object.keys(filters).length > 0 || searchTerm && (
            <button
              onClick={() => {
                setFilters({});
                setSearchTerm('');
                setCurrentPage(1);
              }}
              className="mt-2 text-blue-600 hover:text-blue-800"
            >
              Clear filters
            </button>
          )}
        </div>
      )}

      {/* Form Modal */}
      {(showForm || editingRecord) && (
        <DynamicTableForm
          tableName={tableName}
          config={config}
          record={editingRecord}
          onSubmit={handleFormSubmit}
          onCancel={() => {
            setShowForm(false);
            setEditingRecord(null);
          }}
        />
      )}
    </div>
  );
}