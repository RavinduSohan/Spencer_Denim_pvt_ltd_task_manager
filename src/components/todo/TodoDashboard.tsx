'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { Button } from '@/components/ui';
import { Badge } from '@/components/ui';
import { Progress } from '@/components/ui';
import {
  Plus,
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle,
  Circle,
  MoreHorizontal,
  Filter,
  Search,
  Users,
  Tag,
  TrendingUp,
  TrendingDown,
  AlertCircle,
} from 'lucide-react';
import { TodoList, TodoItem, TodoStatus, TodoPriority } from '@/types';
import { cn } from '@/lib/utils';
// Component imports
import CreateTodoListModal from '@/components/todo/CreateTodoListModal';
import CreateTodoModal from '@/components/todo/CreateTodoModal';
import TodoListCard from '@/components/todo/TodoListCard';
import TodoItemCard from '@/components/todo/TodoItemCard';
import TodoFilters from '@/components/todo/TodoFilters';

interface TodoDashboardProps {
  initialTodoLists?: TodoList[];
  initialTodos?: TodoItem[];
}

export function TodoDashboard({ initialTodoLists = [], initialTodos = [] }: TodoDashboardProps) {
  const [todoLists, setTodoLists] = useState<TodoList[]>(initialTodoLists);
  const [todos, setTodos] = useState<TodoItem[]>(initialTodos);
  const [selectedListId, setSelectedListId] = useState<string | null>(null);
  const [isCreateListModalOpen, setIsCreateListModalOpen] = useState(false);
  const [isCreateTodoModalOpen, setIsCreateTodoModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<TodoStatus | 'ALL'>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<TodoPriority | 'ALL'>('ALL');
  const [loading, setLoading] = useState(false);

  // Fetch todo lists on mount
  useEffect(() => {
    fetchTodoLists();
  }, []);

  // Fetch todos when a list is selected
  useEffect(() => {
    if (selectedListId) {
      fetchTodos();
    }
  }, [selectedListId]);

  // Refresh todos when filters change
  useEffect(() => {
    if (selectedListId) {
      fetchTodos();
    }
  }, [statusFilter, priorityFilter, searchQuery]);

  const fetchTodoLists = async () => {
    setLoading(true);
    try {
      console.log('Fetching todo lists...'); // Debug log
      const response = await fetch('/api/todo-lists');
      if (response.ok) {
        const result = await response.json();
        console.log('Todo lists response:', result); // Debug log
        
        // Handle the successResponse format: { success, message, data: { todoLists, total } }
        let listsArray = [];
        if (result.success && result.data) {
          listsArray = result.data.todoLists || [];
        } else {
          // Fallback for direct response
          listsArray = result.todoLists || result;
        }
        
        // Ensure data is an array
        const finalLists = Array.isArray(listsArray) ? listsArray : [];
        console.log('Setting todo lists:', finalLists); // Debug log
        setTodoLists(finalLists);
      } else {
        console.error('Failed to fetch todo lists:', response.statusText);
        setTodoLists([]);
      }
    } catch (error) {
      console.error('Failed to fetch todo lists:', error);
      setTodoLists([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchTodos = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedListId) params.append('todoListId', selectedListId);
      if (statusFilter !== 'ALL') params.append('status', statusFilter);
      if (priorityFilter !== 'ALL') params.append('priority', priorityFilter);
      if (searchQuery) params.append('search', searchQuery);

      console.log('Fetching todos with params:', params.toString()); // Debug log
      const response = await fetch(`/api/todos?${params.toString()}`);
      if (response.ok) {
        const result = await response.json();
        console.log('Todos response:', result); // Debug log
        
        // Handle the successResponse format: { success, message, data: { todos, total } }
        let todosArray = [];
        if (result.success && result.data) {
          todosArray = result.data.todos || [];
        } else {
          // Fallback for direct response
          todosArray = result.todos || result;
        }
        
        // Ensure data is an array
        const finalTodos = Array.isArray(todosArray) ? todosArray : [];
        console.log('Setting todos:', finalTodos); // Debug log
        setTodos(finalTodos);
      } else {
        console.error('Failed to fetch todos:', response.statusText);
        setTodos([]);
      }
    } catch (error) {
      console.error('Failed to fetch todos:', error);
      setTodos([]);
    } finally {
      setLoading(false);
    }
  };

  // Ensure todoLists and todos are always arrays for safe operations
  const safeTodoLists = Array.isArray(todoLists) ? todoLists : [];
  const safeTodos = Array.isArray(todos) ? todos : [];
  
  // Auto-select first todo list if none is selected
  useEffect(() => {
    if (safeTodoLists.length > 0 && !selectedListId) {
      setSelectedListId(safeTodoLists[0].id);
    }
  }, [safeTodoLists, selectedListId]);
  
  const selectedList = selectedListId ? safeTodoLists.find(list => list.id === selectedListId) : null;
  const filteredTodos = safeTodos.filter(todo => {
    const matchesSearch = searchQuery === '' || 
      todo.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      todo.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'ALL' || todo.status === statusFilter;
    const matchesPriority = priorityFilter === 'ALL' || todo.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  // Calculate dashboard stats with safety checks
  const totalTodos = safeTodoLists.reduce((sum: number, list: TodoList) => sum + (list.stats?.total || 0), 0);
  const completedTodos = safeTodoLists.reduce((sum: number, list: TodoList) => sum + (list.stats?.completed || 0), 0);
  const pendingTodos = safeTodoLists.reduce((sum: number, list: TodoList) => sum + (list.stats?.pending || 0), 0);
  const delayedTodos = safeTodoLists.reduce((sum: number, list: TodoList) => sum + (list.stats?.delayed || 0), 0);
  const completionRate = totalTodos > 0 ? Math.round((completedTodos / totalTodos) * 100) : 0;

  const getPriorityColor = (priority: TodoPriority) => {
    const colors = {
      LOW: 'bg-blue-500',
      MEDIUM: 'bg-yellow-500',
      HIGH: 'bg-orange-500',
      URGENT: 'bg-red-500',
      CRITICAL: 'bg-purple-500',
    };
    return colors[priority];
  };

  const getStatusIcon = (status: TodoStatus) => {
    const icons = {
      PENDING: Circle,
      IN_PROGRESS: Clock,
      ON_HOLD: AlertTriangle,
      COMPLETED: CheckCircle,
      CANCELLED: AlertCircle,
      DELAYED: AlertTriangle,
    };
    return icons[status];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Todo Management
            </h1>
            <p className="text-slate-600 mt-2">
              Organize your tasks with beautiful, interconnected workflows
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={() => setIsCreateListModalOpen(true)}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg"
            >
              <Plus className="w-4 h-4 mr-2" />
              New List
            </Button>
            {selectedListId && (
              <Button
                onClick={() => setIsCreateTodoModalOpen(true)}
                variant="secondary"
                className="border-indigo-200 hover:bg-indigo-50"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Task
              </Button>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">Total Tasks</p>
                  <p className="text-3xl font-bold">{totalTodos}</p>
                </div>
                <div className="p-3 bg-white/20 rounded-full">
                  <CheckCircle className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm">Completed</p>
                  <p className="text-3xl font-bold">{completedTodos}</p>
                </div>
                <div className="p-3 bg-white/20 rounded-full">
                  <TrendingUp className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm">Pending</p>
                  <p className="text-3xl font-bold">{pendingTodos}</p>
                </div>
                <div className="p-3 bg-white/20 rounded-full">
                  <Clock className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-red-100 text-sm">Delayed</p>
                  <p className="text-3xl font-bold">{delayedTodos}</p>
                </div>
                <div className="p-3 bg-white/20 rounded-full">
                  <TrendingDown className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Completion Rate */}
        <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-800">Overall Progress</h3>
              <span className="text-2xl font-bold text-indigo-600">{completionRate}%</span>
            </div>
            <Progress value={completionRate} className="h-3 bg-slate-200" />
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Todo Lists Sidebar */}
          <div className="lg:col-span-1">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="text-slate-800 flex items-center gap-2">
                  <Tag className="w-5 h-5" />
                  Todo Lists
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {safeTodoLists.map((list) => (
                  <TodoListCard
                    key={list.id}
                    todoList={list}
                    isSelected={selectedListId === list.id}
                    onClick={() => setSelectedListId(list.id)}
                    onUpdate={fetchTodoLists}
                  />
                ))}
                {safeTodoLists.length === 0 && (
                  <div className="text-center py-8 text-slate-500">
                    <Tag className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p className="mb-2">No todo lists yet</p>
                    <p className="text-sm mb-4">Create your first list to get started</p>
                    <Button
                      onClick={() => setIsCreateListModalOpen(true)}
                      className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Create First List
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Todo Items */}
          <div className="lg:col-span-2">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-slate-800 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    {selectedList ? selectedList.name : 'Select a Todo List'}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => {
                        setSearchQuery('');
                        setStatusFilter('ALL');
                        setPriorityFilter('ALL');
                      }}
                    >
                      Reset Filters
                    </Button>
                    {selectedListId && (
                      <TodoFilters
                        searchQuery={searchQuery}
                        statusFilter={statusFilter}
                        priorityFilter={priorityFilter}
                        onSearchChange={setSearchQuery}
                        onStatusChange={setStatusFilter}
                        onPriorityChange={setPriorityFilter}
                      />
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {selectedListId ? (
                  <div className="space-y-4">
                    {filteredTodos.map((todo) => (
                      <TodoItemCard
                        key={todo.id}
                        todo={todo}
                        onUpdate={fetchTodos}
                      />
                    ))}
                    {filteredTodos.length === 0 && (
                      <div className="text-center py-12 text-slate-500">
                        <CheckCircle className="w-16 h-16 mx-auto mb-4 opacity-50" />
                        <p className="text-lg">No tasks found</p>
                        <p className="text-sm">
                          {safeTodos.length === 0 
                            ? "Add your first task to this list" 
                            : "Try adjusting your filters"}
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-12 text-slate-500">
                    <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg">Select a todo list</p>
                    <p className="text-sm">Choose a list from the sidebar to view and manage tasks</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Modals */}
      <CreateTodoListModal
        isOpen={isCreateListModalOpen}
        onClose={() => setIsCreateListModalOpen(false)}
        onSuccess={fetchTodoLists}
      />

      {selectedListId && (
        <CreateTodoModal
          isOpen={isCreateTodoModalOpen}
          onClose={() => setIsCreateTodoModalOpen(false)}
          todoListId={selectedListId as string}
          onSuccess={fetchTodos}
        />
      )}
    </div>
  );
}