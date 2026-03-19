'use client';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from '@/components/ui/collapsible';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
  useSidebar
} from '@/components/ui/sidebar';
import { UserAvatarProfile } from '@/components/user-avatar-profile';
import { useMediaQuery } from '@/hooks/use-media-query';
import {
  IconBell,
  IconChevronRight,
  IconChevronsDown,
  IconCreditCard,
  IconLogout,
  IconPhotoUp,
  IconUserCircle
} from '@tabler/icons-react';
import { Icons } from '@/components/icons';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import * as React from 'react';
import { useAuthStore } from '@/store/useAuth';
import { useLayoutStore } from '@/store/useLayout';
import { cn } from '@/lib/utils';
import { ProjectSwitcher } from '@/components/project-switcher';
export const company = {
  name: 'Acme Inc',
  logo: IconPhotoUp,
  plan: 'Enterprise'
};

export default function AppSidebar() {
  const pathname = usePathname();
  const { isOpen } = useMediaQuery();
  const { user, logOut } = useAuthStore();
  const { sidebarList } = useLayoutStore();
  const router = useRouter();
  const { state, setOpen } = useSidebar();
  const isCollapsed = state === 'collapsed';

  const [openCollapsibles, setOpenCollapsibles] = React.useState<
    Record<string, boolean>
  >({});

  React.useEffect(() => {}, [isOpen]);
  React.useEffect(() => {
    sidebarList.forEach((item) => {
      if (item?.children && item?.children?.length > 0) {
        const itemKey = item.pageName;
        const isParentActive = pathname === item.pageUrl;
        const isAnyChildActive = item.children.some(
          (child) => pathname === child.pageUrl
        );
        if (isParentActive || isAnyChildActive) {
          setOpenCollapsibles((prev) => {
            if (prev[itemKey] !== true) {
              return { ...prev, [itemKey]: true };
            }
            return prev;
          });
        }
      }
    });
  }, [pathname, sidebarList]);

  const handleSignOut = () => {
    logOut();
  };

  const getIconComponent = (pageIcon: string | null) => {
    if (!pageIcon) return null;
    const IconComponent = Icons[pageIcon as keyof typeof Icons];
    return IconComponent || null;
  };

  const handleItemWithChildrenClick = (
    e: React.MouseEvent,
    itemKey: string
  ) => {
    if (isCollapsed) {
      e.preventDefault();
      e.stopPropagation();
      setOpen(true);
      setOpenCollapsibles((prev) => ({
        ...prev,
        [itemKey]: true
      }));
    }
  };

  const handleCollapsibleOpenChange = (itemKey: string, open: boolean) => {
    setOpenCollapsibles((prev) => ({
      ...prev,
      [itemKey]: open
    }));
  };

  const staticQuickLinks = [
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
        <ProjectSwitcher />
      </SidebarHeader>
      <SidebarContent className='overflow-x-hidden'>
        <SidebarGroup>
          <SidebarGroupLabel>Overview</SidebarGroupLabel>
          <SidebarMenu>
            {sidebarList.map((item) => {
              const IconComponent = getIconComponent(item.pageIcon);
              const itemKey = item.pageName;
              const hasChildren = item?.children && item?.children?.length > 0;
              const isCollapsibleOpen = openCollapsibles[itemKey] ?? true;

              return hasChildren ? (
                <Collapsible
                  key={itemKey}
                  asChild
                  open={isCollapsibleOpen}
                  onOpenChange={(open) =>
                    handleCollapsibleOpenChange(itemKey, open)
                  }
                  className='group/collapsible'
                >
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton
                        tooltip={item.pageName}
                        isActive={pathname === item.pageUrl}
                        onClick={(e) => handleItemWithChildrenClick(e, itemKey)}
                        className={cn(
                          'transition-all duration-200',
                          pathname === item.pageUrl &&
                            'bg-primary/10 text-primary font-medium shadow-sm'
                        )}
                      >
                        {IconComponent && (
                          <IconComponent
                            className={cn(
                              'h-5 w-5 transition-colors duration-200',
                              pathname === item.pageUrl && 'text-primary'
                            )}
                          />
                        )}
                        <span>{item.pageName}</span>
                        <IconChevronRight className='ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90' />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {item.children?.map((subItem) => (
                          <SidebarMenuSubItem key={subItem.pageName}>
                            <SidebarMenuSubButton
                              asChild
                              isActive={pathname === subItem.pageUrl}
                              className={cn(
                                'transition-all duration-200',
                                pathname === subItem.pageUrl &&
                                  'bg-primary/10 text-primary font-medium shadow-sm'
                              )}
                            >
                              <Link href={subItem.pageUrl}>
                                <span>{subItem.pageName}</span>
                              </Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </SidebarMenuItem>
                </Collapsible>
              ) : (
                <SidebarMenuItem key={itemKey}>
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
        <SidebarGroup>
          <SidebarGroupLabel>Quick Access</SidebarGroupLabel>
          <SidebarMenu>
            {staticQuickLinks.map((item) => {
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
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size='lg'
                  className='data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground'
                >
                  {user && (
                    <UserAvatarProfile
                      className='h-8 w-8 rounded-lg'
                      showInfo
                      user={user}
                    />
                  )}
                  <IconChevronsDown className='ml-auto size-4' />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className='w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg'
                side='bottom'
                align='end'
                sideOffset={4}
              >
                <DropdownMenuLabel className='p-0 font-normal'>
                  <div className='px-1 py-1.5'>
                    {user && (
                      <UserAvatarProfile
                        className='h-8 w-8 rounded-lg'
                        showInfo
                        user={user}
                      />
                    )}
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />

                <DropdownMenuGroup>
                  <DropdownMenuItem
                    onClick={() => router.push('/dashboard/profile')}
                  >
                    <IconUserCircle className='mr-2 h-4 w-4' />
                    Profile
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  <IconLogout className='mr-2 h-4 w-4' />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
