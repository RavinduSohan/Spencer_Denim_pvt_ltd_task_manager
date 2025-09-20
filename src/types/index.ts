// Database types based on Prisma schema
export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  phone?: string;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
  _count?: {
    tasks: number;
    assignedTasks: number;
    documents: number;
    orders: number;
  };
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: Priority;
  category: TaskCategory;
  dueDate?: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  createdBy?: User;
  assignedTo?: User;
  order?: Order;
  createdById: string;
  assignedToId?: string;
  orderId?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  client: string;
  product: string;
  quantity: number;
  shipDate: Date;
  status: OrderStatus;
  progress: number;
  createdAt: Date;
  updatedAt: Date;
  createdBy?: User;
  tasks?: Task[];
  documents?: Document[];
  _count?: {
    tasks: number;
    documents: number;
  };
}

export interface Document {
  id: string;
  name: string;
  fileName: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  category: DocumentCategory;
  createdAt: Date;
  updatedAt: Date;
  uploadedBy?: User;
  order?: Order;
  uploadedById: string;
  orderId?: string;
}

export interface Activity {
  id: string;
  type: ActivityType;
  title: string;
  description?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
  user?: User;
  userId: string;
}

// Enums
export enum TaskStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  URGENT = 'URGENT',
  ON_HOLD = 'ON_HOLD',
}

export enum Priority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

export enum TaskCategory {
  SAMPLING = 'SAMPLING',
  PRODUCTION = 'PRODUCTION',
  QUALITY = 'QUALITY',
  SHIPPING = 'SHIPPING',
  COSTING = 'COSTING',
  DESIGN = 'DESIGN',
  PLANNING = 'PLANNING',
}

export enum OrderStatus {
  PENDING = 'PENDING',
  SAMPLING = 'SAMPLING',
  CUTTING = 'CUTTING',
  PRODUCTION = 'PRODUCTION',
  QUALITY_CHECK = 'QUALITY_CHECK',
  PACKING = 'PACKING',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
}

export enum DocumentCategory {
  TECH_PACK = 'TECH_PACK',
  PURCHASE_ORDER = 'PURCHASE_ORDER',
  QUALITY_REPORT = 'QUALITY_REPORT',
  SHIPPING_DOCUMENT = 'SHIPPING_DOCUMENT',
  COST_SHEET = 'COST_SHEET',
  DESIGN_FILE = 'DESIGN_FILE',
  CONTRACT = 'CONTRACT',
  INVOICE = 'INVOICE',
}

