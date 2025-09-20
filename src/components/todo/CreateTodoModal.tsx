'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui';
import { Badge } from '@/components/ui';
import { X, Plus, Calendar, Clock, User, Flag, Tag } from 'lucide-react';
import { CreateTodoItemForm, TodoPriority, User as UserType } from '@/types';

interface CreateTodoModalProps {
  isOpen: boolean;
  onClose: () => void;
  todoListId: string;
  onSuccess: () => void;
}

const priorityOptions = [
  { value: TodoPriority.LOW, label: 'Low', color: 'bg-blue-100 text-blue-800' },
  { value: TodoPriority.MEDIUM, label: 'Medium', color: 'bg-yellow-100 text-yellow-800' },
  { value: TodoPriority.HIGH, label: 'High', color: 'bg-orange-100 text-orange-800' },
  { value: TodoPriority.URGENT, label: 'Urgent', color: 'bg-red-100 text-red-800' },
  { value: TodoPriority.CRITICAL, label: 'Critical', color: 'bg-purple-100 text-purple-800' },
];

export default function CreateTodoModal({ isOpen, onClose, todoListId, onSuccess }: CreateTodoModalProps) {
  const [formData, setFormData] = useState<CreateTodoItemForm>({
    title: '',
    description: '',
    priority: TodoPriority.MEDIUM,
    startDate: '',
    dueDate: '',
    estimatedHours: undefined,
    assignedToId: '',
    tags: [],
    todoListId,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [users, setUsers] = useState<UserType[]>([]);
  const [newTag, setNewTag] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchUsers();
    }
  }, [isOpen]);

  const fetchUsers = async () => {
    try {
      // In a real app, you'd have a /api/users endpoint
      // For now, we'll simulate some users
      setUsers([
        { id: '1', name: 'John Doe', email: 'john@example.com' },
        { id: '2', name: 'Jane Smith', email: 'jane@example.com' },
      ] as UserType[]);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  };

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (!formData.title.trim()) {
      setErrors({ title: 'Title is required' });
      return;
    }

    if (formData.startDate && formData.dueDate && new Date(formData.startDate) > new Date(formData.dueDate)) {
      setErrors({ dueDate: 'Due date must be after start date' });
      return;
    }

    setIsLoading(true);
    try {
      const submitData = {
        ...formData,
        assignedToId: formData.assignedToId || undefined,
        estimatedHours: formData.estimatedHours ? Number(formData.estimatedHours) : undefined,
        // Ensure dates are properly formatted if provided
        startDate: formData.startDate || undefined,
        dueDate: formData.dueDate || undefined,
      };

      console.log('Submitting todo data:', submitData); // Debug log

      const response = await fetch('/api/todos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-database-type': 'sqlite', // Specify SQLite database
        },
        body: JSON.stringify(submitData),
      });

      if (response.ok) {
        console.log('Todo created successfully'); // Debug log
        onSuccess();
        onClose();
        resetForm();
      } else {
        const errorText = await response.text();
        console.error('API Error:', errorText); // Debug log
        try {
          const error = JSON.parse(errorText);
          setErrors({ submit: error.message || 'Failed to create todo' });
        } catch {
          setErrors({ submit: `Server error: ${response.status} - ${errorText}` });
        }
      }
    } catch (error) {
      console.error('Network error:', error); // Debug log
      setErrors({ submit: 'Network error. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      priority: TodoPriority.MEDIUM,
      startDate: '',
      dueDate: '',
      estimatedHours: undefined,
      assignedToId: '',
      tags: [],
      todoListId,
    });
    setErrors({});
    setNewTag('');
  };

  const handleClose = () => {
    if (!isLoading) {
      onClose();
      resetForm();
    }
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags?.includes(newTag.trim())) {
      setFormData({
        ...formData,
        tags: [...(formData.tags || []), newTag.trim()],
      });
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData({
      ...formData,
      tags: (formData.tags || []).filter(tag => tag !== tagToRemove),
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.target === e.currentTarget) {
      e.preventDefault();
      addTag();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          onClick={handleClose}
        />
        
        {/* Modal */}
        <div className="relative w-full max-w-lg transform rounded-lg bg-white shadow-xl transition-all">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Create New Task
            </h3>
            <button
              onClick={handleClose}
              disabled={isLoading}
              className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 disabled:opacity-50"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          
          {/* Content */}
          <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4 max-h-[70vh] overflow-y-auto">
            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Title *
              </label>
              <input
                type="text"
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="e.g., Complete project proposal"
                disabled={isLoading}
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">{errors.title}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Detailed description of the task..."
                disabled={isLoading}
              />
            </div>

            {/* Priority */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Priority
              </label>
              <div className="flex flex-wrap gap-2">
                {priorityOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, priority: option.value })}
                    className={`px-3 py-2 rounded-md text-sm font-medium border transition-all ${
                      formData.priority === option.value
                        ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                        : 'border-gray-300 hover:border-gray-400 bg-white text-gray-700'
                    }`}
                    disabled={isLoading}
                  >
                    <Flag className="w-4 h-4 inline-block mr-1" />
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  id="startDate"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  disabled={isLoading}
                />
              </div>
              <div>
                <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 mb-1">
                  Due Date
                </label>
                <input
                  type="date"
                  id="dueDate"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  disabled={isLoading}
                />
                {errors.dueDate && (
                  <p className="mt-1 text-sm text-red-600">{errors.dueDate}</p>
                )}
              </div>
            </div>

            {/* Estimated Hours & Assignee */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="estimatedHours" className="block text-sm font-medium text-gray-700 mb-1">
                  Estimated Hours
                </label>
                <input
                  type="number"
                  id="estimatedHours"
                  min="0"
                  step="0.5"
                  value={formData.estimatedHours || ''}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    estimatedHours: e.target.value ? parseFloat(e.target.value) : undefined 
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="e.g., 2.5"
                  disabled={isLoading}
                />
              </div>
              <div>
                <label htmlFor="assignedToId" className="block text-sm font-medium text-gray-700 mb-1">
                  Assign To
                </label>
                <select
                  id="assignedToId"
                  value={formData.assignedToId}
                  onChange={(e) => setFormData({ ...formData, assignedToId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  disabled={isLoading}
                >
                  <option value="">Unassigned</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name || user.email}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tags
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {(formData.tags || []).map((tag, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    <Tag className="w-3 h-3" />
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-1 hover:bg-black/10 rounded-full p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Add a tag..."
                  disabled={isLoading}
                />
                <Button
                  type="button"
                  variant="secondary"
                  onClick={addTag}
                  disabled={isLoading || !newTag.trim()}
                >
                  Add
                </Button>
              </div>
            </div>

            {errors.submit && (
              <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-3">
                {errors.submit}
              </div>
            )}
          </form>

          {/* Actions */}
          <div className="flex justify-end gap-3 px-6 py-4 border-t bg-gray-50">
            <Button
              type="button"
              variant="secondary"
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !formData.title.trim()}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              {isLoading ? 'Creating...' : 'Create Task'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}