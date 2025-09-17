'use client';

import React, { useState } from 'react';
import { TableConfig, FieldConfig, FieldType } from '@/types/table-config';

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
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold">
          {existingTable ? 'Edit Table Configuration' : 'Create New Table'}
        </h2>
        <p className="text-gray-600 mt-1">
          Define your table structure and field types
        </p>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Basic Information */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
        <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Table Name (Database) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={tableName}
              onChange={(e) => setTableName(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
              placeholder="e.g., employees, projects"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={!!existingTable}
            />
            <p className="text-xs text-gray-500 mt-1">
              Lowercase letters, numbers, and underscores only
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Display Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="e.g., Employees, Projects"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Brief description of what this table stores"
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Fields Configuration */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Fields</h3>
          <button
            onClick={addField}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Add Field
          </button>
        </div>

        <div className="space-y-4">
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
            />
          ))}
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end space-x-3">
        <button
          onClick={() => window.history.back()}
          className="px-6 py-3 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          disabled={loading}
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
          disabled={loading}
        >
          {loading ? 'Saving...' : existingTable ? 'Update Table' : 'Create Table'}
        </button>
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
}

function FieldEditor({ 
  fieldName, 
  fieldConfig, 
  fieldTypes, 
  onUpdate, 
  onRename, 
  onRemove, 
  canRemove 
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
    <div className="border border-gray-200 rounded-lg p-4 space-y-3">
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
                className="text-sm font-medium px-2 py-1 border border-gray-300 rounded"
                autoFocus
              />
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-600">
                {fieldName}
              </span>
              {!fieldConfig.primaryKey && (
                <button
                  onClick={() => setEditingName(true)}
                  className="text-xs text-blue-600 hover:text-blue-800"
                >
                  rename
                </button>
              )}
              {fieldConfig.primaryKey && (
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                  Primary Key
                </span>
              )}
            </div>
          )}
        </div>
        
        {canRemove && (
          <button
            onClick={onRemove}
            className="text-red-600 hover:text-red-800 text-sm"
          >
            Remove
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Display Name
          </label>
          <input
            type="text"
            value={fieldConfig.displayName}
            onChange={(e) => onUpdate({ displayName: e.target.value })}
            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Type
          </label>
          <select
            value={fieldConfig.type}
            onChange={(e) => onUpdate({ type: e.target.value as FieldType })}
            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            disabled={fieldConfig.primaryKey}
          >
            {fieldTypes.map(type => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center space-x-4 pt-5">
          <label className="flex items-center space-x-1">
            <input
              type="checkbox"
              checked={fieldConfig.required || false}
              onChange={(e) => onUpdate({ required: e.target.checked })}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              disabled={fieldConfig.primaryKey}
            />
            <span className="text-xs text-gray-700">Required</span>
          </label>
        </div>
      </div>

      {/* Type-specific options */}
      {['select', 'multiselect'].includes(fieldConfig.type) && (
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Options (one per line)
          </label>
          <textarea
            value={fieldConfig.options?.join('\n') || ''}
            onChange={(e) => onUpdate({ 
              options: e.target.value.split('\n').filter(opt => opt.trim()) 
            })}
            placeholder="Option 1&#10;Option 2&#10;Option 3"
            rows={3}
            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      )}

      {fieldConfig.type === 'number' && (
        <div className="grid grid-cols-3 gap-2">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Min Value
            </label>
            <input
              type="number"
              value={fieldConfig.min || ''}
              onChange={(e) => onUpdate({ min: e.target.value ? Number(e.target.value) : undefined })}
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Max Value
            </label>
            <input
              type="number"
              value={fieldConfig.max || ''}
              onChange={(e) => onUpdate({ max: e.target.value ? Number(e.target.value) : undefined })}
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Format
            </label>
            <select
              value={fieldConfig.format || ''}
              onChange={(e) => onUpdate({ format: e.target.value as any })}
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">Default</option>
              <option value="currency">Currency</option>
              <option value="percentage">Percentage</option>
            </select>
          </div>
        </div>
      )}

      {['text', 'textarea'].includes(fieldConfig.type) && (
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Min Length
            </label>
            <input
              type="number"
              value={fieldConfig.minLength || ''}
              onChange={(e) => onUpdate({ minLength: e.target.value ? Number(e.target.value) : undefined })}
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Max Length
            </label>
            <input
              type="number"
              value={fieldConfig.maxLength || ''}
              onChange={(e) => onUpdate({ maxLength: e.target.value ? Number(e.target.value) : undefined })}
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>
      )}

      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">
          Help Text
        </label>
        <input
          type="text"
          value={fieldConfig.helpText || ''}
          onChange={(e) => onUpdate({ helpText: e.target.value })}
          placeholder="Optional help text for users"
          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>
    </div>
  );
}