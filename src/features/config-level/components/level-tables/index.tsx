'use client';

import { ColumnDef } from '@tanstack/react-table';
import { useDataTable } from '@/hooks/use-data-table';
import { DataTable } from '@/components/ui/table/data-table';
import { DataTableToolbar } from '@/components/ui/table/data-table-toolbar';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { ExtendedColumnSort } from '@/types_old/data-table';

interface LevelTableParams<TData, TValue> {
  data: TData[];
  totalItems: number;
  columns: ColumnDef<TData, TValue>[];
  isLoading: boolean;
  pageIndex: number;
  pageSize: number;
  initialSorting?: ExtendedColumnSort<TData>[];
  onReload?: () => void;
}

export function LevelTable<TData, TValue>({
  data,
  totalItems,
  columns,
  isLoading,
  pageIndex,
  pageSize,
  initialSorting,
  onReload
}: LevelTableParams<TData, TValue>) {
  const router = useRouter();
  const pageCount = Math.ceil(totalItems / pageSize);

  const { table } = useDataTable({
    data,
    columns,
    pageCount: pageCount > 0 ? pageCount : 1,
    shallow: false,
    debounceMs: 500,
    initialState: {
      pagination: {
        pageIndex: pageIndex - 1,
        pageSize: pageSize
      },
      sorting: initialSorting
    }
  });

  if (isLoading) {
    return (
      <div className='flex flex-1 flex-col space-y-4'>
        <div className='flex w-full items-start justify-between gap-2 p-1'>
          <Skeleton className='h-10 w-64' />
          <Skeleton className='h-10 w-32' />
        </div>
        <div className='relative flex flex-1'>
          <div className='absolute inset-0 flex overflow-hidden rounded-lg border'>
            <div className='flex w-full flex-col space-y-2 p-4'>
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className='h-12 w-full' />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='flex flex-1 flex-col space-y-4'>
      <DataTableToolbar table={table}>
        <div className='flex items-center gap-2'>
          {onReload && (
            <Button
              variant='outline'
              size='sm'
              onClick={onReload}
              className='h-8'
            >
              Reload
            </Button>
          )}
          <Button
            size='sm'
            onClick={() => router.push('/dashboard/config-level/new')}
            className='h-8'
          >
            <Plus className='mr-2 h-4 w-4' /> Add New
          </Button>
        </div>
      </DataTableToolbar>
      <DataTable table={table} />
    </div>
  );
}
