'use client';

import NextImage from 'next/image';
import { Image as ImageIcon } from 'lucide-react';
import { Item } from '@/features/config-item/types';
import { CellAction } from './cell-action';
import { Badge } from '@/components/ui/badge';
import { ColumnDef } from '@tanstack/react-table';
import { DataTableColumnHeader } from '@/components/ui/table/data-table-column-header';
import { format } from 'date-fns';

const ITEM_TYPE_OPTIONS = [
  { value: 'TOKEN', label: 'TOKEN' },
  { value: 'ADS', label: 'ADS' },
  { value: 'VIP', label: 'VIP' },
  { value: 'GAME_ITEM', label: 'GAME_ITEM' }
];

export const columns = (
  pageIndex: number,
  pageSize: number
): ColumnDef<Item>[] => [
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
    id: 'urlIcon',
    accessorKey: 'urlIcon',
    header: () => <div className='text-center'>Icon</div>,
    cell: ({ cell }) => {
      const url = cell.getValue<string>();
      const isValidUrl = url && (url.startsWith('http') || url.startsWith('/'));

      return (
        <div className='flex justify-center'>
          <div className='bg-muted/30 relative h-10 w-10 overflow-hidden rounded-md border'>
            {isValidUrl ? (
              <NextImage
                src={url}
                alt='Item Icon'
                fill
                className='object-cover'
                unoptimized
              />
            ) : (
              <div className='text-muted-foreground/40 flex h-full w-full items-center justify-center'>
                <ImageIcon className='h-5 w-5' />
              </div>
            )}
          </div>
        </div>
      );
    },
    enableSorting: false
  },
  {
    id: 'itemCode',
    accessorKey: 'itemCode',
    header: ({ column }) => (
      <div className='flex justify-center'>
        <DataTableColumnHeader column={column} title='Item Code' />
      </div>
    ),
    cell: ({ cell }) => (
      <div className='flex justify-center'>{cell.getValue<string>()}</div>
    ),
    enableSorting: true
  },
  {
    id: 'name',
    accessorKey: 'name',
    header: ({ column }) => (
      <div className='flex justify-center'>
        <DataTableColumnHeader column={column} title='Name' />
      </div>
    ),
    cell: ({ cell }) => (
      <div className='flex justify-center'>{cell.getValue<string>()}</div>
    ),
    enableSorting: true
  },
  {
    id: 'gameId',
    accessorKey: 'gameId',
    header: ({ column }) => (
      <div className='flex justify-center'>
        <DataTableColumnHeader column={column} title='Game' />
      </div>
    ),
    cell: ({ cell }) => (
      <div className='flex justify-center'>{cell.getValue<string>()}</div>
    ),
    enableColumnFilter: true,
    enableSorting: false,
    meta: {
      label: 'Game',
      variant: 'text',
      placeholder: 'Filter by Game'
    }
  },
  {
    id: 'type',
    accessorKey: 'type',
    header: ({ column }) => (
      <div className='flex justify-center'>
        <DataTableColumnHeader column={column} title='Type' />
      </div>
    ),
    cell: ({ cell }) => {
      const type = cell.getValue<string>();
      return (
        <div className='flex justify-center'>
          <Badge variant='outline'>{type}</Badge>
        </div>
      );
    },
    enableColumnFilter: true,
    enableSorting: false,
    meta: {
      label: 'Type',
      variant: 'select',
      options: ITEM_TYPE_OPTIONS,
      placeholder: 'Filter by Type'
    }
  },
  {
    id: 'lastUpdatedTime',
    accessorKey: 'lastUpdatedTime',
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
    enableSorting: false
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
