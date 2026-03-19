'use client';

import NextImage from 'next/image';
import { cn } from '@/lib/utils';
import type { Image as ImageModel, SyncStatus } from '@/types/image.type';
import { CellAction } from './cell-action';
import { Badge } from '@/components/ui/badge';
import { Column, ColumnDef } from '@tanstack/react-table';
import { CheckCircle2, XCircle, Clock } from 'lucide-react';
import { DataTableColumnHeader } from '@/components/ui/table/data-table-column-header';
import { format } from 'date-fns';

const STATUS_OPTIONS = [
  { value: 'ACTIVE', label: 'Active' },
  { value: 'INACTIVE', label: 'Inactive' }
];

const getStatusBadge = (status: string, type: 'status' | 'sync' = 'status') => {
  if (type === 'sync') {
    const Icon =
      status === 'COMPLETED'
        ? CheckCircle2
        : status === 'FAILED'
          ? XCircle
          : Clock;
    return (
      <Badge
        variant={
          status === 'COMPLETED'
            ? 'default'
            : status === 'FAILED'
              ? 'destructive'
              : 'secondary'
        }
        className={cn(
          status === 'COMPLETED'
            ? 'bg-green-500 text-white'
            : status === 'FAILED'
              ? 'bg-red-500 text-white'
              : 'bg-yellow-500 text-white'
        )}
      >
        <Icon className='mr-1 h-3 w-3' />
        {status}
      </Badge>
    );
  }

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
};

