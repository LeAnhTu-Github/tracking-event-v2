'use client';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

interface ModalProps {
  title: string;
  description: React.ReactNode;
  isOpen: boolean;
  onClose: () => void;
  children?: React.ReactNode;
  className?: string;
}

export const Modal: React.FC<ModalProps> = ({
  title,
  description,
  isOpen,
  onClose,
  children,
  className
}) => {
  const onChange = (open: boolean) => {
    if (!open) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onChange}>
      <DialogContent className={cn('flex max-h-[90vh] flex-col', className)}>
        <DialogHeader className='shrink-0'>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className='min-h-0 flex-1 overflow-x-hidden overflow-y-auto'>
          {children}
        </div>
      </DialogContent>
    </Dialog>
  );
};
