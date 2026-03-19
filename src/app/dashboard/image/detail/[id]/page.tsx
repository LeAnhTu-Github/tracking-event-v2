'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Heading } from '@/components/ui/heading';
import PageContainer from '@/components/layout/page-container';
import { ImageDetailView } from '@/features/image/components/image-detail-view';
import { Image } from '@/types/image.type';
import { Button } from '@/components/ui/button';
import { IconArrowLeft } from '@tabler/icons-react';
import imageService from '@/services/image.service';
import { transformApiImage } from '@/store/useImage';

export default function ImageDetailPage() {
  const [image, setImage] = useState<Image | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const params = useParams();
  const id = Number(params.id);

  const fetchImage = useCallback(async () => {
    try {
      if (!id) return;
      setIsLoading(true);
      const apiImage = await imageService.getMediaById(id);
      const transformed = transformApiImage(apiImage);
      setImage(transformed as Image);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchImage();
  }, [fetchImage]);

  if (isLoading) {
    return (
      <PageContainer>
        <div className='flex items-center justify-center p-8'>
          <p>Loading...</p>
        </div>
      </PageContainer>
    );
  }

  if (!image) {
    return (
      <PageContainer>
        <div className='flex items-center justify-center p-8'>
          <p>Image not found</p>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className='w-full space-y-4'>
        <div className='flex items-center gap-4'>
          {/* <Button variant='ghost' size='sm' onClick={() => router.back()}>
            <IconArrowLeft className='mr-2 h-4 w-4' />
            Quay lại
          </Button> */}
          <Heading
            title='Detail Image'
            description='Detail Information Image'
          />
        </div>

        <ImageDetailView image={image} />
      </div>
    </PageContainer>
  );
}
