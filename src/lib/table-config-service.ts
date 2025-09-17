import fs from 'fs';
import path from 'path';
import { TableConfigFile, TableConfig, FieldConfig, TableRecord, ValidationResult, ValidationError } from '@/types/table-config';

export class TableConfigService {
  private static configPath = path.join(process.cwd(), 'config', 'table-configs.json');
  private static configCache: TableConfigFile | null = null;

  /**
   * Load table configurations from file
   */
  static loadConfigs(): TableConfigFile {
    if (this.configCache) {
      return this.configCache;
    }

    try {
      const configData = fs.readFileSync(this.configPath, 'utf-8');
      this.configCache = JSON.parse(configData);
      return this.configCache as TableConfigFile;
    } catch (error) {
      console.error('Error loading table configs:', error);
      const defaultConfig = { tables: {} };
      this.configCache = defaultConfig;
      return defaultConfig;
    }
  }

  /**
   * Save table configurations to file
   */
  static saveConfigs(configs: TableConfigFile): boolean {
    try {
      // Ensure config directory exists
      const configDir = path.dirname(this.configPath);
      if (!fs.existsSync(configDir)) {
        fs.mkdirSync(configDir, { recursive: true });
      }

      fs.writeFileSync(this.configPath, JSON.stringify(configs, null, 2));
      this.configCache = configs;
      return true;
    } catch (error) {
      console.error('Error saving table configs:', error);
      return false;
    }
  }

  /**
   * Get all table names
   */
  static getTableNames(): string[] {
    const configs = this.loadConfigs();
    return Object.keys(configs.tables);
  }

  /**
   * Get specific table configuration
   */
  static getTableConfig(tableName: string): TableConfig | null {
    const configs = this.loadConfigs();
    return configs.tables[tableName] || null;
  }

  /**
   * Add or update table configuration
   */
  static setTableConfig(tableName: string, config: TableConfig): boolean {
    const configs = this.loadConfigs();
    configs.tables[tableName] = config;
    return this.saveConfigs(configs);
  }

  /**
   * Delete table configuration
   */
  static deleteTableConfig(tableName: string): boolean {
    const configs = this.loadConfigs();
    if (configs.tables[tableName]) {
      delete configs.tables[tableName];
      return this.saveConfigs(configs);
    }
    return false;
  }

  /**
   * Generate SQLite CREATE TABLE statement from config
   */
  static generateCreateTableSQL(tableName: string, config: TableConfig): string {
    const fields = config.fields;
    const columns: string[] = [];

    for (const [fieldName, fieldConfig] of Object.entries(fields)) {
      if (fieldConfig.calculated) {
        continue; // Skip calculated fields in SQL
      }

      let columnDef = `"${fieldName}"`;
      
      // Determine SQL type
      switch (fieldConfig.type) {
        case 'text':
        case 'email':
        case 'url':
        case 'textarea':
        case 'select':
        case 'multiselect':
          columnDef += ' TEXT';
          break;
        case 'number':
          columnDef += fieldConfig.format === 'currency' || fieldConfig.format === 'decimal' 
            ? ' REAL' 
            : ' INTEGER';
          break;
        case 'boolean':
          columnDef += ' BOOLEAN';
          break;
        case 'date':
        case 'timestamp':
          columnDef += ' TEXT'; // SQLite stores dates as text
          break;
        case 'file':
        case 'image':
          columnDef += ' TEXT'; // Store file paths/URLs
          break;
        default:
          columnDef += ' TEXT';
      }

      // Add constraints
      if (fieldConfig.primaryKey) {
        columnDef += ' PRIMARY KEY';
      }
      
      if (fieldConfig.required && !fieldConfig.primaryKey) {
        columnDef += ' NOT NULL';
      }

      if (fieldConfig.unique && !fieldConfig.primaryKey) {
        columnDef += ' UNIQUE';
      }

      // Add default value
      if (fieldConfig.default !== undefined && fieldConfig.default !== 'auto' && fieldConfig.default !== 'now') {
        if (typeof fieldConfig.default === 'string') {
          columnDef += ` DEFAULT '${fieldConfig.default}'`;
        } else {
          columnDef += ` DEFAULT ${fieldConfig.default}`;
        }
      }

      columns.push(columnDef);
    }

    return `CREATE TABLE IF NOT EXISTS "${tableName}" (\n  ${columns.join(',\n  ')}\n);`;
  }

