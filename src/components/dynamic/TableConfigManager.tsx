'use client';

import React, { useState } from 'react';
import { TableConfig, FieldConfig, FieldType } from '@/types/table-config';
import { getTableColorTheme, getPremiumButtonClasses } from '@/lib/premium-colors';

interface TableConfigManagerProps {
  onSave: () => void;
  existingTable?: { name: string; config: TableConfig } | null;
}

export function TableConfigManager({ onSave, existingTable }: TableConfigManagerProps) {
  const [tableName, setTableName] = useState(existingTable?.name || '');
  const [displayName, setDisplayName] = useState(existingTable?.config.displayName || '');
  const [description, setDescription] = useState(existingTable?.config.description || '');
  const [fields, setFields] = useState<Record<string, FieldConfig>>(
    existingTable?.config.fields || {
      id: {
        type: 'text',
        primaryKey: true,
        required: true,
        displayName: 'ID',
        default: 'auto',
        readonly: true
      }
    }
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get a consistent color theme for this table
  const colorTheme = getTableColorTheme(tableName || 'new-table');

  const fieldTypes: { value: FieldType; label: string }[] = [
    { value: 'text', label: 'Text' },
    { value: 'number', label: 'Number' },
    { value: 'boolean', label: 'Yes/No' },
    { value: 'date', label: 'Date' },
    { value: 'timestamp', label: 'Date & Time' },
    { value: 'email', label: 'Email' },
    { value: 'url', label: 'URL' },
    { value: 'textarea', label: 'Long Text' },
    { value: 'select', label: 'Dropdown' },
    { value: 'multiselect', label: 'Multiple Choice' },
  ];

  // Add new field
  const addField = () => {
    const fieldName = `field_${Object.keys(fields).length + 1}`;
    setFields(prev => ({
      ...prev,
      [fieldName]: {
        type: 'text',
        displayName: 'New Field',
        required: false
      }
    }));
  };

  // Remove field
  const removeField = (fieldName: string) => {
    if (fields[fieldName]?.primaryKey) {
      alert('Cannot remove primary key field');
      return;
    }
    
    setFields(prev => {
      const newFields = { ...prev };
      delete newFields[fieldName];
      return newFields;
    });
  };

  // Update field
  const updateField = (fieldName: string, updates: Partial<FieldConfig>) => {
    setFields(prev => ({
      ...prev,
      [fieldName]: {
        ...prev[fieldName],
        ...updates
      }
    }));
  };

  // Rename field
  const renameField = (oldName: string, newName: string) => {
    if (newName === oldName || !newName.trim()) return;
    
    // Check if new name already exists
    if (fields[newName]) {
      alert('Field name already exists');
      return;
    }

    setFields(prev => {
      const newFields: Record<string, FieldConfig> = {};
      for (const [key, value] of Object.entries(prev)) {
        if (key === oldName) {
          newFields[newName] = value;
        } else {
          newFields[key] = value;
        }
      }
      return newFields;
    });
  };

  // Validate configuration
  const validateConfig = (): string | null => {
    if (!tableName.trim()) {
      return 'Table name is required';
    }

    if (!/^[a-zA-Z][a-zA-Z0-9_]*$/.test(tableName)) {
      return 'Table name must start with a letter and contain only letters, numbers, and underscores';
    }

    if (!displayName.trim()) {
      return 'Display name is required';
    }

    const fieldNames = Object.keys(fields);
    if (fieldNames.length === 0) {
      return 'At least one field is required';
    }

    // Check for primary key
    const hasPrimaryKey = Object.values(fields).some(field => field.primaryKey);
    if (!hasPrimaryKey) {
      return 'A primary key field is required';
    }

    // Validate field names
    for (const fieldName of fieldNames) {
      if (!/^[a-zA-Z][a-zA-Z0-9_]*$/.test(fieldName)) {
        return `Field name '${fieldName}' is invalid. Use only letters, numbers, and underscores, starting with a letter.`;
      }
    }

    // Validate select/multiselect options
    for (const [fieldName, fieldConfig] of Object.entries(fields)) {
      if (['select', 'multiselect'].includes(fieldConfig.type)) {
        if (!fieldConfig.options || fieldConfig.options.length === 0) {
          return `Field '${fieldConfig.displayName}' requires at least one option`;
        }
      }
    }

    return null;
  };

  // Save configuration
  const handleSave = async () => {
    const validationError = validateConfig();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const config: TableConfig = {
        displayName,
        description,
        fields,
        sortable: true,
        filterable: true,
        searchable: true,
        paginated: true,
        exportable: true,
        permissions: {
          create: true,
          read: true,
          update: true,
          delete: true,
          export: true
        }
      };

      const response = await fetch('/api/table-configs', {
        method: existingTable ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tableName,
          config
        }),
      });

      const result = await response.json();

      if (result.success) {
        onSave();
      } else {
        setError(result.error || 'Failed to save table configuration');
      }
    } catch (err) {
      setError('Failed to save table configuration');
      console.error('Error saving config:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        {/* Header Section with Premium Gradient */}
        <div className="text-center space-y-4">
          <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl ${colorTheme.gradient} shadow-xl shadow-${colorTheme.shadow} transform rotate-3 hover:rotate-0 transition-all duration-300`}>
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 bg-clip-text text-transparent">
              {existingTable ? 'Edit Table Configuration' : 'Create New Table'}
            </h1>
            <p className="text-lg text-gray-600 mt-2 font-medium">
              Define your table structure and field types
            </p>
          </div>
        </div>

        {error && (
          <div className="bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 text-red-800 px-6 py-4 rounded-2xl shadow-lg shadow-red-500/10 backdrop-blur-sm">
            <div className="flex items-center space-x-3">
              <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-medium">{error}</span>
            </div>
          </div>
        )}

        {/* Basic Information Card */}
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 transform hover:scale-[1.01] transition-all duration-300">
          <div className="flex items-center space-x-3 mb-6">
            <div className={`w-10 h-10 rounded-xl ${colorTheme.gradient} flex items-center justify-center shadow-lg`}>
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900">Basic Information</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Table Name (Database) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={tableName}
                onChange={(e) => setTableName(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                placeholder="e.g., employees, projects"
                className="w-full px-4 py-3 bg-gradient-to-r from-gray-50 to-blue-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 font-medium placeholder-gray-400"
                disabled={!!existingTable}
              />
              <p className="text-xs text-gray-500 font-medium">
                Lowercase letters, numbers, and underscores only
              </p>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Display Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="e.g., Employees, Projects"
                className="w-full px-4 py-3 bg-gradient-to-r from-gray-50 to-blue-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 font-medium placeholder-gray-400"
              />
            </div>
          </div>

          <div className="mt-6 space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of what this table stores"
              rows={3}
              className="w-full px-4 py-3 bg-gradient-to-r from-gray-50 to-blue-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 font-medium placeholder-gray-400 resize-none"
            />
          </div>
        </div>

        {/* Fields Configuration Card */}
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 transform hover:scale-[1.01] transition-all duration-300">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center space-x-3">
              <div className={`w-10 h-10 rounded-xl ${colorTheme.gradient} flex items-center justify-center shadow-lg`}>
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900">Fields</h3>
            </div>
            <button
              onClick={addField}
              className={`${getPremiumButtonClasses(colorTheme, 'primary')} transform hover:scale-105 transition-all duration-300 shadow-lg`}
            >
              <span className="flex items-center space-x-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span>Add Field</span>
              </span>
            </button>
          </div>

          <div className="space-y-6">
            {Object.entries(fields).map(([fieldName, fieldConfig]) => (
              <FieldEditor
                key={fieldName}
                fieldName={fieldName}
                fieldConfig={fieldConfig}
                fieldTypes={fieldTypes}
                onUpdate={(updates) => updateField(fieldName, updates)}
                onRename={(newName) => renameField(fieldName, newName)}
                onRemove={() => removeField(fieldName)}
                canRemove={!fieldConfig.primaryKey}
                colorTheme={colorTheme}
              />
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center space-x-6 pt-4">
          <button
            onClick={() => window.history.back()}
            className="px-8 py-4 text-gray-700 font-semibold border-2 border-gray-300 rounded-2xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-300 transform hover:scale-105 bg-white shadow-lg"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className={`${getPremiumButtonClasses(colorTheme, 'primary')} px-8 py-4 disabled:opacity-50 transform hover:scale-105 transition-all duration-300 shadow-xl`}
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center space-x-2">
                <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>Saving...</span>
              </span>
            ) : (
              <span className="flex items-center space-x-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>{existingTable ? 'Update Table' : 'Create Table'}</span>
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// Field Editor Component
interface FieldEditorProps {
  fieldName: string;
  fieldConfig: FieldConfig;
  fieldTypes: { value: FieldType; label: string }[];
  onUpdate: (updates: Partial<FieldConfig>) => void;
  onRename: (newName: string) => void;
  onRemove: () => void;
  canRemove: boolean;
  colorTheme: any;
}

function FieldEditor({ 
  fieldName, 
  fieldConfig, 
  fieldTypes, 
  onUpdate, 
  onRename, 
  onRemove, 
  canRemove,
  colorTheme
}: FieldEditorProps) {
  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState(fieldName);

  const handleNameSubmit = () => {
    if (newName !== fieldName) {
      onRename(newName);
    }
    setEditingName(false);
  };

  return (
    <div className="bg-gradient-to-r from-white to-gray-50/50 border border-gray-200/60 rounded-2xl p-6 space-y-4 shadow-lg hover:shadow-xl transition-all duration-300 backdrop-blur-sm">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          {editingName ? (
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                onBlur={handleNameSubmit}
                onKeyDown={(e) => e.key === 'Enter' && handleNameSubmit()}
                className="text-sm font-semibold px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                autoFocus
              />
            </div>
          ) : (
            <div className="flex items-center space-x-3">
              <span className="text-lg font-semibold text-gray-800">
                {fieldName}
              </span>
              {!fieldConfig.primaryKey && (
                <button
                  onClick={() => setEditingName(true)}
                  className="text-xs text-blue-600 hover:text-blue-800 font-medium px-2 py-1 rounded-md hover:bg-blue-50 transition-colors"
                >
                  rename
                </button>
              )}
              {fieldConfig.primaryKey && (
                <span className={`text-xs font-semibold px-3 py-1 rounded-full ${colorTheme.light} ${colorTheme.text} border ${colorTheme.border}`}>
                  Primary Key
                </span>
              )}
            </div>
          )}
        </div>
        
        {canRemove && (
          <button
            onClick={onRemove}
            className="text-red-600 hover:text-red-800 text-sm font-medium px-3 py-1 rounded-lg hover:bg-red-50 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700">
            Display Name
          </label>
          <input
            type="text"
            value={fieldConfig.displayName}
            onChange={(e) => onUpdate({ displayName: e.target.value })}
            className="w-full px-3 py-2 text-sm bg-gradient-to-r from-gray-50 to-blue-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 font-medium"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700">
            Type
          </label>
          <select
            value={fieldConfig.type}
            onChange={(e) => onUpdate({ type: e.target.value as FieldType })}
            className="w-full px-3 py-2 text-sm bg-gradient-to-r from-gray-50 to-blue-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 font-medium"
            disabled={fieldConfig.primaryKey}
          >
            {fieldTypes.map(type => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center justify-center pt-6">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={fieldConfig.required || false}
              onChange={(e) => onUpdate({ required: e.target.checked })}
              className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 focus:ring-2"
              disabled={fieldConfig.primaryKey}
            />
            <span className="text-sm font-medium text-gray-700">Required</span>
          </label>
        </div>
      </div>

      {/* Type-specific options with premium styling */}
      {['select', 'multiselect'].includes(fieldConfig.type) && (
        <div className="space-y-2 mt-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
          <label className="block text-sm font-semibold text-gray-700">
            Options (one per line)
          </label>
          <textarea
            value={fieldConfig.options?.join('\n') || ''}
            onChange={(e) => onUpdate({ 
              options: e.target.value.split('\n').filter(opt => opt.trim()) 
            })}
            placeholder="Option 1&#10;Option 2&#10;Option 3"
            rows={3}
            className="w-full px-3 py-2 text-sm bg-white border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 font-medium placeholder-gray-400 resize-none"
          />
        </div>
      )}

      {fieldConfig.type === 'number' && (
        <div className="mt-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Min Value
              </label>
              <input
                type="number"
                value={fieldConfig.min || ''}
                onChange={(e) => onUpdate({ min: e.target.value ? Number(e.target.value) : undefined })}
                className="w-full px-3 py-2 text-sm bg-white border border-green-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300 font-medium"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Max Value
              </label>
              <input
                type="number"
                value={fieldConfig.max || ''}
                onChange={(e) => onUpdate({ max: e.target.value ? Number(e.target.value) : undefined })}
                className="w-full px-3 py-2 text-sm bg-white border border-green-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300 font-medium"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Format
              </label>
              <select
                value={fieldConfig.format || ''}
                onChange={(e) => onUpdate({ format: e.target.value as any })}
                className="w-full px-3 py-2 text-sm bg-white border border-green-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300 font-medium"
              >
                <option value="">Default</option>
                <option value="currency">Currency</option>
                <option value="percentage">Percentage</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {['text', 'textarea'].includes(fieldConfig.type) && (
        <div className="mt-4 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Min Length
              </label>
              <input
                type="number"
                value={fieldConfig.minLength || ''}
                onChange={(e) => onUpdate({ minLength: e.target.value ? Number(e.target.value) : undefined })}
                className="w-full px-3 py-2 text-sm bg-white border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 font-medium"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Max Length
              </label>
              <input
                type="number"
                value={fieldConfig.maxLength || ''}
                onChange={(e) => onUpdate({ maxLength: e.target.value ? Number(e.target.value) : undefined })}
                className="w-full px-3 py-2 text-sm bg-white border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 font-medium"
              />
            </div>
          </div>
        </div>
      )}

      <div className="space-y-2 mt-4">
        <label className="block text-sm font-semibold text-gray-700">
          Help Text
        </label>
        <input
          type="text"
          value={fieldConfig.helpText || ''}
          onChange={(e) => onUpdate({ helpText: e.target.value })}
          placeholder="Optional help text for users"
          className="w-full px-3 py-2 text-sm bg-gradient-to-r from-gray-50 to-blue-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 font-medium placeholder-gray-400"
        />
      </div>
    </div>
  );
}