'use client';

import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import PageContainer from '@/components/layout/page-container';
import UserGroupView from '@/features/user/user-group-view';

export default function Page() {
  return (
    <PageContainer scrollable={false}>
      <div className='flex flex-1 flex-col space-y-4'>
        <Heading
          title='User Groups'
          description='Manage user groups and permissions'
        />
        <Separator />

        <UserGroupView />
      </div>
    </PageContainer>
  );
}
