'use client';

import { useEffect, useRef, useState } from 'react';
import { Group } from '@/types/user.type';
import userService from '@/services/user.service';
import groupService from '@/services/group.service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { toast } from 'sonner';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Heading } from '@/components/ui/heading';
import { MultiSelect } from '@/components/ui/multi-select';
import fileService from '@/services/file.service';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useRouter } from 'next/navigation';
import PageContainer from '@/components/layout/page-container';

const formSchema = z.object({
  username: z
    .string()
    .min(1, 'Username is required')
    .max(50, 'Username must be less than 50 characters')
    .regex(
      /^[a-zA-Z0-9_]+$/,
      'Username can only contain letters, numbers and underscore'
    ),
  fullName: z
    .string()
    .min(1, 'Full name is required')
    .max(100, 'Full name must be less than 100 characters'),
  phone: z.string().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE']),
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters')
    .max(50, 'Password must not exceed 50 characters'),
  groups: z.array(z.number()).min(1, 'At least one group must be selected')
});

type FormValues = z.infer<typeof formSchema>;

export default function PageCreateUser() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [avatar, setAvatar] = useState<string>('');

  const router = useRouter();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: '',
      fullName: '',
      phone: '',
      password: '',
      status: 'ACTIVE',
      groups: []
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
    fetchGroups();
  }, []);

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
    } catch (error) {
      setUploadError('An error occurred while uploading the image.');
    } finally {
      setIsUploading(false);
    }
  };

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    try {
      const body = {
        avatar,
        username: values.username,
        password: values.password,
        phone: values.phone,
        status: values.status,
        fullName: values.fullName,
        groupIds: values.groups
      };
      await userService.createUser(body);
      toast.success('Create user successfully');
      form.reset();
      router.push('/dashboard/system/users');
    } catch (error: any) {
      toast.error(error.message || 'Failed to create user. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputRef = useRef<HTMLInputElement | null>(null);
  const handleAvatarClick = () => {
    if (inputRef.current) {
      inputRef.current.click();
    }
  };

  return (
    <PageContainer>
      <div className='w-full space-y-4'>
        <Heading title='Users' description='Create new user' />
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <Card>
            <CardHeader className='hidden md:block'>
              <CardTitle>Create new user</CardTitle>
            </CardHeader>
            <CardContent className='grid space-y-6 md:grid-cols-3'>
              <div className='flex flex-col items-center justify-center space-y-4'>
                <Avatar
                  onClick={handleAvatarClick}
                  className='relative h-36 w-36 cursor-pointer md:h-44 md:w-44'
                >
                  <AvatarImage
                    src={avatar}
                    className={isUploading ? 'opacity-50' : ''}
                  />
                  <AvatarFallback>{'No file'}</AvatarFallback>
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
                    className={uploadError ? 'border-red-500' : ''}
                  />
                  {uploadError && (
                    <p className='text-center text-sm text-red-500'>
                      {uploadError}
                    </p>
                  )}
                </div>
              </div>
              <div className='space-y-6 md:col-span-2'>
                <div className='grid gap-4'>
                  <div className='grid gap-2'>
                    <Label htmlFor='username' className='font-semibold'>
                      Username
                    </Label>
                    <Input
                      id='username'
                      {...form.register('username')}
                      className={
                        form.formState.errors.username ? 'border-red-500' : ''
                      }
                    />
                    {form.formState.errors.username && (
                      <p className='text-sm text-red-500'>
                        {form.formState.errors.username.message}
                      </p>
                    )}
                  </div>

                  <div className='grid gap-2'>
                    <Label htmlFor='fullName' className='font-semibold'>
                      Full Name
                    </Label>
                    <Input
                      id='fullName'
                      {...form.register('fullName')}
                      className={
                        form.formState.errors.fullName ? 'border-red-500' : ''
                      }
                    />
                    {form.formState.errors.fullName && (
                      <p className='text-sm text-red-500'>
                        {form.formState.errors.fullName.message}
                      </p>
                    )}
                  </div>

                  <div className='grid gap-2'>
                    <Label htmlFor='password' className='font-semibold'>
                      Password
                    </Label>
                    <Input
                      id='password'
                      type='password'
                      {...form.register('password')}
                      className={
                        form.formState.errors.password ? 'border-red-500' : ''
                      }
                    />
                    {form.formState.errors.password && (
                      <p className='text-sm text-red-500'>
                        {form.formState.errors.password.message}
                      </p>
                    )}
                  </div>

                  <div className='grid gap-2'>
                    <Label htmlFor='phone' className='font-semibold'>
                      Phone Number
                    </Label>
                    <Input
                      id='phone'
                      {...form.register('phone')}
                      className={
                        form.formState.errors.phone ? 'border-red-500' : ''
                      }
                    />
                    {form.formState.errors.phone && (
                      <p className='text-sm text-red-500'>
                        {form.formState.errors.phone.message}
                      </p>
                    )}
                  </div>

                  <div className='grid grid-cols-2 gap-4'>
                    <div className='grid w-full gap-2'>
                      <Label className='font-semibold'>Status</Label>
                      <Select
                        value={form.watch('status')}
                        onValueChange={(value) =>
                          form.setValue(
                            'status',
                            value as 'ACTIVE' | 'INACTIVE'
                          )
                        }
                      >
                        <SelectTrigger className='w-full'>
                          <SelectValue placeholder='Select status' />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value='ACTIVE'>Active</SelectItem>
                          <SelectItem value='INACTIVE'>Inactive</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className='grid gap-2'>
                      <Label className='font-semibold'>User group</Label>
                      <MultiSelect
                        options={groups.map((group) => ({
                          label: group.groupName,
                          value: group.id.toString()
                        }))}
                        onValueChange={(values) => {
                          form.setValue(
                            'groups',
                            values.map((v) => Number(v))
                          );
                        }}
                        placeholder='Select user group'
                        variant='inverted'
                        animation={2}
                        maxCount={3}
                      />
                      {form.formState.errors.groups && (
                        <p className='text-sm text-red-500'>
                          {form.formState.errors.groups.message}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className='flex justify-end'>
                  <Button
                    type='submit'
                    disabled={isSubmitting}
                    className='font-semibold'
                  >
                    {isSubmitting ? 'Submitting...' : 'Create'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </PageContainer>
  );
}
