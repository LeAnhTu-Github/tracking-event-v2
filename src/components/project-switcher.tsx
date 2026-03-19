'use client';

import * as React from 'react';
import { Check, ChevronsUpDown, Plus } from 'lucide-react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem
} from '@/components/ui/sidebar';
import axiosInstance from '@/services/api';
import {
  resolveSelectedAppId,
  SELECTED_APP_CHANGED_EVENT,
  writeSelectedAppId
} from '@/lib/selected-app';

type TrackingApp = {
  id: number;
  name: string;
};

const getInitials = (name: string) =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');

export function ProjectSwitcher() {
  const [apps, setApps] = React.useState<TrackingApp[]>([]);
  const [selectedAppId, setSelectedAppId] = React.useState<number | null>(null);

  React.useEffect(() => {
    const fetchApps = async () => {
      try {
        const response = await axiosInstance.get<TrackingApp[]>('/apps');
        const appList = Array.isArray(response.data) ? response.data : [];
        setApps(appList);

        if (appList.length === 0) return;

        const initialId = resolveSelectedAppId(appList, 1);
        if (!initialId) return;

        setSelectedAppId(initialId);
        writeSelectedAppId(initialId);
      } catch {
        setApps([]);
      }
    };

    fetchApps();
  }, []);

  React.useEffect(() => {
    const syncSelected = (event?: Event) => {
      if (!apps.length) return;
      const custom = event as CustomEvent<number> | undefined;
      const nextId = custom?.detail ?? resolveSelectedAppId(apps, 1);
      if (!nextId) return;
      setSelectedAppId((prev) => (prev === nextId ? prev : nextId));
    };

    window.addEventListener(SELECTED_APP_CHANGED_EVENT, syncSelected as EventListener);
    window.addEventListener('storage', syncSelected);
    return () => {
      window.removeEventListener(
        SELECTED_APP_CHANGED_EVENT,
        syncSelected as EventListener
      );
      window.removeEventListener('storage', syncSelected);
    };
  }, [apps]);

  const selectedApp = apps.find((app) => app.id === selectedAppId) ?? apps[0];

  const handleSelectApp = (app: TrackingApp) => {
    setSelectedAppId(app.id);
    writeSelectedAppId(app.id);
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <p className='text-sidebar-foreground/70 px-2 pb-2 text-xs font-semibold tracking-wider uppercase group-data-[collapsible=icon]:hidden'>
          Active Project
        </p>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size='lg'
              className='data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground border-sidebar-border border group-data-[collapsible=icon]:justify-center'
            >
              <div className='bg-primary/10 text-primary flex aspect-square size-8 items-center justify-center rounded-md text-xs font-semibold'>
                {selectedApp ? getInitials(selectedApp.name) : '--'}
              </div>
              <div className='grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden'>
                <span className='truncate font-medium'>
                  {selectedApp?.name || 'No project'}
                </span>
              </div>
              <ChevronsUpDown className='ml-auto size-4 group-data-[collapsible=icon]:hidden' />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className='w-[--radix-dropdown-menu-trigger-width]'
            align='start'
          >
            {apps.map((app) => (
              <DropdownMenuItem key={app.id} onSelect={() => handleSelectApp(app)}>
                <span className='truncate'>{app.name}</span>
                {app.id === selectedAppId && <Check className='ml-auto h-4 w-4' />}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem disabled>
              <Plus className='mr-2 h-4 w-4' />
              Add New Project
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
