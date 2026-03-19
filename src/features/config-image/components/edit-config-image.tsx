'use client';

import { useQuery } from '@tanstack/react-query';
import { ConfigImageForm } from './config-image-form';
import { useUpdateConfigImage } from '../hooks/use-config-image-mutation';
import configImageService from '@/services/config-image.service';
import { CreateConfigImagePayload } from '@/types/config-image.type';
import { Skeleton } from '@/components/ui/skeleton';

interface EditConfigImagePageProps {
  id: number;
}

export function EditConfigImagePage({ id }: EditConfigImagePageProps) {
  const { data: configImage, isLoading } = useQuery({
    queryKey: ['config-image', id],
    queryFn: () => configImageService.getById(id),
    enabled: !!id
  });

  const { mutate: updateConfig, isPending } = useUpdateConfigImage(id);

  const handleSubmit = (payload: CreateConfigImagePayload) => {
    updateConfig(payload);
  };

  if (isLoading) {
    return (
      <div className='space-y-6'>
        <Skeleton className='h-40 w-full rounded-xl' />
        <Skeleton className='h-64 w-full rounded-xl' />
        <Skeleton className='h-64 w-full rounded-xl' />
      </div>
    );
  }

  return (
    <ConfigImageForm
      mode='edit'
      initialData={configImage}
      onSubmit={handleSubmit}
      isSubmitting={isPending}
    />
  );
}
