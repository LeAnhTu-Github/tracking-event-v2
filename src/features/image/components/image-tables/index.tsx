'use client';

import { ColumnDef } from '@tanstack/react-table';
import { useDataTable } from '@/hooks/use-data-table';
import { DataTable } from '@/components/ui/table/data-table';
import { DataTableToolbar } from '@/components/ui/table/data-table-toolbar';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

interface ImageTableParams<TData, TValue> {
  data: TData[];
  totalItems: number;
  columns: ColumnDef<TData, TValue>[];
  isLoading: boolean;
  pageIndex: number;
  pageSize: number;
  onReload?: () => void;
}

export function ImageTable<TData, TValue>({
  data,
  totalItems,
  columns,
  isLoading,
  pageIndex,
  pageSize,
  onReload
}: ImageTableParams<TData, TValue>) {
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
      }
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
      </DataTableToolbar>
      <DataTable table={table} />
    </div>
  );
}
