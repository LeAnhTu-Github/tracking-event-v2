'use client';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { AlertTriangle } from 'lucide-react';

interface AlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  loading: boolean;
  title?: string;
  description?: React.ReactNode;
}

export const AlertModal: React.FC<AlertModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  loading,
  title,
  description
}) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title || 'Confirm Action'}
      description=''
    >
      <div className='flex flex-col gap-4 py-2'>
        <div className='flex items-start gap-4'>
          <div className='flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-500'>
            <AlertTriangle className='h-6 w-6' />
          </div>
          <div className='flex-1 space-y-2'>{description}</div>
        </div>
        <div className='flex w-full items-center justify-end space-x-3 pt-4'>
          <Button
            disabled={loading}
            variant='outline'
            onClick={onClose}
            className='h-10 px-6'
          >
            Cancel
          </Button>
          <Button
            disabled={loading}
            variant='destructive'
            onClick={onConfirm}
            className='h-10 px-6'
          >
            {loading ? 'Processing...' : 'Delete'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
