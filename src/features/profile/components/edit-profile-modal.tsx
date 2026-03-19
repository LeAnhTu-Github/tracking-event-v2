'use client';

import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { User, Group } from '@/types/user.type';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { FormInput } from '@/components/forms/form-input';
import { FormSelect, type FormOption } from '@/components/forms/form-select';
import { MultiSelect } from '@/components/ui/multi-select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import userService from '@/services/user.service';
import groupService from '@/services/group.service';
import fileService from '@/services/file.service';
import { useAuthStore } from '@/store/useAuth';
import { toast } from 'sonner';

const formSchema = z.object({
  fullName: z
    .string()
    .min(1, 'Full name is required')
    .max(100, 'Full name must be less than 100 characters'),
  phone: z.string().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE']),
  groupIds: z.array(z.number()).min(1, 'At least one group must be selected')
});

type FormValues = z.infer<typeof formSchema>;

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  isOpen,
  onClose,
  user
}) => {
  const { setUser } = useAuthStore();
  const [groups, setGroups] = useState<Group[]>([]);
  const [avatar, setAvatar] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: '',
      phone: '',
      status: 'ACTIVE',
      groupIds: []
    }
  });

  const fetchGroups = async () => {
    try {
      const res = await groupService.getGroups();
      setGroups(res);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchGroups();
      if (user) {
        form.reset({
          fullName: user.fullName,
          phone: user.phone || '',
          status: (user.status as 'ACTIVE' | 'INACTIVE') ?? 'ACTIVE',
          groupIds: user.groups?.map((g) => g.id) || []
        });
        setAvatar(user.avatar || '');
      }
    }
  }, [isOpen, user, form]);

  const handleAvatarClick = () => {
    if (inputRef.current) {
      inputRef.current.click();
    }
  };

  const handleUploadFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = e.target.files?.[0];
      if (!file) return;

      if (!file.type.startsWith('image/')) {
        setUploadError('Please select image file');
        return;
      }

      setIsUploading(true);
      setUploadError('');

      const formData = new FormData();
      formData.append('file', file);
      const res = await fileService.uploadFile(formData);
      setAvatar(res.fileUrl);
      toast.success('Avatar uploaded successfully');
    } catch (error: any) {
      setUploadError(
        error.message || 'An error occurred while uploading the image.'
      );
      toast.error('Failed to upload avatar');
    } finally {
      setIsUploading(false);
    }
  };

  const onSubmit = async (values: FormValues) => {
    if (!user) return;

    setIsSubmitting(true);
    try {
      const body = {
        id: user.id,
        avatar,
        phone: values.phone || '',
        status: values.status,
        fullName: values.fullName,
        groupIds: values.groupIds
      };

      await userService.updateUser(body);

      const updatedUser = await userService.getUserById(user.id);
      setUser(updatedUser);

      toast.success('Profile updated successfully');
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  const statusOptions: FormOption[] = [
    { value: 'ACTIVE', label: 'Active' },
    { value: 'INACTIVE', label: 'Inactive' }
  ];

  const groupOptions = groups.map((group) => ({
    label: group.groupName,
    value: group.id.toString()
  }));

  const getInitials = (name: string | undefined) => {
    if (!name) return 'CN';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title='Edit Profile'
      description='Update your profile information'
    >
      <Form form={form} onSubmit={form.handleSubmit(onSubmit)}>
        <div className='space-y-6 py-4'>
          <div className='flex flex-col items-center justify-center space-y-4'>
            <Avatar
              onClick={handleAvatarClick}
              className='relative h-24 w-24 cursor-pointer md:h-32 md:w-32'
            >
              <AvatarImage
                src={avatar}
                alt={user?.fullName || 'Avatar'}
                className={isUploading ? 'opacity-50' : ''}
              />
              <AvatarFallback>{getInitials(user?.fullName)}</AvatarFallback>
              {isUploading && (
                <div className='absolute inset-0 flex items-center justify-center rounded-full bg-black/10'>
                  <div className='border-primary h-8 w-8 animate-spin rounded-full border-4 border-t-transparent'></div>
                </div>
              )}
            </Avatar>
            <div className='flex w-full max-w-[200px] flex-col items-center gap-2'>
              <Input
                ref={inputRef}
                type='file'
                accept='image/*'
                onChange={handleUploadFile}
                disabled={isUploading}
                className={uploadError ? 'border-red-500' : 'hidden'}
              />
              <Button
                type='button'
                variant='outline'
                size='sm'
                onClick={handleAvatarClick}
                disabled={isUploading}
                className='w-full'
              >
                {isUploading ? 'Uploading...' : 'Change Avatar'}
              </Button>
            </div>
          </div>

          <div className='space-y-4'>
            <FormInput
              control={form.control}
              name='fullName'
              label='Full Name'
              placeholder='Enter your full name'
              required
            />

            <FormInput
              control={form.control}
              name='phone'
              label='Phone Number'
              placeholder='Enter your phone number'
              type='tel'
            />

            <FormSelect
              control={form.control}
              name='status'
              label='Status'
              options={statusOptions}
              placeholder='Select status'
              required
              className='w-full'
            />

            <div className='space-y-2'>
              <Label className='font-semibold'>
                Groups <span className='ml-1 text-red-500'>*</span>
              </Label>
              <MultiSelect
                options={groupOptions}
                onValueChange={(values) => {
                  form.setValue(
                    'groupIds',
                    values.map((v) => Number(v)),
                    { shouldValidate: true }
                  );
                }}
                value={form.watch('groupIds').map((id) => id.toString())}
                placeholder='Select user groups'
                variant='inverted'
                animation={2}
                maxCount={3}
              />
              {form.formState.errors.groupIds && (
                <p className='text-destructive text-sm'>
                  {form.formState.errors.groupIds.message}
                </p>
              )}
            </div>
          </div>

          <div className='flex justify-end gap-2 pt-4'>
            <Button
              type='button'
              variant='outline'
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type='submit' disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </Form>
    </Modal>
  );
};
