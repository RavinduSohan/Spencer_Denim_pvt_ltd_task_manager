import * as XLSX from 'xlsx';
import { Task, Order } from '@/types';

// Utility to format date for Excel
const formatDate = (date: Date | string | null): string => {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString() + ' ' + d.toLocaleTimeString();
};

// Format task data for Excel export
export const formatTasksForExport = (tasks: Task[]) => {
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

// Format order data for Excel export
export const formatOrdersForExport = (orders: Order[]) => {
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
export const generateExcelFile = (data: any[], filename: string, sheetName: string = 'Sheet1'): Buffer => {
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

// Export filter types
export interface ExportFilters {
  dateFrom?: string;
  dateTo?: string;
  status?: string;
  category?: string;
  assignedToId?: string;
  client?: string;
  priority?: string;
}

// Generate filename with timestamp
export const generateFilename = (type: 'tasks' | 'orders', filters?: ExportFilters): string => {
  const timestamp = new Date().toISOString().slice(0, 19).replace(/[T:]/g, '-');
  let filename = `${type}_export_${timestamp}`;
  
  if (filters?.dateFrom || filters?.dateTo) {
    filename += '_filtered';
  }
  
  return `${filename}.xlsx`;
};
