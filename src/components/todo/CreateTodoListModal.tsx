'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui';
import { X, Plus, Palette } from 'lucide-react';
import { CreateTodoListForm } from '@/types';

interface CreateTodoListModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const colorOptions = [
  { name: 'Indigo', value: 'bg-indigo-500' },
  { name: 'Blue', value: 'bg-blue-500' },
  { name: 'Green', value: 'bg-green-500' },
  { name: 'Yellow', value: 'bg-yellow-500' },
  { name: 'Orange', value: 'bg-orange-500' },
  { name: 'Red', value: 'bg-red-500' },
  { name: 'Purple', value: 'bg-purple-500' },
  { name: 'Pink', value: 'bg-pink-500' },
];

const iconOptions = [
  '📋', '✅', '📝', '🎯', '⭐', '🔥', '💼', '🏠', '🎨', '💡', '🚀', '⚡'
];

export default function CreateTodoListModal({ isOpen, onClose, onSuccess }: CreateTodoListModalProps) {
  const [formData, setFormData] = useState<CreateTodoListForm>({
    name: '',
    description: '',
    color: 'bg-indigo-500',
    icon: '📋',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (!formData.name.trim()) {
      setErrors({ name: 'Name is required' });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/todo-lists', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        onSuccess();
        onClose();
        setFormData({
          name: '',
          description: '',
          color: 'bg-indigo-500',
          icon: '📋',
        });
      } else {
        const error = await response.json();
        setErrors({ submit: error.message || 'Failed to create todo list' });
      }
    } catch (error) {
      setErrors({ submit: 'Network error. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      onClose();
      setFormData({
        name: '',
        description: '',
        color: 'bg-indigo-500',
        icon: '📋',
      });
      setErrors({});
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
        <div className="relative w-full max-w-md transform rounded-lg bg-white shadow-xl transition-all">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Create New Todo List
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
          <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Name *
              </label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="e.g., Work Tasks, Personal Projects"
                disabled={isLoading}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
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
                placeholder="Brief description of this todo list..."
                disabled={isLoading}
              />
            </div>

            {/* Color Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Color
              </label>
              <div className="flex flex-wrap gap-2">
                {colorOptions.map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, color: color.value })}
                    className={`w-8 h-8 rounded-full ${color.value} border-2 ${
                      formData.color === color.value 
                        ? 'border-gray-800 ring-2 ring-gray-300' 
                        : 'border-gray-300 hover:border-gray-400'
                    } transition-all`}
                    disabled={isLoading}
                    title={color.name}
                  />
                ))}
              </div>
            </div>

            {/* Icon Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Icon
              </label>
              <div className="flex flex-wrap gap-2">
                {iconOptions.map((icon) => (
                  <button
                    key={icon}
                    type="button"
                    onClick={() => setFormData({ ...formData, icon })}
                    className={`w-10 h-10 flex items-center justify-center text-lg border-2 rounded-md transition-all ${
                      formData.icon === icon
                        ? 'border-indigo-500 bg-indigo-50'
                        : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                    }`}
                    disabled={isLoading}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>

            {/* Preview */}
            <div className="border-t pt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Preview
              </label>
              <div className="flex items-center gap-3 p-3 border border-gray-200 rounded-md bg-gray-50">
                <div className={`w-4 h-4 rounded-full ${formData.color}`} />
                <span className="text-lg">{formData.icon}</span>
                <div>
                  <div className="font-medium text-gray-900">
                    {formData.name || 'Todo List Name'}
                  </div>
                  {formData.description && (
                    <div className="text-sm text-gray-600">
                      {formData.description}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {errors.submit && (
              <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-3">
                {errors.submit}
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t">
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
                disabled={isLoading || !formData.name.trim()}
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                {isLoading ? 'Creating...' : 'Create List'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}