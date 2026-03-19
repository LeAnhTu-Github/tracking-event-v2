'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  IconRotateClockwise,
  IconArrowLeft,
  IconCheck
} from '@tabler/icons-react';
import { useRef, useState, useEffect, useCallback } from 'react';

interface AnnotationGeometry {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface BBox {
  x: number;
  y: number;
  w: number;
  h: number;
  x_min: number;
  y_min: number;
  x_max: number;
  y_max: number;
}

type LabelType = 'face' | 'chest_breast' | 'groin_pubic';

interface Annotation {
  geometry: AnnotationGeometry;
  bbox_px: BBox;
  bbox_norm: BBox;
  thumbnail: string;
  id: number;
  label: LabelType | '';
}

function calculatePixelCoordinates(
  geometry: AnnotationGeometry,
  displayedWidth: number,
  displayedHeight: number,
  naturalWidth: number,
  naturalHeight: number
): BBox {
  const scaleX = naturalWidth / displayedWidth;
  const scaleY = naturalHeight / displayedHeight;

  const x = geometry.x * scaleX;
  const y = geometry.y * scaleY;
  const w = geometry.width * scaleX;
  const h = geometry.height * scaleY;

  return {
    x: Math.round(x),
    y: Math.round(y),
    w: Math.round(w),
    h: Math.round(h),
    x_min: Math.round(x),
    y_min: Math.round(y),
    x_max: Math.round(x + w),
    y_max: Math.round(y + h)
  };
}
function calculateNormalizedCoordinates(
  bbox_px: BBox,
  naturalWidth: number,
  naturalHeight: number
): BBox {
  return {
    x: Math.round((bbox_px.x / naturalWidth) * 10000) / 10000,
    y: Math.round((bbox_px.y / naturalHeight) * 10000) / 10000,
    w: Math.round((bbox_px.w / naturalWidth) * 10000) / 10000,
    h: Math.round((bbox_px.h / naturalHeight) * 10000) / 10000,
    x_min: Math.round((bbox_px.x_min / naturalWidth) * 10000) / 10000,
    y_min: Math.round((bbox_px.y_min / naturalHeight) * 10000) / 10000,
    x_max: Math.round((bbox_px.x_max / naturalWidth) * 10000) / 10000,
    y_max: Math.round((bbox_px.y_max / naturalHeight) * 10000) / 10000
  };
}

function isSameOrigin(url: string): boolean {
  try {
    const parsed = new URL(url, window.location.href);
    return parsed.origin === window.location.origin;
  } catch {
    return false;
  }
}

function createThumbnail(
  image: HTMLImageElement,
  geometry: AnnotationGeometry,
  displayedWidth: number,
  displayedHeight: number,
  naturalWidth: number,
  naturalHeight: number
): string {
  try {
    if (!isSameOrigin(image.src)) {
      return '';
    }

    const scaleX = naturalWidth / displayedWidth;
    const scaleY = naturalHeight / displayedHeight;

    const x = geometry.x * scaleX;
    const y = geometry.y * scaleY;
    const w = Math.max(1, geometry.width * scaleX);
    const h = Math.max(1, geometry.height * scaleY);

    const clampedX = Math.max(0, Math.min(x, naturalWidth - 1));
    const clampedY = Math.max(0, Math.min(y, naturalHeight - 1));
    const clampedW = Math.max(1, Math.min(w, naturalWidth - clampedX));
    const clampedH = Math.max(1, Math.min(h, naturalHeight - clampedY));

    const canvas = document.createElement('canvas');
    canvas.width = clampedW;
    canvas.height = clampedH;

    const ctx = canvas.getContext('2d');
    if (!ctx) return '';

    ctx.drawImage(
      image,
      clampedX,
      clampedY,
      clampedW,
      clampedH,
      0,
      0,
      clampedW,
      clampedH
    );

    try {
      return canvas.toDataURL('image/png');
    } catch (corsError) {
      console.warn(
        'Cannot create thumbnail due to CORS restrictions:',
        corsError
      );
      return '';
    }
  } catch (error) {
    console.error('Error creating thumbnail:', error);
    return '';
  }
}

export interface AnnotationData {
  version: string;
  image: {
    width: number;
    height: number;
  };
  detections: Array<{
    id: number;
    label: LabelType;
    bbox_norm: BBox;
  }>;
}

interface ImageAnnotationViewProps {
  initialImage?: string;
  initialAnnotations?: Annotation[];
  onSave?: (annotationData: AnnotationData | null) => void;
}

export default function ImageAnnotationView({
  initialImage,
  initialAnnotations,
  onSave
}: ImageAnnotationViewProps = {}) {
  const [imagePreview, setImagePreview] = useState<string | null>(
    initialImage || null
  );
  const [annotations, setAnnotations] = useState<Annotation[]>(
    initialAnnotations || []
  );
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState<{ x: number; y: number } | null>(
    null
  );
  const [currentRect, setCurrentRect] = useState<AnnotationGeometry | null>(
    null
  );
  const [imageSize, setImageSize] = useState<{
    width: number;
    height: number;
  } | null>(null);
  const [displayedImageSize, setDisplayedImageSize] = useState<{
    width: number;
    height: number;
  } | null>(null);
  const [hasInitializedFromProps, setHasInitializedFromProps] = useState(false);

  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (initialImage) {
      setImagePreview(initialImage);
      setAnnotations([]);
      setHasInitializedFromProps(false);
    }
  }, [initialImage]);

  useEffect(() => {
    if (
      hasInitializedFromProps ||
      !initialAnnotations ||
      initialAnnotations.length === 0 ||
      !displayedImageSize ||
      !imageRef.current ||
      !imageSize
    ) {
      return;
    }

    const rect = imageRef.current.getBoundingClientRect();
    const displayedWidth = rect.width;
    const displayedHeight = rect.height;

    const mapped = initialAnnotations.map((ann) => {
      const geometry: AnnotationGeometry = {
        x: ann.bbox_norm.x * displayedImageSize.width,
        y: ann.bbox_norm.y * displayedImageSize.height,
        width: ann.bbox_norm.w * displayedImageSize.width,
        height: ann.bbox_norm.h * displayedImageSize.height
      };
      const generatedThumb = createThumbnail(
        imageRef.current!,
        geometry,
        displayedWidth,
        displayedHeight,
        imageSize.width,
        imageSize.height
      );
      const thumbnail = generatedThumb || '';

      return {
        ...ann,
        geometry,
        thumbnail
      };
    });

    setAnnotations(mapped);
    setHasInitializedFromProps(true);
  }, [
    initialAnnotations,
    displayedImageSize,
    imageSize,
    imagePreview,
    hasInitializedFromProps
  ]);

  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  const handleImageLoad = () => {
    if (imageRef.current) {
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
      if (imageRef.current) {
        const rect = imageRef.current.getBoundingClientRect();
        setDisplayedImageSize({
          width: rect.width,
          height: rect.height
        });
      }
    };

    if (imagePreview) {
      window.addEventListener('resize', updateDisplayedSize);
      const timeoutId = setTimeout(updateDisplayedSize, 100);

      return () => {
        window.removeEventListener('resize', updateDisplayedSize);
        clearTimeout(timeoutId);
      };
    }
  }, [imagePreview]);

  const getRelativePosition = useCallback(
    (clientX: number, clientY: number): { x: number; y: number } | null => {
      if (!imageRef.current || !containerRef.current) return null;

      const rect = imageRef.current.getBoundingClientRect();
      const containerRect = containerRef.current.getBoundingClientRect();

      const x = clientX - rect.left;
      const y = clientY - rect.top;

      if (x < 0 || y < 0 || x > rect.width || y > rect.height) {
        return null;
      }

      return { x, y };
    },
    []
  );

  const calculateRect = useCallback(
    (
      start: { x: number; y: number },
      end: { x: number; y: number }
    ): AnnotationGeometry => {
      const x = Math.min(start.x, end.x);
      const y = Math.min(start.y, end.y);
      const width = Math.abs(end.x - start.x);
      const height = Math.abs(end.y - start.y);

      return { x, y, width, height };
    },
    []
  );

  const handleStart = useCallback(
    (clientX: number, clientY: number) => {
      const pos = getRelativePosition(clientX, clientY);
      if (pos) {
        setIsDrawing(true);
        setStartPos(pos);
        setCurrentRect({ x: pos.x, y: pos.y, width: 0, height: 0 });
      }
    },
    [getRelativePosition]
  );
  const handleMove = useCallback(
    (clientX: number, clientY: number) => {
      if (!isDrawing || !startPos) return;

      const pos = getRelativePosition(clientX, clientY);
      if (pos) {
        const rect = calculateRect(startPos, pos);
        setCurrentRect(rect);
      }
    },
    [isDrawing, startPos, getRelativePosition, calculateRect]
  );
  const handleEnd = useCallback(() => {
    if (!isDrawing || !startPos || !currentRect) {
      setIsDrawing(false);
      setStartPos(null);
      setCurrentRect(null);
      return;
    }

    if (
      currentRect.width >= 5 &&
      currentRect.height >= 5 &&
      imageSize &&
      imageRef.current
    ) {
      const rect = imageRef.current.getBoundingClientRect();
      const displayedWidth = rect.width;
      const displayedHeight = rect.height;

      const isDuplicate = annotations.some(
        (ann) =>
          Math.abs(ann.geometry.x - currentRect.x) < 1 &&
          Math.abs(ann.geometry.y - currentRect.y) < 1 &&
          Math.abs(ann.geometry.width - currentRect.width) < 1 &&
          Math.abs(ann.geometry.height - currentRect.height) < 1
      );

      if (!isDuplicate) {
        if (saveTimeoutRef.current) {
          clearTimeout(saveTimeoutRef.current);
        }

        saveTimeoutRef.current = setTimeout(() => {
          const bbox_px = calculatePixelCoordinates(
            currentRect,
            displayedWidth,
            displayedHeight,
            imageSize.width,
            imageSize.height
          );

          const bbox_norm = calculateNormalizedCoordinates(
            bbox_px,
            imageSize.width,
            imageSize.height
          );

          const generatedThumb = createThumbnail(
            imageRef.current!,
            currentRect,
            displayedWidth,
            displayedHeight,
            imageSize.width,
            imageSize.height
          );

          const thumbnail = generatedThumb || '';

          setAnnotations((prev) => [
            ...prev,
            {
              geometry: currentRect,
              bbox_px,
              bbox_norm,
              thumbnail,
              id: Date.now() + Math.random(),
              label: '' as LabelType | ''
            }
          ]);
          setCurrentRect(null);
        }, 50);
      }
    }

    setIsDrawing(false);
    setStartPos(null);
  }, [isDrawing, startPos, currentRect, annotations, imageSize, imagePreview]);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      handleStart(e.clientX, e.clientY);
    },
    [handleStart]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      handleMove(e.clientX, e.clientY);
    },
    [handleMove]
  );

  const handleMouseUp = useCallback(() => {
    handleEnd();
  }, [handleEnd]);

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      e.preventDefault();
      const touch = e.touches[0];
      if (touch) {
        handleStart(touch.clientX, touch.clientY);
      }
    },
    [handleStart]
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      e.preventDefault();
      const touch = e.touches[0];
      if (touch) {
        handleMove(touch.clientX, touch.clientY);
      }
    },
    [handleMove]
  );

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      e.preventDefault();
      handleEnd();
    },
    [handleEnd]
  );

  useEffect(() => {
    const handleGlobalMouseUp = () => {
      if (isDrawing) {
        handleEnd();
      }
    };

    if (isDrawing) {
      window.addEventListener('mouseup', handleGlobalMouseUp);
      return () => {
        window.removeEventListener('mouseup', handleGlobalMouseUp);
      };
    }
  }, [isDrawing, handleEnd]);

  const handleReset = () => {
    setAnnotations([]);
    setCurrentRect(null);
    setStartPos(null);
    setIsDrawing(false);
  };

  const handleBack = () => {
    setAnnotations((prev) => {
      if (prev.length === 0) return prev;
      return prev.slice(0, -1);
    });
  };

  const handleLabelChange = (annotationId: number, label: LabelType) => {
    setAnnotations((prev) =>
      prev.map((ann) => (ann.id === annotationId ? { ...ann, label } : ann))
    );
  };

  const LABEL_OPTIONS: { value: LabelType; label: string }[] = [
    { value: 'face', label: 'Face' },
    { value: 'chest_breast', label: 'Chest/Breast' },
    { value: 'groin_pubic', label: 'Groin/Pubic' }
  ];

  const handleSubmit = () => {
    if (!imageSize || annotations.length === 0) {
      if (onSave) {
        onSave(null);
      }
      return;
    }

    const detections = annotations.map((ann, index) => ({
      id: index + 1,
      label: (ann.label || 'face') as LabelType,
      bbox_norm: ann.bbox_norm
    }));

    const result: AnnotationData = {
      version: '1.0',
      image: {
        width: imageSize.width,
        height: imageSize.height
      },
      detections
    };

    if (onSave) {
      onSave(result);
    }
    return result;
  };

  if (!imagePreview) {
    return (
      <div className='flex items-center justify-center py-12'>
        <p className='text-muted-foreground'>Không có ảnh để khoanh vùng</p>
      </div>
    );
  }

  return (
    <div className='flex flex-col gap-6'>
      <Card>
        <CardHeader>
          <CardTitle>Image Annotation</CardTitle>
          <CardDescription>
            Click and drag to select regions on the image
            {imageSize && displayedImageSize && (
              <span className='mt-1 block'>
                Image size: {imageSize.width} × {imageSize.height} px
                {displayedImageSize.width !== imageSize.width ||
                displayedImageSize.height !== imageSize.height ? (
                  <span className='text-muted-foreground'>
                    {' '}
                    (Displayed: {Math.round(displayedImageSize.width)} ×{' '}
                    {Math.round(displayedImageSize.height)} px)
                  </span>
                ) : null}
              </span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='flex flex-col gap-4'>
            <div
              ref={containerRef}
              className='bg-muted/20 flex justify-center overflow-auto rounded-lg border p-4'
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              <div className='relative inline-block'>
                <img
                  ref={imageRef}
                  src={imagePreview}
                  alt='Annotated image'
                  onLoad={handleImageLoad}
                  className='h-auto max-w-full select-none'
                  draggable={false}
                  style={{ display: 'block' }}
                />
                {annotations.map((annotation) => (
                  <div
                    key={annotation.id}
                    className='pointer-events-none absolute border-2 border-blue-500 bg-blue-500/20'
                    style={{
                      left: `${annotation.geometry.x}px`,
                      top: `${annotation.geometry.y}px`,
                      width: `${annotation.geometry.width}px`,
                      height: `${annotation.geometry.height}px`
                    }}
                  />
                ))}
                {currentRect &&
                  currentRect.width > 0 &&
                  currentRect.height > 0 && (
                    <div
                      className='pointer-events-none absolute border-2 border-red-500 bg-red-500/20'
                      style={{
                        left: `${currentRect.x}px`,
                        top: `${currentRect.y}px`,
                        width: `${currentRect.width}px`,
                        height: `${currentRect.height}px`
                      }}
                    />
                  )}
                {isDrawing && (
                  <div className='pointer-events-none absolute inset-0 cursor-crosshair' />
                )}
              </div>
            </div>

            <div className='flex gap-2'>
              <Button
                variant='outline'
                size='sm'
                onClick={handleBack}
                disabled={annotations.length === 0}
              >
                <IconArrowLeft className='mr-2 h-4 w-4' />
                Back (Undo Last)
              </Button>
              <Button
                variant='destructive'
                size='sm'
                onClick={handleReset}
                disabled={annotations.length === 0}
              >
                <IconRotateClockwise className='mr-2 h-4 w-4' />
                Reset All
              </Button>
              <Button
                variant='default'
                size='sm'
                onClick={handleSubmit}
                disabled={annotations.length === 0}
                className='ml-auto'
              >
                <IconCheck className='mr-2 h-4 w-4' />
                Submit
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Selected Regions</CardTitle>
          <CardDescription>
            List of coordinates for all selected regions with thumbnails
          </CardDescription>
        </CardHeader>
        <CardContent>
          {annotations.length > 0 ? (
            <div className='space-y-4'>
              {annotations.map((item, index) => (
                <div
                  key={item.id}
                  className='bg-muted/30 rounded-lg border p-4'
                >
                  <div className='mb-4 flex gap-4'>
                    <div className='shrink-0'>
                      {item.thumbnail && (
                        <img
                          src={item.thumbnail}
                          alt={`Region ${index + 1} thumbnail`}
                          className='h-24 w-24 rounded border object-cover'
                        />
                      )}
                    </div>
                    <div className='flex-1'>
                      <div className='mb-2 flex items-center justify-between'>
                        <div className='font-semibold'>Region {index + 1}</div>
                        <Select
                          value={item.label || undefined}
                          onValueChange={(value) =>
                            handleLabelChange(item.id, value as LabelType)
                          }
                        >
                          <SelectTrigger className='w-[180px]'>
                            <SelectValue placeholder='Select label' />
                          </SelectTrigger>
                          <SelectContent>
                            {LABEL_OPTIONS.map((option) => (
                              <SelectItem
                                key={option.value}
                                value={option.value}
                              >
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className='grid grid-cols-2 gap-3 text-sm md:grid-cols-4'>
                        <div>
                          <span className='text-muted-foreground'>x: </span>
                          <span className='font-mono'>
                            {item.bbox_norm.x.toFixed(4)}
                          </span>
                        </div>
                        <div>
                          <span className='text-muted-foreground'>y: </span>
                          <span className='font-mono'>
                            {item.bbox_norm.y.toFixed(4)}
                          </span>
                        </div>
                        <div>
                          <span className='text-muted-foreground'>w: </span>
                          <span className='font-mono'>
                            {item.bbox_norm.w.toFixed(4)}
                          </span>
                        </div>
                        <div>
                          <span className='text-muted-foreground'>h: </span>
                          <span className='font-mono'>
                            {item.bbox_norm.h.toFixed(4)}
                          </span>
                        </div>
                        <div>
                          <span className='text-muted-foreground'>x_min: </span>
                          <span className='font-mono'>
                            {item.bbox_norm.x_min.toFixed(4)}
                          </span>
                        </div>
                        <div>
                          <span className='text-muted-foreground'>y_min: </span>
                          <span className='font-mono'>
                            {item.bbox_norm.y_min.toFixed(4)}
                          </span>
                        </div>
                        <div>
                          <span className='text-muted-foreground'>x_max: </span>
                          <span className='font-mono'>
                            {item.bbox_norm.x_max.toFixed(4)}
                          </span>
                        </div>
                        <div>
                          <span className='text-muted-foreground'>y_max: </span>
                          <span className='font-mono'>
                            {item.bbox_norm.y_max.toFixed(4)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className='text-muted-foreground py-8 text-center'>
              No regions selected yet. Click and drag on the image to select a
              region.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
