import { NextRequest, NextResponse } from 'next/server';
import { TableConfigService } from '@/lib/table-config-service';
import { DynamicSQLiteService } from '@/lib/dynamic-sqlite-service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tableName = searchParams.get('table');

    if (tableName) {
      // Get specific table configuration
      const config = TableConfigService.getTableConfig(tableName);
      if (!config) {
        return NextResponse.json(
          { success: false, error: 'Table configuration not found' },
          { status: 404 }
        );
      }

      // Get table statistics
      const stats = DynamicSQLiteService.getTableStats(tableName);

      return NextResponse.json({
        success: true,
        data: {
          tableName,
          config,
          stats
        }
      });
    } else {
      // Get all table configurations
      const configs = TableConfigService.loadConfigs();
      const tableNames = Object.keys(configs.tables);
      
      // Get stats for all tables
      const tablesWithStats = tableNames.map(name => ({
        name,
        config: configs.tables[name],
        stats: DynamicSQLiteService.getTableStats(name)
      }));

      return NextResponse.json({
        success: true,
        data: {
          tables: tablesWithStats,
          totalTables: tableNames.length
        }
      });
    }
  } catch (error) {
    console.error('Error in table config GET:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { tableName, config } = await request.json();

    if (!tableName || !config) {
      return NextResponse.json(
        { success: false, error: 'Table name and configuration are required' },
        { status: 400 }
      );
    }

    // Validate table name
    if (!/^[a-zA-Z][a-zA-Z0-9_]*$/.test(tableName)) {
      return NextResponse.json(
        { success: false, error: 'Invalid table name. Use only letters, numbers, and underscores, starting with a letter.' },
        { status: 400 }
      );
    }

    // Save configuration
    const saved = TableConfigService.setTableConfig(tableName, config);
    if (!saved) {
      return NextResponse.json(
        { success: false, error: 'Failed to save table configuration' },
        { status: 500 }
      );
    }

    // Create the table in SQLite
    const created = DynamicSQLiteService.createTable(tableName);
    if (!created) {
      return NextResponse.json(
        { success: false, error: 'Failed to create table in database' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        tableName,
        config,
        message: 'Table configuration saved and table created successfully'
      }
    }, { status: 201 });
  } catch (error) {
    console.error('Error in table config POST:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { tableName, config } = await request.json();

    if (!tableName || !config) {
      return NextResponse.json(
        { success: false, error: 'Table name and configuration are required' },
        { status: 400 }
      );
    }

    // Check if table exists
    const existingConfig = TableConfigService.getTableConfig(tableName);
    if (!existingConfig) {
      return NextResponse.json(
        { success: false, error: 'Table configuration not found' },
        { status: 404 }
      );
    }

    // Save updated configuration
    const saved = TableConfigService.setTableConfig(tableName, config);
    if (!saved) {
      return NextResponse.json(
        { success: false, error: 'Failed to update table configuration' },
        { status: 500 }
      );
    }

    // Recreate the table (this will preserve data for existing columns)
    const recreated = DynamicSQLiteService.createTable(tableName);
    if (!recreated) {
      console.warn('Failed to recreate table in database, but configuration was updated');
    }

    return NextResponse.json({
      success: true,
      data: {
        tableName,
        config,
        message: 'Table configuration updated successfully'
      }
    });
  } catch (error) {
    console.error('Error in table config PUT:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tableName = searchParams.get('table');

    if (!tableName) {
      return NextResponse.json(
        { success: false, error: 'Table name is required' },
        { status: 400 }
      );
    }

    // Check if table exists
    const existingConfig = TableConfigService.getTableConfig(tableName);
    if (!existingConfig) {
      return NextResponse.json(
        { success: false, error: 'Table configuration not found' },
        { status: 404 }
      );
    }

    // Drop the table from database
    DynamicSQLiteService.dropTable(tableName);

    // Delete configuration
    const deleted = TableConfigService.deleteTableConfig(tableName);
    if (!deleted) {
      return NextResponse.json(
        { success: false, error: 'Failed to delete table configuration' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        tableName,
        message: 'Table and configuration deleted successfully'
      }
    });
  } catch (error) {
    console.error('Error in table config DELETE:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}