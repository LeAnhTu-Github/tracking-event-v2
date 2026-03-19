'use client';

import * as React from 'react';
import {
  Plus,
  Save,
  Trash2,
  CheckCircle,
  Database,
  Coins,
  Gamepad2,
  RefreshCw,
  ListFilter,
  Copy
} from 'lucide-react';
import PageContainer from '@/components/layout/page-container';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import axiosInstance from '@/services/api';
import {
  clearSelectedAppId,
  resolveSelectedAppId,
  SELECTED_APP_CHANGED_EVENT,
  writeSelectedAppId
} from '@/lib/selected-app';
import { toast } from 'sonner';
import { EventMappingModal, type AnalyticsConfig } from './components/event-mapping-modal';

type TrackingApp = {
  id: number;
  name: string;
  app_id: string;
  api_token: string;
  is_active: boolean;
  schedule_time?: string;
  interval_minutes?: number;
};

type EventDictionaryData = {
  total_count: number;
  groups: Record<string, string[]>;
};

const emptyAnalytics: AnalyticsConfig = {
  events: {
    level_start: '',
    level_win: '',
    level_fail: ''
  },
  boosters: []
};

const emptyForm = {
  name: '',
  app_id: '',
  api_token: '',
  schedule_time: '00:00',
  interval_minutes: 60,
  is_active: true
};

function getGroupColor(group: string) {
  if (group.includes('Progression')) return 'bg-blue-50 text-blue-700 border-blue-200';
  if (group.includes('Economy')) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
  if (group.includes('Ads')) return 'bg-amber-50 text-amber-700 border-amber-200';
  if (group.includes('System')) return 'bg-slate-100 text-slate-700 border-slate-200';
  return 'bg-purple-50 text-purple-700 border-purple-200';
}

