'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { TableConfig, FieldConfig, TableRecord, TableListResponse } from '@/types/table-config';
import { DynamicTableForm } from './DynamicTableForm';
import { DynamicTableFilters } from './DynamicTableFilters';
import { 
  getTableColorTheme, 
  getPremiumCardClasses,
  getPremiumHeaderClasses,
  getPremiumButtonClasses,
  getPremiumRowClasses,
  getPremiumBadgeClasses
} from '@/lib/premium-colors';

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

  // Check if this is a major table that should use dedicated endpoints
  const isMajorTable = (tableName: string): boolean => {
    return ['tasks', 'orders', 'users', 'documents', 'activities'].includes(tableName.toLowerCase());
  };

  // Get the appropriate API endpoint for the table
  const getApiEndpoint = (tableName: string): string => {
    if (isMajorTable(tableName)) {
      return `/api/${tableName}`;
    }
    return `/api/tables/${tableName}`;
  };

  // Get premium color theme for this table
  const colorTheme = useMemo(() => getTableColorTheme(tableName), [tableName]);

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
      
      if (isMajorTable(tableName)) {
        // For major tables, use pagination parameters that match their API
        params.set('page', currentPage.toString());
        params.set('limit', recordsPerPage.toString());
      } else {
        // For dynamic tables, use offset-based pagination
        params.set('limit', recordsPerPage.toString());
        params.set('offset', ((currentPage - 1) * recordsPerPage).toString());
      }
      
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

      const endpoint = getApiEndpoint(tableName);
      const response = await fetch(`${endpoint}?${params}`);
      const result = await response.json();

      if (result.success) {
        if (isMajorTable(tableName)) {
          // Major tables return data in a different format
          const data = result.data;
          if (Array.isArray(data)) {
            setRecords(data);
            setTotalRecords(data.length);
            setTotalPages(1); // For now, assume single page for major tables
          } else if (data && Array.isArray(data.data)) {
            setRecords(data.data);
            setTotalRecords(data.pagination?.total || data.data.length);
            setTotalPages(Math.ceil((data.pagination?.total || data.data.length) / recordsPerPage));
          } else if (data && (data.orders || data.tasks)) {
            // Handle specific response formats for orders/tasks
            const records = data.orders || data.tasks || [];
            setRecords(records);
            setTotalRecords(data.pagination?.total || records.length);
            setTotalPages(Math.ceil((data.pagination?.total || records.length) / recordsPerPage));
          } else {
            setRecords([]);
            setTotalRecords(0);
            setTotalPages(1);
          }
        } else {
          // Dynamic tables return data in the expected format
          if (result.data) {
            setRecords(result.data.records || []);
            setTotalRecords(result.metadata?.total || 0);
            setTotalPages(Math.ceil((result.metadata?.total || 0) / recordsPerPage));
          } else {
            setRecords([]);
            setTotalRecords(0);
            setTotalPages(1);
          }
        }
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
      let response;
      if (isMajorTable(tableName)) {
        // For major tables, use the dedicated endpoint with SQLite headers
        const endpoint = getApiEndpoint(tableName);
        response = await fetch(`${endpoint}/${record[primaryKeyField]}`, {
          method: 'DELETE',
          headers: {
            'x-database-type': 'sqlite'
          }
        });
      } else {
        // For dynamic tables, use the existing format
        response = await fetch(`/api/tables/${tableName}?id=${record[primaryKeyField]}`, {
          method: 'DELETE',
        });
      }

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

      let exportUrl;
      if (isMajorTable(tableName)) {
        // For major tables, use their dedicated export endpoint
        exportUrl = `${getApiEndpoint(tableName)}/export?${params}`;
      } else {
        // For dynamic tables, use the tables export endpoint
        exportUrl = `/api/tables/${tableName}/export?${params}`;
      }

      const response = await fetch(exportUrl);
      
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
        <div className={`text-lg font-medium ${colorTheme.text}`}>Loading {config.displayName}...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Premium Header Card */}
      <div className={getPremiumCardClasses(colorTheme)}>
        <div className={getPremiumHeaderClasses(colorTheme)}>
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-white">{config.displayName}</h2>
              {config.description && (
                <p className="text-white/90 mt-1">{config.description}</p>
              )}
            </div>
            <div className="flex items-center space-x-3">
              <div className={getPremiumBadgeClasses(colorTheme)}>
                {totalRecords} record{totalRecords !== 1 ? 's' : ''}
              </div>
            </div>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="p-6 bg-white rounded-b-xl">
          <div className="flex justify-end space-x-3">
            {config.permissions?.export !== false && (
              <button
                onClick={handleExport}
                className={getPremiumButtonClasses(colorTheme, 'secondary')}
                disabled={loading || records.length === 0}
              >
                <span className="flex items-center space-x-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span>Export Excel</span>
                </span>
              </button>
            )}
            {config.permissions?.create !== false && (
              <button
                onClick={() => setShowForm(true)}
                className={getPremiumButtonClasses(colorTheme, 'primary')}
              >
                <span className="flex items-center space-x-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span>Add Record</span>
                </span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className={`${colorTheme.light} border ${colorTheme.border} ${colorTheme.text} px-4 py-3 rounded-lg shadow-sm`}>
          <div className="flex items-center space-x-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Filters */}
      <DynamicTableFilters
        config={config}
        filters={filters}
        onFiltersChange={setFilters}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        colorTheme={colorTheme}
        onReset={() => {
          setFilters({});
          setSearchTerm('');
          setCurrentPage(1);
        }}
      />

      {/* Premium Table */}
      <div className={getPremiumCardClasses(colorTheme)}>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className={getPremiumHeaderClasses(colorTheme)}>
              <tr>
                {displayFields.map(fieldName => {
                  const fieldConfig = config.fields[fieldName];
                  if (!fieldConfig) return null;

                  return (
                    <th
                      key={fieldName}
                      className="px-6 py-4 text-left text-sm font-semibold text-white uppercase tracking-wider cursor-pointer hover:bg-white/10 transition-colors duration-200"
                      onClick={() => handleSort(fieldName)}
                    >
                      <div className="flex items-center space-x-2">
                        <span>{fieldConfig.displayName}</span>
                        {sortField === fieldName && (
                          <span className="text-white/90 text-lg">
                            {sortOrder === 'ASC' ? '↑' : '↓'}
                          </span>
                        )}
                      </div>
                    </th>
                  );
                })}
                {(config.permissions?.update !== false || config.permissions?.delete !== false) && (
                  <th className="px-6 py-4 text-right text-sm font-semibold text-white uppercase tracking-wider">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {records.map((record, index) => {
                const primaryKeyField = Object.keys(config.fields).find(field => 
                  config.fields[field].primaryKey
                );
                const recordId = primaryKeyField ? record[primaryKeyField] : index;

                return (
                  <tr key={recordId} className={getPremiumRowClasses(colorTheme, index % 2 === 0)}>
                    {displayFields.map(fieldName => {
                      const fieldConfig = config.fields[fieldName];
                      if (!fieldConfig) return null;

                      return (
                        <td key={fieldName} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div className="max-w-xs truncate font-medium" title={formatFieldValue(record[fieldName], fieldConfig)}>
                            {formatFieldValue(record[fieldName], fieldConfig)}
                          </div>
                        </td>
                      );
                    })}
                    {(config.permissions?.update !== false || config.permissions?.delete !== false) && (
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-3">
                          {config.permissions?.update !== false && (
                            <button
                              onClick={() => setEditingRecord(record)}
                              className={`${colorTheme.text} hover:text-white ${colorTheme.hover} px-3 py-1 rounded-md transition-all duration-200 font-medium`}
                            >
                              Edit
                            </button>
                          )}
                          {config.permissions?.delete !== false && (
                            <button
                              onClick={() => handleDelete(record)}
                              className="text-red-600 hover:text-white hover:bg-red-600 px-3 py-1 rounded-md transition-all duration-200 font-medium"
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

        {/* Premium Pagination */}
        {totalPages > 1 && (
          <div className="bg-white px-6 py-4 flex items-center justify-between border-t border-gray-200 rounded-b-xl">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className={getPremiumButtonClasses(colorTheme, 'secondary')}
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className={getPremiumButtonClasses(colorTheme, 'secondary')}
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className={`text-sm ${colorTheme.text} font-medium`}>
                  Showing{' '}
                  <span className="font-bold">{(currentPage - 1) * recordsPerPage + 1}</span>
                  {' '}to{' '}
                  <span className="font-bold">
                    {Math.min(currentPage * recordsPerPage, totalRecords)}
                  </span>
                  {' '}of{' '}
                  <span className="font-bold">{totalRecords}</span>
                  {' '}results
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-lg shadow-sm -space-x-px">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium transition-all duration-200 ${
                        page === currentPage
                          ? `z-10 ${colorTheme.light} ${colorTheme.border} ${colorTheme.text} shadow-md`
                          : `bg-white border-gray-300 text-gray-500 hover:${colorTheme.light} hover:${colorTheme.text}`
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
        <div className={getPremiumCardClasses(colorTheme)}>
          <div className="text-center py-16">
            <svg className={`mx-auto h-16 w-16 ${colorTheme.text} mb-4`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <div className={`${colorTheme.text} text-xl font-medium mb-2`}>No records found</div>
            <p className="text-gray-500 mb-4">Get started by adding your first record</p>
            {Object.keys(filters).length > 0 || searchTerm ? (
              <button
                onClick={() => {
                  setFilters({});
                  setSearchTerm('');
                  setCurrentPage(1);
                }}
                className={getPremiumButtonClasses(colorTheme, 'secondary')}
              >
                Clear filters
              </button>
            ) : config.permissions?.create !== false && (
              <button
                onClick={() => setShowForm(true)}
                className={getPremiumButtonClasses(colorTheme, 'primary')}
              >
                Add First Record
              </button>
            )}
          </div>
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
          colorTheme={colorTheme}
        />
      )}
    </div>
  );
}