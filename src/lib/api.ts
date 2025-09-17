import axios from 'axios';
import {
  Task,
  Order,
  Document,
  User,
  Activity,
  DashboardStats,
  ApiResponse,
  PaginatedResponse,
  TaskFilters,
  OrderFilters,
  DocumentFilters,
  CreateTaskForm,
  CreateOrderForm,
  CreateDocumentForm,
} from '@/types';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for auth and database selection
api.interceptors.request.use((config) => {
  // Add auth headers if available
  const userId = localStorage.getItem('userId') || 'default-user-id';
  config.headers['x-user-id'] = userId;
  
  // Add database type header
  const databaseType = localStorage.getItem('database-type') || 'postgres';
  config.headers['x-database-type'] = databaseType;
  
  return config;
});

// Tasks API
export const tasksApi = {
  getAll: async (filters?: TaskFilters): Promise<PaginatedResponse<Task>> => {
    const response = await api.get('/tasks', { params: filters });
    return response.data.data;
  },

  getById: async (id: string): Promise<Task> => {
    const response = await api.get(`/tasks/${id}`);
    return response.data.data;
  },

  create: async (data: CreateTaskForm): Promise<Task> => {
    const response = await api.post('/tasks', data);
    return response.data.data;
  },

  update: async (id: string, data: Partial<CreateTaskForm>): Promise<Task> => {
    const response = await api.put(`/tasks/${id}`, data);
    return response.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/tasks/${id}`);
  },

  // Export tasks to Excel
  exportToExcel: async (filters?: TaskFilters): Promise<void> => {
    const params = new URLSearchParams();
    if (filters?.search) params.append('search', filters.search);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.priority) params.append('priority', filters.priority);
    if (filters?.category) params.append('category', filters.category);
    if (filters?.assignedToId) params.append('assignedToId', filters.assignedToId);
    if (filters?.orderId) params.append('orderId', filters.orderId);

    const url = `/api/tasks/export?${params.toString()}`;
    const response = await fetch(url);
    
    if (response.ok) {
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      
      // Get filename from response headers
      const contentDisposition = response.headers.get('content-disposition');
      const filename = contentDisposition?.split('filename=')[1]?.replace(/"/g, '') || 'tasks_export.xlsx';
      
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } else {
      throw new Error('Export failed');
    }
  },
};

// Orders API
export const ordersApi = {
  getAll: async (filters?: OrderFilters): Promise<{ orders: Order[]; pagination: any }> => {
    const response = await api.get('/orders', { params: filters });
    return response.data.data;
  },

  getById: async (id: string): Promise<Order> => {
    const response = await api.get(`/orders/${id}`);
    return response.data.data;
  },

  create: async (data: CreateOrderForm): Promise<Order> => {
    const response = await api.post('/orders', data);
    return response.data.data;
  },

  update: async (id: string, data: Partial<CreateOrderForm>): Promise<Order> => {
    const response = await api.put(`/orders/${id}`, data);
    return response.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/orders/${id}`);
  },

  // Export orders to Excel
  exportToExcel: async (filters?: OrderFilters): Promise<void> => {
    const params = new URLSearchParams();
    if (filters?.search) params.append('search', filters.search);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.client) params.append('client', filters.client);

    const url = `/api/orders/export?${params.toString()}`;
    const response = await fetch(url);
    
    if (response.ok) {
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      
      // Get filename from response headers
      const contentDisposition = response.headers.get('content-disposition');
      const filename = contentDisposition?.split('filename=')[1]?.replace(/"/g, '') || 'orders_export.xlsx';
      
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } else {
      throw new Error('Export failed');
    }
  },
};

// Documents API
export const documentsApi = {
  getAll: async (filters?: DocumentFilters): Promise<PaginatedResponse<Document>> => {
    const response = await api.get('/documents', { params: filters });
    return response.data.data;
  },

  getById: async (id: string): Promise<Document> => {
    const response = await api.get(`/documents/${id}`);
    return response.data.data;
  },

  create: async (data: CreateDocumentForm): Promise<Document> => {
    const response = await api.post('/documents', data);
    return response.data.data;
  },

  update: async (id: string, data: Partial<CreateDocumentForm>): Promise<Document> => {
    const response = await api.put(`/documents/${id}`, data);
    return response.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/documents/${id}`);
  },
};

// Users API
export const usersApi = {
  getAll: async (filters?: { page?: number; limit?: number; search?: string }): Promise<PaginatedResponse<User>> => {
    const response = await api.get('/users', { params: filters });
    return response.data.data;
  },

  getById: async (id: string): Promise<User> => {
    const response = await api.get(`/users/${id}`);
    return response.data.data;
  },

  create: async (data: Partial<User>): Promise<User> => {
    const response = await api.post('/users', data);
    return response.data.data;
  },

  update: async (id: string, data: Partial<User>): Promise<User> => {
    const response = await api.put(`/users/${id}`, data);
    return response.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/users/${id}`);
  },
};

// Activities API
export const activitiesApi = {
  getAll: async (filters?: { page?: number; limit?: number; search?: string }): Promise<PaginatedResponse<Activity>> => {
    const response = await api.get('/activities', { params: filters });
    return response.data.data;
  },
};

// Dashboard API
export const dashboardApi = {
  getStats: async (): Promise<DashboardStats> => {
    const response = await api.get('/dashboard/stats');
    return response.data.data;
  },
};

// Health check
export const healthApi = {
  check: async (): Promise<ApiResponse> => {
    const response = await api.get('/health');
    return response.data;
  },
};

// Database API
export const databaseApi = {
  getCurrentType: (): string => {
    return localStorage.getItem('database-type') || 'postgres';
  },

  switchDatabase: (type: 'sqlite' | 'postgres'): void => {
    localStorage.setItem('database-type', type);
    // Update axios default headers for future requests
    api.defaults.headers['x-database-type'] = type;
  },

  // Test database connection
  testConnection: async (type: 'sqlite' | 'postgres'): Promise<boolean> => {
    try {
      const response = await api.get('/health', { 
        headers: { 'x-database-type': type } 
      });
      return response.status === 200;
    } catch (error) {
      console.error(`Database connection test failed for ${type}:`, error);
      return false;
    }
  },
};

export default api;
