'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Icons } from '@/components/icons';
import { buttonVariants } from '@/components/ui/button';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import PageContainer from '@/components/layout/page-container';
import UserListingPage from '@/features/user/components/user-listing';

export default function Page() {
  return (
    <PageContainer scrollable={false}>
      <div className='flex flex-1 flex-col space-y-4'>
        <div className='flex items-start justify-between'>
          <Heading title='Users' description='Manage users' />
          <Link
            href='/dashboard/system/users/new'
            className={cn(buttonVariants(), 'text-xs md:text-sm')}
          >
            <Icons.add className='mr-2 h-4 w-4' /> Add New
          </Link>
        </div>
        <Separator />

        <UserListingPage />
      </div>
    </PageContainer>
  );
}
