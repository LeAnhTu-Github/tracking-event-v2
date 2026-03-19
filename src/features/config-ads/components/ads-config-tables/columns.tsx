'use client';

import { AdsConfig } from '@/features/config-ads/types';
import { CellAction } from './cell-action';
import { ColumnDef } from '@tanstack/react-table';
import { DataTableColumnHeader } from '@/components/ui/table/data-table-column-header';
import { format } from 'date-fns';

export const columns = (
  pageIndex: number,
  pageSize: number,
  gameOptions: { value: string; label: string }[] = []
): ColumnDef<AdsConfig>[] => [
  {
    accessorKey: 'No',
    header: () => <div className='text-center'>No.</div>,
    cell: ({ row }) => {
      return (
        <div className='text-center'>
          {row.index + 1 + (Number(pageIndex) - 1) * Number(pageSize)}
        </div>
      );
    },
    size: 60
  },
  {
    id: 'id',
    accessorKey: 'id',
    header: ({ column }) => (
      <div className='flex justify-center'>
        <DataTableColumnHeader column={column} title='ID' />
      </div>
    ),
    cell: ({ cell }) => (
      <div className='flex justify-center'>{cell.getValue<number>()}</div>
    ),
    enableSorting: false
  },
  {
    id: 'gameId',
    accessorKey: 'gameId',
    header: ({ column }) => (
      <div className='flex justify-center'>
        <DataTableColumnHeader column={column} title='Game ID' />
      </div>
    ),
    cell: ({ cell }) => (
      <div className='flex justify-center'>{cell.getValue<string>()}</div>
    ),
    enableColumnFilter: true,
    meta: {
      label: 'Game',
      variant: 'select',
      options: gameOptions,
      placeholder: 'Filter by Game'
    },
    enableSorting: true
  },
  {
    id: 'configKey',
    accessorKey: 'configKey',
    header: ({ column }) => (
      <div className='flex justify-center'>
        <DataTableColumnHeader column={column} title='Config Key' />
      </div>
    ),
    cell: ({ cell }) => (
      <div className='flex justify-center'>{cell.getValue<string>()}</div>
    ),
    enableColumnFilter: true,
    meta: {
      label: 'Config Key',
      variant: 'text',
      placeholder: 'Filter by Config Key'
    },
    enableSorting: true
  },
  {
    id: 'configValue',
    accessorKey: 'configValue',
    header: ({ column }) => (
      <div className='flex justify-center'>
        <DataTableColumnHeader column={column} title='Config Value' />
      </div>
    ),
    cell: ({ cell }) => (
      <div className='flex justify-center'>{cell.getValue<number>()}</div>
    ),
    enableSorting: true
  },
  {
    id: 'description',
    accessorKey: 'description',
    header: ({ column }) => (
      <div className='flex justify-center'>
        <DataTableColumnHeader column={column} title='Description' />
      </div>
    ),
    cell: ({ cell }) => (
      <div className='flex max-w-[200px] justify-center truncate'>
        {cell.getValue<string>()}
      </div>
    ),
    enableSorting: false
  },
  {
    id: 'updatedAt',
    accessorKey: 'updatedAt',
    header: ({ column }) => (
      <div className='flex justify-center'>
        <DataTableColumnHeader column={column} title='Updated At' />
      </div>
    ),
    cell: ({ cell }) => {
      const date = cell.getValue<string>();
      try {
        return (
          <div className='flex justify-center text-sm'>
            {format(new Date(date), 'dd/MM/yyyy HH:mm')}
          </div>
        );
      } catch {
        return <div className='flex justify-center text-sm'>{date}</div>;
      }
    },
    enableSorting: true
  },
  {
    id: 'q',
    accessorFn: () => '',
    header: () => null,
    cell: () => null,
    enableHiding: true,
    enableSorting: false,
    enableColumnFilter: true,
    meta: {
      label: 'Keyword',
      variant: 'text',
      placeholder: 'Search keyword'
    }
  },
  {
    id: 'actions',
    header: () => <div className='w-full text-center'>Actions</div>,
    cell: ({ row }) => (
      <div className='w-full text-center'>
        <CellAction data={row.original} />
      </div>
    ),
    enableSorting: false,
    size: 80
  }
];
