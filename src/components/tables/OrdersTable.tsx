'use client';

import React from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { Order, OrderStatus } from '@/types';
import { DataTable } from './DataTable';
import { format } from 'date-fns';

interface OrdersTableProps {
  orders: Order[];
  onOrderUpdate?: (orderId: string, updates: Partial<Order>) => void;
  onOrderDelete?: (orderId: string) => void;
}

const OrderStatusBadge = ({ status }: { status: OrderStatus }) => {
  const statusColors = {
    [OrderStatus.PENDING]: 'bg-yellow-100 text-yellow-800',
    [OrderStatus.SAMPLING]: 'bg-purple-100 text-purple-800',
    [OrderStatus.CUTTING]: 'bg-blue-100 text-blue-800',
    [OrderStatus.PRODUCTION]: 'bg-indigo-100 text-indigo-800',
    [OrderStatus.QUALITY_CHECK]: 'bg-teal-100 text-teal-800',
    [OrderStatus.PACKING]: 'bg-orange-100 text-orange-800',
    [OrderStatus.SHIPPED]: 'bg-green-100 text-green-800',
    [OrderStatus.DELIVERED]: 'bg-emerald-100 text-emerald-800',
    [OrderStatus.CANCELLED]: 'bg-red-100 text-red-800',
  };

  return (
    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusColors[status]}`}>
      {status.replace('_', ' ')}
    </span>
  );
};

const ProgressBar = ({ progress }: { progress: number }) => {
  const getProgressColor = (progress: number) => {
    if (progress < 30) return 'bg-red-500';
    if (progress < 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className="w-full bg-gray-200 rounded-full h-2">
      <div
        className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(progress)}`}
        style={{ width: `${progress}%` }}
      ></div>
      <span className="text-xs text-gray-600 mt-1 block">{progress}%</span>
    </div>
  );
};

export function OrdersTable({ orders, onOrderUpdate, onOrderDelete }: OrdersTableProps) {
  const columns: ColumnDef<Order>[] = [
    {
      accessorKey: 'orderNumber',
      header: 'Order #',
      cell: ({ row }) => (
        <div className="font-mono font-medium text-blue-600">
          {row.original.orderNumber}
        </div>
      ),
    },
    {
      accessorKey: 'client',
      header: 'Client',
      cell: ({ row }) => (
        <div className="font-medium text-gray-900">
          {row.original.client}
        </div>
      ),
    },
    {
      accessorKey: 'product',
      header: 'Product',
      cell: ({ row }) => (
        <div>
          <div className="font-medium text-gray-900">{row.original.product}</div>
          <div className="text-sm text-gray-500">
            Qty: {row.original.quantity.toLocaleString()} pcs
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => <OrderStatusBadge status={row.original.status} />,
      filterFn: 'equals',
    },
    {
      accessorKey: 'progress',
      header: 'Progress',
      cell: ({ row }) => (
        <div className="w-24">
          <ProgressBar progress={row.original.progress} />
        </div>
      ),
    },
    {
      accessorKey: 'shipDate',
      header: 'Ship Date',
      cell: ({ row }) => {
        const shipDate = new Date(row.original.shipDate);
        const isOverdue = shipDate < new Date() && row.original.status !== OrderStatus.SHIPPED && row.original.status !== OrderStatus.DELIVERED;
        return (
          <span className={isOverdue ? 'text-red-600 font-medium' : 'text-gray-900'}>
            {format(shipDate, 'MMM dd, yyyy')}
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
      id: 'tasks',
      header: 'Tasks',
      cell: ({ row }) => (
        <div className="text-center">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            {row.original._count?.tasks || 0} tasks
          </span>
        </div>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => {/* Navigate to order details */}}
            className="text-blue-600 hover:text-blue-900 text-sm font-medium"
          >
            View
          </button>
          <button
            onClick={() => onOrderUpdate?.(row.original.id, { status: OrderStatus.PRODUCTION })}
            className="text-green-600 hover:text-green-900 text-sm font-medium"
          >
            Update
          </button>
          <button
            onClick={() => onOrderDelete?.(row.original.id)}
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
      data={orders}
      columns={columns}
      searchKey="orders"
      className="bg-white"
    />
  );
}
