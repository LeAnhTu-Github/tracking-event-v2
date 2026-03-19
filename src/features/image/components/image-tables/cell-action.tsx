'use client';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Image } from '@/types/image.type';
import {
  IconDotsVertical,
  IconInfoCircle,
  IconEdit
} from '@tabler/icons-react';
import { useRouter } from 'next/navigation';

interface CellActionProps {
  data: Image;
}

export const CellAction: React.FC<CellActionProps> = ({ data }) => {
  const router = useRouter();

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button variant='ghost' className='h-8 w-8 p-0'>
          <span className='sr-only'>Open menu</span>
          <IconDotsVertical className='h-4 w-4' />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end'>
        <DropdownMenuLabel>Actions</DropdownMenuLabel>

        {/* Detail */}
        <DropdownMenuItem
          onClick={() => router.push(`/dashboard/image/detail/${data.id}`)}
        >
          <IconInfoCircle className='mr-2 h-4 w-4' /> Detail
        </DropdownMenuItem>

        {/* Edit */}
        <DropdownMenuItem
          onClick={() => router.push(`/dashboard/image/edit/${data.id}`)}
        >
          <IconEdit className='mr-2 h-4 w-4' /> Edit
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
