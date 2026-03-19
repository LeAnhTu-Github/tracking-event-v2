import * as React from 'react';
import { Database, Gamepad2, Plus, Save, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export type AnalyticsConfig = {
  events: {
    level_start: string;
    level_win: string;
    level_fail: string;
  };
  boosters: {
    event_name: string;
    display_name: string;
    coin_cost: number;
  }[];
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appName?: string;
  analyticsData: AnalyticsConfig;
  setAnalyticsData: React.Dispatch<React.SetStateAction<AnalyticsConfig>>;
  onSave: () => void | Promise<void>;
};

export function EventMappingModal({
  open,
  onOpenChange,
  appName,
  analyticsData,
  setAnalyticsData,
  onSave
}: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-h-[70dvh] w-[calc(100vw-1.5rem)] max-w-none overflow-y-auto p-3 sm:max-h-[80vh] sm:w-[calc(100vw-2.5rem)] sm:max-w-3xl sm:p-6'>
        <DialogHeader className='pr-6'>
          <DialogTitle className='flex items-start gap-2 pr-2 text-lg leading-tight sm:items-center sm:text-2xl'>
            <Database className='h-5 w-5 text-indigo-600' />
            <span className='wrap-break-word'>Event Mapping: {appName || '-'}</span>
          </DialogTitle>
        </DialogHeader>

        <div className='space-y-4 sm:space-y-6'>
          <div className='rounded-lg border bg-slate-50 p-3 sm:p-4'>
            <h4 className='mb-3 flex items-center gap-2 text-base font-bold sm:mb-4 sm:text-xl'>
              <Gamepad2 size={18} /> Level Events Definition
            </h4>

            <div className='grid grid-cols-1 gap-3 md:grid-cols-3'>
              <div>
                <Label className='mb-1 block text-[11px] tracking-wide uppercase sm:text-xs'>
                  Start Level Event
                </Label>
                <Input
                  value={analyticsData.events.level_start}
                  onChange={(e) =>
                    setAnalyticsData((prev) => ({
                      ...prev,
                      events: { ...prev.events, level_start: e.target.value }
                    }))
                  }
                  placeholder='level_start'
                />
              </div>
              <div>
                <Label className='mb-1 block text-[11px] tracking-wide uppercase sm:text-xs'>
                  Win Level Event
                </Label>
                <Input
                  value={analyticsData.events.level_win}
                  onChange={(e) =>
                    setAnalyticsData((prev) => ({
                      ...prev,
                      events: { ...prev.events, level_win: e.target.value }
                    }))
                  }
                  placeholder='mission_completed'
                />
              </div>
              <div>
                <Label className='mb-1 block text-[11px] tracking-wide uppercase sm:text-xs'>
                  Fail Level Event
                </Label>
                <Input
                  value={analyticsData.events.level_fail}
                  onChange={(e) =>
                    setAnalyticsData((prev) => ({
                      ...prev,
                      events: { ...prev.events, level_fail: e.target.value }
                    }))
                  }
                  placeholder='mission_failed'
                />
              </div>
            </div>
          </div>

          <div className='rounded-lg border bg-slate-50 p-3 sm:p-4'>
            <div className='mb-4 flex items-center justify-between'>
              <h4 className='text-base font-bold sm:text-lg'>Booster Config</h4>
              <Button
                size='sm'
                className='h-8 px-2.5 text-xs sm:h-9 sm:px-3 sm:text-sm'
                onClick={() =>
                  setAnalyticsData((prev) => ({
                    ...prev,
                    boosters: [...(prev.boosters || []), { event_name: '', display_name: '', coin_cost: 0 }]
                  }))
                }
              >
                <Plus className='mr-2 h-4 w-4' /> Add Booster
              </Button>
            </div>

            <div className='space-y-3'>
              {(analyticsData.boosters || []).map((booster, index) => (
                <div
                  key={`booster-${index}`}
                  className='rounded-md border bg-white p-2 sm:border-0 sm:bg-transparent sm:p-0'
                >
                  <div className='grid grid-cols-1 gap-2 md:grid-cols-12'>
                    <Input
                      className='md:col-span-4'
                      placeholder='event_name'
                      value={booster.event_name}
                      onChange={(e) => {
                        const next = [...analyticsData.boosters];
                        next[index] = { ...next[index], event_name: e.target.value };
                        setAnalyticsData((prev) => ({ ...prev, boosters: next }));
                      }}
                    />
                    <Input
                      className='md:col-span-4'
                      placeholder='display_name'
                      value={booster.display_name}
                      onChange={(e) => {
                        const next = [...analyticsData.boosters];
                        next[index] = { ...next[index], display_name: e.target.value };
                        setAnalyticsData((prev) => ({ ...prev, boosters: next }));
                      }}
                    />
                    <Input
                      className='md:col-span-3'
                      type='number'
                      placeholder='coin_cost'
                      value={booster.coin_cost}
                      onChange={(e) => {
                        const next = [...analyticsData.boosters];
                        next[index] = {
                          ...next[index],
                          coin_cost: Number(e.target.value) || 0
                        };
                        setAnalyticsData((prev) => ({ ...prev, boosters: next }));
                      }}
                    />
                    <Button
                      variant='destructive'
                      className='h-9 md:col-span-1'
                      onClick={() => {
                        const next = [...analyticsData.boosters];
                        next.splice(index, 1);
                        setAnalyticsData((prev) => ({ ...prev, boosters: next }));
                      }}
                    >
                      <X className='h-4 w-4' />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className='flex flex-col justify-end gap-2 sm:flex-row'>
            <Button variant='outline' onClick={() => onOpenChange(false)} className='w-full sm:w-auto'>
              Cancel
            </Button>
            <Button onClick={onSave} className='w-full sm:w-auto'>
              <Save className='mr-2 h-4 w-4' /> Save Mapping
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
