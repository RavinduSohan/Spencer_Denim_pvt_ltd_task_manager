import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { TableConfigService } from './table-config-service';
import { TableRecord, TableConfig, TableListResponse, TableCreateResponse, TableUpdateResponse } from '@/types/table-config';

export class DynamicSQLiteService {
  private static dbPath = path.join(process.cwd(), 'data', 'dynamic-tables.db');
  private static db: Database.Database | null = null;

  /**
   * Initialize database connection and create tables
   */
  static initialize(): boolean {
    try {
      // Ensure data directory exists
      const dataDir = path.dirname(this.dbPath);
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }

      // Create database connection
      this.db = new Database(this.dbPath);
      this.db.pragma('journal_mode = WAL');
      this.db.pragma('foreign_keys = ON');

      // Create tables from configurations
      this.createTablesFromConfigs();

      console.log('Dynamic SQLite database initialized successfully');
      return true;
    } catch (error) {
      console.error('Error initializing dynamic SQLite database:', error);
      return false;
    }
  }

  /**
   * Get database instance
   */
  private static getDb(): Database.Database {
    if (!this.db) {
      this.initialize();
    }
    return this.db!;
  }

  /**
   * Create tables from configurations
   */
  static createTablesFromConfigs(): void {
    const configs = TableConfigService.loadConfigs();
    const db = this.getDb();

    for (const [tableName, config] of Object.entries(configs.tables)) {
      try {
        const createSQL = TableConfigService.generateCreateTableSQL(tableName, config);
        db.exec(createSQL);
        console.log(`Table '${tableName}' created/updated successfully`);
      } catch (error) {
        console.error(`Error creating table '${tableName}':`, error);
      }
    }
  }

  /**
   * Create a new table from configuration
   */
  static createTable(tableName: string): boolean {
    try {
      const config = TableConfigService.getTableConfig(tableName);
      if (!config) {
        throw new Error(`Table configuration not found: ${tableName}`);
      }

      const createSQL = TableConfigService.generateCreateTableSQL(tableName, config);
      const db = this.getDb();
      db.exec(createSQL);
      
      console.log(`Table '${tableName}' created successfully`);
      return true;
    } catch (error) {
      console.error(`Error creating table '${tableName}':`, error);
      return false;
    }
  }

  /**
   * Drop a table
   */
  static dropTable(tableName: string): boolean {
    try {
      const db = this.getDb();
      db.exec(`DROP TABLE IF EXISTS "${tableName}"`);
      console.log(`Table '${tableName}' dropped successfully`);
      return true;
    } catch (error) {
      console.error(`Error dropping table '${tableName}':`, error);
      return false;
    }
  }

  /**
   * Get all records from a table
   */
  static getRecords(
    tableName: string, 
    options: {
      limit?: number;
      offset?: number;
      sort?: string;
      sortOrder?: 'ASC' | 'DESC';
      filters?: Record<string, any>;
      search?: string;
    } = {}
  ): TableListResponse {
    try {
      const config = TableConfigService.getTableConfig(tableName);
      if (!config) {
        return {
          success: false,
          error: `Table configuration not found: ${tableName}`
        };
      }

      const db = this.getDb();
      let query = `SELECT * FROM "${tableName}"`;
      const params: any[] = [];

      // Build WHERE clause
      const whereClauses: string[] = [];
      
      // Add filters
      if (options.filters) {
        for (const [field, value] of Object.entries(options.filters)) {
          if (value !== undefined && value !== null && value !== '') {
            whereClauses.push(`"${field}" = ?`);
            params.push(value);
          }
        }
      }

      // Add search
      if (options.search) {
        const searchFields = Object.keys(config.fields).filter(field => 
          ['text', 'email', 'textarea'].includes(config.fields[field].type)
        );
        
        if (searchFields.length > 0) {
          const searchClause = searchFields
            .map(field => `"${field}" LIKE ?`)
            .join(' OR ');
          whereClauses.push(`(${searchClause})`);
          searchFields.forEach(() => params.push(`%${options.search}%`));
        }
      }

      if (whereClauses.length > 0) {
        query += ` WHERE ${whereClauses.join(' AND ')}`;
      }

      // Add sorting
      if (options.sort) {
        const sortOrder = options.sortOrder || 'ASC';
        query += ` ORDER BY "${options.sort}" ${sortOrder}`;
      } else if (config.defaultSort) {
        const sortOrder = config.defaultSortOrder || 'ASC';
        query += ` ORDER BY "${config.defaultSort}" ${sortOrder.toUpperCase()}`;
      }

      // Add pagination
      if (options.limit) {
        query += ` LIMIT ?`;
        params.push(options.limit);
        
        if (options.offset) {
          query += ` OFFSET ?`;
          params.push(options.offset);
        }
      }

      const stmt = db.prepare(query);
      const records = stmt.all(...params) as TableRecord[];

      // Calculate fields for each record
      const processedRecords = records.map(record => 
        TableConfigService.calculateFields(record, config)
      );

      // Get total count
      let countQuery = `SELECT COUNT(*) as total FROM "${tableName}"`;
      const countParams: any[] = [];
      
      if (whereClauses.length > 0) {
        countQuery += ` WHERE ${whereClauses.join(' AND ')}`;
        // Add search params for count query
        if (options.filters) {
          for (const [field, value] of Object.entries(options.filters)) {
            if (value !== undefined && value !== null && value !== '') {
              countParams.push(value);
            }
          }
        }
        if (options.search) {
          const searchFields = Object.keys(config.fields).filter(field => 
            ['text', 'email', 'textarea'].includes(config.fields[field].type)
          );
          searchFields.forEach(() => countParams.push(`%${options.search}%`));
        }
      }

      const countStmt = db.prepare(countQuery);
      const { total } = countStmt.get(...countParams) as { total: number };

      return {
        success: true,
        data: {
          records: processedRecords,
          config,
          metadata: {
            tableName,
            config,
            recordCount: total,
            lastModified: new Date()
          }
        },
        metadata: {
          total,
          page: options.offset ? Math.floor(options.offset / (options.limit || 10)) + 1 : 1,
          limit: options.limit || total,
          hasMore: options.limit ? (options.offset || 0) + options.limit < total : false
        }
      };
    } catch (error) {
      console.error(`Error getting records from ${tableName}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get a single record by ID
   */
  static getRecord(tableName: string, id: string): TableRecord | null {
    try {
      const config = TableConfigService.getTableConfig(tableName);
      if (!config) {
        return null;
      }

      // Find primary key field
      const primaryKeyField = Object.keys(config.fields).find(field => 
        config.fields[field].primaryKey
      );

      if (!primaryKeyField) {
        throw new Error(`No primary key defined for table ${tableName}`);
      }

      const db = this.getDb();
      const stmt = db.prepare(`SELECT * FROM "${tableName}" WHERE "${primaryKeyField}" = ?`);
      const record = stmt.get(id) as TableRecord;

      if (record) {
        return TableConfigService.calculateFields(record, config);
      }

      return null;
    } catch (error) {
      console.error(`Error getting record from ${tableName}:`, error);
      return null;
    }
  }

  /**
   * Create a new record
   */
  static createRecord(tableName: string, data: Partial<TableRecord>): TableCreateResponse {
    try {
      const config = TableConfigService.getTableConfig(tableName);
      if (!config) {
        return {
          success: false,
          error: `Table configuration not found: ${tableName}`
        };
      }

      // Validate data
      const validation = TableConfigService.validateRecord(tableName, data, false);
      if (!validation.valid) {
        return {
          success: false,
          error: `Validation failed: ${validation.errors.map(e => e.message).join(', ')}`
        };
      }

      const sanitizedData = validation.sanitizedData!;
      const processedData = TableConfigService.calculateFields(sanitizedData, config);

      // Build INSERT query
      const fields = Object.keys(processedData).filter(field => 
        !config.fields[field]?.calculated
      );
      const placeholders = fields.map(() => '?').join(', ');
      const values = fields.map(field => processedData[field]);

      const query = `INSERT INTO "${tableName}" (${fields.map(f => `"${f}"`).join(', ')}) VALUES (${placeholders})`;
      
      const db = this.getDb();
      const stmt = db.prepare(query);
      const result = stmt.run(...values);

      // Get the created record
      const primaryKeyField = Object.keys(config.fields).find(field => 
        config.fields[field].primaryKey
      );
      
      const recordId = primaryKeyField && processedData[primaryKeyField] 
        ? processedData[primaryKeyField] 
        : result.lastInsertRowid;

      const createdRecord = this.getRecord(tableName, String(recordId));

      return {
        success: true,
        data: {
          record: createdRecord!,
          id: String(recordId)
        }
      };
    } catch (error) {
      console.error(`Error creating record in ${tableName}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Update a record
   */
  static updateRecord(tableName: string, id: string, data: Partial<TableRecord>): TableUpdateResponse {
    try {
      const config = TableConfigService.getTableConfig(tableName);
      if (!config) {
        return {
          success: false,
          error: `Table configuration not found: ${tableName}`
        };
      }

      // Find primary key field
      const primaryKeyField = Object.keys(config.fields).find(field => 
        config.fields[field].primaryKey
      );

      if (!primaryKeyField) {
        return {
          success: false,
          error: `No primary key defined for table ${tableName}`
        };
      }

      // Validate data
      const validation = TableConfigService.validateRecord(tableName, data, true);
      if (!validation.valid) {
        return {
          success: false,
          error: `Validation failed: ${validation.errors.map(e => e.message).join(', ')}`
        };
      }

      const sanitizedData = validation.sanitizedData!;
      
      // Build UPDATE query
      const fields = Object.keys(sanitizedData).filter(field => 
        !config.fields[field]?.calculated && !config.fields[field]?.primaryKey
      );
      
      if (fields.length === 0) {
        return {
          success: false,
          error: 'No updatable fields provided'
        };
      }

      const setClause = fields.map(field => `"${field}" = ?`).join(', ');
      const values = fields.map(field => sanitizedData[field]);
      values.push(id);

      const query = `UPDATE "${tableName}" SET ${setClause} WHERE "${primaryKeyField}" = ?`;
      
      const db = this.getDb();
      const stmt = db.prepare(query);
      stmt.run(...values);

      // Get the updated record
      const updatedRecord = this.getRecord(tableName, id);

      return {
        success: true,
        data: {
          record: updatedRecord!,
          changes: sanitizedData
        }
      };
    } catch (error) {
      console.error(`Error updating record in ${tableName}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Delete a record
   */
  static deleteRecord(tableName: string, id: string): { success: boolean; error?: string } {
    try {
      const config = TableConfigService.getTableConfig(tableName);
      if (!config) {
        return {
          success: false,
          error: `Table configuration not found: ${tableName}`
        };
      }

      // Find primary key field
      const primaryKeyField = Object.keys(config.fields).find(field => 
        config.fields[field].primaryKey
      );

      if (!primaryKeyField) {
        return {
          success: false,
          error: `No primary key defined for table ${tableName}`
        };
      }

      const db = this.getDb();
      const stmt = db.prepare(`DELETE FROM "${tableName}" WHERE "${primaryKeyField}" = ?`);
      const result = stmt.run(id);

      if (result.changes === 0) {
        return {
          success: false,
          error: 'Record not found'
        };
      }

      return { success: true };
    } catch (error) {
      console.error(`Error deleting record from ${tableName}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get table statistics
   */
  static getTableStats(tableName: string): any {
    try {
      const db = this.getDb();
      
      // Get record count
      const countStmt = db.prepare(`SELECT COUNT(*) as count FROM "${tableName}"`);
      const { count } = countStmt.get() as { count: number };

      // Get table info
      const infoStmt = db.prepare(`PRAGMA table_info("${tableName}")`);
      const columns = infoStmt.all();

      return {
        recordCount: count,
        columns: columns.length,
        tableInfo: columns
      };
    } catch (error) {
      console.error(`Error getting stats for ${tableName}:`, error);
      return null;
    }
  }

  /**
   * Close database connection
   */
  static close(): void {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }
}