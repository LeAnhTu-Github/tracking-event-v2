'use client';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { LevelReward } from '../../types';
import { Edit, MoreHorizontal, Trash, Eye } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { AlertModal } from '@/components/modal/alert-modal';
import { useDeleteLevelReward } from '../../hooks/use-level-rewards';

interface CellActionProps {
  data: LevelReward;
}

export const CellAction: React.FC<CellActionProps> = ({ data }) => {
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const deleteMutation = useDeleteLevelReward();

  const onEdit = () => {
    router.push(`/dashboard/config-level-reward/${data.id}`);
  };

  const onView = () => {
    router.push(`/dashboard/config-level-reward/${data.id}`);
  };

  const onDelete = async () => {
    try {
      setLoading(true);
      await deleteMutation.mutateAsync(data.id);
      setOpen(false);
    } catch (error: any) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <AlertModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onConfirm={onDelete}
        loading={loading}
        title='Confirm Delete'
        description={
          <div className='space-y-1'>
            <p className='text-foreground text-lg font-medium'>
              Are you sure you want to delete{' '}
              <span className='text-destructive font-bold'>{data.name}</span>?
            </p>
            <p className='text-muted-foreground text-sm'>
              This action cannot be undone.
            </p>
          </div>
        }
      />
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button variant='ghost' className='h-8 w-8 p-0'>
            <span className='sr-only'>Open menu</span>
            <MoreHorizontal className='h-4 w-4' />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end'>
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem onClick={onView}>
            <Eye className='mr-2 h-4 w-4' /> View Detail
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onEdit}>
            <Edit className='mr-2 h-4 w-4' /> Edit
          </DropdownMenuItem>
          <DropdownMenuItem
            className='text-destructive focus:text-destructive'
            disabled={loading}
            onClick={() => setOpen(true)}
          >
            <Trash className='mr-2 h-4 w-4' />{' '}
            {loading ? 'Deleting...' : 'Delete'}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};
