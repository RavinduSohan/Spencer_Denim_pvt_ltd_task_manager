'use client';

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui';
import { Badge } from '@/components/ui';
import { Button } from '@/components/ui';
import { Progress } from '@/components/ui';
import {
  Calendar,
  Clock,
  User,
  MoreVertical,
  Edit,
  Trash2,
  CheckCircle,
  Circle,
  AlertTriangle,
  Flag,
  MessageSquare,
  Paperclip,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui';
import { TodoItem, TodoStatus, TodoPriority } from '@/types';
import { cn } from '@/lib/utils';

interface TodoItemCardProps {
  todo: TodoItem;
  onUpdate: () => void;
}

export default function TodoItemCard({ todo, onUpdate }: TodoItemCardProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleStatusChange = async (newStatus: TodoStatus) => {
    setIsLoading(true);
    try {
      const updateData: any = { status: newStatus };
      
      // If marking as completed, set completedAt and progress to 100
      if (newStatus === TodoStatus.COMPLETED) {
        updateData.completedAt = new Date().toISOString();
        updateData.progress = 100;
      }

      const response = await fetch(`/api/todos/${todo.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      if (response.ok) {
        onUpdate();
      }
    } catch (error) {
      console.error('Failed to update todo status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this task?')) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/todos/${todo.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        onUpdate();
      }
    } catch (error) {
      console.error('Failed to delete todo:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getPriorityColor = (priority: TodoPriority) => {
    const colors = {
      LOW: 'bg-blue-100 text-blue-800 border-blue-200',
      MEDIUM: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      HIGH: 'bg-orange-100 text-orange-800 border-orange-200',
      URGENT: 'bg-red-100 text-red-800 border-red-200',
      CRITICAL: 'bg-purple-100 text-purple-800 border-purple-200',
    };
    return colors[priority];
  };

  const getStatusColor = (status: TodoStatus) => {
    const colors = {
      PENDING: 'bg-gray-100 text-gray-800 border-gray-200',
      IN_PROGRESS: 'bg-blue-100 text-blue-800 border-blue-200',
      ON_HOLD: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      COMPLETED: 'bg-green-100 text-green-800 border-green-200',
      CANCELLED: 'bg-red-100 text-red-800 border-red-200',
      DELAYED: 'bg-orange-100 text-orange-800 border-orange-200',
    };
    return colors[status];
  };

  const getStatusIcon = (status: TodoStatus) => {
    const icons = {
      PENDING: Circle,
      IN_PROGRESS: Clock,
      ON_HOLD: AlertTriangle,
      COMPLETED: CheckCircle,
      CANCELLED: AlertTriangle,
      DELAYED: AlertTriangle,
    };
    const Icon = icons[status];
    return <Icon className="w-4 h-4" />;
  };

  const formatDate = (date: Date | string | null | undefined) => {
    if (!date) return null;
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: d.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
    });
  };

  const isOverdue = todo.dueDate && new Date(todo.dueDate) < new Date() && todo.status !== TodoStatus.COMPLETED;

  return (
    <Card 
      className={cn(
        'transition-all duration-200 hover:shadow-lg border-l-4',
        todo.status === TodoStatus.COMPLETED 
          ? 'opacity-75 border-l-green-500' 
          : todo.isDelayed 
            ? 'border-l-red-500' 
            : 'border-l-indigo-500',
        isOverdue && 'bg-red-50 border-red-200',
        isLoading && 'pointer-events-none opacity-50'
      )}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-start gap-3 flex-1">
            <button
              onClick={() => handleStatusChange(
                todo.status === TodoStatus.COMPLETED 
                  ? TodoStatus.PENDING 
                  : TodoStatus.COMPLETED
              )}
              className={cn(
                'mt-1 p-1 rounded-full transition-colors',
                todo.status === TodoStatus.COMPLETED
                  ? 'text-green-600 hover:bg-green-100'
                  : 'text-gray-400 hover:bg-gray-100'
              )}
            >
              {getStatusIcon(todo.status)}
            </button>
            
            <div className="flex-1 min-w-0">
              <h3 className={cn(
                'font-semibold text-slate-800 mb-1',
                todo.status === TodoStatus.COMPLETED && 'line-through text-slate-500'
              )}>
                {todo.title}
              </h3>
              
              {todo.description && (
                <p className="text-sm text-slate-600 mb-2 line-clamp-2">
                  {todo.description}
                </p>
              )}

              {/* Tags */}
              {todo.tags && todo.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-2">
                  {todo.tags.map((tag, index) => (
                    <Badge 
                      key={index} 
                      variant="outline" 
                      className="text-xs bg-slate-50"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}

              {/* Progress */}
              {todo.progress > 0 && todo.status !== TodoStatus.COMPLETED && (
                <div className="mb-2">
                  <div className="flex items-center justify-between text-xs text-slate-600 mb-1">
                    <span>Progress</span>
                    <span>{todo.progress}%</span>
                  </div>
                  <Progress value={todo.progress} className="h-2" />
                </div>
              )}

              {/* Meta Info */}
              <div className="flex items-center gap-4 text-xs text-slate-500">
                {todo.dueDate && (
                  <div className={cn(
                    'flex items-center gap-1',
                    isOverdue && 'text-red-600 font-medium'
                  )}>
                    <Calendar className="w-3 h-3" />
                    <span>{formatDate(todo.dueDate)}</span>
                  </div>
                )}
                
                {todo.assignedTo && (
                  <div className="flex items-center gap-1">
                    <User className="w-3 h-3" />
                    <span>{todo.assignedTo.name || todo.assignedTo.email}</span>
                  </div>
                )}

                {todo.estimatedHours && (
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{todo.estimatedHours}h</span>
                  </div>
                )}

                {todo._count?.comments && todo._count.comments > 0 && (
                  <div className="flex items-center gap-1">
                    <MessageSquare className="w-3 h-3" />
                    <span>{todo._count.comments}</span>
                  </div>
                )}

                {todo._count?.attachments && todo._count.attachments > 0 && (
                  <div className="flex items-center gap-1">
                    <Paperclip className="w-3 h-3" />
                    <span>{todo._count.attachments}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 ml-3">
            <Badge 
              variant="outline" 
              className={cn('text-xs border', getPriorityColor(todo.priority))}
            >
              <Flag className="w-3 h-3 mr-1" />
              {todo.priority}
            </Badge>

            <Badge 
              variant="outline" 
              className={cn('text-xs border', getStatusColor(todo.status))}
            >
              {todo.status.replace('_', ' ')}
            </Badge>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="secondary" size="sm" className="h-8 w-8 p-0">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => console.log('Edit todo')}>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Task
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
        </div>

        {/* Delay Warning */}
        {todo.isDelayed && todo.delayReason && (
          <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded-md">
            <div className="flex items-center gap-2 text-red-800 text-sm">
              <AlertTriangle className="w-4 h-4" />
              <span className="font-medium">Delayed:</span>
              <span>{todo.delayReason}</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}