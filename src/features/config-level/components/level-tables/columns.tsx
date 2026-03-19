'use client';

import NextImage from 'next/image';
import { cn } from '@/lib/utils';
import { LevelItem, HardLevel } from '@/types/level.type';
import { CellAction } from './cell-action';
import { Badge } from '@/components/ui/badge';
import { Column, ColumnDef } from '@tanstack/react-table';
import { DataTableColumnHeader } from '@/components/ui/table/data-table-column-header';
import { format } from 'date-fns';

const HARD_LEVEL_OPTIONS = [
  { value: 'EASY', label: 'EASY' },
  { value: 'MEDIUM', label: 'MEDIUM' },
  { value: 'HARD', label: 'HARD' }
];

export const columns = (
  pageIndex: number,
  pageSize: number,
  gameOptions: { value: string; label: string }[] = []
): ColumnDef<LevelItem>[] => [
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
    id: 'levelNumber',
    accessorKey: 'levelNumber',
    header: ({ column }) => (
      <div className='flex justify-center'>
        <DataTableColumnHeader column={column} title='Level' />
      </div>
    ),
    cell: ({ cell }) => (
      <div className='flex justify-center'>{cell.getValue<number>()}</div>
    ),
    enableColumnFilter: true,
    enableSorting: true,
    meta: {
      label: 'Level Number',
      variant: 'number',
      placeholder: 'Level'
    }
  },
  {
    id: 'hardLevel',
    accessorKey: 'hardLevel',
    header: ({ column }) => (
      <div className='flex justify-center'>
        <DataTableColumnHeader column={column} title='Difficulty' />
      </div>
    ),
    cell: ({ cell }) => {
      const level = cell.getValue<HardLevel>();
      return (
        <div className='flex justify-center'>
          <Badge
            variant={
              level === 'EASY'
                ? 'outline'
                : level === 'MEDIUM'
                  ? 'default'
                  : 'destructive'
            }
          >
            {level}
          </Badge>
        </div>
      );
    },
    enableColumnFilter: true,
    enableSorting: false,
    meta: {
      label: 'Difficulty',
      variant: 'select',
      options: HARD_LEVEL_OPTIONS,
      placeholder: 'Filter by Difficulty'
    }
  },
  {
    id: 'countdown',
    accessorKey: 'countdown',
    header: ({ column }) => (
      <div className='flex justify-center'>
        <DataTableColumnHeader column={column} title='Countdown' />
      </div>
    ),
    cell: ({ cell }) => (
      <div className='text-center'>{cell.getValue<number>()}s</div>
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
