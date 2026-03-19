'use client';
import {
  KBarAnimator,
  KBarPortal,
  KBarPositioner,
  KBarProvider,
  KBarSearch
} from 'kbar';
import { useRouter } from 'next/navigation';
import { useMemo } from 'react';
import RenderResults from './render-result';
import useThemeSwitching from './use-theme-switching';
import { useAuthStore } from '@/store/useAuth';

export default function KBar({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { pageRoles } = useAuthStore();

  // These action are for the navigation
  const actions = useMemo(() => {
    // Define navigateTo inside the useMemo callback to avoid dependency array issues
    const navigateTo = (url: string) => {
      router.push(url);
    };

    if (!pageRoles || pageRoles.length === 0) {
      return [];
    }

    // Create a map to find parent by id
    const parentMap = new Map<number, { pageName: string; pageUrl: string }>();
    pageRoles.forEach((item) => {
      if (item.parentId === 0) {
        parentMap.set(item.id, {
          pageName: item.pageName,
          pageUrl: item.pageUrl
        });
      }
    });

    return pageRoles.flatMap((pageRole) => {
      // Only include base action if the pageRole has a real URL
      const baseAction =
        pageRole.pageUrl && pageRole.pageUrl !== '#'
          ? {
              id: `${pageRole.pageName.toLowerCase().replace(/\s+/g, '-')}Action`,
              name: pageRole.pageName,
              keywords: pageRole.pageName.toLowerCase(),
              section:
                pageRole.parentId === 0
                  ? 'Navigation'
                  : parentMap.get(pageRole.parentId)?.pageName || 'Navigation',
              subtitle: `Go to ${pageRole.pageName}`,
              perform: () => navigateTo(pageRole.pageUrl)
            }
          : null;

      // Map child items into actions
      const childActions =
        pageRole.children?.map((childItem) => ({
          id: `${childItem.pageName.toLowerCase().replace(/\s+/g, '-')}Action`,
          name: childItem.pageName,
          keywords: childItem.pageName.toLowerCase(),
          section: pageRole.pageName,
          subtitle: `Go to ${childItem.pageName}`,
          perform: () => navigateTo(childItem.pageUrl)
        })) ?? [];

      // Return only valid actions (ignoring null base actions for containers)
      return baseAction ? [baseAction, ...childActions] : childActions;
    });
  }, [router, pageRoles]);

  return (
    <KBarProvider actions={actions}>
      <KBarComponent>{children}</KBarComponent>
    </KBarProvider>
  );
}
const KBarComponent = ({ children }: { children: React.ReactNode }) => {
  useThemeSwitching();

  return (
    <>
      <KBarPortal>
        <KBarPositioner className='bg-background/80 fixed inset-0 z-99999 p-0! backdrop-blur-sm'>
          <KBarAnimator className='bg-card text-card-foreground relative mt-64! w-full max-w-[600px] -translate-y-12! overflow-hidden rounded-lg border shadow-lg'>
            <div className='bg-card border-border sticky top-0 z-10 border-b'>
              <KBarSearch className='bg-card w-full border-none px-6 py-4 text-lg outline-hidden focus:ring-0 focus:ring-offset-0 focus:outline-hidden' />
            </div>
            <div className='max-h-[400px]'>
              <RenderResults />
            </div>
          </KBarAnimator>
        </KBarPositioner>
      </KBarPortal>
      {children}
    </>
  );
};
