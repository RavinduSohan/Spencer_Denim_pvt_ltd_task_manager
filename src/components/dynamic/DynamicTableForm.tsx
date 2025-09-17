'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { TableConfig, FieldConfig, TableRecord, ValidationError } from '@/types/table-config';
import { 
  ColorTheme,
  getTableColorTheme, 
  getPremiumCardClasses,
  getPremiumHeaderClasses,
  getPremiumButtonClasses,
  getPremiumInputClasses
} from '@/lib/premium-colors';

interface DynamicTableFormProps {
  tableName: string;
  config: TableConfig;
  record?: TableRecord | null;
  onSubmit: () => void;
  onCancel: () => void;
  colorTheme?: ColorTheme;
}

export function DynamicTableForm({ tableName, config, record, onSubmit, onCancel, colorTheme }: DynamicTableFormProps) {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const isEditing = !!record;
  
  // Use provided color theme or generate one for the table
  const theme = colorTheme || getTableColorTheme(tableName);
  
  // Get editable fields - memoized to prevent infinite re-renders
  const editableFields = useMemo(() => {
    return config.editableFields || 
      Object.keys(config.fields).filter(field => {
        const fieldConfig = config.fields[field];
        return !fieldConfig.readonly && 
               !fieldConfig.calculated &&
               fieldConfig.default !== 'now' &&
               fieldConfig.default !== 'auto' &&
               (!isEditing || !fieldConfig.primaryKey);
      });
  }, [config.editableFields, config.fields, isEditing]);

  // Initialize form data
  useEffect(() => {
    if (record) {
      // Editing mode - populate with existing data
      const initialData: Record<string, any> = {};
      editableFields.forEach(fieldName => {
        initialData[fieldName] = record[fieldName] ?? '';
      });
      setFormData(initialData);
    } else {
      // Create mode - populate with defaults
      const initialData: Record<string, any> = {};
      editableFields.forEach(fieldName => {
        const fieldConfig = config.fields[fieldName];
        if (fieldConfig.default !== undefined && 
            fieldConfig.default !== 'auto' && 
            fieldConfig.default !== 'now') {
          initialData[fieldName] = fieldConfig.default;
        } else {
          initialData[fieldName] = fieldConfig.type === 'boolean' ? false : '';
        }
      });
      setFormData(initialData);
    }
  }, [record, editableFields, config.fields]);

  // Handle form field changes
  const handleFieldChange = (fieldName: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: value
    }));

    // Clear field error when user starts typing
    if (errors[fieldName]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      });
    }
  };

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    editableFields.forEach(fieldName => {
      const fieldConfig = config.fields[fieldName];
      const value = formData[fieldName];

      // Skip validation for fields with auto-generated defaults (now, auto)
      if (fieldConfig.default === 'now' || fieldConfig.default === 'auto') {
        return;
      }

      // Required field validation
      if (fieldConfig.required && (value === '' || value === null || value === undefined)) {
        newErrors[fieldName] = `${fieldConfig.displayName} is required`;
        return;
      }

      // Skip validation for empty optional fields
      if (!fieldConfig.required && (value === '' || value === null || value === undefined)) {
        return;
      }

      // Type-specific validation
      switch (fieldConfig.type) {
        case 'number':
          if (isNaN(Number(value))) {
            newErrors[fieldName] = `${fieldConfig.displayName} must be a number`;
          } else {
            const num = Number(value);
            if (fieldConfig.min !== undefined && num < fieldConfig.min) {
              newErrors[fieldName] = `${fieldConfig.displayName} must be at least ${fieldConfig.min}`;
            }
            if (fieldConfig.max !== undefined && num > fieldConfig.max) {
              newErrors[fieldName] = `${fieldConfig.displayName} must be at most ${fieldConfig.max}`;
            }
          }
          break;

        case 'email':
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(value)) {
            newErrors[fieldName] = `${fieldConfig.displayName} must be a valid email address`;
          }
          break;

        case 'url':
          try {
            new URL(value);
          } catch {
            newErrors[fieldName] = `${fieldConfig.displayName} must be a valid URL`;
          }
          break;

        case 'date':
          const date = new Date(value);
          if (isNaN(date.getTime())) {
            newErrors[fieldName] = `${fieldConfig.displayName} must be a valid date`;
          }
          break;
      }

      // String length validation
      if (typeof value === 'string') {
        if (fieldConfig.minLength && value.length < fieldConfig.minLength) {
          newErrors[fieldName] = `${fieldConfig.displayName} must be at least ${fieldConfig.minLength} characters`;
        }
        if (fieldConfig.maxLength && value.length > fieldConfig.maxLength) {
          newErrors[fieldName] = `${fieldConfig.displayName} must be at most ${fieldConfig.maxLength} characters`;
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setSubmitError(null);

    try {
      const url = isEditing 
        ? `/api/tables/${tableName}?id=${record![Object.keys(config.fields).find(f => config.fields[f].primaryKey)!]}`
        : `/api/tables/${tableName}`;
      
      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        onSubmit();
      } else {
        setSubmitError(result.error || 'Failed to save record');
      }
    } catch (err) {
      setSubmitError('Failed to save record');
      console.error('Error saving record:', err);
    } finally {
      setLoading(false);
    }
  };

  // Render form field based on type
  const renderField = (fieldName: string, fieldConfig: FieldConfig) => {
    const value = formData[fieldName] ?? '';
    const error = errors[fieldName];

    const baseClassName = getPremiumInputClasses(theme) + (error ? ` border-red-500 focus:ring-red-500/20 focus:border-red-500` : '');

    const handleChange = (newValue: any) => {
      handleFieldChange(fieldName, newValue);
    };

    switch (fieldConfig.type) {
      case 'text':
      case 'email':
      case 'url':
        return (
          <input
            type={fieldConfig.type === 'email' ? 'email' : fieldConfig.type === 'url' ? 'url' : 'text'}
            value={value}
            onChange={(e) => handleChange(e.target.value)}
            placeholder={fieldConfig.placeholder}
            maxLength={fieldConfig.maxLength}
            className={baseClassName}
            required={fieldConfig.required}
          />
        );

      case 'number':
        return (
          <input
            type="number"
            value={value}
            onChange={(e) => handleChange(e.target.value)}
            placeholder={fieldConfig.placeholder}
            min={fieldConfig.min}
            max={fieldConfig.max}
            step={fieldConfig.format === 'decimal' ? '0.01' : '1'}
            className={baseClassName}
            required={fieldConfig.required}
          />
        );

      case 'textarea':
        return (
          <textarea
            value={value}
            onChange={(e) => handleChange(e.target.value)}
            placeholder={fieldConfig.placeholder}
            maxLength={fieldConfig.maxLength}
            rows={4}
            className={baseClassName}
            required={fieldConfig.required}
          />
        );

      case 'boolean':
        return (
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={Boolean(value)}
              onChange={(e) => handleChange(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">
              {fieldConfig.helpText || `Enable ${fieldConfig.displayName}`}
            </span>
          </label>
        );

      case 'date':
        return (
          <input
            type="date"
            value={value ? new Date(value).toISOString().split('T')[0] : ''}
            onChange={(e) => handleChange(e.target.value)}
            className={baseClassName}
            required={fieldConfig.required}
          />
        );

      case 'timestamp':
        return (
          <input
            type="datetime-local"
            value={value ? new Date(value).toISOString().slice(0, 16) : ''}
            onChange={(e) => handleChange(e.target.value)}
            className={baseClassName}
            required={fieldConfig.required}
          />
        );

      case 'select':
        return (
          <select
            value={value}
            onChange={(e) => handleChange(e.target.value)}
            className={baseClassName}
            required={fieldConfig.required}
          >
            <option value="">Select {fieldConfig.displayName}</option>
            {fieldConfig.options?.map(option => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        );

      case 'multiselect':
        return (
          <div className="space-y-2">
            {fieldConfig.options?.map(option => (
              <label key={option} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={Array.isArray(value) ? value.includes(option) : false}
                  onChange={(e) => {
                    const currentArray = Array.isArray(value) ? value : [];
                    if (e.target.checked) {
                      handleChange([...currentArray, option]);
                    } else {
                      handleChange(currentArray.filter((item: string) => item !== option));
                    }
                  }}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">{option}</span>
              </label>
            ))}
          </div>
        );

      default:
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => handleChange(e.target.value)}
            placeholder={fieldConfig.placeholder}
            className={baseClassName}
            required={fieldConfig.required}
          />
        );
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className={`${getPremiumCardClasses(theme)} max-w-2xl w-full max-h-[90vh] overflow-hidden`}>
        <div className={getPremiumHeaderClasses(theme)}>
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold text-white">
              {isEditing ? `Edit ${config.displayName}` : `Add ${config.displayName}`}
            </h3>
            <button
              onClick={onCancel}
              className="text-white/80 hover:text-white hover:bg-white/10 rounded-lg p-2 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="overflow-y-auto max-h-[calc(90vh-200px)]">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {submitError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center space-x-2">
                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{submitError}</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {editableFields.map(fieldName => {
                const fieldConfig = config.fields[fieldName];
                if (!fieldConfig) return null;

                return (
                  <div key={fieldName} className={`space-y-2 ${fieldConfig.type === 'textarea' ? 'md:col-span-2' : ''}`}>
                    <label className={`block text-sm font-semibold ${theme.text}`}>
                      {fieldConfig.displayName}
                      {fieldConfig.required && <span className="text-red-500 ml-1">*</span>}
                    </label>
                    
                    {renderField(fieldName, fieldConfig)}
                    
                    {errors[fieldName] && (
                      <p className="text-red-500 text-sm flex items-center space-x-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>{errors[fieldName]}</span>
                      </p>
                    )}
                    
                    {fieldConfig.helpText && !errors[fieldName] && (
                      <p className="text-gray-500 text-sm flex items-center space-x-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>{fieldConfig.helpText}</span>
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </form>
        </div>

        <div className="px-6 py-4 bg-gray-50 rounded-b-xl border-t border-gray-200">
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onCancel}
              className={getPremiumButtonClasses(theme, 'secondary')}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              form="dynamic-form"
              className={getPremiumButtonClasses(theme, 'primary')}
              disabled={loading}
              onClick={handleSubmit}
            >
              <span className="flex items-center space-x-2">
                {loading && (
                  <svg className="animate-spin w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                )}
                <span>{loading ? 'Saving...' : isEditing ? 'Update Record' : 'Create Record'}</span>
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}