export default function SystemSettingsPage() {
  const [apps, setApps] = React.useState<TrackingApp[]>([]);
  const [selectedApp, setSelectedApp] = React.useState<TrackingApp | null>(null);
  const [isAdding, setIsAdding] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);
  const [showAnalyticsConfig, setShowAnalyticsConfig] = React.useState(false);

  const [formData, setFormData] = React.useState(emptyForm);
  const [analyticsData, setAnalyticsData] = React.useState<AnalyticsConfig>(emptyAnalytics);
  const [previewData, setPreviewData] = React.useState<AnalyticsConfig | null>(null);
  const [dictionaryData, setDictionaryData] = React.useState<EventDictionaryData | null>(null);
  const [dictionaryLoading, setDictionaryLoading] = React.useState(false);

  const fetchApps = React.useCallback(async () => {
    try {
      const res = await axiosInstance.get<TrackingApp[]>('/apps');
      const data = res.data;
      const appList = Array.isArray(data) ? data : [];
      setApps(appList);

      if (appList.length === 0) {
        setSelectedApp(null);
        return;
      }

      const selectedId = resolveSelectedAppId(appList, 1);
      const selected =
        appList.find((item: TrackingApp) => item.id === selectedId) || appList[0];
      setSelectedApp(selected);
      writeSelectedAppId(selected.id);
    } catch {
      toast.error('Load apps failed');
    }
  }, []);

  React.useEffect(() => {
    fetchApps();
  }, [fetchApps]);

  React.useEffect(() => {
    const syncSelected = (event?: Event) => {
      if (!apps.length) return;
      const custom = event as CustomEvent<number> | undefined;
      const nextId = custom?.detail ?? resolveSelectedAppId(apps, 1);
      if (!nextId) return;
      const nextApp = apps.find((item) => item.id === nextId);
      if (nextApp) {
        setSelectedApp((prev) => (prev?.id === nextApp.id ? prev : nextApp));
        setIsAdding(false);
      }
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

  React.useEffect(() => {
    if (isAdding) {
      setFormData(emptyForm);
      return;
    }

    if (!selectedApp) return;

    setFormData({
      name: selectedApp.name,
      app_id: selectedApp.app_id || '',
      api_token: selectedApp.api_token || '',
      schedule_time: selectedApp.schedule_time || '00:00',
      interval_minutes: selectedApp.interval_minutes || 60,
      is_active: selectedApp.is_active
    });
  }, [isAdding, selectedApp]);

  const fetchPreviewAnalytics = React.useCallback(async (appId?: number) => {
    if (!appId) {
      setPreviewData(null);
      return;
    }

    try {
      const res = await axiosInstance.get<AnalyticsConfig>(`/apps/${appId}/analytics-config`);
      if (res.status < 200 || res.status >= 300) {
        setPreviewData(null);
        return;
      }
      const data = res.data;
      if (data?.events || (Array.isArray(data?.boosters) && data.boosters.length > 0)) {
        setPreviewData(data);
      } else {
        setPreviewData(null);
      }
    } catch {
      setPreviewData(null);
    }
  }, []);

  const fetchEventDictionary = React.useCallback(async (appId?: number) => {
    if (!appId || isAdding) {
      setDictionaryData(null);
      return;
    }

    setDictionaryLoading(true);
    try {
      const res = await axiosInstance.get<any>(`/api/events/dictionary/${appId}`);
      const json = res.data;
      if (json?.success) {
        setDictionaryData({
          total_count: json.total_count,
          groups: json.groups || {}
        });
      } else {
        setDictionaryData(null);
      }
    } catch {
      setDictionaryData(null);
    } finally {
      setDictionaryLoading(false);
    }
  }, [isAdding]);

  React.useEffect(() => {
    fetchPreviewAnalytics(selectedApp?.id);
    fetchEventDictionary(selectedApp?.id);
  }, [selectedApp?.id, fetchEventDictionary, fetchPreviewAnalytics]);

  const handleSelectApp = (app: TrackingApp) => {
    setIsAdding(false);
    setSelectedApp(app);
    writeSelectedAppId(app.id);
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.app_id || !formData.api_token) {
      toast.error('Please fill required fields');
      return;
    }

    const url = isAdding
      ? `/apps`
      : `/apps/${selectedApp?.id}`;

    setIsSaving(true);
    try {
      if (isAdding) {
        await axiosInstance.post(url, formData);
      } else {
        await axiosInstance.put(url, formData);
      }

      toast.success(isAdding ? 'Created new app' : 'Saved changes');
      setIsAdding(false);
      await fetchApps();
    } catch {
      toast.error('Save failed');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (app: TrackingApp) => {
    const ok = window.confirm(`Delete ${app.name}?`);
    if (!ok) return;

    try {
      await axiosInstance.delete(`/apps/${app.id}`);

      if (selectedApp?.id === app.id) {
        setSelectedApp(null);
        clearSelectedAppId();
      }

      toast.success('Deleted app');
      await fetchApps();
    } catch {
      toast.error('Delete failed');
    }
  };

  const handleOpenAnalytics = async () => {
    if (!selectedApp) return;

    try {
      const res = await axiosInstance.get<AnalyticsConfig>(
        `/apps/${selectedApp.id}/analytics-config`
      );
      const data = res.data;
      setAnalyticsData(
        data?.events
          ? data
          : {
              ...emptyAnalytics
            }
      );
    } catch {
      setAnalyticsData({ ...emptyAnalytics });
    }

    setShowAnalyticsConfig(true);
  };

  const handleSaveAnalytics = async () => {
    if (!selectedApp) return;

    try {
      await axiosInstance.post(
        `/apps/${selectedApp.id}/analytics-config`,
        analyticsData
      );

      toast.success('Analytics configuration saved');
      setShowAnalyticsConfig(false);
      await fetchPreviewAnalytics(selectedApp.id);
      await fetchEventDictionary(selectedApp.id);
    } catch {
      toast.error('Save analytics failed');
    }
  };

  return (
    <PageContainer scrollable>
      <div className='flex flex-1 flex-col space-y-4'>
        <Heading
          title='Settings'
          description='Manage tracking apps and analytics mapping'
        />
        <Separator />

        <div className='space-y-8 pb-10'>
          <div className='grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-4'>
            {apps.map((app) => (
              <div
                key={app.id}
                onClick={() => handleSelectApp(app)}
                className={cn(
                  'group relative flex cursor-pointer items-center justify-between rounded-xl border-2 p-4 transition-all',
                  !isAdding && selectedApp?.id === app.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-slate-200 hover:border-blue-300'
                )}
              >
                <div className='min-w-0 flex-1 pr-2'>
                  <h3 className='truncate font-bold' title={app.name}>
                    {app.name}
                  </h3>
                </div>

                <div className='flex shrink-0 items-center gap-2'>
                  {!isAdding && selectedApp?.id === app.id && (
                    <CheckCircle size={18} className='text-blue-500' />
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(app);
                    }}
                    className='rounded-md p-1.5 text-red-400 opacity-0 transition-opacity hover:bg-red-100 hover:text-red-600 group-hover:opacity-100'
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}

            <button
              onClick={() => {
                setIsAdding(true);
                setSelectedApp(null);
              }}
              className={cn(
                'flex items-center justify-center rounded-xl border-2 border-dashed p-4 transition-all',
                isAdding
                  ? 'border-blue-500 bg-blue-50 text-blue-600'
                  : 'border-slate-300 text-slate-400 hover:border-blue-400'
              )}
            >
              <div className='flex flex-col items-center'>
                <Plus size={24} />
                <span className='font-medium'>Add New App</span>
              </div>
            </button>
          </div>

          <div className='rounded-xl border bg-white p-4 shadow-sm sm:p-6 md:p-8'>
            <div className='mb-6 flex items-start justify-between'>
              <h3 className='flex items-center gap-2 text-lg font-bold'>
                <Database size={20} />
                {isAdding ? 'Create New App Config' : `Configuration: ${formData.name || '-'}`}
              </h3>
            </div>

            <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
              <div className='space-y-2'>
                <Label>Game Name</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder='Woolen Yarn: Sort & Knit 3D'
                />
              </div>

              <div className='space-y-2'>
                <Label>AppMetrica App ID</Label>
                <Input
                  value={formData.app_id}
                  onChange={(e) => setFormData((prev) => ({ ...prev, app_id: e.target.value }))}
                />
              </div>

              <div className='space-y-2 md:col-span-2'>
                <Label>OAuth Token</Label>
                <Input
                  type='password'
                  value={formData.api_token}
                  onChange={(e) => setFormData((prev) => ({ ...prev, api_token: e.target.value }))}
                />
              </div>

              <div className='space-y-2'>
                <Label>Schedule Time</Label>
                <Input
                  type='time'
                  value={formData.schedule_time}
                  onChange={(e) => setFormData((prev) => ({ ...prev, schedule_time: e.target.value }))}
                />
              </div>

              <div className='space-y-2'>
                <Label>Interval (minutes)</Label>
                <Input
                  type='number'
                  value={formData.interval_minutes}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      interval_minutes: Number(e.target.value) || 0
                    }))
                  }
                />
              </div>

              <div className='flex items-center gap-3 md:col-span-2'>
                <Switch
                  checked={formData.is_active}
                  onCheckedChange={(checked) =>
                    setFormData((prev) => ({ ...prev, is_active: checked }))
                  }
                />
                <Label>Automatic Schedule</Label>
              </div>
            </div>

            {previewData && (
              <div className='mt-6 overflow-hidden rounded-lg border bg-slate-50'>
                <div className='flex items-center justify-between border-b bg-slate-100 px-4 py-2'>
                  <span className='text-xs font-bold tracking-wider text-slate-500 uppercase'>
                    Analytics Map Preview
                  </span>
                  <span className='text-xs text-blue-600 italic'>Active Configuration</span>
                </div>

                <div className='grid grid-cols-1 gap-6 p-4 md:grid-cols-2'>
                  <div>
                    <h4 className='mb-2 flex items-center gap-1 text-xs font-bold text-slate-400 uppercase'>
                      <Gamepad2 size={12} /> Level Events
                    </h4>
                    <div className='space-y-1 border-l-2 border-slate-200 pl-3 text-sm'>
                      <div className='flex items-center justify-between gap-2'>
                        <span className='text-xs text-slate-500'>Start:</span>
                        <code className='max-w-[180px] truncate rounded border bg-white px-1.5 py-0.5 font-mono text-xs text-blue-600'>
                          {previewData.events?.level_start || '-'}
                        </code>
                      </div>
                      <div className='flex items-center justify-between gap-2'>
                        <span className='text-xs text-slate-500'>Win:</span>
                        <code className='max-w-[180px] truncate rounded border bg-white px-1.5 py-0.5 font-mono text-xs text-emerald-600'>
                          {previewData.events?.level_win || '-'}
                        </code>
                      </div>
                      <div className='flex items-center justify-between gap-2'>
                        <span className='text-xs text-slate-500'>Fail:</span>
                        <code className='max-w-[180px] truncate rounded border bg-white px-1.5 py-0.5 font-mono text-xs text-red-600'>
                          {previewData.events?.level_fail || '-'}
                        </code>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className='mb-2 flex items-center gap-1 text-xs font-bold text-slate-400 uppercase'>
                      <Coins size={12} /> Boosters ({previewData.boosters?.length || 0})
                    </h4>
                    {previewData.boosters?.length ? (
                      <div className='max-h-40 overflow-y-auto rounded border bg-white'>
                        <table className='w-full text-left text-xs'>
                          <thead className='sticky top-0 z-10 bg-slate-50'>
                            <tr>
                              <th className='border-b p-2 font-medium text-slate-500'>Log Event</th>
                              <th className='border-b p-2 font-medium text-slate-500'>Display</th>
                              <th className='border-b p-2 text-right font-medium text-slate-500'>Cost</th>
                            </tr>
                          </thead>
                          <tbody>
                            {previewData.boosters.map((item, index) => (
                              <tr key={`${item.event_name}-${index}`} className='border-b last:border-0'>
                                <td className='max-w-[140px] truncate p-2 font-mono'>{item.event_name}</td>
                                <td className='max-w-[120px] truncate p-2'>{item.display_name || '-'}</td>
                                <td className='p-2 text-right font-mono text-orange-600'>
                                  {item.coin_cost}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className='rounded border border-dashed p-2 text-center text-xs text-slate-400 italic'>
                        No boosters mapped yet.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className='mt-8 flex flex-col justify-end gap-2 sm:flex-row sm:gap-3'>
              {!isAdding && selectedApp && (
                <Button
                  onClick={handleOpenAnalytics}
                  variant='secondary'
                  className='w-full sm:w-auto'
                >
                  <Database className='mr-2 h-4 w-4' />
                  Advanced Analytics
                </Button>
              )}
              <Button
                onClick={handleSubmit}
                disabled={isSaving}
                className='w-full sm:w-auto'
              >
                <Save className='mr-2 h-4 w-4' />
                {isAdding ? 'Create App' : 'Save Changes'}
              </Button>
            </div>
          </div>

          {!isAdding && selectedApp && (
            <div className='rounded-xl border bg-white shadow-sm'>
              <div className='flex flex-col gap-3 border-b bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between'>
                <div className='flex min-w-0 items-center gap-2'>
                  <ListFilter size={18} className='text-blue-600' />
                  <h3 className='truncate font-bold'>Captured Events Dictionary</h3>
                  <span className='rounded-full bg-slate-200 px-2 py-0.5 text-xs font-bold text-slate-600'>
                    {dictionaryData?.total_count || 0}
                  </span>
                </div>
                <Button
                  size='icon'
                  variant='ghost'
                  onClick={() => fetchEventDictionary(selectedApp.id)}
                >
                  <RefreshCw className={cn('h-4 w-4', dictionaryLoading && 'animate-spin')} />
                </Button>
              </div>

              {dictionaryData ? (
                <div className='grid grid-cols-1 gap-6 p-6 md:grid-cols-2'>
                  {Object.entries(dictionaryData.groups).map(([groupName, events]) => (
                    <div key={groupName} className='space-y-3'>
                      <h4 className='flex items-center gap-2 border-b pb-1 text-xs font-bold tracking-wider text-slate-400 uppercase'>
                        {groupName}
                        <span className='rounded bg-slate-100 px-1.5 text-[10px] text-slate-500'>
                          {events.length}
                        </span>
                      </h4>

                      <div className='flex flex-wrap gap-2'>
                        {events.map((evt) => (
                          <button
                            key={evt}
                            onClick={() => {
                              navigator.clipboard.writeText(evt);
                              toast.success('Copied event name');
                            }}
                            className={cn(
                              'flex cursor-pointer items-center gap-1.5 rounded border px-2.5 py-1 text-xs font-medium transition-transform hover:scale-105',
                              getGroupColor(groupName)
                            )}
                          >
                            {evt}
                            <Copy size={10} />
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className='p-6 text-sm text-slate-500'>No dictionary data.</div>
              )}
            </div>
          )}
        </div>
      </div>

      <EventMappingModal
        open={showAnalyticsConfig}
        onOpenChange={setShowAnalyticsConfig}
        appName={selectedApp?.name}
        analyticsData={analyticsData}
        setAnalyticsData={setAnalyticsData}
        onSave={handleSaveAnalytics}
      />
    </PageContainer>
  );
}
