import NextImage from 'next/image';
import { Package } from '../../types';
import { CellAction } from './cell-action';
import { Badge } from '@/components/ui/badge';
import { ColumnDef } from '@tanstack/react-table';
import { DataTableColumnHeader } from '@/components/ui/table/data-table-column-header';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip';
import { Tag, Package as PackageIcon, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

export const columns = (
  pageIndex: number,
  pageSize: number,
  gameOptions: { value: string; label: string }[] = []
): ColumnDef<Package>[] => [
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
      <div className='text-muted-foreground flex justify-center font-mono text-[10px]'>
        {cell.getValue<number>()}
      </div>
    ),
    enableSorting: false,
    size: 60
  },
  {
    id: 'info',
    accessorKey: 'name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Package Info' />
    ),
    cell: ({ row }) => {
      const url = row.original.urlImage;
      return (
        <div className='flex items-center gap-3'>
          <div className='bg-muted relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border shadow-sm'>
            {url ? (
              <NextImage
                src={url}
                alt='Package'
                fill
                className='object-cover'
                unoptimized
              />
            ) : (
              <div className='bg-muted text-muted-foreground flex h-full w-full items-center justify-center text-[10px]'>
                <PackageIcon className='h-5 w-5 opacity-20' />
              </div>
            )}
          </div>
          <div className='flex min-w-0 flex-col'>
            <span className='truncate text-sm leading-tight font-bold'>
              {row.original.name}
            </span>
            <div className='mt-0.5 flex items-center gap-1.5'>
              <Badge
                variant='outline'
                className='bg-muted/50 h-4 px-1 font-mono text-[9px] leading-none'
              >
                {row.original.packageCode}
              </Badge>
              {row.original.description && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className='text-muted-foreground hover:text-primary h-3 w-3 cursor-help' />
                    </TooltipTrigger>
                    <TooltipContent side='bottom' className='max-w-xs'>
                      <p className='text-xs'>{row.original.description}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
          </div>
        </div>
      );
    },
    enableColumnFilter: true,
    meta: {
      label: 'Name',
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
    id: 'packageType',
    accessorKey: 'packageType',
    header: ({ column }) => (
      <div className='flex justify-center'>
        <DataTableColumnHeader column={column} title='Package Type' />
      </div>
    ),
    cell: ({ cell }) => {
      const type = cell.getValue<string>();
      return (
        <div className='flex justify-center'>
          <Badge
            variant='outline'
            className={cn(
              'h-5 px-1.5 text-[9px] font-bold tracking-wider uppercase',
              type === 'COMBO'
                ? 'border-primary text-primary bg-primary/5'
                : 'text-muted-foreground'
            )}
          >
            {type}
          </Badge>
        </div>
      );
    },
    enableColumnFilter: true,
    meta: {
      label: 'Type',
      variant: 'select',
      options: [
        { label: 'COMBO', value: 'COMBO' },
        { label: 'SINGLE', value: 'SINGLE' },
        { label: 'ADS', value: 'ADS' },
        { label: 'FREE', value: 'FREE' },
        { label: 'BUNDLE', value: 'BUNDLE' },
        { label: 'PROP', value: 'PROP' },
        { label: 'RESOURCE_COIN', value: 'RESOURCE_COIN' },
        { label: 'RESOURCE_GEM', value: 'RESOURCE_GEM' }
      ],
      placeholder: 'Filter by Type'
    }
  },
  {
    id: 'items',
    header: () => <div className='text-center'>Items</div>,
    cell: ({ row }) => {
      const items = row.original.items || [];
      if (items.length === 0)
        return <div className='text-muted-foreground text-center'>-</div>;

      const displayItems = items.slice(0, 3);
      const remaining = items.length - 3;

      return (
        <div className='flex justify-center'>
          <div className='flex -space-x-2'>
            <TooltipProvider>
              {displayItems.map((item, idx) => (
                <Tooltip key={idx}>
                  <TooltipTrigger asChild>
                    <div className='border-background bg-muted ring-border relative h-8 w-8 overflow-hidden rounded-full border-2 shadow-sm ring-1 transition-transform hover:z-20 hover:scale-110'>
                      {item.urlIcon ? (
                        <NextImage
                          src={item.urlIcon}
                          alt={item.name}
                          fill
                          className='object-cover'
                          unoptimized
                        />
                      ) : (
                        <div className='flex h-full w-full items-center justify-center text-[10px] font-bold'>
                          {item.quantity}
                        </div>
                      )}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent
                    side='top'
                    className='bg-popover text-popover-foreground border shadow-lg'
                  >
                    <div className='flex items-center gap-2 py-1'>
                      {item.urlIcon && (
                        <div className='bg-muted relative h-6 w-6 overflow-hidden rounded border'>
                          <NextImage
                            src={item.urlIcon}
                            alt=''
                            fill
                            className='object-cover'
                            unoptimized
                          />
                        </div>
                      )}
                      <div className='flex flex-col'>
                        <span className='text-xs leading-none font-bold'>
                          {item.name}
                        </span>
                        <span className='text-muted-foreground text-[10px]'>
                          Qty: {item.quantity}
                        </span>
                      </div>
                    </div>
                  </TooltipContent>
                </Tooltip>
              ))}
            </TooltipProvider>
            {remaining > 0 && (
              <div className='border-background bg-muted text-muted-foreground ring-border flex h-8 w-8 items-center justify-center rounded-full border-2 text-[10px] font-bold ring-1'>
                +{remaining}
              </div>
            )}
          </div>
        </div>
      );
    }
  },
  {
    id: 'pricing',
    header: () => <div className='text-center'>Pricing</div>,
    cell: ({ row }) => {
      const vendors = row.original.purchaseOptions?.paymentVendor || [];
      if (vendors.length === 0)
        return <div className='text-muted-foreground text-center'>-</div>;

      return (
        <div className='flex flex-col items-center gap-1'>
          {vendors.map((vendor, idx) => (
            <div
              key={idx}
              className='flex w-full items-center justify-center gap-1.5'
            >
              {vendor.currency && vendor.amount !== undefined ? (
                <Badge
                  variant='default'
                  className='h-5 bg-blue-600 px-1.5 text-[10px] font-black shadow-sm'
                >
                  {vendor.amount?.toLocaleString()} {vendor.currency || 'USD'}
                </Badge>
              ) : (
                <div className='bg-muted/60 border-border/50 hover:bg-muted flex items-center gap-1 rounded border px-1.5 py-0.5 transition-colors'>
                  <span className='text-muted-foreground font-mono text-[9px] leading-none uppercase'>
                    {vendor.paymentType}
                  </span>
                  {vendor.amount !== undefined && (
                    <span className='text-[10px] leading-none font-bold'>
                      {vendor.amount}
                    </span>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      );
    }
  },
  {
    id: 'discount',
    header: () => <div className='text-center'>Discount</div>,
    cell: ({ row }) => {
      const discount = row.original.discount;
      if (!discount)
        return <div className='text-muted-foreground text-center'>-</div>;
      const active = discount.active ?? discount.isActive;

      return (
        <div className='flex flex-col items-center gap-1'>
          <div
            className={cn(
              'flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-black shadow-xs',
              active
                ? 'border-orange-500/20 bg-orange-500/10 text-orange-600'
                : 'bg-muted text-muted-foreground opacity-50'
            )}
          >
            <Tag className='h-3 w-3' />
            {discount.percent}% OFF
          </div>
          {discount.condition && discount.condition !== 'NONE' && (
            <span className='text-muted-foreground text-[9px] leading-tight font-bold tracking-wider uppercase'>
              {discount.condition.replace('_', ' ')}
            </span>
          )}
        </div>
      );
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
