import * as React from 'react';
import { ChevronsLeft, ChevronsRight } from 'lucide-react';
import { ChevronLeftIcon, ChevronRightIcon } from '@radix-ui/react-icons';

import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

export type SimpleTablePaginationProps = React.ComponentProps<'div'> & {
  page: number;
  totalPages: number;
  totalRecords: number;
  pageSize: number;
  pageSizeOptions?: readonly number[];
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
};

export default function SimpleTablePagination({
  page,
  totalPages,
  totalRecords,
  pageSize,
  pageSizeOptions = [10, 20, 30, 40, 50],
  onPageChange,
  onPageSizeChange,
  className,
  ...props
}: SimpleTablePaginationProps) {
  const safeTotalPages = Math.max(1, Number.isFinite(totalPages) ? totalPages : 1);
  const safePage = Math.min(safeTotalPages, Math.max(1, Number.isFinite(page) ? page : 1));
  const canPreviousPage = safePage > 1;
  const canNextPage = safePage < safeTotalPages;
  return (
    <div
      className={cn(
        'flex w-full flex-col items-stretch justify-between gap-2 overflow-auto p-1 sm:flex-row sm:items-center sm:gap-8',
        className
      )}
      {...props}
    >
      <div className='text-muted-foreground hidden flex-1 text-sm whitespace-nowrap sm:block'>
        {totalRecords.toLocaleString()} row(s) total.
      </div>
      <div className='flex w-full items-center justify-between gap-2 sm:w-auto sm:justify-end sm:gap-6 lg:gap-8'>
        <div className='flex items-center gap-2'>
          <p className='hidden text-sm font-medium whitespace-nowrap sm:block'>Rows per page</p>
          <Select
            value={`${pageSize}`}
            onValueChange={(value) => onPageSizeChange(Number(value))}
          >
            <SelectTrigger
              className='h-7 w-16 data-size:h-7 sm:h-8 sm:w-18 sm:data-size:h-8 [&>svg]:hidden'
              size='sm'
            >
              <SelectValue placeholder={pageSize} />
            </SelectTrigger>
            <SelectContent side='top'>
              {pageSizeOptions.map((size) => (
                <SelectItem key={size} value={`${size}`}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className='flex items-center justify-center text-xs font-semibold sm:text-sm sm:font-medium'>
          Page {safePage} of {safeTotalPages}
          <span className='text-muted-foreground ml-2 inline sm:hidden'>
            · {totalRecords.toLocaleString()}
          </span>
        </div>
        <div className='flex items-center gap-1 sm:gap-2'>
          <Button
            aria-label='Go to first page'
            variant='outline'
            size='icon'
            className='hidden size-8 lg:flex'
            onClick={() => onPageChange(1)}
            disabled={!canPreviousPage}
          >
            <ChevronsLeft />
          </Button>
          <Button
            aria-label='Go to previous page'
            variant='outline'
            size='icon'
            className='size-7 sm:size-8'
            onClick={() => onPageChange(safePage - 1)}
            disabled={!canPreviousPage}
          >
            <ChevronLeftIcon />
          </Button>
          <Button
            aria-label='Go to next page'
            variant='outline'
            size='icon'
            className='size-7 sm:size-8'
            onClick={() => onPageChange(safePage + 1)}
            disabled={!canNextPage}
          >
            <ChevronRightIcon />
          </Button>
          <Button
            aria-label='Go to last page'
            variant='outline'
            size='icon'
            className='hidden size-8 lg:flex'
            onClick={() => onPageChange(safeTotalPages)}
            disabled={!canNextPage}
          >
            <ChevronsRight />
          </Button>
        </div>
      </div>
    </div>
  );
}

