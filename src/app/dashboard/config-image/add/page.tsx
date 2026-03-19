import PageContainer from '@/components/layout/page-container';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { AddConfigImagePage } from '@/features/config-image/components/add-config-image';

export const metadata = {
  title: 'Dashboard: Add Config Image'
};

export default function Page() {
  return (
    <PageContainer scrollable>
      <div className='flex w-full flex-1 flex-col space-y-4'>
        <div className='flex items-start justify-between'>
          <Heading
            title='Add Config Image'
            description='Create a new image configuration with action settings'
          />
        </div>
        <Separator />
        <AddConfigImagePage />
      </div>
    </PageContainer>
  );
}
