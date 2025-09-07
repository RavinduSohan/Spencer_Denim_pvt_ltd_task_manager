import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { OrderFilterSchema } from '@/lib/validations';
import { handleError, getQueryParams, buildWhereClause } from '@/lib/utils';
import * as XLSX from 'xlsx';

// Types for export
interface ExportFilters {
  dateFrom?: string;
  dateTo?: string;
  status?: string;
  client?: string;
}

// Format date for Excel
const formatDate = (date: Date | string | null): string => {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString() + ' ' + d.toLocaleTimeString();
};

// Format order data for Excel export
const formatOrdersForExport = (orders: any[]) => {
  return orders.map(order => ({
    'Order ID': order.id,
    'Order Number': order.orderNumber,
    'Client': order.client,
    'Product': order.product,
    'Quantity': order.quantity,
    'Status': order.status,
    'Progress (%)': order.progress,
    'Ship Date': formatDate(order.shipDate),
    'Created By': order.createdBy?.name || '',
    'Created At': formatDate(order.createdAt),
    'Updated At': formatDate(order.updatedAt),
    'Total Tasks': order._count?.tasks || 0,
    'Total Documents': order._count?.documents || 0,
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
    console.log('Orders export API called');
    const queryParams = getQueryParams(request);
    console.log('Query params:', queryParams);
    
    // Parse filters
    const filters = OrderFilterSchema.parse({
      status: queryParams.status,
      client: queryParams.client,
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

    // Handle client filter
    if (filters.client) {
      where.client = { contains: filters.client, mode: 'insensitive' };
    }

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

    console.log('Where clause:', JSON.stringify(where, null, 2));

    // Get all orders matching filters (no pagination for export)
    const orders = await db.order.findMany({
      where,
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        tasks: {
          select: {
            id: true,
            title: true,
            status: true,
            priority: true,
          },
        },
        documents: {
          select: {
            id: true,
            name: true,
            category: true,
          },
        },
        _count: {
          select: {
            tasks: true,
            documents: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    console.log('Orders fetched:', orders.length);

    // Format data for Excel
    const formattedData = formatOrdersForExport(orders as any);

    // Generate Excel file
    const buffer = generateExcelFile(formattedData, 'Orders Export', 'Orders');

    // Generate filename
    const filename = generateFilename('orders', { ...filters, ...exportFilters });

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
    console.error('Orders export error:', error);
    return handleError(error);
  }
}
