'use client';

import { useRef, useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface ImagePreviewBoxProps {
  src: string;
  title?: string;
  isVideo?: boolean;
}

export function ImagePreviewBox({
  src,
  title,
  isVideo = false
}: ImagePreviewBoxProps) {
  const [imageSize, setImageSize] = useState<{
    width: number;
    height: number;
  } | null>(null);
  const [displayedImageSize, setDisplayedImageSize] = useState<{
    width: number;
    height: number;
  } | null>(null);
  const imageRef = useRef<HTMLImageElement | HTMLVideoElement>(null);

  const handleImageLoad = () => {
    if (imageRef.current && 'naturalWidth' in imageRef.current) {
      setImageSize({
        width: imageRef.current.naturalWidth,
        height: imageRef.current.naturalHeight
      });
      const rect = imageRef.current.getBoundingClientRect();
      setDisplayedImageSize({
        width: rect.width,
        height: rect.height
      });
    }
  };

  useEffect(() => {
    const updateDisplayedSize = () => {
      if (imageRef.current && 'getBoundingClientRect' in imageRef.current) {
        const rect = imageRef.current.getBoundingClientRect();
        setDisplayedImageSize({
          width: rect.width,
          height: rect.height
        });
      }
    };

    if (src) {
      window.addEventListener('resize', updateDisplayedSize);
      const timeoutId = setTimeout(updateDisplayedSize, 100);

      return () => {
        window.removeEventListener('resize', updateDisplayedSize);
        clearTimeout(timeoutId);
      };
    }
  }, [src]);

  if (!src) {
    return null;
  }

  return (
    <Card>
      <CardContent className='pt-6'>
        <div className='space-y-2'>
          {title && (
            <div className='text-muted-foreground text-sm font-medium'>
              {title}
            </div>
          )}
          <div className='bg-muted/20 flex justify-center overflow-auto rounded-lg border p-4'>
            <div className='relative inline-block'>
              {isVideo ? (
                <video
                  ref={imageRef as React.RefObject<HTMLVideoElement>}
                  src={src}
                  controls
                  className='max-h-[400px] w-full object-contain'
                  onLoadedMetadata={handleImageLoad}
                />
              ) : (
                <img
                  ref={imageRef as React.RefObject<HTMLImageElement>}
                  src={src}
                  alt={title || 'Preview'}
                  onLoad={handleImageLoad}
                  onError={(e) => {
                    const img = e.currentTarget;
                    img.src = src;
                  }}
                  className='max-h-[400px] w-full rounded-md object-contain'
                  draggable={false}
                  style={{ display: 'block' }}
                />
              )}
            </div>
          </div>
          {imageSize && displayedImageSize && !isVideo && (
            <div className='text-muted-foreground text-xs'>
              Image size: {imageSize.width} × {imageSize.height} px
              {displayedImageSize.width !== imageSize.width ||
              displayedImageSize.height !== imageSize.height ? (
                <span className='ml-2'>
                  (Displayed: {Math.round(displayedImageSize.width)} ×{' '}
                  {Math.round(displayedImageSize.height)} px)
                </span>
              ) : null}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
