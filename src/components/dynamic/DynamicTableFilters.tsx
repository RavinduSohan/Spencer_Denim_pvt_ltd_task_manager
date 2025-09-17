'use client';

import React from 'react';
import { TableConfig, FieldConfig } from '@/types/table-config';
import { 
  ColorTheme,
  getPremiumCardClasses,
  getPremiumButtonClasses,
  getPremiumInputClasses
} from '@/lib/premium-colors';

interface DynamicTableFiltersProps {
  config: TableConfig;
  filters: Record<string, any>;
  onFiltersChange: (filters: Record<string, any>) => void;
  searchTerm: string;
  onSearchChange: (search: string) => void;
  onReset: () => void;
  colorTheme?: ColorTheme;
}

export function DynamicTableFilters({
  config,
  filters,
  onFiltersChange,
  searchTerm,
  onSearchChange,
  onReset,
  colorTheme
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
    <div className={colorTheme ? getPremiumCardClasses(colorTheme) : "bg-gray-50 p-4 rounded-lg border"}>
      <div className="flex flex-wrap gap-4 items-end p-2">
        {/* Search */}
        {hasSearchableFields && (
          <div className="flex-1 min-w-64">
            <label className={`block text-sm font-semibold mb-2 ${colorTheme?.text || 'text-gray-700'}`}>
              <span className="flex items-center space-x-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <span>Search</span>
              </span>
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={`Search in ${searchableFields.map(f => config.fields[f].displayName).join(', ')}`}
              className={colorTheme ? getPremiumInputClasses(colorTheme) : "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"}
            />
          </div>
        )}

        {/* Filterable Fields */}
        {filterableFields.map(fieldName => {
          const fieldConfig = config.fields[fieldName];
          const value = filters[fieldName] ?? '';

          return (
            <div key={fieldName} className="min-w-48">
              <label className={`block text-sm font-semibold mb-2 ${colorTheme?.text || 'text-gray-700'}`}>
                {fieldConfig.displayName}
              </label>
              {renderFilterField(fieldName, fieldConfig, value, handleFilterChange, colorTheme)}
            </div>
          );
        })}

        {/* Reset Button */}
        {hasActiveFilters && (
          <div>
            <button
              onClick={onReset}
              className={colorTheme ? getPremiumButtonClasses(colorTheme, 'secondary') : "px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-100 transition-colors"}
            >
              <span className="flex items-center space-x-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                <span>Clear Filters</span>
              </span>
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
  onChange: (fieldName: string, value: any) => void,
  colorTheme?: ColorTheme
) {
  const baseClassName = colorTheme ? getPremiumInputClasses(colorTheme) : "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500";

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