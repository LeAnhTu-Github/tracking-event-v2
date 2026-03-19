'use client';

import * as React from 'react';
import { Check, Copy, Search, UserMinus } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import dataExplorerService from '@/services/data-explorer.service';

type DropUserModalProps = {
  isOpen: boolean;
  appId: number;
  startDate: string;
  endDate: string;
  defaultLevel: string;
  onClose: () => void;
  onPickUuid: (uuid: string) => void;
};

export default function DropUserModal({
  isOpen,
  appId,
  startDate,
  endDate,
  defaultLevel,
  onClose,
  onPickUuid
}: DropUserModalProps) {
  const [level, setLevel] = React.useState(defaultLevel);
  const [isLoading, setIsLoading] = React.useState(false);
  const [result, setResult] = React.useState<{
    totalStart: number;
    totalWin: number;
    droppedCount: number;
    uuids: string[];
  } | null>(null);

  React.useEffect(() => {
    if (!isOpen) return;
    setLevel(defaultLevel);
    setResult(null);
  }, [isOpen, defaultLevel]);

  const handleSearch = async () => {
    if (!level.trim()) {
      toast.error('Please input level');
      return;
    }
    setIsLoading(true);
    setResult(null);
    try {
      const json = await dataExplorerService.getDroppedUsers({
        appId,
        level: level.trim(),
        startDate,
        endDate
      });
      if (!json.success) {
        toast.error(json.error || 'DropUser search failed');
        return;
      }
      setResult({
        totalStart: json.total_start,
        totalWin: json.total_win,
        droppedCount: json.dropped_count,
        uuids: json.dropped_uuids
      });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'DropUser search failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async () => {
    const list = result?.uuids ?? [];
    if (list.length === 0) return;
    await navigator.clipboard.writeText(list.join('\n'));
    toast.success('Copied UUID list');
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className='w-[calc(100vw-1.5rem)] max-h-[90vh] overflow-hidden sm:max-w-3xl'>
        <DialogHeader className='text-left'>
          <DialogTitle className='flex items-center gap-2'>
            <UserMinus className='h-4 w-4 text-orange-600' /> Tìm DropUser
          </DialogTitle>
          <div className='mt-1 text-xs text-muted-foreground'>
            Range: <span className='font-mono'>{startDate}</span> →{' '}
            <span className='font-mono'>{endDate}</span>
          </div>
        </DialogHeader>

        <div className='space-y-4'>
          <div className='flex items-end gap-2'>
            <div className='flex-1'>
              <Label>Check Level</Label>
              <Input
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                placeholder='VD: 0'
                type='number'
                className='mt-2'
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <Button type='button' onClick={handleSearch} disabled={isLoading} className='h-9'>
              {isLoading ? (
                <>
                  <span className='mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent' />
                  Loading
                </>
              ) : (
                <>
                  <Search className='mr-2 h-4 w-4' /> Search
                </>
              )}
            </Button>
          </div>

          {result && (
            <div className='space-y-3'>
              <div className='grid grid-cols-3 gap-2'>
                <div className='rounded-md border bg-muted/30 p-3 text-center'>
                  <div className='text-[11px] font-bold text-muted-foreground'>User Start</div>
                  <div className='text-xl font-black'>{result.totalStart}</div>
                </div>
                <div className='rounded-md border bg-muted/30 p-3 text-center'>
                  <div className='text-[11px] font-bold text-muted-foreground'>User Win</div>
                  <div className='text-xl font-black text-blue-600'>{result.totalWin}</div>
                </div>
                <div className='rounded-md border bg-red-50 p-3 text-center'>
                  <div className='text-[11px] font-bold text-red-600'>Dropped</div>
                  <div className='text-xl font-black text-red-600'>{result.droppedCount}</div>
                </div>
              </div>

              <div className='flex items-center justify-between gap-2'>
                <div className='text-xs font-bold text-muted-foreground'>
                  List UUID (user_id) drop
                </div>
                <Button
                  type='button'
                  variant='outline'
                  size='sm'
                  className='h-8'
                  onClick={handleCopy}
                  disabled={(result.uuids ?? []).length === 0}
                >
                  <Copy className='mr-2 h-4 w-4' /> Copy List
                </Button>
              </div>

              <div className='max-h-[320px] overflow-auto rounded-md border bg-slate-900 p-2 font-mono text-xs text-slate-100'>
                {(result.uuids ?? []).length === 0 ? (
                  <div className='p-6 text-center text-slate-400 italic'>No dropped user</div>
                ) : (
                  <div className='flex flex-col gap-1'>
                    {result.uuids.map((uuid) => (
                      <button
                        key={uuid}
                        type='button'
                        className='flex items-center justify-between rounded px-2 py-2 text-left hover:bg-slate-800'
                        onClick={() => onPickUuid(uuid)}
                        title='Click to filter by this uuid'
                      >
                        <span>{uuid}</span>
                        <Check className='h-4 w-4 opacity-60' />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

