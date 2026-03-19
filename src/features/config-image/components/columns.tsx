'use client';

import { ConfigImage, ConfigActionGroup } from '@/types/config-image.type';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DataTableColumnHeader } from '@/components/ui/table/data-table-column-header';
import { Column, ColumnDef } from '@tanstack/react-table';
import { useRouter } from 'next/navigation';
import { Pencil, Trash2, Loader2 } from 'lucide-react';
import { useDeleteConfigImage } from '../hooks/use-config-image-mutation';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from '@/components/ui/alert-dialog';

function EditButton({ id }: { id: number }) {
  const router = useRouter();
  return (
    <Button
      variant='ghost'
      size='icon'
      className='h-8 w-8 text-blue-600 hover:bg-blue-50 hover:text-blue-700'
      onClick={() => router.push(`/dashboard/config-image/${id}/edit`)}
    >
      <Pencil className='h-4 w-4' />
    </Button>
  );
}

function DeleteButton({ id }: { id: number }) {
  const { mutate: deleteConfig, isPending } = useDeleteConfigImage();

  const handleDelete = () => {
    deleteConfig(id);
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant='ghost'
          size='icon'
          className='text-destructive hover:text-destructive hover:bg-destructive/10 h-8 w-8'
          disabled={isPending}
        >
          {isPending ? (
            <Loader2 className='h-4 w-4 animate-spin' />
          ) : (
            <Trash2 className='h-4 w-4' />
          )}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the
            configuration.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export const columns = (
  pageIndex: number,
  pageSize: number,
  gameOptions: { value: string; label: string }[] = [],
  typeOptions: { value: string; label: string }[] = []
): ColumnDef<ConfigActionGroup>[] => [
  {
    accessorKey: 'No',
    header: () => <div className='text-center'>No.</div>,
    cell: ({ row }: { row: any }) => (
      <div className='text-center'>
        {row.index + 1 + (Number(pageIndex) - 1) * Number(pageSize)}
      </div>
    ),
    size: 60
  },
  {
    accessorKey: 'type',
    header: ({ column }: { column: Column<ConfigActionGroup, unknown> }) => (
      <div className='flex justify-center'>
        <DataTableColumnHeader column={column} title='Type' />
      </div>
    ),
    cell: ({ row }: { row: any }) => {
      const type = row.original.type || 'INDIVIDUAL';
      return (
        <div className='flex justify-center'>
          <Badge variant={type === 'GENERAL' ? 'default' : 'secondary'}>
            {type}
          </Badge>
        </div>
      );
    },
    meta: {
      label: 'Type',
      variant: 'select',
      options: typeOptions,
      placeholder: 'Search type...'
    }
  },
  {
    accessorKey: 'name',
    header: ({ column }: { column: Column<ConfigActionGroup, unknown> }) => (
      <DataTableColumnHeader column={column} title='Name' />
    ),
    cell: ({ row }: { row: any }) => (
      <div className='font-medium'>{row.original.name}</div>
    )
  },
  {
    accessorKey: 'gameId',
    header: ({ column }: { column: Column<ConfigActionGroup, unknown> }) => (
      <div className='flex justify-center'>
        <DataTableColumnHeader column={column} title='Game' />
      </div>
    ),
    cell: ({ row }: { row: any }) => (
      <div className='flex justify-center'>
        <Badge variant='outline'>{row.original.gameId}</Badge>
      </div>
    ),
    meta: {
      label: 'Game',
      variant: 'select',
      options: gameOptions,
      placeholder: 'Search game...'
    }
  },
  {
    id: 'play',
    header: () => <div className='text-center'>Play</div>,
    cell: ({ row }: { row: any }) => {
      const playAction = row.original.action.actionConfig.actions.find(
        (a: any) => a.type === 'PLAY'
      );
      if (!playAction)
        return <div className='text-muted-foreground text-center'>—</div>;
      const paymentTypes = Array.from(
        new Set(playAction.paymentVendor.map((pv: any) => pv.paymentType))
      );
      return (
        <div className='flex flex-wrap justify-center gap-1'>
          {paymentTypes.map((pt: any) => (
            <Badge key={String(pt)} variant='outline' className='py-0 text-xs'>
              {String(pt)}
            </Badge>
          ))}
        </div>
      );
    }
  },
  {
    id: 'download',
    header: () => <div className='text-center'>Download</div>,
    cell: ({ row }: { row: any }) => {
      const downloadAction = row.original.action.actionConfig.actions.find(
        (a: any) => a.type === 'DOWNLOAD'
      );
      if (!downloadAction)
        return <div className='text-muted-foreground text-center'>—</div>;
      const paymentTypes = Array.from(
        new Set(downloadAction.paymentVendor.map((pv: any) => pv.paymentType))
      );
      return (
        <div className='flex flex-wrap justify-center gap-1'>
          {paymentTypes.map((pt: any) => (
            <Badge key={String(pt)} variant='outline' className='py-0 text-xs'>
              {String(pt)}
            </Badge>
          ))}
        </div>
      );
    }
  },
  {
    id: 'actions',
    header: () => <div className='text-center'>Actions</div>,
    cell: ({ row }: { row: any }) => (
      <div className='flex justify-center gap-2'>
        <EditButton id={row.original.id} />
        <DeleteButton id={row.original.id} />
      </div>
    ),
    size: 100
  }
];
