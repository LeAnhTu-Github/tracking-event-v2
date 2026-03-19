'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import PageContainer from '@/components/layout/page-container';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';
import {
  ImageForm,
  ImageFormValues
} from '@/features/image/components/image-form';
import imageService from '@/services/image.service';

export default function AddImagePage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const onSubmit = async (values: ImageFormValues) => {
    setIsSubmitting(true);
    try {
      const response = await imageService.createMedia({
        imageUrl: values.fullImage,
        thumbnailUrl: values.thumbnail,
        downloadImageUrl: values.downloadImage,
        videoUrl: values.video,
        gameId: values.gameId,
        vip: values.isVip === 'ACTIVE',
        type: values.imageType.toUpperCase(),
        sexyLevel: values.levelSexy,
        isActive: values.status === 'ACTIVE'
      });

      toast.success('Image added successfully');
      await queryClient.invalidateQueries({ queryKey: ['images'] });
      router.push(`/dashboard/image`);
    } catch (error) {
      toast.error('Failed to add image');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageContainer>
      <div className='flex flex-1 flex-col space-y-4'>
        <div className='flex items-start justify-between'>
          <div className='flex items-center gap-4'>
            <Heading
              title='Add Image'
              description='Add a new image to the system'
            />
          </div>
        </div>
        <Separator />
        <Card>
          <CardContent className='pt-6'>
            <ImageForm
              mode='create'
              onSubmit={onSubmit}
              onCancel={() => router.back()}
              isSubmitting={isSubmitting}
            />
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
