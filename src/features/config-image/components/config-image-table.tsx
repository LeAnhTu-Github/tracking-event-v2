'use client';

import { ColumnDef } from '@tanstack/react-table';
import { useDataTable } from '@/hooks/use-data-table';
import { DataTable } from '@/components/ui/table/data-table';
import { DataTableToolbar } from '@/components/ui/table/data-table-toolbar';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';

interface ConfigImageTableProps<TData, TValue> {
  data: TData[];
  totalItems: number;
  columns: ColumnDef<TData, TValue>[];
  isLoading: boolean;
  pageIndex: number;
  pageSize: number;
  onReload?: () => void;
  // New props for client-side filtering
  gameId?: string;
  onGameIdChange?: (value: string) => void;
  gameOptions?: { value: string; label: string }[];
  type?: string;
  onTypeChange?: (value: string) => void;
  typeOptions?: { value: string; label: string }[];
}

export function ConfigImageTable<TData, TValue>({
  data,
  totalItems,
  columns,
  isLoading,
  pageIndex,
  pageSize,
  onReload,
  gameId,
  onGameIdChange,
  gameOptions = [],
  type,
  onTypeChange,
  typeOptions = []
}: ConfigImageTableProps<TData, TValue>) {
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
        <div className='flex items-center gap-2'>
          {onTypeChange && (
            <Select value={type || 'all'} onValueChange={onTypeChange}>
              <SelectTrigger className='h-8 w-[150px]'>
                <SelectValue placeholder='Select Type' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>All Types</SelectItem>
                {typeOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          {onGameIdChange && (
            <Select value={gameId || 'all'} onValueChange={onGameIdChange}>
              <SelectTrigger className='h-8 w-[180px]'>
                <SelectValue placeholder='Select Game' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>All Games</SelectItem>
                {gameOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
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
        </div>
      </DataTableToolbar>
      <DataTable table={table} />
    </div>
  );
}
