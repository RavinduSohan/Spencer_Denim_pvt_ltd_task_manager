'use client';

import React from 'react';
import { TableConfig, FieldConfig } from '@/types/table-config';

interface DynamicTableFiltersProps {
  config: TableConfig;
  filters: Record<string, any>;
  onFiltersChange: (filters: Record<string, any>) => void;
  searchTerm: string;
  onSearchChange: (search: string) => void;
  onReset: () => void;
}

export function DynamicTableFilters({
  config,
  filters,
  onFiltersChange,
  searchTerm,
  onSearchChange,
  onReset
}: DynamicTableFiltersProps) {
  // Get filterable fields
  const filterableFields = Object.keys(config.fields).filter(fieldName => {
    const fieldConfig = config.fields[fieldName];
    return ['select', 'boolean', 'date'].includes(fieldConfig.type) && 
           !fieldConfig.calculated;
  });

  // Check if search is enabled
  const searchableFields = Object.keys(config.fields).filter(fieldName => {
    const fieldConfig = config.fields[fieldName];
    return ['text', 'email', 'textarea'].includes(fieldConfig.type);
  });

  const hasSearchableFields = searchableFields.length > 0 && config.searchable !== false;

  // Handle filter change
  const handleFilterChange = (fieldName: string, value: any) => {
    onFiltersChange({
      ...filters,
      [fieldName]: value
    });
  };

  // Check if any filters are active
  const hasActiveFilters = Object.values(filters).some(value => 
    value !== '' && value !== null && value !== undefined
  ) || searchTerm !== '';

  if (!hasSearchableFields && filterableFields.length === 0) {
    return null;
  }

  return (
    <div className="bg-gray-50 p-4 rounded-lg border">
      <div className="flex flex-wrap gap-4 items-end">
        {/* Search */}
        {hasSearchableFields && (
          <div className="flex-1 min-w-64">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={`Search in ${searchableFields.map(f => config.fields[f].displayName).join(', ')}`}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        )}

        {/* Filterable Fields */}
        {filterableFields.map(fieldName => {
          const fieldConfig = config.fields[fieldName];
          const value = filters[fieldName] ?? '';

          return (
            <div key={fieldName} className="min-w-48">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {fieldConfig.displayName}
              </label>
              {renderFilterField(fieldName, fieldConfig, value, handleFilterChange)}
            </div>
          );
        })}

        {/* Reset Button */}
        {hasActiveFilters && (
          <div>
            <button
              onClick={onReset}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-100 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function renderFilterField(
  fieldName: string, 
  fieldConfig: FieldConfig, 
  value: any, 
  onChange: (fieldName: string, value: any) => void
) {
  const baseClassName = "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500";

  switch (fieldConfig.type) {
    case 'select':
      return (
        <select
          value={value}
          onChange={(e) => onChange(fieldName, e.target.value)}
          className={baseClassName}
        >
          <option value="">All {fieldConfig.displayName}</option>
          {fieldConfig.options?.map(option => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      );

    case 'boolean':
      return (
        <select
          value={value}
          onChange={(e) => onChange(fieldName, e.target.value)}
          className={baseClassName}
        >
          <option value="">All</option>
          <option value="true">Yes</option>
          <option value="false">No</option>
        </select>
      );

    case 'date':
      return (
        <input
          type="date"
          value={value}
          onChange={(e) => onChange(fieldName, e.target.value)}
          className={baseClassName}
        />
      );

    default:
      return (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(fieldName, e.target.value)}
          placeholder={`Filter by ${fieldConfig.displayName}`}
          className={baseClassName}
        />
      );
  }
}