export enum ActivityType {
  TASK_CREATED = 'TASK_CREATED',
  TASK_UPDATED = 'TASK_UPDATED',
  TASK_COMPLETED = 'TASK_COMPLETED',
  ORDER_CREATED = 'ORDER_CREATED',
  ORDER_UPDATED = 'ORDER_UPDATED',
  DOCUMENT_UPLOADED = 'DOCUMENT_UPLOADED',
  USER_LOGIN = 'USER_LOGIN',
  STATUS_CHANGED = 'STATUS_CHANGED',
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

// Dashboard statistics
export interface DashboardStats {
  overview: {
    totalTasks: number;
    pendingTasks: number;
    completedTasks: number;
    urgentTasks: number;
    totalOrders: number;
    activeOrders: number;
    shippedOrders: number;
    totalDocuments: number;
    totalUsers: number;
    completionRate: number;
    onTimeDeliveryRate: number;
  };
  growth: {
    taskGrowthRate: number;
    orderGrowthRate: number;
    tasksThisMonth: number;
    ordersThisMonth: number;
    documentsThisMonth: number;
  };
  distributions: {
    tasksByCategory: Array<{ category: string; count: number }>;
    tasksByStatus: Array<{ status: string; count: number }>;
    ordersByStatus: Array<{ status: string; count: number }>;
  };
  tasksByStatus: Array<{ status: TaskStatus; count: number }>;
  tasksByPriority: Array<{ priority: Priority; count: number }>;
  tasksByCategory: Array<{ category: TaskCategory; count: number }>;
  recentActivities: Activity[];
}

// Form types
export interface CreateTaskForm {
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: Priority;
  category: TaskCategory;
  dueDate?: string;
  assignedToId?: string;
  orderId?: string;
}

export interface CreateOrderForm {
  orderNumber?: string;
  client: string;
  product: string;
  quantity: number;
  shipDate: string;
  status?: OrderStatus;
  progress?: number;
}

export interface CreateDocumentForm {
  name: string;
  fileName: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  category: DocumentCategory;
  orderId?: string;
}

// Filter types
export interface TaskFilters {
  search?: string;
  status?: TaskStatus;
  priority?: Priority;
  category?: TaskCategory;
  assignedToId?: string;
  orderId?: string;
  page?: number;
  limit?: number;
}

export interface OrderFilters {
  search?: string;
  status?: OrderStatus;
  client?: string;
  page?: number;
  limit?: number;
}

export interface DocumentFilters {
  search?: string;
  category?: DocumentCategory;
  orderId?: string;
  page?: number;
  limit?: number;
}

// Utility types
export type StatusVariant = 'pending' | 'in-progress' | 'completed' | 'urgent' | 'on-hold';
export type PriorityVariant = 'low' | 'medium' | 'high' | 'urgent';

// Todo List Types
export interface TodoList {
  id: string;
  name: string;
  description?: string;
  color: string;
  icon: string;
  isArchived: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdById: string;
  createdBy?: User;
  todos?: TodoItem[];
  stats?: {
    total: number;
    completed: number;
    pending: number;
    inProgress: number;
    delayed: number;
  };
  _count?: {
    todos: number;
  };
}

export interface TodoItem {
  id: string;
  title: string;
  description?: string;
  status: TodoStatus;
  priority: TodoPriority;
  startDate?: Date;
  dueDate?: Date;
  completedAt?: Date;
  estimatedHours?: number;
  actualHours?: number;
  progress: number;
  tags: string[];
  isDelayed: boolean;
  delayReason?: string;
  createdAt: Date;
  updatedAt: Date;
  todoListId: string;
  todoList?: TodoList;
  assignedToId?: string;
  assignedTo?: User;
  createdById: string;
  createdBy?: User;
  dependencies?: TodoDependency[];
  dependents?: TodoDependency[];
  attachments?: TodoAttachment[];
  comments?: TodoComment[];
  _count?: {
    comments: number;
    attachments: number;
  };
}

export interface TodoDependency {
  id: string;
  type: DependencyType;
  lagDays: number;
  createdAt: Date;
  dependsOnId: string;
  dependsOn?: TodoItem;
  blockedById: string;
  blockedBy?: TodoItem;
}

export interface TodoAttachment {
  id: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  uploadedAt: Date;
  todoItemId: string;
  todoItem?: TodoItem;
  uploadedById: string;
  uploadedBy?: User;
}

export interface TodoComment {
  id: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  todoItemId: string;
  todoItem?: TodoItem;
  authorId: string;
  author?: User;
}

export enum TodoStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  ON_HOLD = 'ON_HOLD',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  DELAYED = 'DELAYED',
}

export enum TodoPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
  CRITICAL = 'CRITICAL',
}

export enum DependencyType {
  FINISH_TO_START = 'FINISH_TO_START',
  START_TO_START = 'START_TO_START',
  FINISH_TO_FINISH = 'FINISH_TO_FINISH',
  START_TO_FINISH = 'START_TO_FINISH',
}

// Todo List Form Types
export interface CreateTodoListForm {
  name: string;
  description?: string;
  color?: string;
  icon?: string;
}

export interface CreateTodoItemForm {
  title: string;
  description?: string;
  priority?: TodoPriority;
  startDate?: string;
  dueDate?: string;
  estimatedHours?: number;
  assignedToId?: string;
  tags?: string[];
  todoListId: string;
}

export interface UpdateTodoItemForm extends Partial<CreateTodoItemForm> {
  status?: TodoStatus;
  progress?: number;
  actualHours?: number;
  isDelayed?: boolean;
  delayReason?: string;
}

export interface TodoFilters {
  todoListId?: string;
  status?: TodoStatus;
  priority?: TodoPriority;
  assignedToId?: string;
  search?: string;
  tags?: string[];
  isDelayed?: boolean;
  page?: number;
  limit?: number;
}
