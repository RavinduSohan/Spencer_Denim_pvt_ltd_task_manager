import { z } from 'zod';

// User schemas
export const CreateUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1),
  role: z.string().default('user'),
  phone: z.string().optional(),
  avatar: z.string().optional(),
});

export const UpdateUserSchema = CreateUserSchema.partial();

// Task schemas
export const CreateTaskSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'URGENT', 'ON_HOLD']).default('PENDING'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM'),
  category: z.enum(['SAMPLING', 'PRODUCTION', 'QUALITY', 'SHIPPING', 'COSTING', 'DESIGN', 'PLANNING']),
  dueDate: z.string().datetime().optional(),
  assignedToId: z.string().optional(),
  orderId: z.string().optional(),
});

export const UpdateTaskSchema = CreateTaskSchema.partial();

// Order schemas
export const CreateOrderSchema = z.object({
  orderNumber: z.string().min(1).optional(),
  client: z.string().min(1),
  product: z.string().min(1),
  quantity: z.number().positive(),
  shipDate: z.string().min(1), // Accept any date string, convert to Date in API
  status: z.enum(['PENDING', 'SAMPLING', 'CUTTING', 'PRODUCTION', 'QUALITY_CHECK', 'PACKING', 'SHIPPED', 'DELIVERED', 'CANCELLED']).default('PENDING'),
  progress: z.number().min(0).max(100).default(0),
});

export const UpdateOrderSchema = CreateOrderSchema.partial();

// Document schemas
export const CreateDocumentSchema = z.object({
  name: z.string().min(1),
  fileName: z.string().min(1),
  filePath: z.string().min(1),
  fileSize: z.number().positive(),
  mimeType: z.string().min(1),
  category: z.enum(['TECH_PACK', 'PURCHASE_ORDER', 'QUALITY_REPORT', 'SHIPPING_DOCUMENT', 'COST_SHEET', 'DESIGN_FILE', 'CONTRACT', 'INVOICE']),
  orderId: z.string().optional(),
});

export const UpdateDocumentSchema = CreateDocumentSchema.partial();

// Activity schemas
export const CreateActivitySchema = z.object({
  type: z.enum(['TASK_CREATED', 'TASK_UPDATED', 'TASK_COMPLETED', 'ORDER_CREATED', 'ORDER_UPDATED', 'DOCUMENT_UPLOADED', 'USER_LOGIN', 'STATUS_CHANGED']),
  title: z.string().min(1),
  description: z.string().optional(),
  metadata: z.record(z.string(), z.any()).optional(),
});

// Query schemas
export const PaginationSchema = z.object({
  page: z.coerce.number().positive().default(1),
  limit: z.coerce.number().positive().max(100).default(10),
});

export const TaskFilterSchema = z.object({
  status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'URGENT', 'ON_HOLD']).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
  category: z.enum(['SAMPLING', 'PRODUCTION', 'QUALITY', 'SHIPPING', 'COSTING', 'DESIGN', 'PLANNING']).optional(),
  assignedToId: z.string().optional(),
  orderId: z.string().optional(),
  search: z.string().optional(),
});

export const OrderFilterSchema = z.object({
  status: z.enum(['PENDING', 'SAMPLING', 'CUTTING', 'PRODUCTION', 'QUALITY_CHECK', 'PACKING', 'SHIPPED', 'DELIVERED', 'CANCELLED']).optional(),
  client: z.string().optional(),
  search: z.string().optional(),
});

export const DocumentFilterSchema = z.object({
  category: z.enum(['TECH_PACK', 'PURCHASE_ORDER', 'QUALITY_REPORT', 'SHIPPING_DOCUMENT', 'COST_SHEET', 'DESIGN_FILE', 'CONTRACT', 'INVOICE']).optional(),
  orderId: z.string().optional(),
  search: z.string().optional(),
});

// Response schemas
export const ApiResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: z.any().optional(),
  error: z.string().optional(),
});

export type CreateUser = z.infer<typeof CreateUserSchema>;
export type UpdateUser = z.infer<typeof UpdateUserSchema>;
export type CreateTask = z.infer<typeof CreateTaskSchema>;
export type UpdateTask = z.infer<typeof UpdateTaskSchema>;
export type CreateOrder = z.infer<typeof CreateOrderSchema>;
export type UpdateOrder = z.infer<typeof UpdateOrderSchema>;
export type CreateDocument = z.infer<typeof CreateDocumentSchema>;
export type UpdateDocument = z.infer<typeof UpdateDocumentSchema>;
export type CreateActivity = z.infer<typeof CreateActivitySchema>;
export type Pagination = z.infer<typeof PaginationSchema>;
export type TaskFilter = z.infer<typeof TaskFilterSchema>;
export type OrderFilter = z.infer<typeof OrderFilterSchema>;
export type DocumentFilter = z.infer<typeof DocumentFilterSchema>;
export type ApiResponse = z.infer<typeof ApiResponseSchema>;
