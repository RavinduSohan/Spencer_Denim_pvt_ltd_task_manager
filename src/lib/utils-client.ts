import { clsx, type ClassValue } from 'clsx';
import { format, isToday, isYesterday, formatDistanceToNow } from 'date-fns';
import {
  TaskStatus,
  Priority,
  OrderStatus,
  DocumentCategory,
  TaskCategory,
  ActivityType,
  StatusVariant,
  PriorityVariant,
} from '@/types';

// Utility function for combining class names
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

// Status and priority mappings
export const statusConfig = {
  [TaskStatus.PENDING]: {
    label: 'Pending',
    variant: 'pending' as StatusVariant,
    color: 'bg-yellow-100 text-yellow-800',
    icon: 'clock',
  },
  [TaskStatus.IN_PROGRESS]: {
    label: 'In Progress',
    variant: 'in-progress' as StatusVariant,
    color: 'bg-blue-100 text-blue-800',
    icon: 'play',
  },
  [TaskStatus.COMPLETED]: {
    label: 'Completed',
    variant: 'completed' as StatusVariant,
    color: 'bg-green-100 text-green-800',
    icon: 'check',
  },
  [TaskStatus.URGENT]: {
    label: 'Urgent',
    variant: 'urgent' as StatusVariant,
    color: 'bg-red-100 text-red-800',
    icon: 'exclamation',
  },
  [TaskStatus.ON_HOLD]: {
    label: 'On Hold',
    variant: 'on-hold' as StatusVariant,
    color: 'bg-gray-100 text-gray-800',
    icon: 'pause',
  },
};

export const priorityConfig = {
  [Priority.LOW]: {
    label: 'Low',
    variant: 'low' as PriorityVariant,
    color: 'bg-gray-100 text-gray-800',
    icon: 'arrow-down',
  },
  [Priority.MEDIUM]: {
    label: 'Medium',
    variant: 'medium' as PriorityVariant,
    color: 'bg-yellow-100 text-yellow-800',
    icon: 'minus',
  },
  [Priority.HIGH]: {
    label: 'High',
    variant: 'high' as PriorityVariant,
    color: 'bg-orange-100 text-orange-800',
    icon: 'arrow-up',
  },
  [Priority.URGENT]: {
    label: 'Urgent',
    variant: 'urgent' as PriorityVariant,
    color: 'bg-red-100 text-red-800',
    icon: 'exclamation-triangle',
  },
};

export const orderStatusConfig = {
  [OrderStatus.PENDING]: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
  [OrderStatus.SAMPLING]: { label: 'Sampling', color: 'bg-purple-100 text-purple-800' },
  [OrderStatus.CUTTING]: { label: 'Cutting', color: 'bg-blue-100 text-blue-800' },
  [OrderStatus.PRODUCTION]: { label: 'Production', color: 'bg-indigo-100 text-indigo-800' },
  [OrderStatus.QUALITY_CHECK]: { label: 'Quality Check', color: 'bg-orange-100 text-orange-800' },
  [OrderStatus.PACKING]: { label: 'Packing', color: 'bg-cyan-100 text-cyan-800' },
  [OrderStatus.SHIPPED]: { label: 'Shipped', color: 'bg-green-100 text-green-800' },
  [OrderStatus.DELIVERED]: { label: 'Delivered', color: 'bg-emerald-100 text-emerald-800' },
  [OrderStatus.CANCELLED]: { label: 'Cancelled', color: 'bg-red-100 text-red-800' },
};

export const categoryConfig = {
  [TaskCategory.SAMPLING]: { label: 'Sampling', color: 'bg-purple-100 text-purple-800', icon: 'beaker' },
  [TaskCategory.PRODUCTION]: { label: 'Production', color: 'bg-blue-100 text-blue-800', icon: 'cog' },
  [TaskCategory.QUALITY]: { label: 'Quality', color: 'bg-green-100 text-green-800', icon: 'shield-check' },
  [TaskCategory.SHIPPING]: { label: 'Shipping', color: 'bg-indigo-100 text-indigo-800', icon: 'truck' },
  [TaskCategory.COSTING]: { label: 'Costing', color: 'bg-yellow-100 text-yellow-800', icon: 'calculator' },
  [TaskCategory.DESIGN]: { label: 'Design', color: 'bg-pink-100 text-pink-800', icon: 'pencil' },
  [TaskCategory.PLANNING]: { label: 'Planning', color: 'bg-gray-100 text-gray-800', icon: 'calendar' },
};

