import { NextRequest, NextResponse } from 'next/server';
import { getDatabaseClient } from '@/lib/server-database';
import { TaskFilterSchema } from '@/lib/validations';
import { handleError, getQueryParams, buildWhereClause } from '@/lib/utils';
import * as XLSX from 'xlsx';

// Types for export
interface ExportFilters {
  dateFrom?: string;
  dateTo?: string;
  status?: string;
  category?: string;
  assignedToId?: string;
  client?: string;
  priority?: string;
}

// Format date for Excel
const formatDate = (date: Date | string | null): string => {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString() + ' ' + d.toLocaleTimeString();
};

// Format task data for Excel export
const formatTasksForExport = (tasks: any[]) => {
  return tasks.map(task => ({
    'Task ID': task.id,
    'Title': task.title,
    'Description': task.description || '',
    'Status': task.status,
    'Priority': task.priority,
    'Category': task.category,
    'Assigned To': task.assignedTo?.name || 'Unassigned',
    'Created By': task.createdBy?.name || '',
    'Due Date': task.dueDate ? formatDate(task.dueDate) : '',
    'Completed At': task.completedAt ? formatDate(task.completedAt) : '',
    'Created At': formatDate(task.createdAt),
    'Updated At': formatDate(task.updatedAt),
    'Order ID': task.orderId || '',
  }));
};

// Generate Excel file from data
const generateExcelFile = (data: any[], filename: string, sheetName: string = 'Sheet1'): Buffer => {
  // Create workbook and worksheet
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.json_to_sheet(data);

  // Auto-width columns
  const cols = Object.keys(data[0] || {}).map(key => ({
    wch: Math.max(key.length, 15) // Minimum width of 15 characters
  }));
  worksheet['!cols'] = cols;

  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

  // Generate buffer
  const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  return buffer;
};

// Generate filename with timestamp
const generateFilename = (type: 'tasks' | 'orders', filters?: ExportFilters): string => {
  const timestamp = new Date().toISOString().slice(0, 19).replace(/[T:]/g, '-');
  let filename = `${type}_export_${timestamp}`;
  
  if (filters?.dateFrom || filters?.dateTo) {
    filename += '_filtered';
  }
  
  return `${filename}.xlsx`;
};

export async function GET(request: NextRequest) {
  try {
    const db = getDatabaseClient(request);
    console.log('Export API called');
    const queryParams = getQueryParams(request);
    console.log('Query params:', queryParams);
    
    // Parse filters
    const filters = TaskFilterSchema.parse({
      status: queryParams.status,
      priority: queryParams.priority,
      category: queryParams.category,
      assignedToId: queryParams.assignedToId,
      orderId: queryParams.orderId,
      search: queryParams.search,
    });

    console.log('Parsed filters:', filters);

    // Additional export-specific filters
    const exportFilters: ExportFilters = {
      dateFrom: queryParams.search?.includes('dateFrom:') ? queryParams.search.split('dateFrom:')[1]?.split(',')[0] : undefined,
      dateTo: queryParams.search?.includes('dateTo:') ? queryParams.search.split('dateTo:')[1]?.split(',')[0] : undefined,
    };

    console.log('Export filters:', exportFilters);

    // Build where clause
    const where = buildWhereClause(filters);

    // Add date range filters
    if (exportFilters.dateFrom || exportFilters.dateTo) {
      where.createdAt = {};
      if (exportFilters.dateFrom) {
        where.createdAt.gte = new Date(exportFilters.dateFrom);
      }
      if (exportFilters.dateTo) {
        where.createdAt.lte = new Date(exportFilters.dateTo);
      }
    }

    // Handle assignedTo filter
    if (filters.assignedToId) {
      where.assignedToId = filters.assignedToId;
    }

    // Handle order filter
    if (filters.orderId) {
      where.orderId = filters.orderId;
    }

    console.log('Where clause:', JSON.stringify(where, null, 2));

    // Get all tasks matching filters (no pagination for export)
    const tasks = await db.task.findMany({
      where,
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        order: {
          select: {
            id: true,
            orderNumber: true,
            client: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    console.log('Tasks fetched:', tasks.length);

    // Format data for Excel
    const formattedData = formatTasksForExport(tasks);

    // Generate Excel file
    const buffer = generateExcelFile(formattedData, 'Tasks Export', 'Tasks');

    // Generate filename
    const filename = generateFilename('tasks', { ...filters, ...exportFilters });

    console.log('Generated filename:', filename);

    // Return file response
    const response = new Response(buffer as any, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': buffer.length.toString(),
      },
    });

    return response;
  } catch (error) {
    console.error('Tasks export error:', error);
    return handleError(error);
  }
}
