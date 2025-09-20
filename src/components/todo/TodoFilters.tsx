'use client';

import React from 'react';
import { Button } from '@/components/ui';
import { Badge } from '@/components/ui';
import {
  Search,
  Filter,
  X,
  CheckCircle,
  Clock,
  AlertTriangle,
  Circle,
  Flag,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui';
import { TodoStatus, TodoPriority } from '@/types';
import { cn } from '@/lib/utils';

interface TodoFiltersProps {
  searchQuery: string;
  statusFilter: TodoStatus | 'ALL';
  priorityFilter: TodoPriority | 'ALL';
  onSearchChange: (query: string) => void;
  onStatusChange: (status: TodoStatus | 'ALL') => void;
  onPriorityChange: (priority: TodoPriority | 'ALL') => void;
}

export default function TodoFilters({
  searchQuery,
  statusFilter,
  priorityFilter,
  onSearchChange,
  onStatusChange,
  onPriorityChange,
}: TodoFiltersProps) {
  const statusOptions = [
    { value: 'ALL', label: 'All Status', icon: Circle },
    { value: TodoStatus.PENDING, label: 'Pending', icon: Circle },
    { value: TodoStatus.IN_PROGRESS, label: 'In Progress', icon: Clock },
    { value: TodoStatus.ON_HOLD, label: 'On Hold', icon: AlertTriangle },
    { value: TodoStatus.COMPLETED, label: 'Completed', icon: CheckCircle },
    { value: TodoStatus.DELAYED, label: 'Delayed', icon: AlertTriangle },
  ];

  const priorityOptions = [
    { value: 'ALL', label: 'All Priority' },
    { value: TodoPriority.LOW, label: 'Low' },
    { value: TodoPriority.MEDIUM, label: 'Medium' },
    { value: TodoPriority.HIGH, label: 'High' },
    { value: TodoPriority.URGENT, label: 'Urgent' },
    { value: TodoPriority.CRITICAL, label: 'Critical' },
  ];

  const hasActiveFilters = statusFilter !== 'ALL' || priorityFilter !== 'ALL' || searchQuery !== '';

  const clearAllFilters = () => {
    onSearchChange('');
    onStatusChange('ALL');
    onPriorityChange('ALL');
  };

  const getStatusIcon = (status: string) => {
    const option = statusOptions.find(opt => opt.value === status);
    if (option && option.icon) {
      const Icon = option.icon;
      return <Icon className="w-4 h-4" />;
    }
    return <Circle className="w-4 h-4" />;
  };

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      LOW: 'bg-blue-100 text-blue-800 border-blue-200',
      MEDIUM: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      HIGH: 'bg-orange-100 text-orange-800 border-orange-200',
      URGENT: 'bg-red-100 text-red-800 border-red-200',
      CRITICAL: 'bg-purple-100 text-purple-800 border-purple-200',
    };
    return colors[priority] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      PENDING: 'bg-gray-100 text-gray-800 border-gray-200',
      IN_PROGRESS: 'bg-blue-100 text-blue-800 border-blue-200',
      ON_HOLD: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      COMPLETED: 'bg-green-100 text-green-800 border-green-200',
      CANCELLED: 'bg-red-100 text-red-800 border-red-200',
      DELAYED: 'bg-orange-100 text-orange-800 border-orange-200',
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  return (
    <div className="flex items-center gap-3">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <input
          type="text"
          placeholder="Search tasks..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9 pr-4 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent w-64"
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Status Filter */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="secondary" className="gap-2">
            {getStatusIcon(statusFilter)}
            <span>{statusOptions.find(opt => opt.value === statusFilter)?.label || 'Status'}</span>
            {statusFilter !== 'ALL' && (
              <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 flex items-center justify-center text-xs">
                1
              </Badge>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          {statusOptions.map((option) => {
            const Icon = option.icon;
            return (
              <DropdownMenuItem
                key={option.value}
                onClick={() => onStatusChange(option.value as TodoStatus | 'ALL')}
                className={cn(
                  'flex items-center gap-2',
                  statusFilter === option.value && 'bg-indigo-50 text-indigo-700'
                )}
              >
                <Icon className="w-4 h-4" />
                <span>{option.label}</span>
                {statusFilter === option.value && (
                  <CheckCircle className="w-4 h-4 ml-auto text-indigo-600" />
                )}
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Priority Filter */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="secondary" className="gap-2">
            <Flag className="w-4 h-4" />
            <span>{priorityOptions.find(opt => opt.value === priorityFilter)?.label || 'Priority'}</span>
            {priorityFilter !== 'ALL' && (
              <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 flex items-center justify-center text-xs">
                1
              </Badge>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          {priorityOptions.map((option) => (
            <DropdownMenuItem
              key={option.value}
              onClick={() => onPriorityChange(option.value as TodoPriority | 'ALL')}
              className={cn(
                'flex items-center gap-2',
                priorityFilter === option.value && 'bg-indigo-50 text-indigo-700'
              )}
            >
              <Flag className="w-4 h-4" />
              <span>{option.label}</span>
              {priorityFilter === option.value && (
                <CheckCircle className="w-4 h-4 ml-auto text-indigo-600" />
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Clear Filters */}
      {hasActiveFilters && (
        <Button
          variant="danger"
          size="sm"
          onClick={clearAllFilters}
          className="text-red-600 hover:text-red-700 hover:bg-red-50"
        >
          <X className="w-4 h-4 mr-1" />
          Clear
        </Button>
      )}

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex items-center gap-2 ml-2">
          {statusFilter !== 'ALL' && (
            <Badge 
              variant="outline" 
              className={cn('text-xs border', getStatusColor(statusFilter))}
            >
              {statusOptions.find(opt => opt.value === statusFilter)?.label}
              <button
                onClick={() => onStatusChange('ALL')}
                className="ml-1 hover:bg-black/10 rounded-full p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          )}
          
          {priorityFilter !== 'ALL' && (
            <Badge 
              variant="outline" 
              className={cn('text-xs border', getPriorityColor(priorityFilter))}
            >
              {priorityOptions.find(opt => opt.value === priorityFilter)?.label}
              <button
                onClick={() => onPriorityChange('ALL')}
                className="ml-1 hover:bg-black/10 rounded-full p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          )}
          
          {searchQuery && (
            <Badge variant="outline" className="text-xs border border-gray-200">
              "{searchQuery}"
              <button
                onClick={() => onSearchChange('')}
                className="ml-1 hover:bg-black/10 rounded-full p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}