// Configuration types for dynamic table system

export type FieldType = 
  | 'text' 
  | 'number' 
  | 'boolean' 
  | 'date' 
  | 'timestamp' 
  | 'email' 
  | 'url' 
  | 'textarea' 
  | 'select' 
  | 'multiselect'
  | 'file'
  | 'image';

export type FormatType = 'currency' | 'percentage' | 'decimal' | 'integer';

export interface FieldConfig {
  type: FieldType;
  displayName: string;
  required?: boolean;
  primaryKey?: boolean;
  unique?: boolean;
  readonly?: boolean;
  default?: any;
  
  // Validation rules
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  
  // Select/Multiselect options
  options?: string[];
  
  // Formatting
  format?: FormatType;
  
  // Calculated fields
  calculated?: boolean;
  formula?: string;
  
  // UI hints
  placeholder?: string;
  helpText?: string;
  group?: string;
}

export interface TableConfig {
  displayName: string;
  description?: string;
  icon?: string;
  color?: string;
  
  // Table settings
  sortable?: boolean;
  filterable?: boolean;
  searchable?: boolean;
  paginated?: boolean;
  exportable?: boolean;
  
  // Field definitions
  fields: Record<string, FieldConfig>;
  
  // Display settings
  defaultSort?: string;
  defaultSortOrder?: 'asc' | 'desc';
  displayFields?: string[]; // Fields to show in list view
  editableFields?: string[]; // Fields that can be edited
  
  // Permissions
  permissions?: {
    create?: boolean;
    read?: boolean;
    update?: boolean;
    delete?: boolean;
    export?: boolean;
  };
}

export interface TableConfigFile {
  tables: Record<string, TableConfig>;
}

// Runtime data types
export interface TableRecord {
  [key: string]: any;
}

export interface TableMetadata {
  tableName: string;
  config: TableConfig;
  recordCount?: number;
  lastModified?: Date;
}

export interface ValidationError {
  field: string;
  message: string;
  value?: any;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  sanitizedData?: TableRecord;
}

// API types
export interface TableApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  metadata?: {
    total?: number;
    page?: number;
    limit?: number;
    hasMore?: boolean;
  };
}

export interface TableListResponse extends TableApiResponse {
  data?: {
    records: TableRecord[];
    config: TableConfig;
    metadata: TableMetadata;
  };
}

export interface TableCreateResponse extends TableApiResponse {
  data?: {
    record: TableRecord;
    id: string;
  };
}

export interface TableUpdateResponse extends TableApiResponse {
  data?: {
    record: TableRecord;
    changes: Partial<TableRecord>;
  };
}

// Export types
export interface ExportOptions {
  format: 'xlsx' | 'csv' | 'json';
  fields?: string[];
  filters?: Record<string, any>;
  sort?: string;
  sortOrder?: 'asc' | 'desc';
  includeHeaders?: boolean;
  filename?: string;
}

export interface ExportResult {
  success: boolean;
  filename?: string;
  downloadUrl?: string;
  error?: string;
}