'use client';

import * as React from 'react';
import { Calendar, RotateCcw } from 'lucide-react';

import { Button } from '@/components/ui/button';

import {
  type DateRangePresetId,
  getPresetDateRange
} from '@/features/dashboard/utils/date-range';

export type TimeRangeFilterValue = {
  readonly startDate: string;
  readonly endDate: string;
};

export type TimeRangeFilterProps = {
  readonly value: TimeRangeFilterValue;
  readonly onChange: (next: TimeRangeFilterValue) => void;
};

const PRESETS: ReadonlyArray<{ id: DateRangePresetId; label: string }> = [
  { id: 'today', label: 'Today' },
  { id: 'last7d', label: 'Last 7d' },
  { id: 'last30d', label: 'Last 30d' }
];

export default function TimeRangeFilter({ value, onChange }: TimeRangeFilterProps) {
  const handleApplyPreset = (presetId: DateRangePresetId) => {
    onChange(getPresetDateRange(presetId));
  };

  const handleReset = () => {
    onChange(getPresetDateRange('last7d'));
  };

  return (
    <div className='bg-card flex flex-col gap-3 rounded-xl border p-4 md:flex-row md:items-center md:justify-between'>
      <div className='flex flex-wrap items-center gap-2'>
        <div className='text-muted-foreground inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium'>
          <Calendar className='h-4 w-4' />
          Time range
        </div>
        <div className='flex flex-wrap items-center gap-2'>
          {PRESETS.map((preset) => (
            <Button
              key={preset.id}
              type='button'
              variant='secondary'
              size='sm'
              onClick={() => handleApplyPreset(preset.id)}
            >
              {preset.label}
            </Button>
          ))}
        </div>
      </div>

      <div className='flex flex-col gap-2 sm:flex-row sm:items-center'>
        <div className='flex items-center gap-2'>
          <input
            aria-label='Start date'
            type='date'
            className='bg-background rounded-md border px-3 py-2 text-sm'
            value={value.startDate}
            onChange={(e) => onChange({ ...value, startDate: e.target.value })}
          />
          <span className='text-muted-foreground text-sm font-medium'>-</span>
          <input
            aria-label='End date'
            type='date'
            className='bg-background rounded-md border px-3 py-2 text-sm'
            value={value.endDate}
            onChange={(e) => onChange({ ...value, endDate: e.target.value })}
          />
        </div>
        <Button type='button' variant='outline' size='icon' onClick={handleReset}>
          <RotateCcw className='h-4 w-4' />
        </Button>
      </div>
    </div>
  );
}

