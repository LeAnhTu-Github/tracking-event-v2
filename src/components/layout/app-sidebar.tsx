'use client';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail
} from '@/components/ui/sidebar';
import { Icons } from '@/components/icons';
import BrandMark from '@/components/brand-mark/BrandMark';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { ProjectSwitcher } from '@/components/project-switcher';
import { usePathname } from 'next/navigation';

export default function AppSidebar() {
  const pathname = usePathname();

  const getIconComponent = (pageIcon: string | null) => {
    if (!pageIcon) return null;
    const IconComponent = Icons[pageIcon as keyof typeof Icons];
    return IconComponent || null;
  };

  const navItems = [
    {
      pageName: 'Dashboard',
      pageUrl: '/dashboard',
      pageIcon: 'dashboard'
    },
    {
      pageName: 'System Settings',
      pageUrl: '/dashboard/system/settings',
      pageIcon: 'settings'
    },
    {
      pageName: 'System Monitor',
      pageUrl: '/dashboard/system/monitor',
      pageIcon: 'dashboard'
    },
    {
      pageName: 'Data Check',
      pageUrl: '/dashboard/check-data',
      pageIcon: 'check'
    },
    {
      pageName: 'Data Explorer',
      pageUrl: '/dashboard/data-explorer',
      pageIcon: 'search'
    }
  ] as const;

  return (
    <Sidebar collapsible='icon'>
      <SidebarHeader>
        <Link
          href='/dashboard'
          className='mb-1 flex items-center gap-2 px-2 py-3'
        >
          <BrandMark withText className='flex items-center gap-2' />
        </Link>
        <ProjectSwitcher />
      </SidebarHeader>
      <SidebarContent className='overflow-x-hidden'>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarMenu>
            {navItems.map((item) => {
              const IconComponent = getIconComponent(item.pageIcon);
              return (
                <SidebarMenuItem key={item.pageUrl}>
                  <SidebarMenuButton
                    asChild
                    tooltip={item.pageName}
                    isActive={pathname === item.pageUrl}
                    className={cn(
                      'transition-all duration-200',
                      pathname === item.pageUrl &&
                        'bg-primary/10 text-primary font-medium shadow-sm'
                    )}
                  >
                    <Link href={item.pageUrl}>
                      {IconComponent && (
                        <IconComponent
                          className={cn(
                            'h-5 w-5 transition-colors duration-200',
                            pathname === item.pageUrl && 'text-primary'
                          )}
                        />
                      )}
                      <span>{item.pageName}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
