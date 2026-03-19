'use client';

import { ConfigImageForm } from './config-image-form';
import { useCreateConfigImage } from '../hooks/use-config-image-mutation';
import { CreateConfigImagePayload } from '@/types/config-image.type';

export function AddConfigImagePage() {
  const { mutate: createConfig, isPending } = useCreateConfigImage();

  const handleSubmit = (payload: CreateConfigImagePayload) => {
    createConfig(payload);
  };

  return (
    <ConfigImageForm
      mode='create'
      onSubmit={handleSubmit}
      isSubmitting={isPending}
    />
  );
}
