'use client';

import { useState, useEffect } from 'react';
import { Task, Order, TaskStatus, Priority, TaskCategory, OrderStatus, DashboardStats, CreateTaskForm, CreateOrderForm, User } from '@/types';
import { tasksApi, ordersApi, dashboardApi, usersApi } from '@/lib/api';
import { ProgressDonutChart, TasksByPriorityChart, WeeklyProgressChart, ProductivityChart } from '@/components/charts/ProgressChart';
import { TasksTable } from '@/components/tables/TasksTable';
import { OrdersTable } from '@/components/tables/OrdersTable';
import { UnifiedNavigation } from '@/components/UnifiedNavigation';
import { DynamicTablesDashboard } from '@/components/dynamic/DynamicTablesDashboard';
import { TodoDashboard } from '@/components/todo/TodoDashboard';
import { Modal, Button, Input, Select, Textarea } from '@/components/ui';
import { ExportModal } from '@/components/ExportModal';
import { PlusIcon, ChartBarIcon, DocumentTextIcon, ClipboardDocumentListIcon, Cog6ToothIcon, BellIcon } from '@heroicons/react/24/outline';
import { useAuth } from '@/hooks/useAuth';

export default function EnhancedDashboard() {
  const { user, isLoading: authLoading } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  
  // Modal states
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [showTasksExportModal, setShowTasksExportModal] = useState(false);
  const [showOrdersExportModal, setShowOrdersExportModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  
  // Form states
  const [taskForm, setTaskForm] = useState<CreateTaskForm>({
    title: '',
    description: '',
    priority: Priority.MEDIUM,
    category: TaskCategory.PRODUCTION,
    dueDate: '',
    assignedToId: '',
  });
  
  const [orderForm, setOrderForm] = useState<CreateOrderForm>({
    client: '',
    product: '',
    quantity: 0,
    shipDate: '',
    status: OrderStatus.PENDING,
    progress: 0,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [statsData, tasksData, ordersData, usersData] = await Promise.all([
        dashboardApi.getStats(),
        tasksApi.getAll({ limit: 100 }),
        ordersApi.getAll({ limit: 50 }),
        usersApi.getAll({ limit: 100 }),
      ]);
      
      setStats(statsData);
      setTasks(tasksData.data || []);
      setOrders(ordersData.orders || []);
      setUsers(usersData.data || []);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async () => {
    try {
      if (editingTask) {
        // Update existing task
        const updatedTask = await tasksApi.update(editingTask.id, taskForm);
        setTasks(tasks.map(task => task.id === editingTask.id ? updatedTask : task));
        setEditingTask(null);
      } else {
        // Create new task
        const newTask = await tasksApi.create(taskForm);
        setTasks([newTask, ...tasks]);
      }
      setShowTaskModal(false);
      setTaskForm({
        title: '',
        description: '',
        priority: Priority.MEDIUM,
        category: TaskCategory.PRODUCTION,
        dueDate: '',
        assignedToId: '',
      });
      loadData(); // Refresh stats
    } catch (error) {
      console.error('Error creating/updating task:', error);
    }
  };

  const handleCreateOrder = async () => {
    try {
      if (editingOrder) {
        // Update existing order
        const updatedOrder = await ordersApi.update(editingOrder.id, orderForm);
        setOrders(orders.map(order => order.id === editingOrder.id ? updatedOrder : order));
        setEditingOrder(null);
      } else {
        // Create new order
        const newOrder = await ordersApi.create(orderForm);
        setOrders([newOrder, ...orders]);
      }
      setShowOrderModal(false);
      setOrderForm({
        client: '',
        product: '',
        quantity: 0,
        shipDate: '',
        status: OrderStatus.PENDING,
        progress: 0,
      });
      loadData(); // Refresh stats
    } catch (error) {
      console.error('Error creating/updating order:', error);
    }
  };

  const handleTaskUpdate = async (taskId: string, updates: Partial<Task>) => {
    try {
      // Convert Task updates to CreateTaskForm format
      const formUpdates: Partial<CreateTaskForm> = {
        ...updates,
        dueDate: updates.dueDate ? new Date(updates.dueDate).toISOString().split('T')[0] : undefined,
      };
      const updatedTask = await tasksApi.update(taskId, formUpdates);
      setTasks(tasks.map(task => task.id === taskId ? updatedTask : task));
      loadData(); // Refresh stats
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const handleTaskDelete = async (taskId: string) => {
    try {
      await tasksApi.delete(taskId);
      setTasks(tasks.filter(task => task.id !== taskId));
      loadData(); // Refresh stats
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const handleOrderUpdate = async (orderId: string, updates: Partial<Order>) => {
    try {
      // Convert Order updates to CreateOrderForm format
      const formUpdates: Partial<CreateOrderForm> = {
        ...updates,
        shipDate: updates.shipDate ? new Date(updates.shipDate).toISOString().split('T')[0] : undefined,
      };
      const updatedOrder = await ordersApi.update(orderId, formUpdates);
      setOrders(orders.map(order => order.id === orderId ? updatedOrder : order));
      loadData(); // Refresh stats
    } catch (error) {
      console.error('Error updating order:', error);
    }
  };

  const handleOrderDelete = async (orderId: string) => {
    try {
      await ordersApi.delete(orderId);
      setOrders(orders.filter(order => order.id !== orderId));
      loadData(); // Refresh stats
    } catch (error) {
      console.error('Error deleting order:', error);
    }
  };

  // Edit handlers
  const handleTaskEdit = (task: Task) => {
    setEditingTask(task);
    setTaskForm({
      title: task.title,
      description: task.description || '',
      priority: task.priority,
      category: task.category,
      dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
      assignedToId: task.assignedToId || '',
    });
    setShowTaskModal(true);
  };

  const handleOrderEdit = (order: Order) => {
    setEditingOrder(order);
    setOrderForm({
      orderNumber: order.orderNumber,
      client: order.client,
      product: order.product,
      quantity: order.quantity,
      shipDate: order.shipDate ? new Date(order.shipDate).toISOString().split('T')[0] : '',
      status: order.status,
      progress: order.progress,
    });
    setShowOrderModal(true);
  };

  // Modal close handlers
  const handleCloseTaskModal = () => {
    setShowTaskModal(false);
    setEditingTask(null);
    setTaskForm({
      title: '',
      description: '',
      priority: Priority.MEDIUM,
      category: TaskCategory.PRODUCTION,
      dueDate: '',
      assignedToId: '',
    });
  };

  const handleCloseOrderModal = () => {
    setShowOrderModal(false);
    setEditingOrder(null);
    setOrderForm({
      client: '',
      product: '',
      quantity: 0,
      shipDate: '',
      status: OrderStatus.PENDING,
      progress: 0,
    });
  };

  // Export handlers
  const handleTasksExport = async (filters: any) => {
    try {
      await tasksApi.exportToExcel(filters);
    } catch (error) {
      console.error('Error exporting tasks:', error);
      throw error;
    }
  };

  const handleOrdersExport = async (filters: any) => {
    try {
      await ordersApi.exportToExcel(filters);
    } catch (error) {
      console.error('Error exporting orders:', error);
      throw error;
    }
  };

  if (loading || !stats) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Unified Premium Navigation */}
      <UnifiedNavigation 
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onNewTask={() => setShowTaskModal(true)}
      />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Premium Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 p-6 hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                  <ClipboardDocumentListIcon className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-600 truncate">Total Tasks</dt>
                  <dd className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">{stats.overview.totalTasks}</dd>
                </dl>
              </div>
            </div>
            <div className="mt-3">
              <div className="text-sm text-green-600 font-medium">
                ↑ {stats.growth.taskGrowthRate}% from last month
              </div>
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 p-6 hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                  <ChartBarIcon className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-600 truncate">Pending Tasks</dt>
                  <dd className="text-3xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">{stats.overview.pendingTasks}</dd>
                </dl>
              </div>
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 p-6 hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                  <DocumentTextIcon className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-600 truncate">Urgent Tasks</dt>
                  <dd className="text-3xl font-bold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">{stats.overview.urgentTasks}</dd>
                </dl>
              </div>
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 p-6 hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
                  <ChartBarIcon className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-600 truncate">Completion Rate</dt>
                  <dd className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">{stats.overview.completionRate}%</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && !stats && (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-32 w-32 border-b-4 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-700 font-medium">Loading dashboard data...</p>
            </div>
          </div>
        )}
        
        {activeTab === 'overview' && stats && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 p-8 hover:shadow-2xl transition-all duration-300">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Task Completion Progress</h3>
              <ProgressDonutChart stats={stats} />
            </div>

            <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 p-8 hover:shadow-2xl transition-all duration-300">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Tasks by Priority</h3>
              <TasksByPriorityChart stats={stats} />
            </div>

            <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 p-8 hover:shadow-2xl transition-all duration-300">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Weekly Progress</h3>
              <WeeklyProgressChart stats={stats} />
            </div>

            <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 p-8 hover:shadow-2xl transition-all duration-300">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Productivity Trend</h3>
              <ProductivityChart stats={stats} />
            </div>
          </div>
        )}

        {activeTab === 'tasks' && (
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50">
            <div className="p-8 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-2xl font-bold text-gray-900">Task Management</h3>
                <div className="flex gap-3">
                  <Button 
                    onClick={() => setShowTasksExportModal(true)}
                    variant="secondary"
                    className="bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 shadow-lg"
                  >
                    📊 Export
                  </Button>
                  <Button 
                    onClick={() => setShowTaskModal(true)}
                    className="bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 shadow-lg"
                  >
                    <PlusIcon className="h-4 w-4 mr-2" />
                    Add Task
                  </Button>
                </div>
              </div>
            </div>
            <div className="p-8">
              <TasksTable 
                tasks={tasks} 
                onTaskUpdate={handleTaskUpdate}
                onTaskDelete={handleTaskDelete}
                onTaskEdit={handleTaskEdit}
              />
            </div>
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50">
            <div className="p-8 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-2xl font-bold text-gray-900">Order Management</h3>
                <div className="flex gap-3">
                  <Button 
                    onClick={() => setShowOrdersExportModal(true)}
                    variant="secondary"
                    className="bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 shadow-lg"
                  >
                    📊 Export
                  </Button>
                  <Button 
                    onClick={() => setShowOrderModal(true)}
                    className="bg-gradient-to-r from-purple-500 to-purple-600 text-white hover:from-purple-600 hover:to-purple-700 shadow-lg"
                  >
                    <PlusIcon className="h-4 w-4 mr-2" />
                    Add Order
                  </Button>
                </div>
              </div>
            </div>
            <div className="p-8">
              <OrdersTable 
                orders={orders} 
                onOrderUpdate={handleOrderUpdate}
                onOrderDelete={handleOrderDelete}
                onOrderEdit={handleOrderEdit}
              />
            </div>
          </div>
        )}

        {activeTab === 'dynamic-tables' && (
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 p-2">
            <DynamicTablesDashboard />
          </div>
        )}

        {activeTab === 'todo' && (
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 p-2">
            <TodoDashboard />
          </div>
        )}
      </div>

      {/* Task Modal */}
      <Modal
        isOpen={showTaskModal}
        onClose={handleCloseTaskModal}
        title={editingTask ? "Edit Task" : "Create New Task"}
        size="lg"
      >
        <div className="space-y-4">
          <Input
            label="Task Title"
            value={taskForm.title}
            onChange={(value) => setTaskForm({ ...taskForm, title: value })}
            placeholder="Enter task title"
            required
          />
          
          <Textarea
            label="Description"
            value={taskForm.description || ''}
            onChange={(value) => setTaskForm({ ...taskForm, description: value })}
            placeholder="Enter task description"
            rows={3}
          />
          
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Priority"
              value={taskForm.priority || Priority.MEDIUM}
              onChange={(value) => setTaskForm({ ...taskForm, priority: value as Priority })}
              options={[
                { value: Priority.LOW, label: 'Low' },
                { value: Priority.MEDIUM, label: 'Medium' },
                { value: Priority.HIGH, label: 'High' },
                { value: Priority.URGENT, label: 'Urgent' },
              ]}
            />
            
            <Select
              label="Category"
              value={taskForm.category}
              onChange={(value) => setTaskForm({ ...taskForm, category: value as TaskCategory })}
              options={[
                { value: TaskCategory.SAMPLING, label: 'Sampling' },
                { value: TaskCategory.PRODUCTION, label: 'Production' },
                { value: TaskCategory.QUALITY, label: 'Quality' },
                { value: TaskCategory.SHIPPING, label: 'Shipping' },
                { value: TaskCategory.COSTING, label: 'Costing' },
                { value: TaskCategory.DESIGN, label: 'Design' },
                { value: TaskCategory.PLANNING, label: 'Planning' },
              ]}
            />
          </div>
          
          <Input
            label="Due Date"
            type="date"
            value={taskForm.dueDate || ''}
            onChange={(value) => setTaskForm({ ...taskForm, dueDate: value })}
          />

          <Input
            label="Assigned To"
            value={taskForm.assignedToId || ''}
            onChange={(value) => setTaskForm({ ...taskForm, assignedToId: value })}
            placeholder="Enter assignee name or ID"
          />
          
          <div className="flex justify-end space-x-3 pt-4">
            <Button variant="secondary" onClick={handleCloseTaskModal}>
              Cancel
            </Button>
            <Button onClick={handleCreateTask}>
              {editingTask ? "Update Task" : "Create Task"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Order Modal */}
      <Modal
        isOpen={showOrderModal}
        onClose={handleCloseOrderModal}
        title={editingOrder ? "Edit Order" : "Create New Order"}
        size="lg"
      >
        <div className="space-y-4">
          <Input
            label="Client"
            value={orderForm.client}
            onChange={(value) => setOrderForm({ ...orderForm, client: value })}
            placeholder="Enter client name"
            required
          />
          
          <Input
            label="Product"
            value={orderForm.product}
            onChange={(value) => setOrderForm({ ...orderForm, product: value })}
            placeholder="Enter product name"
            required
          />
          
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Quantity"
              type="number"
              value={orderForm.quantity.toString()}
              onChange={(value) => setOrderForm({ ...orderForm, quantity: parseInt(value) || 0 })}
              placeholder="Enter quantity"
              required
            />
            
            <Input
              label="Ship Date"
              type="date"
              value={orderForm.shipDate}
              onChange={(value) => setOrderForm({ ...orderForm, shipDate: value })}
              required
            />
          </div>
          
          <Select
            label="Status"
            value={orderForm.status || OrderStatus.PENDING}
            onChange={(value) => setOrderForm({ ...orderForm, status: value as OrderStatus })}
            options={[
              { value: OrderStatus.PENDING, label: 'Pending' },
              { value: OrderStatus.SAMPLING, label: 'Sampling' },
              { value: OrderStatus.CUTTING, label: 'Cutting' },
              { value: OrderStatus.PRODUCTION, label: 'Production' },
              { value: OrderStatus.QUALITY_CHECK, label: 'Quality Check' },
              { value: OrderStatus.PACKING, label: 'Packing' },
              { value: OrderStatus.SHIPPED, label: 'Shipped' },
            ]}
          />
          
          <div className="flex justify-end space-x-3 pt-4">
            <Button variant="secondary" onClick={handleCloseOrderModal}>
              Cancel
            </Button>
            <Button onClick={handleCreateOrder}>
              {editingOrder ? "Update Order" : "Create Order"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Export Modals */}
      <ExportModal
        isOpen={showTasksExportModal}
        onClose={() => setShowTasksExportModal(false)}
        type="tasks"
        onExport={handleTasksExport}
      />

      <ExportModal
        isOpen={showOrdersExportModal}
        onClose={() => setShowOrdersExportModal(false)}
        type="orders"
        onExport={handleOrdersExport}
      />
    </div>
  );
}