  /**
   * Validate record data against table configuration
   */
  static validateRecord(tableName: string, data: Partial<TableRecord>, isUpdate = false): ValidationResult {
    const config = this.getTableConfig(tableName);
    if (!config) {
      return {
        valid: false,
        errors: [{ field: 'table', message: `Table configuration not found: ${tableName}` }]
      };
    }

    const errors: ValidationError[] = [];
    const sanitizedData: TableRecord = {};

    for (const [fieldName, fieldConfig] of Object.entries(config.fields)) {
      const value = data[fieldName];

      // Skip calculated and readonly fields
      if (fieldConfig.calculated || (fieldConfig.readonly && isUpdate)) {
        continue;
      }

      // Check required fields
      if (fieldConfig.required && (value === undefined || value === null || value === '')) {
        if (!isUpdate || data.hasOwnProperty(fieldName)) {
          errors.push({
            field: fieldName,
            message: `${fieldConfig.displayName} is required`,
            value
          });
          continue;
        }
      }

      // Skip validation if field is not provided in update
      if (isUpdate && !data.hasOwnProperty(fieldName)) {
        continue;
      }

      // Type validation
      if (value !== undefined && value !== null && value !== '') {
        const validationError = this.validateFieldValue(fieldName, value, fieldConfig);
        if (validationError) {
          errors.push(validationError);
          continue;
        }
      }

      // Add to sanitized data
      sanitizedData[fieldName] = this.sanitizeFieldValue(value, fieldConfig);
    }

    // Add auto-generated fields
    for (const [fieldName, fieldConfig] of Object.entries(config.fields)) {
      if (fieldConfig.default === 'auto' && !isUpdate) {
        sanitizedData[fieldName] = this.generateAutoValue(fieldName, fieldConfig);
      } else if (fieldConfig.default === 'now') {
        if (!isUpdate || fieldName === 'updatedAt') {
          sanitizedData[fieldName] = new Date().toISOString();
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      sanitizedData: errors.length === 0 ? sanitizedData : undefined
    };
  }

  /**
   * Validate individual field value
   */
  private static validateFieldValue(fieldName: string, value: any, config: FieldConfig): ValidationError | null {
    const { type, min, max, minLength, maxLength, pattern, options } = config;

    // Type-specific validation
    switch (type) {
      case 'number':
        const num = Number(value);
        if (isNaN(num)) {
          return { field: fieldName, message: `${config.displayName} must be a number`, value };
        }
        if (min !== undefined && num < min) {
          return { field: fieldName, message: `${config.displayName} must be at least ${min}`, value };
        }
        if (max !== undefined && num > max) {
          return { field: fieldName, message: `${config.displayName} must be at most ${max}`, value };
        }
        break;

      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          return { field: fieldName, message: `${config.displayName} must be a valid email address`, value };
        }
        break;

      case 'url':
        try {
          new URL(value);
        } catch {
          return { field: fieldName, message: `${config.displayName} must be a valid URL`, value };
        }
        break;

      case 'date':
        const date = new Date(value);
        if (isNaN(date.getTime())) {
          return { field: fieldName, message: `${config.displayName} must be a valid date`, value };
        }
        break;

      case 'select':
        if (options && !options.includes(value)) {
          return { field: fieldName, message: `${config.displayName} must be one of: ${options.join(', ')}`, value };
        }
        break;

      case 'multiselect':
        if (options && Array.isArray(value)) {
          for (const item of value) {
            if (!options.includes(item)) {
              return { field: fieldName, message: `${config.displayName} contains invalid option: ${item}`, value };
            }
          }
        }
        break;
    }

    // String length validation
    if (typeof value === 'string') {
      if (minLength !== undefined && value.length < minLength) {
        return { field: fieldName, message: `${config.displayName} must be at least ${minLength} characters`, value };
      }
      if (maxLength !== undefined && value.length > maxLength) {
        return { field: fieldName, message: `${config.displayName} must be at most ${maxLength} characters`, value };
      }
    }

    // Pattern validation
    if (pattern && typeof value === 'string') {
      const regex = new RegExp(pattern);
      if (!regex.test(value)) {
        return { field: fieldName, message: `${config.displayName} format is invalid`, value };
      }
    }

    return null;
  }

  /**
   * Sanitize field value
   */
  private static sanitizeFieldValue(value: any, config: FieldConfig): any {
    if (value === undefined || value === null) {
      return null;
    }

    switch (config.type) {
      case 'number':
        return Number(value);
      case 'boolean':
        return Boolean(value);
      case 'date':
      case 'timestamp':
        return new Date(value).toISOString();
      case 'multiselect':
        return Array.isArray(value) ? value : [value];
      default:
        return String(value);
    }
  }

  /**
   * Generate auto value for fields
   */
  private static generateAutoValue(fieldName: string, config: FieldConfig): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `${fieldName}_${timestamp}_${random}`;
  }

  /**
   * Calculate field values
   */
  static calculateFields(data: TableRecord, config: TableConfig): TableRecord {
    const result = { ...data };

    for (const [fieldName, fieldConfig] of Object.entries(config.fields)) {
      if (fieldConfig.calculated && fieldConfig.formula) {
        try {
          // Simple formula evaluation (extend as needed)
          let formula = fieldConfig.formula;
          
          // Replace field names with values
          for (const [key, value] of Object.entries(result)) {
            formula = formula.replace(new RegExp(key, 'g'), String(value || 0));
          }

          // Evaluate simple mathematical expressions
          const calculatedValue = this.evaluateFormula(formula);
          result[fieldName] = calculatedValue;
        } catch (error) {
          console.warn(`Error calculating field ${fieldName}:`, error);
          result[fieldName] = null;
        }
      }
    }

    return result;
  }

  /**
   * Evaluate simple mathematical formulas
   */
  private static evaluateFormula(formula: string): number {
    // Simple and safe formula evaluation
    // Only allows basic math operations
    const sanitized = formula.replace(/[^0-9+\-*/.() ]/g, '');
    try {
      return Function(`"use strict"; return (${sanitized})`)();
    } catch {
      return 0;
    }
  }

  /**
   * Clear configuration cache
   */
  static clearCache(): void {
    this.configCache = null;
  }
}