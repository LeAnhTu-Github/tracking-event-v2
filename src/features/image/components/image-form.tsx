'use client';

import {
  useState,
  useEffect,
  useCallback,
  forwardRef,
  useImperativeHandle,
  useRef
} from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { FormFileUpload } from '@/components/forms/form-file-upload';
import { FormInput } from '@/components/forms/form-input';
import { FormSelect } from '@/components/forms/form-select';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { IconX } from '@tabler/icons-react';
import { FormLabel } from '@/components/ui/form';
import { ImagePreviewBox } from '@/features/image/components/image-preview-box';
import { Image } from '@/types/image.type';
import imageService from '@/services/image.service';
import { toast } from 'sonner';
import { useGames } from '@/hooks/use-games';
import { useMemo } from 'react';

const baseSchema = z.object({
  thumbnailMode: z.enum(['upload', 'link']),
  fullImageMode: z.enum(['upload', 'link']),
  downloadImageMode: z.enum(['upload', 'link']),
  videoMode: z.enum(['upload', 'link']),
  isVip: z.enum(['ACTIVE', 'INACTIVE']),
  levelSexy: z
    .number()
    .min(1, 'Level must be between 1 and 5')
    .max(5, 'Level must be between 1 and 5'),
  status: z.enum(['ACTIVE', 'INACTIVE']),
  imageType: z.enum(['Review', 'Product']),
  gameId: z.string().min(1, 'Please select a game')
});

const formSchema = baseSchema
  .extend({
    thumbnail: z.string().optional(),
    fullImage: z.string().min(1, 'Please provide a full image'),
    downloadImage: z.string().optional(),
    video: z.string().optional()
  })
  .refine(
    (data) => {
      if (data.videoMode === 'link' && data.video) {
        const videoExtensions = [
          '.mp4',
          '.webm',
          '.ogg',
          '.mov',
          '.m4v',
          '.avi',
          '.mkv'
        ];
        return videoExtensions.some((ext) =>
          data.video!.toLowerCase().includes(ext)
        );
      }
      return true;
    },
    {
      message: 'Video link must be a valid video URL (mp4, webm, etc.)',
      path: ['video']
    }
  );

export type ImageFormValues = z.infer<typeof formSchema>;

export interface ImageFormRef {
  getCurrentImageUrls: () => {
    thumbnailUrl: string | undefined | null;
    imageUrl: string | undefined | null;
  };
}

interface ImageFormProps {
  mode: 'create' | 'edit';
  initialValues?: Partial<ImageFormValues>;
  onSubmit: (values: ImageFormValues) => Promise<void>;
  onCancel?: () => void;
  isSubmitting?: boolean;
}

export function mapImageToFormValues(image: Image): Partial<ImageFormValues> {
  return {
    thumbnailMode: image.thumbnailUrl ? 'link' : 'upload',
    fullImageMode: image.imageUrl ? 'link' : 'upload',
    downloadImageMode: image.downloadImageUrl ? 'link' : 'upload',
    videoMode: image.videoUrl ? 'link' : 'upload',
    thumbnail: image.thumbnailUrl || '',
    fullImage: image.imageUrl || '',
    downloadImage: image.downloadImageUrl || '',
    video: image.videoUrl || '',
    isVip: image.isVip ? 'ACTIVE' : 'INACTIVE',
    levelSexy: image.levelSexy,
    status: image.status,
    imageType: (image.metadata?.imageType as 'Review' | 'Product') || 'Review',
    gameId: image.gameId || image.metadata?.gameId || ''
  };
}

