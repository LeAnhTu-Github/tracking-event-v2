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
import { adsConfigFormSchema, AdsConfigFormValues } from '../types';
import adsConfigService from '@/services/ads-config.service';
import { Textarea } from '@/components/ui/textarea';

export default function AdsConfigForm({
  initialData,
  isEdit = false
}: {
  initialData?: any;
  isEdit?: boolean;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const { data: gamesData } = useGames();

  const gameOptions = React.useMemo(() => {
    return (gamesData || []).map((game: string) => ({
      label: game,
      value: game
    }));
  }, [gamesData]);

  const form = useForm<AdsConfigFormValues>({
    resolver: zodResolver(adsConfigFormSchema) as any,
    defaultValues: {
      gameId: initialData?.gameId ?? '',
      configKey: initialData?.configKey ?? '',
      configValue: initialData?.configValue ?? 0,
      description: initialData?.description ?? ''
    }
  });

  useEffect(() => {
    if (initialData) {
      form.reset({
        gameId: initialData?.gameId ?? '',
        configKey: initialData?.configKey ?? '',
        configValue: initialData?.configValue ?? 0,
        description: initialData?.description ?? ''
      });
    }
  }, [initialData, form]);

  async function onSubmit(values: AdsConfigFormValues) {
    try {
      setIsSubmitting(true);

      if (isEdit && initialData?.id) {
        await adsConfigService.updateAdsConfig(initialData.id, values);
        toast.success('Ads configuration updated successfully');
      } else {
        await adsConfigService.createAdsConfig(values);
        toast.success('Ads configuration created successfully');
      }

      queryClient.invalidateQueries({ queryKey: ['ads-configs'] });
      if (isEdit && initialData?.id) {
        queryClient.invalidateQueries({
          queryKey: ['ads-config', initialData.id]
        });
      }

      router.push('/dashboard/config-ads');
      router.refresh();
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || 'Failed to save ads configuration');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form
      form={form}
      onSubmit={form.handleSubmit(onSubmit)}
      className='space-y-6'
    >
      <div className='space-y-6'>
        <Card>
          <CardHeader>
            <CardTitle>
              {isEdit ? 'Edit Ads Config' : 'Create New Ads Config'}
            </CardTitle>
          </CardHeader>
          <CardContent className='grid grid-cols-1 gap-x-6 gap-y-4 md:grid-cols-2'>
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

            <div className='md:row-span-2'>
              <FormField
                control={form.control}
                name='configKey'
                render={({ field }) => (
                  <FormItem className='flex h-full flex-col'>
                    <FormLabel>
                      Config Key <span className='text-destructive'>*</span>
                    </FormLabel>
                    <FormControl className='flex-1'>
                      <Textarea
                        placeholder='Enter config key'
                        className='h-full min-h-[120px] resize-none'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name='configValue'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Config Value <span className='text-destructive'>*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      type='number'
                      placeholder='Enter config value'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className='col-span-1 md:col-span-2'>
              <FormField
                control={form.control}
                name='description'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder='Enter description'
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
            onClick={() => router.push('/dashboard/config-ads')}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type='submit'
            disabled={isSubmitting}
            className='min-w-[120px]'
          >
            {isSubmitting ? 'Saving...' : 'Save Config'}
          </Button>
        </div>
      </div>
    </Form>
  );
}
