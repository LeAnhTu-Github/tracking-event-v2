'use client';

import PageContainer from '@/components/layout/page-container';
import ShopForm from '@/features/config-shop/components/shop-form';

export default function NewShopPage() {
  return (
    <PageContainer scrollable={true}>
      <ShopForm isEdit={false} />
    </PageContainer>
  );
}
