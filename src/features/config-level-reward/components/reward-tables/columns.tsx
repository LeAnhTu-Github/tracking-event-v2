'use client';

import { cn } from '@/lib/utils';
import { LevelReward, ConfigType } from '../../types';
import { CellAction } from './cell-action';
import { Badge } from '@/components/ui/badge';
import { ColumnDef } from '@tanstack/react-table';
import { DataTableColumnHeader } from '@/components/ui/table/data-table-column-header';
import { format } from 'date-fns';

const CONFIG_TYPE_OPTIONS = [
  { value: 'INDIVIDUAL', label: 'INDIVIDUAL' },
  { value: 'GENERAL', label: 'GENERAL' }
];

export const columns = (
  pageIndex: number,
  pageSize: number,
  gameOptions: { value: string; label: string }[] = []
): ColumnDef<LevelReward>[] => [
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
    enableSorting: false
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
      variant: 'select',
      options: gameOptions,
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
      const type = cell.getValue<ConfigType>();
      return (
        <div className='flex justify-center'>
          <Badge variant={type === 'INDIVIDUAL' ? 'default' : 'secondary'}>
            {type}
          </Badge>
        </div>
      );
    },
    enableColumnFilter: true,
    enableSorting: false,
    meta: {
      label: 'Type',
      variant: 'select',
      options: CONFIG_TYPE_OPTIONS,
      placeholder: 'Filter by Type'
    }
  },
  {
    id: 'levelNumbers',
    accessorKey: 'levelNumbers',
    header: ({ column }) => (
      <div className='flex justify-center'>
        <DataTableColumnHeader column={column} title='Levels' />
      </div>
    ),
    cell: ({ cell }) => {
      const levels = cell.getValue<number[]>();
      return (
        <div className='flex max-w-[200px] flex-wrap justify-center gap-1'>
          {levels?.length > 0 ? (
            levels.map((l) => (
              <Badge key={l} variant='outline'>
                {l}
              </Badge>
            ))
          ) : (
            <span className='text-muted-foreground'>-</span>
          )}
        </div>
      );
    },
    enableSorting: false
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
