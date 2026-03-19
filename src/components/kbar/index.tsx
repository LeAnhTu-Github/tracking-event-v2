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

export default function KBar({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const actions = useMemo(
    () => [
      {
        id: 'dashboardAction',
        name: 'Dashboard',
        keywords: 'dashboard',
        section: 'Navigation',
        subtitle: 'Go to Dashboard',
        perform: () => router.push('/dashboard')
      },
      {
        id: 'systemSettingsAction',
        name: 'System Settings',
        keywords: 'system settings settings',
        section: 'Navigation',
        subtitle: 'Go to System Settings',
        perform: () => router.push('/dashboard/system/settings')
      },
      {
        id: 'systemMonitorAction',
        name: 'System Monitor',
        keywords: 'system monitor monitor',
        section: 'Navigation',
        subtitle: 'Go to System Monitor',
        perform: () => router.push('/dashboard/system/monitor')
      },
      {
        id: 'dataCheckAction',
        name: 'Data Check',
        keywords: 'data check datacheck',
        section: 'Navigation',
        subtitle: 'Go to Data Check',
        perform: () => router.push('/dashboard/check-data')
      },
      {
        id: 'dataExplorerAction',
        name: 'Data Explorer',
        keywords: 'data explorer explorer',
        section: 'Navigation',
        subtitle: 'Go to Data Explorer',
        perform: () => router.push('/dashboard/data-explorer')
      }
    ],
    [router]
  );

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
