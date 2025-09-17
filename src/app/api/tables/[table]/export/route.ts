import { NextRequest, NextResponse } from 'next/server';
import { DynamicSQLiteService } from '@/lib/dynamic-sqlite-service';
import { TableConfigService } from '@/lib/table-config-service';
import * as XLSX from 'xlsx';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ table: string }> }
) {
  try {
    const { table } = await params;
    const { searchParams } = new URL(request.url);

    // Get table configuration
    const config = TableConfigService.getTableConfig(table);
    if (!config) {
      return NextResponse.json(
        { success: false, error: 'Table configuration not found' },
        { status: 404 }
      );
    }

    // Parse query parameters for filtering/sorting
    const sort = searchParams.get('sort') || undefined;
    const sortOrder = searchParams.get('sortOrder') as 'ASC' | 'DESC' || 'ASC';
    const search = searchParams.get('search') || undefined;

    // Parse filters
    const filters: Record<string, any> = {};
    for (const [key, value] of searchParams.entries()) {
      if (!['sort', 'sortOrder', 'search', 'format', 'filename'].includes(key) && value) {
        filters[key] = value;
      }
    }

    // Get all records (no pagination for export)
    const result = DynamicSQLiteService.getRecords(table, {
      sort,
      sortOrder,
      filters,
      search
    });

    if (!result.success || !result.data) {
      return NextResponse.json(
        { success: false, error: 'Failed to fetch data for export' },
        { status: 400 }
      );
    }

    const { records } = result.data;

    // Prepare data for Excel export
    const exportData = records.map(record => {
      const row: Record<string, any> = {};
      
      // Use display names as headers and format values
      for (const [fieldName, fieldConfig] of Object.entries(config.fields)) {
        const value = record[fieldName];
        const displayName = fieldConfig.displayName;
        
        // Format values based on field type
        if (value !== null && value !== undefined) {
          switch (fieldConfig.type) {
            case 'date':
              row[displayName] = new Date(value).toLocaleDateString();
              break;
            case 'timestamp':
              row[displayName] = new Date(value).toLocaleString();
              break;
            case 'number':
              if (fieldConfig.format === 'currency') {
                row[displayName] = new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: 'USD'
                }).format(Number(value));
              } else if (fieldConfig.format === 'percentage') {
                row[displayName] = `${Number(value)}%`;
              } else {
                row[displayName] = Number(value);
              }
              break;
            case 'boolean':
              row[displayName] = value ? 'Yes' : 'No';
              break;
            case 'multiselect':
              row[displayName] = Array.isArray(value) ? value.join(', ') : value;
              break;
            default:
              row[displayName] = String(value);
          }
        } else {
          row[displayName] = '';
        }
      }
      
      return row;
    });

    // Create workbook
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(exportData);

    // Auto-size columns
    const maxWidths: number[] = [];
    
    // Calculate column widths based on content
    if (exportData.length > 0) {
      const headers = Object.keys(exportData[0]);
      headers.forEach((header, index) => {
        let maxWidth = header.length;
        exportData.forEach(row => {
          const cellValue = String(row[header] || '');
          maxWidth = Math.max(maxWidth, cellValue.length);
        });
        maxWidths[index] = Math.min(maxWidth + 2, 50); // Cap at 50 characters
      });
    }

    worksheet['!cols'] = maxWidths.map(width => ({ width }));

    // Add worksheet to workbook
    const sheetName = config.displayName || table;
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

    // Generate Excel file
    const excelBuffer = XLSX.write(workbook, { 
      type: 'buffer', 
      bookType: 'xlsx',
      compression: true 
    });

    // Prepare filename
    const timestamp = new Date().toISOString().slice(0, 19).replace(/[:.]/g, '-');
    const filename = searchParams.get('filename') || `${table}-export-${timestamp}.xlsx`;

    // Return Excel file
    return new NextResponse(excelBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': excelBuffer.length.toString(),
      },
    });

  } catch (error) {
    console.error('Error in Excel export:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate Excel export' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ table: string }> }
) {
  try {
    const { table } = await params;
    const { filters, sort, sortOrder, search, fields, filename } = await request.json();

    // Get table configuration
    const config = TableConfigService.getTableConfig(table);
    if (!config) {
      return NextResponse.json(
        { success: false, error: 'Table configuration not found' },
        { status: 404 }
      );
    }

    // Get records with specified filters
    const result = DynamicSQLiteService.getRecords(table, {
      sort,
      sortOrder: sortOrder as 'ASC' | 'DESC',
      filters,
      search
    });

    if (!result.success || !result.data) {
      return NextResponse.json(
        { success: false, error: 'Failed to fetch data for export' },
        { status: 400 }
      );
    }

    const { records } = result.data;

    // Filter fields if specified
    const fieldsToExport = fields || Object.keys(config.fields);
    
    // Prepare data for Excel export
    const exportData = records.map(record => {
      const row: Record<string, any> = {};
      
      fieldsToExport.forEach((fieldName: string) => {
        const fieldConfig = config.fields[fieldName];
        if (!fieldConfig) return;
        
        const value = record[fieldName];
        const displayName = fieldConfig.displayName;
        
        // Format values based on field type
        if (value !== null && value !== undefined) {
          switch (fieldConfig.type) {
            case 'date':
              row[displayName] = new Date(value).toLocaleDateString();
              break;
            case 'timestamp':
              row[displayName] = new Date(value).toLocaleString();
              break;
            case 'number':
              if (fieldConfig.format === 'currency') {
                row[displayName] = new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: 'USD'
                }).format(Number(value));
              } else if (fieldConfig.format === 'percentage') {
                row[displayName] = `${Number(value)}%`;
              } else {
                row[displayName] = Number(value);
              }
              break;
            case 'boolean':
              row[displayName] = value ? 'Yes' : 'No';
              break;
            case 'multiselect':
              row[displayName] = Array.isArray(value) ? value.join(', ') : value;
              break;
            default:
              row[displayName] = String(value);
          }
        } else {
          row[displayName] = '';
        }
      });
      
      return row;
    });

    // Create workbook
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(exportData);

    // Auto-size columns
    const maxWidths: number[] = [];
    
    if (exportData.length > 0) {
      const headers = Object.keys(exportData[0]);
      headers.forEach((header, index) => {
        let maxWidth = header.length;
        exportData.forEach(row => {
          const cellValue = String(row[header] || '');
          maxWidth = Math.max(maxWidth, cellValue.length);
        });
        maxWidths[index] = Math.min(maxWidth + 2, 50);
      });
    }

    worksheet['!cols'] = maxWidths.map(width => ({ width }));

    // Add worksheet to workbook
    const sheetName = config.displayName || table;
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

    // Generate Excel file
    const excelBuffer = XLSX.write(workbook, { 
      type: 'buffer', 
      bookType: 'xlsx',
      compression: true 
    });

    // Prepare filename
    const timestamp = new Date().toISOString().slice(0, 19).replace(/[:.]/g, '-');
    const finalFilename = filename || `${table}-export-${timestamp}.xlsx`;

    // Return Excel file
    return new NextResponse(excelBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${finalFilename}"`,
        'Content-Length': excelBuffer.length.toString(),
      },
    });

  } catch (error) {
    console.error('Error in Excel export POST:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate Excel export' },
      { status: 500 }
    );
  }
}