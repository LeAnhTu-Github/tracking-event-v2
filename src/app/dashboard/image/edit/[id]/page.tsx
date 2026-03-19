'use client';

import { useCallback, useEffect, useState, useRef, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Heading } from '@/components/ui/heading';
import PageContainer from '@/components/layout/page-container';
import {
  Image,
  MediaApiResponse,
  SensitiveRegionsMetadata
} from '@/types/image.type';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import {
  IconArrowLeft,
  IconTags,
  IconCode,
  IconPhotoEdit
} from '@tabler/icons-react';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';
import {
  ImageForm,
  ImageFormValues,
  ImageFormRef,
  mapImageToFormValues
} from '@/features/image/components/image-form';
import { MetadataModal } from '@/features/image/components/metadata-modal';
import { EmbeddingModal } from '@/features/image/components/embedding-modal';
import { AnnotationModal } from '@/features/image/components/annotation-modal';
import { AnnotationData } from '@/features/image/components/image-annotation-view';
import imageService from '@/services/image.service';
import fileService from '@/services/file.service';
import { transformApiImage, useImageStore } from '@/store/useImage';

interface UpdateImages {
  thumbnailUrl?: string | File;
}

interface AnnotationStorage {
  [imageUrl: string]: AnnotationData | null;
}

export default function ImageEditPage() {
  const {
    editingMetadata,
    editingEmbedding,
    editingAnnotation,
    setEditingMetadata,
    setEditingEmbedding,
    setEditingAnnotation,
    clearEditingState
  } = useImageStore();

  const [image, setImage] = useState<Image | null>(null);
  const [apiImage, setApiImage] = useState<MediaApiResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [updateImages, setUpdateImages] = useState<UpdateImages>({});
  const [originalImageUrl, setOriginalImageUrl] = useState<string | null>(null);
  const [isMetadataModalOpen, setIsMetadataModalOpen] = useState(false);
  const [isEmbeddingModalOpen, setIsEmbeddingModalOpen] = useState(false);
  const [isAnnotationModalOpen, setIsAnnotationModalOpen] = useState(false);
  const [currentAnnotationImageUrl, setCurrentAnnotationImageUrl] = useState<
    string | null
  >(null);
  const imageFormRef = useRef<ImageFormRef>(null);
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const id = Number(params.id);

  const fetchImage = useCallback(async () => {
    try {
      if (!id) return;
      setIsLoading(true);
      const apiImageData = await imageService.getMediaById(id);
      const transformed = transformApiImage(apiImageData);
      setApiImage(apiImageData);
      setImage(transformed as Image);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    setUpdateImages({});
    clearEditingState();
    setOriginalImageUrl(null);
    setCurrentAnnotationImageUrl(null);
    setApiImage(null);
    setIsAnnotationModalOpen(false);
    setIsMetadataModalOpen(false);
    setIsEmbeddingModalOpen(false);
  }, [id, clearEditingState]);

  useEffect(() => {
    fetchImage();
  }, [fetchImage]);

  useEffect(() => {
    if (image && image.imageUrl) {
      setOriginalImageUrl(image.imageUrl);

      if (image.annotations && image.annotations.length > 0) {
        const imageWidth =
          apiImage?.sensitiveRegionsMetadata?.image?.width || 0;
        const imageHeight =
          apiImage?.sensitiveRegionsMetadata?.image?.height || 0;

        const annotationData: AnnotationData | null = {
          version: apiImage?.sensitiveRegionsMetadata?.version || '1.0',
          image: {
            width: imageWidth,
            height: imageHeight
          },
          detections: image.annotations.map((ann) => ({
            id: ann.id,
            label: ann.label || 'face',
            bbox_norm: ann.bbox_norm
          }))
        };

        if (!editingAnnotation) {
          setEditingAnnotation(annotationData);
        }
        setCurrentAnnotationImageUrl(image.imageUrl);
      }

      if (!editingMetadata) {
        setEditingMetadata(image.metadata);
      }

      if (!editingEmbedding) {
        setEditingEmbedding(image.embedding);
      }
    }
  }, [
    image?.id,
    image?.imageUrl,
    apiImage?.sensitiveRegionsMetadata,
    editingAnnotation,
    editingMetadata,
    editingEmbedding,
    setEditingAnnotation,
    setEditingMetadata,
    setEditingEmbedding
  ]);

  const formInitialValues = useMemo(
    () => (image ? mapImageToFormValues(image) : undefined),
    [image?.id]
  );

  const getCurrentImageInfo = useCallback((): {
    url: string | null;
    key: string;
  } => {
    const currentUrls = imageFormRef.current?.getCurrentImageUrls();
    if (currentUrls?.imageUrl) {
      const key = currentUrls.imageUrl.startsWith('blob:')
        ? `image_${image?.id}_temp`
        : currentUrls.imageUrl;
      return { url: currentUrls.imageUrl, key };
    }

    const originalUrl = image?.imageUrl || null;
    return {
      url: originalUrl,
      key: originalUrl || `image_${image?.id}_original`
    };
  }, [image?.imageUrl, image?.id]);

  const handleSaveBasicInfo = async (values: ImageFormValues) => {
    setIsSubmitting(true);
    const blobUrlsToRevoke: string[] = [];

    try {
      const thumbnailUrl = values.thumbnail;
      const imageUrl = values.fullImage;
      const downloadImageUrl = values.downloadImage;
      const videoUrl = values.video || undefined;
      const originalImageUrl = image?.imageUrl || '';

      const annotationData = editingAnnotation;

      const metadataToSave = {
        ...image!.metadata,
        imageType: values.imageType,
        gameId: values.gameId,
        ...editingMetadata
      };

      const embeddingToSave = {
        ...image!.embedding,
        ...editingEmbedding
      };

      await imageService.updateMedia(image!.id, {
        imageUrl: imageUrl || image!.imageUrl || '',
        thumbnailUrl: thumbnailUrl || undefined,
        downloadImageUrl: downloadImageUrl || undefined,
        videoUrl: videoUrl || undefined,
        gameId: values.gameId,
        vip: values.isVip === 'ACTIVE',
        sexyLevel: values.levelSexy,
        isActive: values.status === 'ACTIVE',
        type: values.imageType.toUpperCase(),
        metaData: metadataToSave ? JSON.stringify(metadataToSave) : undefined,
        embedding: embeddingToSave
          ? JSON.stringify(embeddingToSave)
          : undefined,
        annotation: annotationData ? JSON.stringify(annotationData) : undefined
      });

      const updatedImage: Image = {
        ...image!,
        thumbnailUrl: thumbnailUrl || image?.thumbnailUrl || '',
        imageUrl: imageUrl || image?.imageUrl,
        downloadImageUrl: downloadImageUrl || image?.downloadImageUrl,
        videoUrl: videoUrl || image?.videoUrl,
        isVip: values.isVip === 'ACTIVE',
        levelSexy: values.levelSexy,
        status: values.status,
        metadata: metadataToSave,
        embedding: embeddingToSave
      };

      setImage(updatedImage);

      setOriginalImageUrl(imageUrl || image?.imageUrl || null);
      clearEditingState();

      await queryClient.invalidateQueries({ queryKey: ['images'] });

      toast.success('All changes saved successfully');
      router.push(`/dashboard/image`);
    } catch (error) {
      toast.error('Failed to save changes');
      console.error(error);
    } finally {
      blobUrlsToRevoke.forEach((url) => {
        if (url.startsWith('blob:')) {
          URL.revokeObjectURL(url);
        }
      });
      setIsSubmitting(false);
    }
  };

  const handleSaveMetadata = async (metadata: Image['metadata']) => {
    try {
      setEditingMetadata(metadata);
      toast.success('Metadata updated successfully');
      setIsMetadataModalOpen(false);
    } catch (error) {
      toast.error('Failed to save metadata');
      console.error(error);
    }
  };

  const handleSaveEmbedding = async (embedding: Image['embedding']) => {
    try {
      setEditingEmbedding(embedding);
      toast.success('Embedding update successfully');
      setIsEmbeddingModalOpen(false);
    } catch (error) {
      toast.error('Failed to save embedding');
      console.error(error);
    }
  };

  const handleSaveAnnotations = async (
    annotationData: AnnotationData | null
  ) => {
    try {
      setEditingAnnotation(annotationData);
      toast.success('Annotations saved successfully');
      setIsAnnotationModalOpen(false);
    } catch (error) {
      toast.error('Failed to save annotations');
      console.error(error);
    }
  };

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
      <div className='flex flex-1 flex-col space-y-4'>
        <div className='flex items-start justify-between'>
          <div className='flex items-center gap-4'>
            <Button variant='ghost' size='sm' onClick={() => router.back()}>
              <IconArrowLeft className='mr-2 h-4 w-4' />
              Back
            </Button>
            <Heading
              title='Edit Image'
              description='Edit image information, metadata, embedding, and annotations'
            />
          </div>
        </div>
        <Separator />
        <div className='flex flex-wrap gap-2'>
          <Button
            variant='outline'
            onClick={() => setIsMetadataModalOpen(true)}
            className='flex items-center gap-2'
          >
            <IconTags className='h-4 w-4' />
            Configure Metadata
          </Button>
          <Button
            variant='outline'
            onClick={() => setIsEmbeddingModalOpen(true)}
            className='flex items-center gap-2'
          >
            <IconCode className='h-4 w-4' />
            Configure Embedding
          </Button>
          <Button
            variant='outline'
            onClick={() => setIsAnnotationModalOpen(true)}
            className='flex items-center gap-2'
          >
            <IconPhotoEdit className='h-4 w-4' />
            Configure Annotations
          </Button>
        </div>

        <Card>
          <CardContent className='pt-6'>
            <ImageForm
              ref={imageFormRef}
              mode='edit'
              initialValues={formInitialValues}
              onSubmit={handleSaveBasicInfo}
              onCancel={() => router.back()}
              isSubmitting={isSubmitting}
            />
          </CardContent>
        </Card>

        {image && (
          <>
            <MetadataModal
              isOpen={isMetadataModalOpen}
              onClose={() => setIsMetadataModalOpen(false)}
              image={image}
              onSubmit={handleSaveMetadata}
            />
            <EmbeddingModal
              isOpen={isEmbeddingModalOpen}
              onClose={() => setIsEmbeddingModalOpen(false)}
              image={image}
              onSubmit={handleSaveEmbedding}
            />
            <AnnotationModal
              isOpen={isAnnotationModalOpen}
              onClose={() => setIsAnnotationModalOpen(false)}
              imageUrl={(() => {
                const { url } = getCurrentImageInfo();
                return url || image.imageUrl || '';
              })()}
              onSubmit={handleSaveAnnotations}
            />
          </>
        )}
      </div>
    </PageContainer>
  );
}
