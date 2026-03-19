'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useTheme } from 'next-themes';
import { FieldPath, FieldValues } from 'react-hook-form';
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { BaseFormFieldProps } from '@/types/base-form';
import { cn } from '@/lib/utils';

// Dynamically import Monaco Editor to avoid SSR issues
const MonacoEditor = dynamic(
  () => import('@monaco-editor/react').then((mod) => mod.Editor),
  {
    ssr: false,
    loading: () => (
      <div className='bg-muted flex h-[400px] items-center justify-center rounded-md border'>
        <p className='text-muted-foreground text-sm'>Đang tải editor...</p>
      </div>
    )
  }
) as React.ComponentType<{
  language?: string;
  theme?: string;
  value?: string;
  onChange?: (value: string | undefined) => void;
  height?: string;
  options?: Record<string, any>;
  onMount?: (editor: any, monaco: any) => void;
}>;

interface FormMonacoEditorProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> extends BaseFormFieldProps<TFieldValues, TName> {
  placeholder?: string;
  height?: string;
  language?: string;
}

function FormMonacoEditor<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({
  control,
  name,
  label,
  description,
  required,
  placeholder,
  height = '400px',
  language = 'json',
  disabled,
  className
}: FormMonacoEditorProps<TFieldValues, TName>) {
  const [isMounted, setIsMounted] = useState(false);
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Determine Monaco theme based on global theme
  const monacoTheme = resolvedTheme === 'dark' ? 'vs-dark' : 'vs';

  // Handler to remove all diagnostics/warnings from editor
  const handleEditorMount = (editor: any, monaco: any) => {
    // Remove all markers (errors, warnings, info) from the editor
    const model = editor.getModel();
    if (model) {
      monaco.editor.setModelMarkers(model, 'default', []);
    }

    // Disable diagnostics for the editor
    monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
      validate: false,
      allowComments: true,
      schemas: [],
      enableSchemaRequest: false
    });

    // Also disable other language diagnostics if needed
    if (language === 'javascript' || language === 'typescript') {
      monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
        noSemanticValidation: true,
        noSyntaxValidation: false
      });
    }
  };

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={cn('w-full min-w-0', className)}>
          {label && (
            <FormLabel>
              {label}
              {required && <span className='ml-1 text-red-500'>*</span>}
            </FormLabel>
          )}
          <FormControl>
            <div className='w-full min-w-0'>
              {isMounted ? (
                <div
                  className='overflow-hidden rounded-md border'
                  style={{ height }}
                >
                  <MonacoEditor
                    height={height}
                    language={language}
                    theme={monacoTheme}
                    value={field.value || ''}
                    onChange={(value: string | undefined) =>
                      field.onChange(value || '')
                    }
                    onMount={handleEditorMount}
                    options={{
                      minimap: { enabled: false },
                      scrollBeyondLastLine: false,
                      fontSize: 14,
                      lineNumbers: 'on',
                      roundedSelection: false,
                      readOnly: disabled,
                      automaticLayout: true,
                      formatOnPaste: true,
                      formatOnType: true,
                      tabSize: 2,
                      wordWrap: 'on',
                      // Disable validation and diagnostics
                      quickSuggestions: false,
                      parameterHints: { enabled: false },
                      suggestOnTriggerCharacters: false,
                      acceptSuggestionOnEnter: 'off',
                      tabCompletion: 'off',
                      wordBasedSuggestions: false
                    }}
                  />
                </div>
              ) : (
                <div
                  className='bg-muted flex items-center justify-center rounded-md border'
                  style={{ height }}
                >
                  <p className='text-muted-foreground text-sm'>
                    Đang tải editor...
                  </p>
                </div>
              )}
            </div>
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

export { FormMonacoEditor };
