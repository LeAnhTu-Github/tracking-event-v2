import PageContainer from '@/components/layout/page-container';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { EditConfigImagePage } from '@/features/config-image/components/edit-config-image';

export const metadata = {
  title: 'Dashboard: Edit Config Image'
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function Page({ params }: PageProps) {
  const { id } = await params;
  const configId = parseInt(id, 10);

  return (
    <PageContainer scrollable>
      <div className='flex w-full flex-1 flex-col space-y-4'>
        <div className='flex items-start justify-between'>
          <Heading
            title='Edit Config Image'
            description={`Editing configuration #${configId}`}
          />
        </div>
        <Separator />
        <EditConfigImagePage id={configId} />
      </div>
    </PageContainer>
  );
}
