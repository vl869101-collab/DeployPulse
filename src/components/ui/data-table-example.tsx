'use client';

import * as React from 'react';
import { DataTable, createSortableColumn } from '@/components/ui/table';

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'inactive' | 'pending';
  createdAt: string;
}

const mockUsers: User[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    role: 'Admin',
    status: 'active',
    createdAt: '2024-01-15',
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    role: 'User',
    status: 'active',
    createdAt: '2024-02-20',
  },
  {
    id: '3',
    name: 'Bob Wilson',
    email: 'bob@example.com',
    role: 'Editor',
    status: 'inactive',
    createdAt: '2024-03-10',
  },
  {
    id: '4',
    name: 'Alice Brown',
    email: 'alice@example.com',
    role: 'User',
    status: 'pending',
    createdAt: '2024-04-05',
  },
  {
    id: '5',
    name: 'Charlie Davis',
    email: 'charlie@example.com',
    role: 'Admin',
    status: 'active',
    createdAt: '2024-05-12',
  },
];

const columns = [
  createSortableColumn<User>('name', 'Name'),
  createSortableColumn<User>('email', 'Email'),
  createSortableColumn<User>('role', 'Role'),
  createSortableColumn<User>('status', 'Status', ({ getValue }) => {
    const status = getValue() as User['status'];
    const variants: Record<User['status'], string> = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-red-100 text-red-800',
      pending: 'bg-yellow-100 text-yellow-800',
    };
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[status]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  }),
  createSortableColumn<User>('createdAt', 'Created At'),
];

export function UsersTable() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Users</h2>
      </div>
      <DataTable columns={columns} data={mockUsers} />
    </div>
  );
}