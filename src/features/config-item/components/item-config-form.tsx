'use client';

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { useGames } from '@/hooks/use-games';
import { ItemTypeEnum, itemFormSchema, ItemFormValues } from '../types';
import itemService from '@/services/item.service';
import imageService from '@/services/image.service';
import { Image as ImageIcon, Upload, X, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { Textarea } from '@/components/ui/textarea';

export default function ItemConfigForm({
  initialData,
  isEdit = false
}: {
  initialData?: any;
  isEdit?: boolean;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isUploading, setIsUploading] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const { data: gamesData } = useGames();

  const gameOptions = React.useMemo(() => {
    return (gamesData || []).map((game: string) => ({
      label: game,
      value: game
    }));
  }, [gamesData]);

  const form = useForm<ItemFormValues>({
    resolver: zodResolver(itemFormSchema) as any,
    defaultValues: {
      gameId: initialData?.gameId ?? '',
      itemCode: initialData?.itemCode ?? '',
      name: initialData?.name ?? '',
      urlIcon: initialData?.urlIcon ?? '',
      description: initialData?.description ?? '',
      type: (initialData?.type as any) ?? 'TOKEN'
    }
  });

  // Reset form values when initialData changes (e.g., after refetch or navigation)
  useEffect(() => {
    if (initialData) {
      form.reset({
        gameId: initialData?.gameId ?? '',
        itemCode: initialData?.itemCode ?? '',
        name: initialData?.name ?? '',
        urlIcon: initialData?.urlIcon ?? '',
        description: initialData?.description ?? '',
        type: (initialData?.type as any) ?? 'TOKEN'
      });
    }
  }, [initialData, form]);

  async function onSubmit(values: ItemFormValues) {
    try {
      setIsSubmitting(true);

      if (isEdit && initialData?.id) {
        await itemService.updateItem(initialData.id, values);
        toast.success('Item updated successfully');
      } else {
        await itemService.createItem(values);
        toast.success('Item created successfully');
      }

      queryClient.invalidateQueries({ queryKey: ['items'] });
      if (isEdit && initialData?.id) {
        queryClient.invalidateQueries({ queryKey: ['item', initialData.id] });
      }

      router.push('/dashboard/config-item');
      router.refresh();
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || 'Failed to save item configuration');
    } finally {
      setIsSubmitting(false);
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size should be less than 5MB');
      return;
    }

    try {
      setIsUploading(true);
      const res = await imageService.uploadCloudflare(file, 'items');
      if (res.url) {
        form.setValue('urlIcon', res.url);
        toast.success('Image uploaded successfully');
      } else {
        throw new Error('Upload failed: No URL returned');
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload image');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const removeImage = () => {
    form.setValue('urlIcon', '');
  };

  return (
    <Form
      form={form}
      onSubmit={form.handleSubmit(onSubmit)}
      className='space-y-6'
    >
      <div className='space-y-6'>
        <Card>
          <CardHeader>
            <CardTitle>{isEdit ? 'Edit Item' : 'Create New Item'}</CardTitle>
          </CardHeader>
          <CardContent className='grid grid-cols-1 gap-x-6 gap-y-4 md:grid-cols-2'>
            {/* Row 1, Col 1 */}
            <FormField
              control={form.control}
              name='name'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Name <span className='text-destructive'>*</span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder='Enter item name' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Row 1-3, Col 2: Icon Field (Label + Preview Area + Input Row) */}
            <div className='md:row-span-4'>
              <FormField
                control={form.control}
                name='urlIcon'
                render={({ field }) => (
                  <FormItem className='flex h-full flex-col'>
                    <FormLabel>Icon</FormLabel>
                    <div className='flex flex-1 flex-col gap-4'>
                      {/* Clickable Preview Area */}
                      <div
                        className={cn(
                          'bg-muted/50 hover:bg-muted relative flex min-h-[200px] w-full flex-1 cursor-pointer items-center justify-center overflow-hidden rounded-xl border-2 border-dashed transition-all',
                          field.value && 'border-primary/20 border-solid'
                        )}
                        onClick={() =>
                          !field.value && fileInputRef.current?.click()
                        }
                      >
                        {field.value ? (
                          <>
                            <Image
                              src={field.value}
                              alt='Icon Preview'
                              fill
                              className='object-contain p-4'
                              unoptimized
                            />
                            <Button
                              type='button'
                              variant='destructive'
                              size='icon'
                              className='absolute top-2 right-2 h-8 w-8 rounded-full shadow-lg'
                              onClick={(e) => {
                                e.stopPropagation();
                                removeImage();
                              }}
                            >
                              <X className='h-4 w-4' />
                            </Button>
                          </>
                        ) : (
                          <div className='flex flex-col items-center gap-2 py-4'>
                            {isUploading ? (
                              <Loader2 className='text-primary/40 h-10 w-10 animate-spin' />
                            ) : (
                              <ImageIcon className='text-muted-foreground/40 h-10 w-10' />
                            )}
                            <p className='text-muted-foreground px-4 text-center text-xs'>
                              {isUploading
                                ? 'Uploading...'
                                : 'No icon uploaded. Click here or use the button below to upload.'}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* URL Input and Upload Button Row - Should align with 'Type' field on the left */}
                      <div className='flex gap-2'>
                        <FormControl>
                          <Input
                            placeholder='Icon URL (Paste or upload)'
                            {...field}
                            className='flex-1'
                          />
                        </FormControl>
                        <input
                          type='file'
                          ref={fileInputRef}
                          className='hidden'
                          accept='image/*'
                          onChange={handleFileUpload}
                        />
                        <Button
                          type='button'
                          variant='outline'
                          disabled={isUploading}
                          onClick={() => fileInputRef.current?.click()}
                          className='shrink-0'
                        >
                          {isUploading ? (
                            <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                          ) : (
                            <Upload className='mr-2 h-4 w-4' />
                          )}
                          Upload
                        </Button>
                      </div>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Row 2, Col 1 */}
            <FormField
              control={form.control}
              name='itemCode'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Item Code <span className='text-destructive'>*</span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder='Enter item code' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Row 3, Col 1 */}
            <FormField
              control={form.control}
              name='gameId'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Game ID <span className='text-destructive'>*</span>
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isEdit}
                  >
                    <FormControl>
                      <SelectTrigger className='w-full'>
                        <SelectValue placeholder='Select a game' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {gameOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Row 4, Col 1 - Aligned with the Input Row on the right */}
            <FormField
              control={form.control}
              name='type'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Type <span className='text-destructive'>*</span>
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className='w-full'>
                        <SelectValue placeholder='Select type' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {ItemTypeEnum.options.map((opt) => (
                        <SelectItem key={opt} value={opt}>
                          {opt}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Row 5: Description spanning both columns */}
            <div className='col-span-1 md:col-span-2'>
              <FormField
                control={form.control}
                name='description'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder='Enter item description'
                        className='h-[110px] resize-none'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        <div className='flex items-center justify-end gap-4'>
          <Button
            type='button'
            variant='outline'
            onClick={() => router.push('/dashboard/config-item')}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type='submit'
            disabled={isSubmitting || isUploading}
            className='min-w-[120px]'
          >
            {isSubmitting ? 'Saving...' : 'Save Item'}
          </Button>
        </div>
      </div>
    </Form>
  );
}
