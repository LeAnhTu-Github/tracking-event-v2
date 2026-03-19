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

interface EmbeddingModalProps {
  isOpen: boolean;
  onClose: () => void;
  image: Image;
  currentEmbedding?: Record<string, any>; // Current embedding from form/pendingChanges
  onSubmit?: (embedding: Record<string, any>) => Promise<void>;
}

export function EmbeddingModal({
  isOpen,
  onClose,
  image,
  currentEmbedding,
  onSubmit
}: EmbeddingModalProps) {
  const { editingEmbedding, setEditingEmbedding } = useImageStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      jsonData: ''
    }
  });

  useEffect(() => {
    if (isOpen) {
      // Priority: editingEmbedding from store > currentEmbedding props > image.embedding
      const embeddingToUse =
        editingEmbedding ?? currentEmbedding ?? image.embedding;
      if (embeddingToUse) {
        form.reset({
          jsonData: JSON.stringify(embeddingToUse, null, 2)
        });
      } else {
        form.reset({
          jsonData: '{}'
        });
      }
    }
  }, [isOpen, editingEmbedding, currentEmbedding, image.embedding, form]);

  const handleSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    try {
      let updatedEmbedding: Record<string, any>;
      try {
        updatedEmbedding = values.jsonData ? JSON.parse(values.jsonData) : {};
      } catch (error) {
        toast.error('Invalid JSON data');
        return;
      }

      setEditingEmbedding(updatedEmbedding);

      if (onSubmit) {
        await onSubmit(updatedEmbedding);
      } else {
        // Fallback: simulate API call if no onSubmit provided
        await new Promise((resolve) => setTimeout(resolve, 500));
        console.log('Updated embedding:', updatedEmbedding);
        toast.success('Embedding updated successfully');
      }

      onClose();
    } catch (error) {
      toast.error('Failed to update embedding');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title='Edit Embedding'
      description='Update embedding information for the image (JSON format)'
      className='sm:max-w-3xl'
    >
      <Form form={form} onSubmit={form.handleSubmit(handleSubmit)}>
        <div className='max-w-full space-y-4 py-4'>
          <FormMonacoEditor
            control={form.control}
            name='jsonData'
            label='Embedding (JSON)'
            height='400px'
            language='json'
            description='Enter embedding data in JSON format'
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
