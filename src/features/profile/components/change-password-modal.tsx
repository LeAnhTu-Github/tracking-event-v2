'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { FormInput } from '@/components/forms/form-input';
import userService from '@/services/user.service';
import { toast } from 'sonner';

const formSchema = z
  .object({
    oldPassword: z.string().min(1, 'Old password is required'),
    newPassword: z
      .string()
      .min(6, 'Password must be at least 6 characters')
      .max(50, 'Password must not exceed 50 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your password')
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword']
  });

type FormValues = z.infer<typeof formSchema>;

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({
  isOpen,
  onClose
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      oldPassword: '',
      newPassword: '',
      confirmPassword: ''
    }
  });

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    try {
      await userService.changePassword({
        oldPassword: values.oldPassword,
        newPassword: values.newPassword
      });

      toast.success('Password changed successfully');
      form.reset();
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Failed to change password');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      form.reset();
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title='Change Password'
      description='Update your account password'
    >
      <Form form={form} onSubmit={form.handleSubmit(onSubmit)}>
        <div className='space-y-4 py-4'>
          <FormInput
            control={form.control}
            name='oldPassword'
            label='Old Password'
            placeholder='Enter your current password'
            type='password'
            required
          />

          <FormInput
            control={form.control}
            name='newPassword'
            label='New Password'
            placeholder='Enter your new password'
            type='password'
            required
          />

          <FormInput
            control={form.control}
            name='confirmPassword'
            label='Confirm New Password'
            placeholder='Confirm your new password'
            type='password'
            required
          />

          <div className='flex justify-end gap-2 pt-4'>
            <Button
              type='button'
              variant='outline'
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type='submit' disabled={isSubmitting}>
              {isSubmitting ? 'Changing...' : 'Change Password'}
            </Button>
          </div>
        </div>
      </Form>
    </Modal>
  );
};
