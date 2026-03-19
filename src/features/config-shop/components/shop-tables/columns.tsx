import { SHOP_TYPES, Shop } from '../../types';
import { CellAction } from './cell-action';
import { Badge } from '@/components/ui/badge';
import { ColumnDef } from '@tanstack/react-table';
import { DataTableColumnHeader } from '@/components/ui/table/data-table-column-header';
import { cn } from '@/lib/utils';
import { Calendar, Package } from 'lucide-react';
import { format } from 'date-fns';

export const columns = (
  pageIndex: number,
  pageSize: number,
  gameOptions: { value: string; label: string }[] = []
): ColumnDef<Shop>[] => [
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
    id: 'name',
    accessorKey: 'name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Shop Name' />
    ),
    cell: ({ row }) => (
      <div className='flex flex-col'>
        <span className='text-sm font-bold'>{row.original.name}</span>
        <span className='text-muted-foreground font-mono text-[10px]'>
          ID: {row.original.id}
        </span>
      </div>
    ),
    enableColumnFilter: true,
    meta: {
      label: 'Name',
      variant: 'text',
      placeholder: 'Filter by Name'
    }
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
      <div className='flex justify-center'>
        <Badge
          variant='secondary'
          className='h-5 px-1.5 text-[10px] font-bold tracking-tight uppercase'
        >
          {cell.getValue<string>()}
        </Badge>
      </div>
    ),
    enableColumnFilter: true,
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
    cell: ({ cell }) => (
      <div className='flex justify-center'>
        <Badge
          variant='outline'
          className='h-5 px-1.5 text-[9px] font-bold tracking-wider uppercase'
        >
          {cell.getValue<string>()}
        </Badge>
      </div>
    ),
    enableColumnFilter: true,
    meta: {
      label: 'Type',
      variant: 'select',
      options: SHOP_TYPES.map((value) => ({ value, label: value })),
      placeholder: 'Filter by Type'
    }
  },
  {
    id: 'packages',
    header: () => <div className='text-center'>Packages</div>,
    cell: ({ row }) => {
      const packages = row.original.packageConfig?.package || [];
      return (
        <div className='flex justify-center'>
          <Badge
            variant='secondary'
            className='flex h-5 items-center gap-1 px-1.5 text-[10px] font-medium'
          >
            <Package className='h-3 w-3' />
            {packages.length} Packages
          </Badge>
        </div>
      );
    }
  },
  {
    id: 'period',
    header: () => <div className='text-center'>Active Period</div>,
    cell: ({ row }) => {
      const start = row.original.startTime;
      const end = row.original.endTime;
      return (
        <div className='flex flex-col items-center gap-0.5 text-[10px]'>
          <div className='text-muted-foreground flex items-center gap-1'>
            <Calendar className='h-3 w-3' />
            <span>
              {start ? format(new Date(start), 'dd/MM/yyyy HH:mm') : 'N/A'}
            </span>
          </div>
          <div className='text-muted-foreground flex items-center gap-1'>
            <Calendar className='h-3 w-3' />
            <span>
              {end ? format(new Date(end), 'dd/MM/yyyy HH:mm') : 'N/A'}
            </span>
          </div>
        </div>
      );
    }
  },
  {
    id: 'isActive',
    accessorKey: 'isActive',
    header: ({ column }) => (
      <div className='flex justify-center'>
        <DataTableColumnHeader column={column} title='Status' />
      </div>
    ),
    cell: ({ cell }) => {
      const active = cell.getValue<boolean>();
      return (
        <div className='flex justify-center'>
          <Badge
            className={cn(
              'h-5 px-1.5 text-[10px] font-bold uppercase',
              active
                ? 'bg-emerald-500 hover:bg-emerald-600'
                : 'bg-destructive/10 text-destructive hover:bg-destructive/20'
            )}
          >
            {active ? 'Active' : 'Inactive'}
          </Badge>
        </div>
      );
    },
    enableColumnFilter: true,
    meta: {
      label: 'Status',
      variant: 'select',
      options: [
        { label: 'Active', value: 'true' },
        { label: 'Inactive', value: 'false' }
      ],
      placeholder: 'Filter by Status'
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
    size: 80
  }
];
