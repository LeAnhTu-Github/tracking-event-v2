'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
import { Loader2, ImageIcon, Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import imageService from '@/services/image.service';

interface ImageItem {
  id: number;
  imageUrl: string;
  thumbnailUrl?: string;
  type?: string;
  gameId?: string;
}

interface ImageSelectorProps {
  selectedIds: number[];
  gameId?: string;
  onChange: (ids: number[]) => void;
  multiple?: boolean;
}

export function ImageSelector({
  selectedIds,
  gameId,
  onChange,
  multiple = true
}: ImageSelectorProps) {
  const [images, setImages] = useState<ImageItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [totalItems, setTotalItems] = useState(0);

  const fetchImages = React.useCallback(() => {
    setLoading(true);
    const filters: any = gameId ? { gameId } : {};
    if (search) {
      filters.keyword = search;
    }

    imageService
      .getMedia(filters, pageIndex, pageSize)
      .then((res: any) => {
        const items = Array.isArray(res?.data)
          ? res.data
          : Array.isArray(res)
            ? res
            : [];
        setImages(
          items.map((item: any) => ({
            id: item.id,
            imageUrl: item.imageUrl || '',
            thumbnailUrl: item.thumbnailUrl,
            type: item.type,
            gameId: item.gameId
          }))
        );
        setTotalItems(res?.totalRecords || 0);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [gameId, pageIndex, pageSize, search]);

  useEffect(() => {
    fetchImages();
  }, [fetchImages]);

  const handleSearch = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      setPageIndex(1);
      fetchImages();
    }
  };

  const totalPages = Math.ceil(totalItems / pageSize);

  const toggle = (id: number) => {
    if (multiple) {
      if (selectedIds.includes(id)) {
        onChange(selectedIds.filter((sid) => sid !== id));
      } else {
        onChange([...selectedIds, id]);
      }
    } else {
      onChange([id]);
    }
  };

  return (
    <div className='space-y-4'>
      <div className='flex items-center gap-4'>
        <div className='relative flex-1'>
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleSearch}
            placeholder='Search by ID or keyword (Enter to search)...'
            className='h-9 pr-10 text-sm'
          />
          <Button
            size='icon'
            variant='ghost'
            className='text-muted-foreground hover:text-foreground absolute top-0 right-0 h-9 w-9'
            onClick={() => {
              setPageIndex(1);
              fetchImages();
            }}
          >
            <Search className='h-4 w-4' />
          </Button>
        </div>
        <div className='flex items-center gap-2'>
          <span className='text-muted-foreground text-xs whitespace-nowrap'>
            Show
          </span>
          <Select
            value={String(pageSize)}
            onValueChange={(v) => {
              setPageSize(Number(v));
              setPageIndex(1);
            }}
          >
            <SelectTrigger className='h-8 w-[70px]'>
              <SelectValue placeholder={String(pageSize)} />
            </SelectTrigger>
            <SelectContent>
              {[10, 20, 50, 100].map((size) => (
                <SelectItem key={size} value={String(size)}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {loading ? (
        <div className='bg-muted/10 flex items-center justify-center rounded-lg border py-12'>
          <div className='flex flex-col items-center gap-2'>
            <Loader2 className='text-primary/60 h-8 w-8 animate-spin' />
            <span className='text-muted-foreground text-xs font-medium'>
              Loading images...
            </span>
          </div>
        </div>
      ) : (
        <>
          <div className='bg-muted/5 grid max-h-96 grid-cols-4 gap-2 overflow-y-auto rounded-lg border p-3 sm:grid-cols-5 md:grid-cols-6'>
            {images.map((img) => {
              const isSelected = selectedIds.includes(img.id);
              const thumb = img.thumbnailUrl || img.imageUrl;

              return (
                <button
                  key={img.id}
                  type='button'
                  onClick={() => toggle(img.id)}
                  className={cn(
                    'group relative aspect-square overflow-hidden rounded-md border-2 transition-all',
                    isSelected
                      ? 'border-primary ring-primary/30 ring-2'
                      : 'hover:border-primary/40 border-transparent'
                  )}
                >
                  {thumb ? (
                    <img
                      src={thumb}
                      alt={`Image ${img.id}`}
                      className='h-full w-full object-cover'
                    />
                  ) : (
                    <div className='bg-muted flex h-full w-full items-center justify-center'>
                      <ImageIcon className='text-muted-foreground h-5 w-5' />
                    </div>
                  )}
                  <div className='absolute right-0 bottom-0 left-0 bg-black/60 px-1 py-0.5'>
                    <p className='truncate text-center text-[10px] text-white'>
                      #{img.id}
                    </p>
                  </div>
                  {isSelected && (
                    <div className='bg-primary absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full text-white shadow-sm'>
                      <span className='text-[10px] font-bold'>✓</span>
                    </div>
                  )}
                </button>
              );
            })}
            {images.length === 0 && (
              <div className='col-span-full py-12 text-center'>
                <ImageIcon className='text-muted-foreground/30 mx-auto mb-2 h-10 w-10' />
                <p className='text-muted-foreground text-sm'>No images found</p>
              </div>
            )}
          </div>

          <div className='flex items-center justify-between px-2'>
            <div className='text-muted-foreground text-xs'>
              Total: <span className='font-medium'>{totalItems}</span>
            </div>
            <div className='flex items-center space-x-2'>
              <Button
                variant='outline'
                size='sm'
                onClick={() => setPageIndex((p) => Math.max(1, p - 1))}
                disabled={pageIndex === 1 || loading}
                className='h-8 px-2 lg:px-3'
              >
                Prev
              </Button>
              <div className='flex min-w-[32px] items-center justify-center text-xs font-medium'>
                {pageIndex} / {Math.max(1, totalPages)}
              </div>
              <Button
                variant='outline'
                size='sm'
                onClick={() => setPageIndex((p) => Math.min(totalPages, p + 1))}
                disabled={pageIndex >= totalPages || loading}
                className='h-8 px-2 lg:px-3'
              >
                Next
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