export const ImageForm = forwardRef<ImageFormRef, ImageFormProps>(
  (
    {
      mode,
      initialValues,
      onSubmit,
      onCancel,
      isSubmitting: externalIsSubmitting
    },
    ref
  ) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const submitting = externalIsSubmitting ?? isSubmitting;

    const { data: gamesData } = useGames();
    const gameOptions = useMemo(() => {
      return (
        gamesData?.map((game: string) => ({ label: game, value: game })) || []
      );
    }, [gamesData]);

    const [thumbnailPreviewUrl, setThumbnailPreviewUrl] = useState<
      string | null
    >(null);
    const [fullImagePreviewUrl, setFullImagePreviewUrl] = useState<
      string | null
    >(null);
    const [downloadImagePreviewUrl, setDownloadImagePreviewUrl] = useState<
      string | null
    >(null);
    const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null);

    const [thumbnailLocked, setThumbnailLocked] = useState(false);
    const [fullImageLocked, setFullImageLocked] = useState(false);
    const [downloadImageLocked, setDownloadImageLocked] = useState(false);
    const [videoLocked, setVideoLocked] = useState(false);

    // Track initial thumbnail URL from first initialValues to detect when image actually changes
    const initialThumbnailUrlRef = useRef<string | null | undefined>(undefined);

    const defaultFormValues: ImageFormValues = {
      thumbnailMode: 'upload',
      fullImageMode: 'upload',
      downloadImageMode: 'upload',
      videoMode: 'upload',
      thumbnail: '',
      fullImage: '',
      downloadImage: '',
      video: '',
      isVip: 'INACTIVE',
      levelSexy: 1,
      status: 'ACTIVE',
      imageType: 'Review',
      gameId: ''
    };

    const form = useForm<ImageFormValues>({
      resolver: zodResolver(formSchema),
      defaultValues: initialValues || defaultFormValues
    });

    useImperativeHandle(
      ref,
      () => ({
        getCurrentImageUrls: () => {
          const thumbnailUrl = form.getValues('thumbnail');
          const imageUrl = form.getValues('fullImage');

          return {
            thumbnailUrl,
            imageUrl
          };
        }
      }),
      [form]
    );

    useEffect(() => {
      if (mode === 'edit' && initialValues) {
        const thumbnailUrlFromInitial =
          initialValues.thumbnailMode === 'link' &&
          typeof initialValues.thumbnail === 'string'
            ? initialValues.thumbnail
            : null;

        if (initialThumbnailUrlRef.current === undefined) {
          initialThumbnailUrlRef.current = thumbnailUrlFromInitial;
          form.reset(initialValues);
        } else if (initialThumbnailUrlRef.current !== thumbnailUrlFromInitial) {
          initialThumbnailUrlRef.current = thumbnailUrlFromInitial;
          form.reset(initialValues);
        }
      }
    }, [mode, initialValues, form]);

    useEffect(() => {
      if (mode === 'edit' && initialValues) {
        if (
          initialValues.thumbnailMode === 'link' &&
          typeof initialValues.thumbnail === 'string'
        ) {
          setThumbnailPreviewUrl(initialValues.thumbnail);
          setThumbnailLocked(true);
        }
        if (
          initialValues.fullImageMode === 'link' &&
          typeof initialValues.fullImage === 'string'
        ) {
          setFullImagePreviewUrl(initialValues.fullImage);
          setFullImageLocked(true);
        }
        if (
          initialValues.downloadImageMode === 'link' &&
          typeof initialValues.downloadImage === 'string'
        ) {
          setDownloadImagePreviewUrl(initialValues.downloadImage);
          setDownloadImageLocked(true);
        }
        if (
          initialValues.videoMode === 'link' &&
          typeof initialValues.video === 'string'
        ) {
          setVideoPreviewUrl(initialValues.video);
          setVideoLocked(true);
        }
      }
    }, [mode, initialValues]);

    const handleUpload = useCallback(
      async (
        files: File[],
        fieldName: 'thumbnail' | 'fullImage' | 'downloadImage' | 'video'
      ) => {
        if (files.length === 0) return;
        const file = files[0];
        try {
          const res = await imageService.uploadCloudflare(file);
          form.setValue(fieldName, res.url, {
            shouldValidate: true,
            shouldDirty: true
          });
          form.setValue(`${fieldName}_file` as any, [], {
            shouldValidate: true,
            shouldDirty: true
          });
          form.trigger(fieldName);

          switch (fieldName) {
            case 'thumbnail':
              setThumbnailPreviewUrl(res.url);
              setThumbnailLocked(true);
              break;
            case 'fullImage':
              setFullImagePreviewUrl(res.url);
              setFullImageLocked(true);
              break;
            case 'downloadImage':
              setDownloadImagePreviewUrl(res.url);
              setDownloadImageLocked(true);
              break;
            case 'video':
              setVideoPreviewUrl(res.url);
              setVideoLocked(true);
              break;
          }
        } catch (error) {
          console.error(`Failed to upload ${fieldName}:`, error);
          toast.error(`Failed to upload ${fieldName}`);
          throw error; // Re-throw so FileUploader knows it failed
        }
      },
      [form]
    );

    const handleModeChange = (
      fieldName: 'thumbnail' | 'fullImage' | 'downloadImage' | 'video',
      mode: 'upload' | 'link'
    ) => {
      const modeField = `${fieldName}Mode` as keyof ImageFormValues;
      form.setValue(modeField, mode);
      form.setValue(fieldName, '');
      form.setValue(`${fieldName}_file` as any, [], {
        shouldValidate: true,
        shouldDirty: true
      });

      switch (fieldName) {
        case 'thumbnail':
          setThumbnailPreviewUrl(null);
          setThumbnailLocked(false);
          break;
        case 'fullImage':
          setFullImagePreviewUrl(null);
          setFullImageLocked(false);
          break;
        case 'downloadImage':
          setDownloadImagePreviewUrl(null);
          setDownloadImageLocked(false);
          break;
        case 'video':
          setVideoPreviewUrl(null);
          setVideoLocked(false);
          break;
      }
    };

    const thumbnailMode = form.watch('thumbnailMode');
    const fullImageMode = form.watch('fullImageMode');
    const downloadImageMode = form.watch('downloadImageMode');
    const videoMode = form.watch('videoMode');

    useEffect(() => {
      return () => {
        // No blob URLs to revoke anymore since we use server URLs
      };
    }, []);

    const handleLinkSubmit = useCallback(
      (fieldName: 'thumbnail' | 'fullImage' | 'downloadImage' | 'video') => {
        const value = form.getValues(fieldName);
        const modeField = `${fieldName}Mode` as keyof ImageFormValues;
        const mode = form.getValues(modeField) as 'upload' | 'link';

        if (mode === 'link' && typeof value === 'string' && value.trim()) {
          try {
            new URL(value);
            const url = value;

            // Extra validation for video links
            if (fieldName === 'video') {
              const videoExtensions = [
                '.mp4',
                '.webm',
                '.ogg',
                '.mov',
                '.m4v',
                '.avi',
                '.mkv'
              ];
              const isVideo = videoExtensions.some((ext) =>
                url.toLowerCase().includes(ext)
              );
              if (!isVideo) {
                toast.error(
                  'Invalid video link. Please provide a link to a video file (mp4, webm, etc.)'
                );
                return;
              }
            }

            if (url) {
              switch (fieldName) {
                case 'thumbnail':
                  setThumbnailPreviewUrl(url);
                  setThumbnailLocked(true);
                  break;
                case 'fullImage':
                  setFullImagePreviewUrl(url);
                  setFullImageLocked(true);
                  break;
                case 'downloadImage':
                  setDownloadImagePreviewUrl(url);
                  setDownloadImageLocked(true);
                  break;
                case 'video':
                  setVideoPreviewUrl(url);
                  setVideoLocked(true);
                  break;
              }
            }
          } catch {}
        }
      },
      [form]
    );

    const handleSubmit = async (values: ImageFormValues) => {
      if (!externalIsSubmitting) {
        setIsSubmitting(true);
      }
      try {
        await onSubmit(values);
      } finally {
        if (!externalIsSubmitting) {
          setIsSubmitting(false);
        }
      }
    };

    return (
      <Form form={form} onSubmit={form.handleSubmit(handleSubmit)}>
        <div className='space-y-6'>
          <div className='space-y-4'>
            <Tabs
              value={thumbnailMode}
              onValueChange={(value) =>
                handleModeChange('thumbnail', value as 'upload' | 'link')
              }
            >
              <div className='space-y-2'>
                <div className='flex items-center justify-between'>
                  <FormLabel>Thumbnail Image</FormLabel>
                  <TabsList className='grid w-full max-w-xs grid-cols-2'>
                    <TabsTrigger value='upload'>Upload</TabsTrigger>
                    <TabsTrigger value='link'>Paste Link</TabsTrigger>
                  </TabsList>
                </div>
                {!thumbnailLocked && (
                  <>
                    <TabsContent value='upload' className='mt-0'>
                      <FormFileUpload
                        control={form.control}
                        name={'thumbnail_file' as any}
                        config={{
                          maxSize: 10 * 1024 * 1024,
                          maxFiles: 1,
                          acceptedTypes: ['image/*'],
                          onUpload: (files) => handleUpload(files, 'thumbnail')
                        }}
                      />
                    </TabsContent>
                    <TabsContent value='link' className='mt-0'>
                      <div className='flex gap-2'>
                        <FormInput
                          control={form.control}
                          name='thumbnail'
                          placeholder='https://example.com/image.jpg'
                          type='url'
                          className='flex-1'
                        />
                        <Button
                          type='button'
                          variant='outline'
                          size='sm'
                          onClick={() => handleLinkSubmit('thumbnail')}
                        >
                          Preview
                        </Button>
                      </div>
                    </TabsContent>
                  </>
                )}
              </div>
            </Tabs>
            {thumbnailPreviewUrl && (
              <div className='space-y-2'>
                <div className='flex items-center justify-between'>
                  <span className='text-sm font-medium'>Thumbnail Preview</span>
                  <Button
                    type='button'
                    variant='destructive'
                    size='sm'
                    onClick={() => {
                      setThumbnailPreviewUrl(null);
                      setThumbnailLocked(false);
                      form.setValue('thumbnailMode', 'upload');
                      form.setValue('thumbnail', '', {
                        shouldValidate: true,
                        shouldDirty: true
                      });
                      form.setValue('thumbnail_file' as any, [], {
                        shouldValidate: true,
                        shouldDirty: true
                      });
                    }}
                  >
                    <IconX className='mr-2 h-4 w-4' />
                    Remove
                  </Button>
                </div>
                <ImagePreviewBox src={thumbnailPreviewUrl} />
              </div>
            )}
          </div>

          <div className='space-y-4'>
            <Tabs
              value={fullImageMode}
              onValueChange={(value) =>
                handleModeChange('fullImage', value as 'upload' | 'link')
              }
            >
              <div className='space-y-2'>
                <div className='flex items-center justify-between'>
                  <FormLabel>
                    Full Image
                    <span className='ml-1 text-red-500'>*</span>
                  </FormLabel>
                  <TabsList className='grid w-full max-w-xs grid-cols-2'>
                    <TabsTrigger value='upload'>Upload</TabsTrigger>
                    <TabsTrigger value='link'>Paste Link</TabsTrigger>
                  </TabsList>
                </div>
                {!fullImageLocked && (
                  <>
                    <TabsContent value='upload' className='mt-0'>
                      <FormFileUpload
                        control={form.control}
                        name={'fullImage_file' as any}
                        config={{
                          maxSize: 10 * 1024 * 1024,
                          maxFiles: 1,
                          acceptedTypes: ['image/*'],
                          onUpload: (files) => handleUpload(files, 'fullImage')
                        }}
                      />
                    </TabsContent>
                    <TabsContent value='link' className='mt-0'>
                      <div className='flex gap-2'>
                        <FormInput
                          control={form.control}
                          name='fullImage'
                          placeholder='https://example.com/image.jpg'
                          type='url'
                          required
                          className='flex-1'
                        />
                        <Button
                          type='button'
                          variant='outline'
                          size='sm'
                          onClick={() => handleLinkSubmit('fullImage')}
                        >
                          Preview
                        </Button>
                      </div>
                    </TabsContent>
                  </>
                )}
              </div>
            </Tabs>
            {fullImagePreviewUrl && (
              <div className='space-y-2'>
                <div className='flex items-center justify-between'>
                  <span className='text-sm font-medium'>
                    Full Image Preview
                  </span>
                  <Button
                    type='button'
                    variant='destructive'
                    size='sm'
                    onClick={() => {
                      setFullImagePreviewUrl(null);
                      setFullImageLocked(false);
                      form.setValue('fullImageMode', 'upload');
                      form.setValue('fullImage', '', {
                        shouldValidate: true,
                        shouldDirty: true
                      });
                      form.setValue('fullImage_file' as any, [], {
                        shouldValidate: true,
                        shouldDirty: true
                      });
                    }}
                  >
                    <IconX className='mr-2 h-4 w-4' />
                    Remove
                  </Button>
                </div>
                <ImagePreviewBox src={fullImagePreviewUrl} />
              </div>
            )}
          </div>

          <div className='space-y-4'>
            <Tabs
              value={downloadImageMode}
              onValueChange={(value) =>
                handleModeChange('downloadImage', value as 'upload' | 'link')
              }
            >
              <div className='space-y-2'>
                <div className='flex items-center justify-between'>
                  <FormLabel>Download Image</FormLabel>
                  <TabsList className='grid w-full max-w-xs grid-cols-2'>
                    <TabsTrigger value='upload'>Upload</TabsTrigger>
                    <TabsTrigger value='link'>Paste Link</TabsTrigger>
                  </TabsList>
                </div>
                {!downloadImageLocked && (
                  <>
                    <TabsContent value='upload' className='mt-0'>
                      <FormFileUpload
                        control={form.control}
                        name={'downloadImage_file' as any}
                        config={{
                          maxSize: 10 * 1024 * 1024,
                          maxFiles: 1,
                          acceptedTypes: ['image/*'],
                          onUpload: (files) =>
                            handleUpload(files, 'downloadImage')
                        }}
                      />
                    </TabsContent>
                    <TabsContent value='link' className='mt-0'>
                      <div className='flex gap-2'>
                        <FormInput
                          control={form.control}
                          name='downloadImage'
                          placeholder='https://example.com/image.jpg'
                          type='url'
                          className='flex-1'
                        />
                        <Button
                          type='button'
                          variant='outline'
                          size='sm'
                          onClick={() => handleLinkSubmit('downloadImage')}
                        >
                          Preview
                        </Button>
                      </div>
                    </TabsContent>
                  </>
                )}
              </div>
            </Tabs>
            {downloadImagePreviewUrl && (
              <div className='space-y-2'>
                <div className='flex items-center justify-between'>
                  <span className='text-sm font-medium'>
                    Download Image Preview
                  </span>
                  <Button
                    type='button'
                    variant='destructive'
                    size='sm'
                    onClick={() => {
                      setDownloadImagePreviewUrl(null);
                      setDownloadImageLocked(false);
                      form.setValue('downloadImageMode', 'upload');
                      form.setValue('downloadImage', '', {
                        shouldValidate: true,
                        shouldDirty: true
                      });
                      form.setValue('downloadImage_file' as any, [], {
                        shouldValidate: true,
                        shouldDirty: true
                      });
                    }}
                  >
                    <IconX className='mr-2 h-4 w-4' />
                    Remove
                  </Button>
                </div>
                <ImagePreviewBox src={downloadImagePreviewUrl} />
              </div>
            )}
          </div>

          <div className='space-y-4'>
            <Tabs
              value={videoMode}
              onValueChange={(value) =>
                handleModeChange('video', value as 'upload' | 'link')
              }
            >
              <div className='space-y-2'>
                <div className='flex items-center justify-between'>
                  <FormLabel>Video</FormLabel>
                  <TabsList className='grid w-full max-w-xs grid-cols-2'>
                    <TabsTrigger value='upload'>Upload</TabsTrigger>
                    <TabsTrigger value='link'>Paste Link</TabsTrigger>
                  </TabsList>
                </div>
                {!videoLocked && (
                  <>
                    <TabsContent value='upload' className='mt-0'>
                      <FormFileUpload
                        control={form.control}
                        name={'video_file' as any}
                        config={{
                          maxSize: 100 * 1024 * 1024,
                          maxFiles: 1,
                          acceptedTypes: ['video/*'],
                          onUpload: (files) => handleUpload(files, 'video')
                        }}
                      />
                    </TabsContent>
                    <TabsContent value='link' className='mt-0'>
                      <div className='flex gap-2'>
                        <FormInput
                          control={form.control}
                          name='video'
                          placeholder='https://example.com/video.mp4'
                          type='url'
                          className='flex-1'
                        />
                        <Button
                          type='button'
                          variant='outline'
                          size='sm'
                          onClick={() => handleLinkSubmit('video')}
                        >
                          Preview
                        </Button>
                      </div>
                    </TabsContent>
                  </>
                )}
              </div>
            </Tabs>
            {videoPreviewUrl && (
              <div className='space-y-2'>
                <div className='flex items-center justify-between'>
                  <span className='text-sm font-medium'>Video Preview</span>
                  <Button
                    type='button'
                    variant='destructive'
                    size='sm'
                    onClick={() => {
                      setVideoPreviewUrl(null);
                      setVideoLocked(false);
                      form.setValue('videoMode', 'upload');
                      form.setValue('video', '', {
                        shouldValidate: true,
                        shouldDirty: true
                      });
                      form.setValue('video_file' as any, [], {
                        shouldValidate: true,
                        shouldDirty: true
                      });
                    }}
                  >
                    <IconX className='mr-2 h-4 w-4' />
                    Remove
                  </Button>
                </div>
                <ImagePreviewBox src={videoPreviewUrl} isVideo={true} />
              </div>
            )}
          </div>

          <div className='grid grid-cols-1 gap-4'>
            <FormSelect
              control={form.control}
              name='gameId'
              label='Game'
              placeholder='Select a game'
              required
              options={gameOptions}
            />
          </div>

          <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
            <FormSelect
              control={form.control}
              name='isVip'
              label='Is VIP'
              placeholder='Select VIP status'
              required
              options={[
                { label: 'ACTIVE', value: 'ACTIVE' },
                { label: 'INACTIVE', value: 'INACTIVE' }
              ]}
            />

            <FormInput
              control={form.control}
              name='levelSexy'
              label='Level Sexy'
              type='number'
              min={1}
              max={5}
              required
            />
          </div>

          <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
            <FormSelect
              control={form.control}
              name='status'
              label='Status'
              placeholder='Select status'
              required
              options={[
                { label: 'ACTIVE', value: 'ACTIVE' },
                { label: 'INACTIVE', value: 'INACTIVE' }
              ]}
            />

            <FormSelect
              control={form.control}
              name='imageType'
              label='Image Type'
              placeholder='Select image type'
              required
              options={[
                { label: 'Review', value: 'Review' },
                { label: 'Product', value: 'Product' }
              ]}
            />
          </div>

          {(onCancel || mode === 'create') && (
            <div className='flex justify-end gap-2 border-t pt-4'>
              {onCancel && (
                <Button
                  type='button'
                  variant='outline'
                  onClick={onCancel}
                  disabled={submitting}
                >
                  Cancel
                </Button>
              )}
              <Button type='submit' disabled={submitting}>
                {submitting
                  ? mode === 'create'
                    ? 'Creating...'
                    : 'Saving...'
                  : mode === 'create'
                    ? 'Create Image'
                    : 'Save Changes'}
              </Button>
            </div>
          )}
        </div>
      </Form>
    );
  }
);

ImageForm.displayName = 'ImageForm';
