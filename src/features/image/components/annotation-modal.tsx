'use client';

import { useState } from 'react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import ImageAnnotationView, {
  AnnotationData
} from '@/features/image/components/image-annotation-view';
import { Annotation } from '@/types/image.type';
import { toast } from 'sonner';
import { useImageStore } from '@/store/useImage';

interface AnnotationModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  initialAnnotations?: Annotation[];
  onSubmit?: (annotationData: AnnotationData | null) => Promise<void>;
}

export function AnnotationModal({
  isOpen,
  onClose,
  imageUrl,
  initialAnnotations = [],
  onSubmit
}: AnnotationModalProps) {
  const { editingAnnotation, setEditingAnnotation } = useImageStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSave = async (annotationData: AnnotationData | null) => {
    setIsSubmitting(true);
    try {
      setEditingAnnotation(annotationData);

      if (onSubmit) {
        await onSubmit(annotationData);
      } else {
        await new Promise((resolve) => setTimeout(resolve, 500));
        console.log('Updated annotations:', annotationData);
        toast.success('Annotations updated successfully');
      }

      onClose();
    } catch (error) {
      toast.error('Failed to update annotations');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title='Edit Annotations'
      description='Update annotations for the full image'
      className='sm:max-w-5xl'
    >
      <div className='py-4'>
        <ImageAnnotationView
          initialImage={imageUrl}
          initialAnnotations={
            editingAnnotation?.detections?.map((det: any, index: number) => ({
              id: det.id || index + 1,
              label: det.label,
              bbox_norm: det.bbox_norm,
              geometry: {
                x: det.bbox_norm.x,
                y: det.bbox_norm.y,
                width: det.bbox_norm.w,
                height: det.bbox_norm.h
              }
            })) ?? initialAnnotations
          }
          onSave={handleSave}
        />
        <div className='mt-4 flex justify-end gap-2 border-t pt-4'>
          <Button
            type='button'
            variant='outline'
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
        </div>
      </div>
    </Modal>
  );
}
