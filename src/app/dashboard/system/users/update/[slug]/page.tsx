'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Group, User } from '@/types/user.type';
import userService from '@/services/user.service';
import { useParams, useRouter } from 'next/navigation';
import fileService from '@/services/file.service';
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Heading } from '@/components/ui/heading';
import { MultiSelect } from '@/components/ui/multi-select';
import PageContainer from '@/components/layout/page-container';

const formSchema = z.object({
  fullName: z
    .string()
    .min(1, 'Full name is required')
    .max(100, 'Full name must be less than 100 characters'),
  phone: z.string().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE']),
  groups: z.array(z.number()).min(1, 'At least one group must be selected')
});

type FormValues = z.infer<typeof formSchema>;

export default function PageUpdateUser() {
  const [avatar, setAvatar] = useState<string>('');
  const [user, setUser] = useState<User | null>(null);
  const [groups, setGroups] = useState<Group[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const params = useParams();
  const slug = Number(params.slug);

  const inputRef = useRef<HTMLInputElement | null>(null);
  const handleAvatarClick = () => {
    if (inputRef.current) {
      inputRef.current.click();
    }
  };

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: '',
      phone: '',
      status: 'ACTIVE',
      groups: []
    }
  });

  const fetchUser = useCallback(async () => {
    try {
      if (!slug) return;
      const res = await userService.getUserById(slug);
      setUser(res);
      form.reset({
        fullName: res.fullName,
        phone: res.phone || '',
        status: (res.status as 'ACTIVE' | 'INACTIVE') ?? 'INACTIVE',
        groups: res.groups.map((g) => g.id)
      });
      setAvatar(res.avatar);
    } catch (error) {
      console.error(error);
    }
  }, [form, slug]);

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
    fetchUser();
  }, [fetchUser]);

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

  const router = useRouter();

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    try {
      if (!user) return;
      const body = {
        id: user.id,
        avatar,
        phone: values.phone,
        status: values.status,
        fullName: values.fullName,
        groupIds: values.groups
      };
      await userService.updateUser(body);
      await fetchUser();
      router.push(`/dashboard/system/users`);
      toast.success('Update user successfully');
    } catch (error: any) {
      toast.error(error.message || 'Update user failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <PageContainer>
        <div className='flex items-center justify-center p-8'>
          <p>Loading...</p>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className='space-y-4'>
        <Heading title='Users' description='Update user information' />
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <Card>
            <CardHeader className='hidden md:block'>
              <CardTitle>Update user</CardTitle>
            </CardHeader>
            <CardContent className='grid grid-cols-1 space-y-6 md:grid-cols-3'>
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
                      <Label className='font-semibold'>Groups</Label>
                      <MultiSelect
                        options={groups.map((group) => {
                          return {
                            label: group.groupName,
                            value: group.id.toString()
                          };
                        })}
                        onValueChange={(values) => {
                          form.setValue(
                            'groups',
                            values.map((v) => Number(v))
                          );
                        }}
                        defaultValue={user.groups.map((g) => g.id.toString())}
                        placeholder='Select user group'
                        variant='inverted'
                        animation={2}
                        maxCount={3}
                      />
                    </div>
                  </div>
                </div>

                <div className='flex justify-end'>
                  <Button
                    type='submit'
                    className='font-semibold'
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Updating...' : 'Update'}
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
