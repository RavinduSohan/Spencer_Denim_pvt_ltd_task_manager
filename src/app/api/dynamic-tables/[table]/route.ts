import { NextRequest, NextResponse } from 'next/server';
import { DynamicSQLiteService } from '@/lib/dynamic-sqlite-service';
import { TableConfigService } from '@/lib/table-config-service';
import { requireAuth } from '@/lib/auth-utils';

function successResponse(data: any = null, message: string = 'Success') {
  return NextResponse.json({
    success: true,
    message,
    data,
    timestamp: new Date().toISOString()
  });
}

function errorResponse(message: string, status: number = 400) {
  return NextResponse.json({
    success: false,
    error: message,
    timestamp: new Date().toISOString()
  }, { status });
}

/**
 * DELETE - Drop/Delete a table completely
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { table: string } }
) {
  try {
    const user = await requireAuth(request);

    const { table } = params;
    
    if (!table) {
      return errorResponse('Table name is required');
    }

    // Check if table configuration exists
    const config = TableConfigService.getTableConfig(table);
    if (!config) {
      return errorResponse(`Table configuration not found: ${table}`, 404);
    }

    // Drop the table
    const success = DynamicSQLiteService.dropTable(table);
    
    if (!success) {
      return errorResponse(`Failed to drop table: ${table}`, 500);
    }

    // Remove from table configuration
    TableConfigService.deleteTableConfig(table);

    return successResponse(
      { tableName: table },
      `Table '${table}' deleted successfully`
    );
    
  } catch (error) {
    console.error('Error in table DELETE endpoint:', error);
    return errorResponse(
      error instanceof Error ? error.message : 'Internal server error',
      500
    );
  }
}

/**
 * PATCH - Clear/Reset table data (keep structure)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { table: string } }
) {
  try {
    const user = await requireAuth(request);

    const { table } = params;
    
    if (!table) {
      return errorResponse('Table name is required');
    }

    const body = await request.json();
    const { action } = body;

    if (action !== 'clear') {
      return errorResponse('Invalid action. Only "clear" is supported for PATCH');
    }

    // Check if table configuration exists
    const config = TableConfigService.getTableConfig(table);
    if (!config) {
      return errorResponse(`Table configuration not found: ${table}`, 404);
    }

    // Clear the table data
    const result = DynamicSQLiteService.clearTable(table);
    
    if (!result.success) {
      return errorResponse(result.error || `Failed to clear table: ${table}`, 500);
    }

    return successResponse(
      { tableName: table, action: 'clear' },
      `Table '${table}' data cleared successfully`
    );
    
  } catch (error) {
    console.error('Error in table PATCH endpoint:', error);
    return errorResponse(
      error instanceof Error ? error.message : 'Internal server error',
      500
    );
  }
}