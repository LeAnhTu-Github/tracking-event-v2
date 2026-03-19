'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { FormMonacoEditor } from '@/components/forms/form-monaco-editor';
import { Image } from '@/types/image.type';
import { toast } from 'sonner';
import { useImageStore } from '@/store/useImage';

const formSchema = z.object({
  jsonData: z.string().refine(
    (val) => {
      if (!val || val.trim() === '') return true;
      try {
        JSON.parse(val);
        return true;
      } catch {
        return false;
      }
    },
    {
      message: 'Invalid JSON data'
    }
  )
});

type FormValues = z.infer<typeof formSchema>;

interface MetadataModalProps {
  isOpen: boolean;
  onClose: () => void;
  image: Image;
  currentMetadata?: Record<string, any>; // Current metadata from form/pendingChanges
  onSubmit?: (metadata: Record<string, any>) => Promise<void>;
}

export function MetadataModal({
  isOpen,
  onClose,
  image,
  currentMetadata,
  onSubmit
}: MetadataModalProps) {
  const { editingMetadata, setEditingMetadata } = useImageStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      jsonData: ''
    }
  });

  useEffect(() => {
    if (isOpen) {
      // Priority: editingMetadata from store > currentMetadata props > image.metadata
      const metadataToUse =
        editingMetadata ?? currentMetadata ?? image.metadata;
      if (metadataToUse) {
        form.reset({
          jsonData: JSON.stringify(metadataToUse, null, 2)
        });
      } else {
        form.reset({
          jsonData: '{}'
        });
      }
    }
  }, [isOpen, editingMetadata, currentMetadata, image.metadata, form]);
  const handleSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    try {
      let updatedMetadata: Record<string, any>;
      try {
        updatedMetadata = values.jsonData ? JSON.parse(values.jsonData) : {};
      } catch (error) {
        toast.error('Invalid JSON data');
        return;
      }

      setEditingMetadata(updatedMetadata);

      if (onSubmit) {
        await onSubmit(updatedMetadata);
      } else {
        await new Promise((resolve) => setTimeout(resolve, 500));
        console.log('Updated metadata:', updatedMetadata);
        toast.success('Metadata updated successfully');
      }

      onClose();
    } catch (error) {
      toast.error('Failed to update metadata');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title='Edit Metadata'
      description='Update metadata information for the image (JSON format)'
      className='sm:max-w-3xl'
    >
      <Form form={form} onSubmit={form.handleSubmit(handleSubmit)}>
        <div className='space-y-4 py-4'>
          <FormMonacoEditor
            control={form.control}
            name='jsonData'
            label='Metadata (JSON)'
            height='400px'
            language='json'
            description='Enter metadata in JSON format'
          />

          <div className='flex justify-end gap-2 pt-4'>
            <Button
              type='button'
              variant='outline'
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type='submit' disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </div>
      </Form>
    </Modal>
  );
}
