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

// Add request interceptor for auth (if needed)
api.interceptors.request.use((config) => {
  // Add auth headers if available
  const userId = localStorage.getItem('userId') || 'default-user-id';
  config.headers['x-user-id'] = userId;
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
};

// Orders API
export const ordersApi = {
  getAll: async (filters?: OrderFilters): Promise<PaginatedResponse<Order>> => {
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

export default api;
