'use client';

import { useState, useEffect } from 'react';
import { Task, Order, TaskStatus, Priority, TaskCategory, OrderStatus, DashboardStats, CreateTaskForm, CreateOrderForm } from '@/types';
import { tasksApi, ordersApi, dashboardApi } from '@/lib/api';
import { ProgressDonutChart, TasksByPriorityChart, WeeklyProgressChart, ProductivityChart } from '@/components/charts/ProgressChart';
import { TasksTable } from '@/components/tables/TasksTable';
import { OrdersTable } from '@/components/tables/OrdersTable';
import { Modal, Button, Input, Select, Textarea } from '@/components/ui';
import { PlusIcon, ChartBarIcon, DocumentTextIcon, ClipboardDocumentListIcon, Cog6ToothIcon, BellIcon } from '@heroicons/react/24/outline';
import { useAuth } from '@/hooks/useAuth';

export default function EnhancedDashboard() {
  const { user, isLoading: authLoading } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  
  // Modal states
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showOrderModal, setShowOrderModal] = useState(false);
  
  // Form states
  const [taskForm, setTaskForm] = useState<CreateTaskForm>({
    title: '',
    description: '',
    priority: Priority.MEDIUM,
    category: TaskCategory.PRODUCTION,
    dueDate: '',
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
      const [statsData, tasksData, ordersData] = await Promise.all([
        dashboardApi.getStats(),
        tasksApi.getAll({ limit: 100 }),
        ordersApi.getAll({ limit: 50 }),
      ]);
      
      setStats(statsData);
      setTasks(tasksData.data || []);
      setOrders(ordersData.data || []);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async () => {
    try {
      const newTask = await tasksApi.create(taskForm);
      setTasks([newTask, ...tasks]);
      setShowTaskModal(false);
      setTaskForm({
        title: '',
        description: '',
        priority: Priority.MEDIUM,
        category: TaskCategory.PRODUCTION,
        dueDate: '',
      });
      loadData(); // Refresh stats
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  const handleCreateOrder = async () => {
    try {
      const newOrder = await ordersApi.create(orderForm);
      setOrders([newOrder, ...orders]);
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
      console.error('Error creating order:', error);
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">SD</span>
                </div>
              </div>
              <div className="ml-4">
                <h1 className="text-xl font-semibold text-gray-900">Spencer Denim Industries</h1>
                <p className="text-sm text-gray-500">Task Management System</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-400 hover:text-gray-500">
                <BellIcon className="h-6 w-6" />
              </button>
              <button className="p-2 text-gray-400 hover:text-gray-500">
                <Cog6ToothIcon className="h-6 w-6" />
              </button>
              <Button onClick={() => setShowTaskModal(true)}>
                <PlusIcon className="h-4 w-4 mr-2" />
                New Task
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Stats Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <ClipboardDocumentListIcon className="w-5 h-5 text-blue-600" />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Tasks</dt>
                  <dd className="text-3xl font-semibold text-gray-900">{stats.overview.totalTasks}</dd>
                </dl>
              </div>
            </div>
            <div className="mt-2">
              <div className="text-sm text-green-600">
                ↑ {stats.growth.taskGrowthRate}% from last month
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <ChartBarIcon className="w-5 h-5 text-yellow-600" />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Pending Tasks</dt>
                  <dd className="text-3xl font-semibold text-gray-900">{stats.overview.pendingTasks}</dd>
                </dl>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                  <DocumentTextIcon className="w-5 h-5 text-red-600" />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Urgent Tasks</dt>
                  <dd className="text-3xl font-semibold text-gray-900">{stats.overview.urgentTasks}</dd>
                </dl>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <ChartBarIcon className="w-5 h-5 text-green-600" />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Completion Rate</dt>
                  <dd className="text-3xl font-semibold text-gray-900">{stats.overview.completionRate}%</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'overview', name: 'Overview', icon: ChartBarIcon },
              { id: 'tasks', name: 'Tasks', icon: ClipboardDocumentListIcon },
              { id: 'orders', name: 'Orders', icon: DocumentTextIcon },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="h-5 w-5 mr-2" />
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && !stats && (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading dashboard data...</p>
            </div>
          </div>
        )}
        
        {activeTab === 'overview' && stats && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Task Completion Progress</h3>
              <ProgressDonutChart stats={stats} />
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Tasks by Priority</h3>
              <TasksByPriorityChart stats={stats} />
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Weekly Progress</h3>
              <WeeklyProgressChart stats={stats} />
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Productivity Trend</h3>
              <ProductivityChart stats={stats} />
            </div>
          </div>
        )}

        {activeTab === 'tasks' && (
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Tasks</h3>
                <Button onClick={() => setShowTaskModal(true)}>
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Add Task
                </Button>
              </div>
            </div>
            <div className="p-6">
              <TasksTable 
                tasks={tasks} 
                onTaskUpdate={handleTaskUpdate}
                onTaskDelete={handleTaskDelete}
              />
            </div>
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Orders</h3>
                <Button onClick={() => setShowOrderModal(true)}>
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Add Order
                </Button>
              </div>
            </div>
            <div className="p-6">
              <OrdersTable 
                orders={orders} 
                onOrderUpdate={handleOrderUpdate}
                onOrderDelete={handleOrderDelete}
              />
            </div>
          </div>
        )}
      </div>

      {/* Task Modal */}
      <Modal
        isOpen={showTaskModal}
        onClose={() => setShowTaskModal(false)}
        title="Create New Task"
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
          
          <div className="flex justify-end space-x-3 pt-4">
            <Button variant="secondary" onClick={() => setShowTaskModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateTask}>
              Create Task
            </Button>
          </div>
        </div>
      </Modal>

      {/* Order Modal */}
      <Modal
        isOpen={showOrderModal}
        onClose={() => setShowOrderModal(false)}
        title="Create New Order"
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
            <Button variant="secondary" onClick={() => setShowOrderModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateOrder}>
              Create Order
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