export const documentCategoryConfig = {
  [DocumentCategory.TECH_PACK]: { label: 'Tech Pack', color: 'bg-blue-100 text-blue-800', icon: 'document-text' },
  [DocumentCategory.PURCHASE_ORDER]: { label: 'Purchase Order', color: 'bg-green-100 text-green-800', icon: 'clipboard-list' },
  [DocumentCategory.QUALITY_REPORT]: { label: 'Quality Report', color: 'bg-orange-100 text-orange-800', icon: 'chart-bar' },
  [DocumentCategory.SHIPPING_DOCUMENT]: { label: 'Shipping Document', color: 'bg-indigo-100 text-indigo-800', icon: 'truck' },
  [DocumentCategory.COST_SHEET]: { label: 'Cost Sheet', color: 'bg-yellow-100 text-yellow-800', icon: 'calculator' },
  [DocumentCategory.DESIGN_FILE]: { label: 'Design File', color: 'bg-pink-100 text-pink-800', icon: 'color-swatch' },
  [DocumentCategory.CONTRACT]: { label: 'Contract', color: 'bg-purple-100 text-purple-800', icon: 'document-duplicate' },
  [DocumentCategory.INVOICE]: { label: 'Invoice', color: 'bg-emerald-100 text-emerald-800', icon: 'currency-dollar' },
};

export const activityTypeConfig = {
  [ActivityType.TASK_CREATED]: { label: 'Task Created', color: 'bg-blue-100 text-blue-800', icon: 'plus' },
  [ActivityType.TASK_UPDATED]: { label: 'Task Updated', color: 'bg-yellow-100 text-yellow-800', icon: 'pencil' },
  [ActivityType.TASK_COMPLETED]: { label: 'Task Completed', color: 'bg-green-100 text-green-800', icon: 'check' },
  [ActivityType.ORDER_CREATED]: { label: 'Order Created', color: 'bg-purple-100 text-purple-800', icon: 'plus-circle' },
  [ActivityType.ORDER_UPDATED]: { label: 'Order Updated', color: 'bg-orange-100 text-orange-800', icon: 'refresh' },
  [ActivityType.DOCUMENT_UPLOADED]: { label: 'Document Uploaded', color: 'bg-indigo-100 text-indigo-800', icon: 'upload' },
  [ActivityType.USER_LOGIN]: { label: 'User Action', color: 'bg-gray-100 text-gray-800', icon: 'user' },
  [ActivityType.STATUS_CHANGED]: { label: 'Status Changed', color: 'bg-cyan-100 text-cyan-800', icon: 'arrow-right' },
};

// Date formatting utilities
export function formatDate(date: Date | string, formatStr = 'MMM dd, yyyy'): string {
  return format(new Date(date), formatStr);
}

export function formatDateTime(date: Date | string): string {
  return format(new Date(date), 'MMM dd, yyyy HH:mm');
}

export function formatRelativeTime(date: Date | string): string {
  const dateObj = new Date(date);
  
  if (isToday(dateObj)) {
    return `Today at ${format(dateObj, 'HH:mm')}`;
  }
  
  if (isYesterday(dateObj)) {
    return `Yesterday at ${format(dateObj, 'HH:mm')}`;
  }
  
  return formatDistanceToNow(dateObj, { addSuffix: true });
}

// File size formatting
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Progress calculation
export function calculateProgress(completed: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((completed / total) * 100);
}

// Color utilities
export function getProgressColor(progress: number): string {
  if (progress < 25) return 'bg-red-500';
  if (progress < 50) return 'bg-yellow-500';
  if (progress < 75) return 'bg-blue-500';
  return 'bg-green-500';
}

// Search and filter utilities
export function filterData<T>(
  data: T[],
  searchTerm: string,
  searchFields: (keyof T)[]
): T[] {
  if (!searchTerm) return data;
  
  const lowercaseSearch = searchTerm.toLowerCase();
  
  return data.filter((item) =>
    searchFields.some((field) => {
      const value = item[field];
      return value && String(value).toLowerCase().includes(lowercaseSearch);
    })
  );
}

// Validation utilities
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^\+?[\d\s-()]+$/;
  return phoneRegex.test(phone);
}

// Local storage utilities
export function setLocalStorage(key: string, value: any): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
}

export function getLocalStorage<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error('Error reading from localStorage:', error);
    return defaultValue;
  }
}

export function removeLocalStorage(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error('Error removing from localStorage:', error);
  }
}

// Toast notification helper (placeholder for future implementation)
export function showToast(message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info'): void {
  // This would integrate with a toast library like react-hot-toast
  console.log(`${type.toUpperCase()}: ${message}`);
}

// Debounce utility
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}
