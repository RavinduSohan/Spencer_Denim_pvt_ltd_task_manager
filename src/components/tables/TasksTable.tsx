'use client';

import React from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { Task, TaskStatus, Priority, TaskCategory } from '@/types';
import { DataTable } from './DataTable';
import { format } from 'date-fns';

interface TasksTableProps {
  tasks: Task[];
  onTaskUpdate?: (taskId: string, updates: Partial<Task>) => void;
  onTaskDelete?: (taskId: string) => void;
  onTaskEdit?: (task: Task) => void;
}

const StatusBadge = ({ status }: { status: TaskStatus }) => {
  const statusColors = {
    [TaskStatus.PENDING]: 'bg-yellow-100 text-yellow-800',
    [TaskStatus.IN_PROGRESS]: 'bg-blue-100 text-blue-800',
    [TaskStatus.COMPLETED]: 'bg-green-100 text-green-800',
    [TaskStatus.URGENT]: 'bg-red-100 text-red-800',
    [TaskStatus.ON_HOLD]: 'bg-gray-100 text-gray-800',
  };

  return (
    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusColors[status]}`}>
      {status.replace('_', ' ')}
    </span>
  );
};

const PriorityBadge = ({ priority }: { priority: Priority }) => {
  const priorityColors = {
    [Priority.LOW]: 'bg-green-100 text-green-800',
    [Priority.MEDIUM]: 'bg-yellow-100 text-yellow-800',
    [Priority.HIGH]: 'bg-orange-100 text-orange-800',
    [Priority.URGENT]: 'bg-red-100 text-red-800',
  };

  return (
    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${priorityColors[priority]}`}>
      {priority}
    </span>
  );
};

const CategoryBadge = ({ category }: { category: TaskCategory }) => {
  const categoryColors = {
    [TaskCategory.SAMPLING]: 'bg-purple-100 text-purple-800',
    [TaskCategory.PRODUCTION]: 'bg-blue-100 text-blue-800',
    [TaskCategory.QUALITY]: 'bg-teal-100 text-teal-800',
    [TaskCategory.SHIPPING]: 'bg-indigo-100 text-indigo-800',
    [TaskCategory.COSTING]: 'bg-pink-100 text-pink-800',
    [TaskCategory.DESIGN]: 'bg-cyan-100 text-cyan-800',
    [TaskCategory.PLANNING]: 'bg-orange-100 text-orange-800',
  };

  return (
    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${categoryColors[category]}`}>
      {category}
    </span>
  );
};

export function TasksTable({ tasks, onTaskUpdate, onTaskDelete, onTaskEdit }: TasksTableProps) {
  const columns: ColumnDef<Task>[] = [
    {
      accessorKey: 'title',
      header: 'Task',
      cell: ({ row }) => (
        <div>
          <div className="font-medium text-gray-900">{row.original.title}</div>
          {row.original.description && (
            <div className="text-sm text-gray-500 truncate max-w-xs">
              {row.original.description}
            </div>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
      filterFn: 'equals',
    },
    {
      accessorKey: 'priority',
      header: 'Priority',
      cell: ({ row }) => <PriorityBadge priority={row.original.priority} />,
      filterFn: 'equals',
    },
    {
      accessorKey: 'category',
      header: 'Category',
      cell: ({ row }) => <CategoryBadge category={row.original.category} />,
      filterFn: 'equals',
    },
    {
      accessorKey: 'assignedTo',
      header: 'Assigned To',
      cell: ({ row }) => (
        <div className="flex items-center">
          {row.original.assignedTo ? (
            <>
              <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-medium mr-2">
                {row.original.assignedTo.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="text-sm font-medium text-gray-900">
                  {row.original.assignedTo.name}
                </div>
                <div className="text-sm text-gray-500">
                  {row.original.assignedTo.email}
                </div>
              </div>
            </>
          ) : (
            <span className="text-gray-400 italic">Unassigned</span>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'dueDate',
      header: 'Due Date',
      cell: ({ row }) => {
        if (!row.original.dueDate) return <span className="text-gray-400">-</span>;
        const dueDate = new Date(row.original.dueDate);
        const isOverdue = dueDate < new Date() && row.original.status !== TaskStatus.COMPLETED;
        return (
          <span className={isOverdue ? 'text-red-600 font-medium' : 'text-gray-900'}>
            {format(dueDate, 'MMM dd, yyyy')}
          </span>
        );
      },
    },
    {
      accessorKey: 'createdAt',
      header: 'Created',
      cell: ({ row }) => format(new Date(row.original.createdAt), 'MMM dd, yyyy'),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex items-center space-x-2">
          {onTaskEdit && (
            <button
              onClick={() => onTaskEdit(row.original)}
              className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
            >
              Edit
            </button>
          )}
          <button
            onClick={() => onTaskUpdate?.(row.original.id, {
              status: row.original.status === TaskStatus.COMPLETED 
                ? TaskStatus.IN_PROGRESS 
                : TaskStatus.COMPLETED
            })}
            className="text-blue-600 hover:text-blue-900 text-sm font-medium"
          >
            {row.original.status === TaskStatus.COMPLETED ? 'Reopen' : 'Complete'}
          </button>
          <button
            onClick={() => onTaskDelete?.(row.original.id)}
            className="text-red-600 hover:text-red-900 text-sm font-medium"
          >
            Delete
          </button>
        </div>
      ),
    },
  ];

  return (
    <DataTable
      data={tasks}
      columns={columns}
      searchKey="tasks"
      className="bg-white"
    />
  );
}
