'use client';

import * as React from 'react';
import { ImageIcon } from 'lucide-react';
import { Item } from '@/features/config-item/types';

interface ItemOptionLabelProps {
  item: Item;
}

export function ItemOptionLabel({ item }: ItemOptionLabelProps) {
  return (
    <div className='flex items-center gap-3 py-0.5'>
      {item.urlIcon ? (
        <img
          src={item.urlIcon}
          alt=''
          className='bg-muted h-6 w-6 rounded-md object-cover shadow-sm'
        />
      ) : (
        <div className='bg-muted flex h-6 w-6 items-center justify-center rounded-md'>
          <ImageIcon className='text-muted-foreground h-3 w-3' />
        </div>
      )}
      <div className='flex flex-col text-left'>
        <span className='text-sm leading-tight font-semibold'>{item.name}</span>
        <span className='text-muted-foreground font-mono text-[10px] uppercase'>
          {item.itemCode} • {item.type}
        </span>
      </div>
    </div>
  );
}
