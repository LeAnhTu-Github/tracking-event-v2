'use client';
import { AlertModal } from '@/components/modal/alert-modal';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import userService from '@/services/user.service';
import { User } from '@/types/user.type';

import {
  IconEdit,
  IconDotsVertical,
  IconTrash,
  IconLock,
  IconInfoCircle
} from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

interface CellActionProps {
  data: User;
  fetchUsers: () => Promise<void>;
}

export const CellAction: React.FC<CellActionProps> = ({ data, fetchUsers }) => {
  const router = useRouter();
  const [modalState, setModalState] = useState<{
    loading: boolean;
    type: 'delete' | 'reset-password' | null;
  }>({
    loading: false,
    type: null
  });

  const onResetPassword = async () => {
    setModalState((prev) => ({ ...prev, loading: true }));
    try {
      await userService.resetPassword(data.id);
      await fetchUsers();
      toast.success('Reset password success');
    } catch (error) {
      toast.error('Reset password failed');
    } finally {
      setModalState({ loading: false, type: null });
    }
  };

  const onDeleteUser = async () => {
    setModalState((prev) => ({ ...prev, loading: true }));
    try {
      await userService.deleteUser(data.id);
      await fetchUsers();
      toast.success('Delete user success');
    } catch (error) {
      toast.error('Delete user failed');
    } finally {
      setModalState({ loading: false, type: null });
    }
  };

  const handleAction = (type: 'delete' | 'reset-password') => {
    setModalState((prev) => ({ ...prev, type }));
  };

  const onClose = () => setModalState((prev) => ({ ...prev, type: null }));

  return (
    <>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button variant='ghost' className='h-8 w-8 p-0'>
            <span className='sr-only'>Open menu</span>
            <IconDotsVertical className='h-4 w-4' />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end'>
          <DropdownMenuLabel>Actions</DropdownMenuLabel>

          {/* Reset Password */}
          <DropdownMenuItem onClick={() => handleAction('reset-password')}>
            <IconLock className='mr-2 h-4 w-4' /> Reset Password
          </DropdownMenuItem>

          {/* Detail */}
          <DropdownMenuItem
            onClick={() =>
              router.push(`/dashboard/system/users/detail/${data.id}`)
            }
          >
            <IconInfoCircle className='mr-2 h-4 w-4' /> Detail
          </DropdownMenuItem>

          {/* Update */}
          <DropdownMenuItem
            onClick={() =>
              router.push(`/dashboard/system/users/update/${data.id}`)
            }
          >
            <IconEdit className='mr-2 h-4 w-4' /> Update
          </DropdownMenuItem>

          {/* Delete */}
          <DropdownMenuItem onClick={() => handleAction('delete')}>
            <IconTrash className='mr-2 h-4 w-4' /> Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertModal
        onClose={onClose}
        loading={modalState.loading}
        onConfirm={
          modalState.type === 'reset-password' ? onResetPassword : onDeleteUser
        }
        isOpen={Boolean(modalState.type)}
        title={
          modalState.type === 'reset-password'
            ? 'Reset Password'
            : 'Confirm Delete'
        }
        description={
          modalState.type === 'reset-password' ? (
            <div className='space-y-1'>
              <p className='text-foreground text-lg font-medium'>
                Are you sure you want to reset password for{' '}
                <span className='text-destructive font-bold'>
                  {data.fullName}
                </span>
                ?
              </p>
              <p className='text-muted-foreground text-sm'>
                The password will be reset to &apos;123@123a&apos;.
              </p>
            </div>
          ) : (
            <div className='space-y-1'>
              <p className='text-foreground text-lg font-medium'>
                Are you sure you want to delete{' '}
                <span className='text-destructive font-bold'>
                  {data.fullName}
                </span>
                ?
              </p>
              <p className='text-muted-foreground text-sm'>
                This action cannot be undone.
              </p>
            </div>
          )
        }
      />
    </>
  );
};
