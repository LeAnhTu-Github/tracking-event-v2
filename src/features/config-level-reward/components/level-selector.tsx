'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip';
import { Trash2, CheckCircle2, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LevelOption {
  label: string;
  value: string;
}

interface LevelSelectorProps {
  levels: LevelOption[];
  value: number[];
  onChange: (vals: number[]) => void;
}

const LevelItem = React.memo(
  ({
    num,
    isSelected,
    isHighlighted,
    dragMode,
    onMouseDown,
    onMouseEnter,
    onClick
  }: {
    num: number;
    isSelected: boolean;
    isHighlighted: boolean;
    dragMode: 'select' | 'deselect' | null;
    onMouseDown: () => void;
    onMouseEnter: () => void;
    onClick: () => void;
  }) => {
    return (
      <div
        onMouseDown={onMouseDown}
        onMouseEnter={onMouseEnter}
        onClick={onClick}
        title={`Level ${num}`}
        className={cn(
          'relative flex h-11 w-full cursor-pointer items-center justify-center rounded-xl border px-2 text-[13px] font-extrabold transition-all duration-150 select-none',
          isSelected &&
            !isHighlighted &&
            'border-blue-600 bg-blue-600 text-white shadow-lg ring-2 ring-blue-500/20',
          isHighlighted &&
            dragMode === 'select' &&
            'z-10 scale-105 border-blue-400 bg-blue-400 text-white shadow-md',
          isHighlighted &&
            dragMode === 'deselect' &&
            'z-10 scale-105 border-red-400 bg-red-400 text-white shadow-md',
          !isSelected &&
            !isHighlighted &&
            'border-border bg-background hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-950/30'
        )}
      >
        {num}
        {(isSelected || isHighlighted) && (
          <div className='absolute -top-1 -right-1 h-3 w-3 rounded-full bg-white shadow-xs dark:bg-blue-950'>
            <div
              className={cn(
                'h-full w-full rounded-full transition-colors duration-200',
                isHighlighted
                  ? dragMode === 'deselect'
                    ? 'bg-red-300'
                    : 'bg-blue-300'
                  : 'bg-blue-500'
              )}
            />
          </div>
        )}
      </div>
    );
  }
);

LevelItem.displayName = 'LevelItem';

export function LevelSelector({ levels, value, onChange }: LevelSelectorProps) {
  // Drag-to-select state
  const [isDragging, setIsDragging] = React.useState(false);
  const [dragStart, setDragStart] = React.useState<number | null>(null);
  const [dragCurrent, setDragCurrent] = React.useState<number | null>(null);
  const [dragMode, setDragMode] = React.useState<'select' | 'deselect' | null>(
    null
  );
  const isRangeSelectedRef = React.useRef(false);

  // Use a Set for O(1) lookup performance
  const selectedSet = React.useMemo(() => new Set(value), [value]);

  const toggleLevel = React.useCallback(
    (lvl: number) => {
      if (selectedSet.has(lvl)) {
        onChange(value.filter((v) => v !== lvl));
      } else {
        onChange([...value, lvl].sort((a, b) => a - b));
      }
    },
    [value, selectedSet, onChange]
  );

  const handleMouseDown = (lvl: number) => {
    setIsDragging(true);
    setDragStart(lvl);
    setDragCurrent(lvl);
    setDragMode(selectedSet.has(lvl) ? 'deselect' : 'select');
    isRangeSelectedRef.current = false;
  };

  const handleMouseEnter = (lvl: number) => {
    if (isDragging && dragCurrent !== lvl) {
      setDragCurrent(lvl);
    }
  };

  const handleMouseUp = () => {
    if (
      isDragging &&
      dragStart !== null &&
      dragCurrent !== null &&
      dragMode !== null
    ) {
      if (dragStart !== dragCurrent) {
        const start = Math.min(dragStart, dragCurrent);
        const end = Math.max(dragStart, dragCurrent);

        let newValsArray: number[];
        if (dragMode === 'select') {
          const newVals = new Set(value);
          for (let i = start; i <= end; i++) {
            // Check if the level actually exists in the options
            if (levels.some((l) => parseInt(l.value) === i)) {
              newVals.add(i);
            }
          }
          newValsArray = Array.from(newVals);
        } else {
          // Deselect mode
          newValsArray = value.filter((v) => v < start || v > end);
        }

        onChange(newValsArray.sort((a, b) => a - b));
        isRangeSelectedRef.current = true;
      }
    }
    setIsDragging(false);
    setDragMode(null);
    setTimeout(() => {
      setDragStart(null);
      setDragCurrent(null);
    }, 10);
  };

  const clearAll = () => onChange([]);
  const selectAll = () => onChange(levels.map((l) => parseInt(l.value)));

  // Helper to check if a level is in the current drag range
  const getDragRange = () => {
    if (!isDragging || dragStart === null || dragCurrent === null) return null;
    return {
      start: Math.min(dragStart, dragCurrent),
      end: Math.max(dragStart, dragCurrent)
    };
  };

  const dragRange = getDragRange();

  return (
    <div
      className='group/selector space-y-4'
      onMouseLeave={() => isDragging && handleMouseUp()}
    >
      <div className='flex items-center justify-between rounded-xl border border-blue-100 bg-blue-50/50 p-4 shadow-sm transition-all dark:border-blue-900/30 dark:bg-blue-950/20'>
        <div className='flex items-center gap-2'>
          <div className='flex h-8 w-8 items-center justify-center rounded-full bg-blue-600/10 text-blue-600'>
            <Info className='h-4 w-4' />
          </div>
          <div className='flex flex-col'>
            <span className='text-xs font-bold text-blue-900 dark:text-blue-100'>
              Selection Tools
            </span>
            <span className='text-[10px] text-blue-600/80 dark:text-blue-400'>
              Click or drag to select levels
            </span>
          </div>
        </div>

        <div className='ml-auto flex gap-2'>
          <Button
            type='button'
            variant='outline'
            size='sm'
            onClick={selectAll}
            className='bg-background h-9 border-blue-200 text-xs font-semibold text-blue-600 hover:bg-blue-100 dark:border-blue-800 dark:text-blue-400 dark:hover:bg-blue-900/50'
          >
            <CheckCircle2 className='mr-1.5 h-3.5 w-3.5' />
            Select All
          </Button>
          <Button
            type='button'
            variant='outline'
            size='sm'
            onClick={clearAll}
            className='bg-background h-9 border-red-200 text-xs font-semibold text-red-600 hover:bg-red-100 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-900/50'
          >
            <Trash2 className='mr-1.5 h-3.5 w-3.5' />
            Clear
          </Button>
        </div>
      </div>

      <div
        className='bg-background/50 dark:bg-muted/5 relative overflow-hidden rounded-2xl border p-1 shadow-inner'
        onMouseUp={handleMouseUp}
      >
        <ScrollArea className='h-[350px]'>
          <div
            className='grid grid-cols-5 gap-2 p-4 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12'
            style={{ userSelect: 'none' }}
          >
            {levels.map((lvl) => {
              const num = parseInt(lvl.value);
              const isSelected = selectedSet.has(num);
              const isHighlighted = dragRange
                ? num >= dragRange.start && num <= dragRange.end
                : false;

              return (
                <LevelItem
                  key={lvl.value}
                  num={num}
                  isSelected={isSelected}
                  isHighlighted={isHighlighted}
                  dragMode={dragMode}
                  onMouseDown={() => handleMouseDown(num)}
                  onMouseEnter={() => handleMouseEnter(num)}
                  onClick={() => {
                    if (!isRangeSelectedRef.current) {
                      toggleLevel(num);
                    }
                  }}
                />
              );
            })}
            {levels.length === 0 && (
              <div className='text-muted-foreground col-span-full flex h-60 flex-col items-center justify-center gap-3'>
                <div className='bg-muted rounded-full p-4'>
                  <Info className='h-8 w-8 opacity-40' />
                </div>
                <p className='text-sm font-medium'>
                  No levels found for the selected game
                </p>
                <p className='text-xs opacity-60'>
                  Please ensure the Game ID is selected correctly
                </p>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Drag selection hint */}
        {isDragging && dragStart !== null && dragCurrent !== null && (
          <div
            className={cn(
              'pointer-events-none absolute bottom-4 left-1/2 z-50 -translate-x-1/2 rounded-full px-4 py-1 text-[10px] font-bold text-white shadow-xl backdrop-blur-md',
              dragMode === 'deselect' ? 'bg-red-600/90' : 'bg-blue-600/90'
            )}
          >
            {dragMode === 'deselect' ? 'Deselecting' : 'Selecting'} range:{' '}
            {Math.min(dragStart, dragCurrent)} -{' '}
            {Math.max(dragStart, dragCurrent)}
          </div>
        )}
      </div>

      <div className='flex items-center justify-between px-2'>
        <div className='flex items-center gap-3'>
          <div className='flex -space-x-2'>
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className='border-background flex h-6 w-6 items-center justify-center rounded-full border-2 bg-blue-100 dark:bg-blue-900'
              >
                <div className='h-2 w-2 rounded-full bg-blue-500' />
              </div>
            ))}
          </div>
          <Badge
            variant='secondary'
            className='h-7 bg-blue-100 px-3 text-blue-700 shadow-sm dark:bg-blue-900/40 dark:text-blue-300'
          >
            <span className='mr-1.5 font-black'>{value.length}</span> Levels
            Active
          </Badge>
        </div>
        <div className='flex flex-col items-end gap-1'>
          <p className='text-muted-foreground flex items-center gap-1.5 text-[11px] font-medium'>
            <span className='h-1.5 w-1.5 rounded-full bg-blue-500' />
            Click and drag to select a range of levels
          </p>
        </div>
      </div>
    </div>
  );
}
