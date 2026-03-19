'use client';

import * as React from 'react';
import { Check, Copy } from 'lucide-react';
import { useForm } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Form } from '@/components/ui/form';
import { FormMonacoEditor } from '@/components/forms/form-monaco-editor';
import type { TrackingEventRow } from '@/features/data-explorer/types';

type EventJsonModalProps = {
  row: TrackingEventRow | null;
  onClose: () => void;
};

const COPY_RESET_DELAY_MS = 2000;

type FormValues = {
  jsonData: string;
};

const safeStringify = (value: unknown) => {
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
};

export default function EventJsonModal({ row, onClose }: EventJsonModalProps) {
  const [hasCopied, setHasCopied] = React.useState(false);

  const jsonString = React.useMemo(
    () => (row ? safeStringify(row.event_json) : ''),
    [row]
  );

  const form = useForm<FormValues>({
    defaultValues: {
      jsonData: ''
    }
  });

  React.useEffect(() => {
    form.reset({ jsonData: jsonString });
  }, [form, jsonString]);

  const handleCopy = async () => {
    if (!jsonString) return;
    await navigator.clipboard.writeText(jsonString);
    setHasCopied(true);
    window.setTimeout(() => setHasCopied(false), COPY_RESET_DELAY_MS);
  };

  return (
    <Dialog open={!!row} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className='w-[calc(100vw-1.5rem)] max-h-[90vh] overflow-hidden sm:max-w-4xl lg:max-w-5xl'>
        <div className='flex min-w-0 items-start gap-3 pr-10'>
          <div className='min-w-0 flex-1'>
            <DialogHeader className='p-0 text-left'>
              <DialogTitle className='truncate'>
                Event Detail {row ? `#${row.id}` : ''}
              </DialogTitle>
            </DialogHeader>
            {row && (
              <div className='mt-1 truncate font-mono text-xs text-muted-foreground'>
                {row.event_name} • {row.created_at}
              </div>
            )}
          </div>
          <Button
            type='button'
            variant='outline'
            size='sm'
            className='shrink-0'
            onClick={handleCopy}
            disabled={!row}
          >
            {hasCopied ? <Check /> : <Copy />}
            {hasCopied ? 'Copied' : 'Copy JSON'}
          </Button>
        </div>

        <div className='min-h-0 flex-1 overflow-hidden'>
          <Form form={form} onSubmit={(e) => e.preventDefault()} className='min-h-0'>
            <FormMonacoEditor
              control={form.control}
              name='jsonData'
              label='Event JSON'
              height='60vh'
              language='json'
              disabled
              description='Read-only JSON view'
            />
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}