export const columns = (
  pageIndex: number,
  pageSize: number,
  gameOptions: { value: string; label: string }[] = []
): ColumnDef<ImageModel>[] => [
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
    id: 'thumbnailUrl',
    accessorKey: 'thumbnailUrl',
    header: () => <div className='text-center'>Thumbnail</div>,
    size: 100,
    cell: ({ row }) => {
      return (
        <div className='flex justify-center'>
          <div className='relative h-16 w-16'>
            <NextImage
              fill
              className='rounded-lg object-cover'
              alt='Thumbnail'
              src={row.original.thumbnailUrl || '/images/empty-image.jpg'}
              unoptimized
            />
          </div>
        </div>
      );
    }
  },
  {
    id: 'imageUrl',
    accessorKey: 'imageUrl',
    header: () => <div className='text-center'>Image</div>,
    size: 100,
    cell: ({ row }) => {
      return (
        <div className='flex justify-center'>
          <div className='relative h-16 w-16'>
            <NextImage
              fill
              className='rounded-lg object-cover'
              alt='Full Image'
              src={row.original.imageUrl || '/images/empty-image.jpg'}
              unoptimized
            />
          </div>
        </div>
      );
    }
  },
  {
    id: 'levelSexy',
    accessorKey: 'levelSexy',
    header: ({ column }: { column: Column<ImageModel, unknown> }) => (
      <DataTableColumnHeader column={column} title='Level_sexy' />
    ),
    cell: ({ cell }) => {
      const level = cell.getValue<ImageModel['levelSexy']>();
      return <div className='text-center'>{level}</div>;
    },
    enableSorting: true
  },
  {
    id: 'playCount',
    accessorKey: 'playCount',
    header: ({ column }: { column: Column<ImageModel, unknown> }) => (
      <DataTableColumnHeader column={column} title='Play Count' />
    ),
    cell: ({ cell }) => {
      const count = cell.getValue<ImageModel['playCount']>();
      return <div className='text-center'>{count.toLocaleString()}</div>;
    },
    enableSorting: true
  },
  {
    id: 'likeCount',
    accessorKey: 'likeCount',
    header: ({ column }: { column: Column<ImageModel, unknown> }) => (
      <DataTableColumnHeader column={column} title='Like Count' />
    ),
    cell: ({ cell }) => {
      const count = cell.getValue<ImageModel['likeCount']>();
      return <div className='text-center'>{count.toLocaleString()}</div>;
    },
    enableSorting: true
  },
  {
    id: 'downloadCount',
    accessorKey: 'downloadCount',
    header: ({ column }: { column: Column<ImageModel, unknown> }) => (
      <DataTableColumnHeader column={column} title='Download Count' />
    ),
    cell: ({ cell }) => {
      const count = cell.getValue<ImageModel['downloadCount']>();
      return <div className='text-center'>{count.toLocaleString()}</div>;
    },
    enableSorting: true
  },
  {
    id: 'type',
    accessorKey: 'type',
    header: ({ column }: { column: Column<ImageModel, unknown> }) => (
      <DataTableColumnHeader column={column} title='Image Type' />
    ),
    cell: ({ cell }) => {
      const type = cell.getValue<ImageModel['type']>();
      const typeValue = type || '';
      const isReview = typeValue === 'REVIEW';
      const isProduct = typeValue === 'PRODUCT';

      if (!typeValue) {
        return <div className='text-center'>-</div>;
      }

      return (
        <div className='text-center'>
          <Badge
            variant={isReview ? 'default' : 'secondary'}
            className={cn(
              isReview ? 'bg-blue-500 text-white' : 'bg-purple-500 text-white'
            )}
          >
            {typeValue}
          </Badge>
        </div>
      );
    },
    enableSorting: false
  },
  {
    id: 'gameId',
    accessorKey: 'gameId',
    header: ({ column }: { column: Column<ImageModel, unknown> }) => (
      <DataTableColumnHeader column={column} title='Game' />
    ),
    cell: ({ row }) => {
      const gameId = row.original.metadata?.gameId;
      return <div className='text-center'>{gameId || '-'}</div>;
    },
    enableColumnFilter: true,
    enableSorting: false,
    meta: {
      label: 'Game',
      variant: 'select',
      options: gameOptions,
      placeholder: 'Search game...'
    }
  },
  {
    id: 'status',
    accessorKey: 'status',
    header: ({ column }: { column: Column<ImageModel, unknown> }) => (
      <DataTableColumnHeader column={column} title='Status' />
    ),
    cell: ({ cell }) => {
      const status = cell.getValue<ImageModel['status']>();
      return (
        <div className='text-center'>{getStatusBadge(status, 'status')}</div>
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
    id: 'metadataGenStatus',
    accessorKey: 'metadataGenStatus',
    header: ({ column }: { column: Column<ImageModel, unknown> }) => (
      <DataTableColumnHeader column={column} title='Metadata Gen Status' />
    ),
    cell: ({ cell }) => {
      const status = (cell.getValue<ImageModel['metadataGenStatus']>() ??
        'PENDING') as SyncStatus;
      return (
        <div className='text-center'>{getStatusBadge(status, 'sync')}</div>
      );
    },
    enableSorting: false
  },
  {
    id: 'embeddingStatus',
    accessorKey: 'embeddingStatus',
    header: ({ column }: { column: Column<ImageModel, unknown> }) => (
      <DataTableColumnHeader column={column} title='Embedding Status' />
    ),
    cell: ({ cell }) => {
      const status = (cell.getValue<ImageModel['embeddingStatus']>() ??
        'PENDING') as SyncStatus;
      return (
        <div className='text-center'>{getStatusBadge(status, 'sync')}</div>
      );
    },
    enableSorting: false
  },
  {
    id: 'elasticsearchSyncStatus',
    accessorKey: 'elasticsearchSyncStatus',
    header: ({ column }: { column: Column<ImageModel, unknown> }) => (
      <DataTableColumnHeader
        column={column}
        title='Elasticsearch Sync Status'
      />
    ),
    cell: ({ cell }) => {
      const status = (cell.getValue<ImageModel['elasticsearchSyncStatus']>() ??
        'PENDING') as SyncStatus;
      return (
        <div className='text-center'>{getStatusBadge(status, 'sync')}</div>
      );
    },
    enableSorting: false
  },
  {
    id: 'createdAt',
    accessorKey: 'createdAt',
    header: ({ column }: { column: Column<ImageModel, unknown> }) => (
      <DataTableColumnHeader column={column} title='Created At' />
    ),
    cell: ({ cell }) => {
      const date = cell.getValue<ImageModel['createdAt']>();
      try {
        return (
          <div className='text-center text-sm'>
            {format(new Date(date), 'dd/MM/yyyy HH:mm')}
          </div>
        );
      } catch {
        return <div className='text-center text-sm'>{date}</div>;
      }
    },
    enableSorting: true
  },
  {
    id: 'updatedAt',
    accessorKey: 'updatedAt',
    header: ({ column }: { column: Column<ImageModel, unknown> }) => (
      <DataTableColumnHeader column={column} title='Updated At' />
    ),
    cell: ({ cell }) => {
      const date = cell.getValue<ImageModel['updatedAt']>();
      try {
        return (
          <div className='text-sm'>
            {format(new Date(date), 'dd/MM/yyyy HH:mm')}
          </div>
        );
      } catch {
        return <div className='text-sm'>{date}</div>;
      }
    },
    enableSorting: true
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
