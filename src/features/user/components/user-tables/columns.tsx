'use client';

import Image from 'next/image';
import { cn } from '@/lib/utils';
import { User } from '@/types/user.type';
import { CellAction } from './cell-action';
import { Badge } from '@/components/ui/badge';
import { Column, ColumnDef } from '@tanstack/react-table';
import { CheckCircle2, XCircle } from 'lucide-react';
import { STATUS_OPTIONS } from './options';
import { DataTableColumnHeader } from '@/components/ui/table/data-table-column-header';

export const columns = (
  pageIndex: number,
  pageSize: number,
  fetchUsers: () => Promise<void>
): ColumnDef<User>[] => [
  {
    accessorKey: 'No',
    header: () => <div className='text-center'>No</div>,
    cell: ({ row }) => {
      return (
        <div className='text-center'>
          {row.index + 1 + (Number(pageIndex) - 1) * Number(pageSize)}
        </div>
      );
    },
    size: 40
  },
  {
    id: 'avatar',
    accessorKey: 'avatar',
    header: () => <div className='text-center'>Avatar</div>,
    size: 70,
    cell: ({ row }) => {
      return (
        <div className='flex justify-center'>
          <div className='relative h-10 w-10'>
            <Image
              fill
              className='rounded-lg object-cover'
              alt={row.original.fullName || 'avatar'}
              src={row.original.avatar || '/images/empty-image.jpg'}
            />
          </div>
        </div>
      );
    }
  },
  {
    id: 'fullName',
    accessorKey: 'fullName',
    header: ({ column }: { column: Column<User, unknown> }) => (
      <DataTableColumnHeader column={column} title='Name' />
    ),
    cell: ({ cell }) => <div>{cell.getValue<User['fullName']>()}</div>,
    meta: {
      label: 'Name',
      placeholder: 'Filter by name...',
      variant: 'text'
    },
    enableColumnFilter: true,
    enableSorting: false
  },
  // {
  //     id: "username",
  //     accessorKey: "username",
  //     header: ({ column }: { column: Column<User, unknown> }) => (
  //         <DataTableColumnHeader column={column} title='Username' />
  //     ),
  //     enableSorting: false
  // },
  // {
  //     id: "phone",
  //     accessorKey: "phone",
  //     header: ({ column }: { column: Column<User, unknown> }) => (
  //         <DataTableColumnHeader column={column} title='Phone' />
  //     ),
  //     cell: ({ cell }) => <div>{cell.getValue<User["phone"]>()}</div>,
  //     meta: {
  //         label: "Phone",
  //         placeholder: "Filter by phone...",
  //         variant: "text"
  //     },
  //     enableColumnFilter: true,
  //     enableSorting: false
  // },
  {
    id: 'groups',
    accessorKey: 'groups',
    header: ({ column }: { column: Column<User, unknown> }) => (
      <DataTableColumnHeader column={column} title='Groups' />
    ),
    cell: ({ cell }) => {
      const groups = cell.getValue<User['groups']>();
      return <div>{groups.map((group) => group.groupName).join(', ')}</div>;
    },
    enableSorting: false
  },
  {
    id: 'status',
    accessorKey: 'status',
    header: ({ column }: { column: Column<User, unknown> }) => (
      <DataTableColumnHeader column={column} title='Status' />
    ),
    cell: ({ cell }) => {
      const status = cell.getValue<User['status']>();
      const Icon = status === 'ACTIVE' ? CheckCircle2 : XCircle;

      return (
        <Badge
          variant={status === 'ACTIVE' ? 'default' : 'destructive'}
          className={cn(
            status === 'ACTIVE'
              ? 'bg-green-500 text-white'
              : 'bg-red-500 text-white'
          )}
        >
          <Icon className='mr-1 h-3 w-3' />
          {status}
        </Badge>
      );
    },
    enableColumnFilter: true,
    enableSorting: false,
    meta: {
      label: 'Status',
      variant: 'select',
      options: STATUS_OPTIONS,
      placeholder: 'Search status...'
    }
  },

  {
    id: 'actions',
    header: () => <div className='w-full text-center'>Actions</div>,
    cell: ({ row }) => (
      <div className='w-full text-center'>
        <CellAction data={row.original} fetchUsers={fetchUsers} />
      </div>
    ),
    enableSorting: false,
    size: 80
  }
];
