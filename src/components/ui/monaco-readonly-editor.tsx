'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useTheme } from 'next-themes';
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
  height?: string;
  options?: Record<string, any>;
  onMount?: (editor: any, monaco: any) => void;
}>;

interface MonacoReadonlyEditorProps {
  value: string;
  language?: string;
  height?: string;
  className?: string;
}

export function MonacoReadonlyEditor({
  value,
  language = 'json',
  height = '400px',
  className
}: MonacoReadonlyEditorProps) {
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

    // Format the JSON on mount
    setTimeout(() => {
      editor.getAction('editor.action.formatDocument')?.run();
    }, 100);
  };

  // Format JSON value with proper indentation
  const formatJsonValue = (val: string): string => {
    try {
      const parsed = JSON.parse(val);
      return JSON.stringify(parsed, null, 2);
    } catch {
      return val;
    }
  };

  const formattedValue = formatJsonValue(value);

  return (
    <div className={cn('w-full min-w-0', className)}>
      {isMounted ? (
        <div className='overflow-hidden rounded-md border' style={{ height }}>
          <MonacoEditor
            height={height}
            language={language}
            theme={monacoTheme}
            value={formattedValue}
            onMount={handleEditorMount}
            options={{
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              fontSize: 14,
              lineNumbers: 'on',
              roundedSelection: false,
              readOnly: true,
              automaticLayout: true,
              tabSize: 2,
              wordWrap: 'on',
              // Disable validation and diagnostics
              quickSuggestions: false,
              parameterHints: { enabled: false },
              suggestOnTriggerCharacters: false,
              acceptSuggestionOnEnter: 'off',
              tabCompletion: 'off',
              wordBasedSuggestions: false,
              // Disable selection highlighting for read-only
              selectionHighlight: false,
              occurrencesHighlight: false
            }}
          />
        </div>
      ) : (
        <div
          className='bg-muted flex items-center justify-center rounded-md border'
          style={{ height }}
        >
          <p className='text-muted-foreground text-sm'>Đang tải editor...</p>
        </div>
      )}
    </div>
  );
}
