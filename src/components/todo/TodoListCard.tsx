'use client';

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui';
import { Badge } from '@/components/ui';
import { Button } from '@/components/ui';
import { Progress } from '@/components/ui';
import {
  MoreVertical,
  Edit,
  Archive,
  Trash2,
  Clock,
  CheckCircle,
  AlertTriangle,
  Users,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui';
import { TodoList } from '@/types';
import { cn } from '@/lib/utils';

interface TodoListCardProps {
  todoList: TodoList;
  isSelected: boolean;
  onClick: () => void;
  onUpdate: () => void;
}

export default function TodoListCard({ todoList, isSelected, onClick, onUpdate }: TodoListCardProps) {
  const [isLoading, setIsLoading] = useState(false);

  const stats = todoList.stats || {
    total: 0,
    completed: 0,
    pending: 0,
    inProgress: 0,
    delayed: 0,
  };

  const completionRate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

  const handleArchive = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLoading(true);
    try {
      const response = await fetch(`/api/todo-lists/${todoList.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          isArchived: !todoList.isArchived,
        }),
      });

      if (response.ok) {
        onUpdate();
      }
    } catch (error) {
      console.error('Failed to archive todo list:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this todo list? This action cannot be undone.')) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/todo-lists/${todoList.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        onUpdate();
      }
    } catch (error) {
      console.error('Failed to delete todo list:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card
      className={cn(
        'cursor-pointer transition-all duration-200 hover:shadow-lg',
        isSelected
          ? 'ring-2 ring-indigo-500 bg-indigo-50 border-indigo-200'
          : 'hover:bg-slate-50 border-slate-200',
        todoList.isArchived && 'opacity-60',
        isLoading && 'pointer-events-none opacity-50'
      )}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3 flex-1">
            <div
              className={cn(
                'w-4 h-4 rounded-full flex-shrink-0',
                todoList.color || 'bg-indigo-500'
              )}
            />
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-slate-800 truncate">
                {todoList.name}
              </h3>
              {todoList.description && (
                <p className="text-sm text-slate-600 truncate">
                  {todoList.description}
                </p>
              )}
            </div>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="secondary"
                size="sm"
                className="h-8 w-8 p-0 hover:bg-slate-200"
              >
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={(e: React.MouseEvent) => e.stopPropagation()}>
                <Edit className="w-4 h-4 mr-2" />
                Edit List
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleArchive}>
                <Archive className="w-4 h-4 mr-2" />
                {todoList.isArchived ? 'Unarchive' : 'Archive'}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={handleDelete}
                className="text-red-600 focus:text-red-600"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Progress Bar */}
        <div className="mb-3">
          <div className="flex items-center justify-between text-sm text-slate-600 mb-1">
            <span>Progress</span>
            <span>{completionRate}%</span>
          </div>
          <Progress value={completionRate} className="h-2" />
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1 text-slate-600">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>{stats.completed}</span>
            </div>
            <div className="flex items-center gap-1 text-slate-600">
              <Clock className="w-4 h-4 text-blue-500" />
              <span>{stats.pending + stats.inProgress}</span>
            </div>
            {stats.delayed > 0 && (
              <div className="flex items-center gap-1 text-slate-600">
                <AlertTriangle className="w-4 h-4 text-red-500" />
                <span>{stats.delayed}</span>
              </div>
            )}
          </div>
          
          <Badge 
            variant="secondary" 
            className="bg-slate-100 text-slate-700 hover:bg-slate-200"
          >
            {stats.total} tasks
          </Badge>
        </div>

        {/* Archived Badge */}
        {todoList.isArchived && (
          <div className="mt-2">
            <Badge variant="outline" className="text-xs border-amber-300 text-amber-700">
              Archived
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
}