'use client';

import * as React from 'react';
import {
  ChevronDown,
  ChevronUp,
  Clock,
  Columns3,
  Download,
  FileText,
  Filter,
  Play,
  RefreshCw,
  RotateCcw,
  StopCircle,
  Trash2,
  X
} from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import SimpleTablePagination from '@/components/ui/table/simple-table-pagination';
import { useMonitorHistory } from '@/features/system-monitor/hooks/use-monitor-history';
import { MonitorJob, MonitorPagination, TrackingApp } from '@/features/system-monitor/types';
import {
  resolveSelectedAppId,
  SELECTED_APP_CHANGED_EVENT
} from '@/lib/selected-app';
import systemMonitorService from '@/services/system-monitor.service';

const defaultPagination: MonitorPagination = {
  current_page: 1,
  total_pages: 1,
  total_records: 0,
  limit: 30
};
const VIEW_COLUMNS_KEY = 'monitor_view_columns';
const DEFAULT_LIMIT = 30;
const LIMIT_OPTIONS = [10, 20, 30, 50, 100] as const;

const isRunningState = (status: string) => ['Running', 'Processing'].includes(status);

const parseSafeDate = (dateStr: string | null) => {
  if (!dateStr) return null;
  const parsed = new Date(dateStr);
  if (!Number.isNaN(parsed.getTime())) return parsed;

  const parts = dateStr.match(
    /^(\d{1,2})\/(\d{1,2})\/(\d{4})\s*(\d{0,2}):?(\d{0,2}):?(\d{0,2})/
  );
  if (!parts) return null;

  return new Date(
    Number(parts[3]),
    Number(parts[2]) - 1,
    Number(parts[1]),
    Number(parts[4]) || 0,
    Number(parts[5]) || 0,
    Number(parts[6]) || 0
  );
};

const formatRawTime = (value: string | null) => {
  const date = parseSafeDate(value);
  if (!date) return value ?? '-';
  return date.toLocaleString('en-GB', { hour12: false });
};

const calculateDuration = (start: string | null, end: string | null) => {
  const startDate = parseSafeDate(start);
  const endDate = parseSafeDate(end);
  if (!startDate) return '-';

  const endMs = endDate ? endDate.getTime() : !end ? Date.now() : null;
  if (!endMs) return '-';

  const diffSec = Math.floor((endMs - startDate.getTime()) / 1000);
  if (diffSec < 0) return '0s';

  const hours = Math.floor(diffSec / 3600);
  const minutes = Math.floor((diffSec % 3600) / 60);
  const seconds = diffSec % 60;

  const parts: string[] = [];
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  parts.push(`${seconds}s`);

  return parts.join(' ');
};

const getRunTypeClass = (type: string) => {
  switch (type?.toLowerCase()) {
    case 'manual':
      return 'bg-blue-100 text-blue-700';
    case 'schedule':
      return 'bg-purple-100 text-purple-700';
    case 'retry':
      return 'bg-orange-100 text-orange-700';
    case 'demo':
      return 'bg-yellow-100 text-yellow-700';
    default:
      return 'bg-slate-100 text-slate-600';
  }
};

const formatDataRange = (since: string | null, until: string | null) => {
  if (!since || !until) {
    return <span className='text-slate-400 italic'>-</span>;
  }

  try {
    const utcStart = new Date(since);
    const utcEnd = new Date(until);
    const vnStart = new Date(utcStart.getTime() + 7 * 60 * 60 * 1000);
    const vnEnd = new Date(utcEnd.getTime() + 7 * 60 * 60 * 1000);

    const date = vnStart.toISOString().split('T')[0];
    const vnRange = `${vnStart.toISOString().slice(11, 16)} - ${vnEnd.toISOString().slice(11, 16)}`;
    const utcRange = `${utcStart.toISOString().slice(11, 16)} - ${utcEnd.toISOString().slice(11, 16)}`;

    return (
      <div className='flex flex-col gap-0.5 text-[11px]'>
        <div className='font-bold text-blue-600'>📅 {date}</div>
        <div className='text-slate-600'>
          <span className='font-semibold text-indigo-600'>🕒 VN[{vnRange}]</span>
          <span className='ml-1 text-[10px] text-slate-400'>(UTC: {utcRange})</span>
        </div>
      </div>
    );
  } catch {
    return '-';
  }
};

export default function MonitorListing() {
  const [apps, setApps] = React.useState<TrackingApp[]>([]);
  const [selectedAppId, setSelectedAppId] = React.useState<number | null>(null);

  const [limit, setLimit] = React.useState(DEFAULT_LIMIT);
  const [page, setPage] = React.useState(1);
  const [filterStartDate, setFilterStartDate] = React.useState('');
  const [filterEndDate, setFilterEndDate] = React.useState('');

  const [selectedJob, setSelectedJob] = React.useState<MonitorJob | null>(null);
  const [showManualModal, setShowManualModal] = React.useState(false);
  const [manualConfig, setManualConfig] = React.useState({
    appId: '',
    startTime: '',
    endTime: '',
    executionTime: ''
  });
  const [isControlsOpen, setIsControlsOpen] = React.useState(true);
  const [visibleColumns, setVisibleColumns] = React.useState<Record<string, boolean>>({
    id: true,
    type: true,
    dataRange: true,
    startTime: true,
    endTime: true,
    duration: true,
    status: true,
    events: true,
    actions: true
  });

  const columnDefs = React.useMemo(
    () => [
      { id: 'id', label: 'ID' },
      { id: 'type', label: 'Type' },
      { id: 'dataRange', label: 'Data Range' },
      { id: 'startTime', label: 'Start Time' },
      { id: 'endTime', label: 'End Time' },
      { id: 'duration', label: 'Duration' },
      { id: 'status', label: 'Status' },
      { id: 'events', label: 'Events' },
      { id: 'actions', label: 'Actions' }
    ],
    []
  );

  const {
    data: historyData,
    refetch,
    isLoading
  } = useMonitorHistory(selectedAppId, page, limit, filterStartDate, filterEndDate);

  const history = historyData?.data || [];
  const pagination = historyData?.pagination || defaultPagination;

  const selectedApp = React.useMemo(
    () => apps.find((item) => item.id === selectedAppId) || null,
    [apps, selectedAppId]
  );

  const loadApps = React.useCallback(async () => {
    try {
      const appList = await systemMonitorService.getApps();
      setApps(appList);

      if (appList.length === 0) {
        setSelectedAppId(null);
        return;
      }

      const initialId = resolveSelectedAppId(appList, 1);
      if (!initialId) return;

      setSelectedAppId(initialId);
    } catch {
      setApps([]);
      toast.error('Load apps failed');
    }
  }, []);

  React.useEffect(() => {
    loadApps();
  }, [loadApps]);

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

  React.useEffect(() => {
    const stored = window.localStorage.getItem(VIEW_COLUMNS_KEY);
    if (!stored) return;
    try {
      const parsed = JSON.parse(stored) as Record<string, boolean>;
      setVisibleColumns((prev) => ({ ...prev, ...parsed }));
    } catch {
      // noop
    }
  }, []);

  React.useEffect(() => {
    window.localStorage.setItem(VIEW_COLUMNS_KEY, JSON.stringify(visibleColumns));
  }, [visibleColumns]);

  React.useEffect(() => {
    setPage(1);
  }, [selectedAppId, filterStartDate, filterEndDate, limit]);

  React.useEffect(() => {
    const syncByViewport = () => {
      if (window.innerWidth < 640) {
        setIsControlsOpen(false);
      } else {
        setIsControlsOpen(true);
      }
    };

    syncByViewport();
    window.addEventListener('resize', syncByViewport);
    return () => window.removeEventListener('resize', syncByViewport);
  }, []);

  const initManualTime = React.useCallback(() => {
    const now = new Date();
    const end = new Date(now.getTime() - now.getTimezoneOffset() * 60_000);
    const start = new Date(now.getTime() - 60 * 60 * 1000 - now.getTimezoneOffset() * 60_000);

    setManualConfig({
      appId:
        selectedAppId?.toString() ||
        (apps.length > 0 ? apps[0].id.toString() : ''),
      startTime: start.toISOString().slice(0, 16),
      endTime: end.toISOString().slice(0, 16),
      executionTime: ''
    });
  }, [apps, selectedAppId]);

  const handleRun = async (type: 'demo' | 'manual' | 'retry', retryJobId?: number) => {
    if (type === 'manual') {
      initManualTime();
      setShowManualModal(true);
      return;
    }

    if (!selectedAppId) return;

    try {
      await systemMonitorService.runJob(
        selectedAppId,
        type === 'retry' ? 'retry' : 'demo',
        retryJobId
      );
      toast.success('Triggered job successfully');
      refetch();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Trigger job failed');
    }
  };

  const handleSubmitManual = async () => {
    if (!manualConfig.startTime || !manualConfig.endTime) {
      toast.error('Please select full start/end time');
      return;
    }

    try {
      const result = await systemMonitorService.createManualJob(manualConfig);
      toast.success(result?.message || 'Create manual job success');
      setShowManualModal(false);
      setPage(1);
      refetch();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Create manual job failed');
    }
  };

  const handleStop = async (jobId: number) => {
    if (!window.confirm(`Stop Job #${jobId}?`)) return;
    try {
      await systemMonitorService.stopJob(jobId);
      toast.success('Stopped job');
      refetch();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Stop job failed');
    }
  };

  const handleDeleteAll = async () => {
    if (!selectedAppId) return;
    if (!window.confirm('DELETE ALL HISTORY?')) return;
    try {
      await systemMonitorService.deleteAllHistory(selectedAppId);
      toast.success('Deleted all history');
      setPage(1);
      refetch();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Delete all failed');
    }
  };

  const handleDeleteSingle = async (jobId: number) => {
    if (!window.confirm(`Delete record #${jobId}?`)) return;
    try {
      await systemMonitorService.deleteHistory(jobId);
      toast.success('Deleted record');
      refetch();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Delete record failed');
    }
  };

  const handleDownloadRaw = (jobId: number) => {
    window.open(systemMonitorService.getExportUrl(jobId), '_blank');
  };

  const handlePageChange = (nextPage: number) => {
    if (nextPage >= 1 && nextPage <= pagination.total_pages) {
      setPage(nextPage);
    }
  };

  const handleLimitChange = (nextLimit: number) => {
    if (!Number.isFinite(nextLimit) || nextLimit < 1) return;
    setLimit(nextLimit);
    setPage(1);
  };

  return (
    <div className='flex min-h-0 w-full max-w-full flex-1 flex-col gap-4 overflow-x-hidden'>
      <div className='w-full max-w-full overflow-hidden rounded-xl border bg-card p-3 sm:p-4'>
        <div className='flex min-w-0 flex-col gap-2 p-1'>
          <div className='flex items-center justify-between gap-2'>
            <h3 className='min-w-0 wrap-break-word text-lg font-bold'>Monitor Table</h3>
            <div className='flex items-center gap-2'>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    type='button'
                    variant='outline'
                    size='sm'
                    className='h-8 border-slate-300 bg-slate-100 px-2 text-xs text-slate-800 hover:bg-slate-200'
                  >
                    <Columns3 className='mr-1 h-4 w-4' /> View
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align='end' className='w-56'>
                  <DropdownMenuLabel>Visible Columns</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {columnDefs.map((column) => (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      checked={!!visibleColumns[column.id]}
                      onCheckedChange={(checked) =>
                        setVisibleColumns((prev) => ({ ...prev, [column.id]: !!checked }))
                      }
                    >
                      {column.label}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              <Button
                type='button'
                variant='outline'
                size='sm'
                className='h-8 shrink-0 border-slate-300 bg-slate-100 px-2 text-xs text-slate-800 hover:bg-slate-200 sm:hidden'
                onClick={() => setIsControlsOpen((prev) => !prev)}
              >
                {isControlsOpen ? (
                  <>
                    <ChevronUp className='mr-1 h-4 w-4' /> Hide
                  </>
                ) : (
                  <>
                    <ChevronDown className='mr-1 h-4 w-4' /> Filters
                  </>
                )}
              </Button>
            </div>
          </div>

          <div className={`${isControlsOpen ? 'flex' : 'hidden'} w-full min-w-0 flex-col gap-2 sm:flex`}>
            <div className='flex w-full min-w-0 flex-col gap-2'>
              <div className='flex w-full min-w-0 items-center gap-1.5 overflow-hidden rounded-md border bg-muted/40 px-2 py-1'>
                <Filter className='h-4 w-4 shrink-0 text-muted-foreground' />
                <Input
                  type='date'
                  value={filterStartDate}
                  onChange={(e) => setFilterStartDate(e.target.value)}
                  className='h-7 min-w-0 flex-1 border-0 bg-transparent px-1 text-xs shadow-none'
                />
                <span className='text-muted-foreground'>-</span>
                <Input
                  type='date'
                  value={filterEndDate}
                  onChange={(e) => setFilterEndDate(e.target.value)}
                  className='h-7 min-w-0 flex-1 border-0 bg-transparent px-1 text-xs shadow-none'
                />
                {(filterStartDate || filterEndDate) && (
                  <button
                    onClick={() => {
                      setFilterStartDate('');
                      setFilterEndDate('');
                    }}
                    className='px-1 text-xs font-bold text-red-500'
                    type='button'
                  >
                    ✕
                  </button>
                )}
              </div>

              <div className='flex w-full items-center gap-1.5 overflow-x-auto pb-1'>
                <Button
                  size='sm'
                  className='h-8 shrink-0 bg-amber-400 px-2.5 text-xs text-slate-900 hover:bg-amber-500'
                  onClick={() => handleRun('demo')}
                  title='Test Demo'
                >
                  <Play className='h-4 w-4' />
                  <span className='ml-1.5'>Demo</span>
                </Button>
                <Button
                  size='sm'
                  className='h-8 shrink-0 bg-emerald-600 px-2.5 text-xs hover:bg-emerald-700'
                  onClick={() => handleRun('manual')}
                  title='Create Manual Job'
                >
                  <RotateCcw className='h-4 w-4' />
                  <span className='ml-1.5'>Manual</span>
                </Button>
                <Button
                  size='sm'
                  variant='destructive'
                  className='h-8 shrink-0 px-2.5 text-xs'
                  onClick={handleDeleteAll}
                  title='Delete All'
                >
                  <Trash2 className='h-4 w-4' />
                  <span className='ml-1.5'>Delete</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className='relative flex min-h-0 w-full flex-1'>
        <div className='absolute inset-0 flex min-w-0 flex-col overflow-hidden rounded-xl border bg-card'>
          <ScrollArea className='min-h-0 flex-1 w-full'>
            <table className='w-full min-w-[1220px] border-collapse text-left text-sm'>
            <thead className='sticky top-0 z-10 bg-muted/80'>
              <tr>
                {visibleColumns.id && <th className='px-4 py-3'>ID</th>}
                {visibleColumns.type && <th className='px-4 py-3'>Type</th>}
                {visibleColumns.dataRange && <th className='px-4 py-3'>Data Range</th>}
                {visibleColumns.startTime && <th className='px-4 py-3'>Start Time</th>}
                {visibleColumns.endTime && <th className='px-4 py-3'>End Time</th>}
                {visibleColumns.duration && <th className='px-4 py-3'>Duration</th>}
                {visibleColumns.status && <th className='px-4 py-3'>Status</th>}
                {visibleColumns.events && <th className='px-4 py-3 text-center'>Events</th>}
                {visibleColumns.actions && <th className='px-4 py-3 text-right'>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {!isLoading && history.length === 0 && (
                <tr>
                  <td
                    colSpan={Object.values(visibleColumns).filter(Boolean).length || 1}
                    className='p-10 text-center text-muted-foreground'
                  >
                    No history available.
                  </td>
                </tr>
              )}

              {history.map((job) => (
                <tr key={job.id} className='border-t hover:bg-muted/40'>
                  {visibleColumns.id && (
                    <td className='px-4 py-3 font-mono text-muted-foreground'>#{job.id}</td>
                  )}
                  {visibleColumns.type && (
                    <td className='px-4 py-3'>
                    <span className={`rounded-md px-2 py-1 text-xs font-bold uppercase ${getRunTypeClass(job.run_type)}`}>
                      {job.run_type || '-'}
                    </span>
                  </td>
                  )}
                  {visibleColumns.dataRange && (
                    <td className='px-4 py-3'>{formatDataRange(job.date_since, job.date_until)}</td>
                  )}
                  {visibleColumns.startTime && (
                    <td className='px-4 py-3 font-mono'>
                    {job.start_time ? (
                      formatRawTime(job.start_time)
                    ) : job.scheduled_at ? (
                      <span className='inline-flex items-center gap-1 rounded border border-amber-200 bg-amber-50 px-2 py-0.5 font-semibold text-amber-700'>
                        <Clock className='h-3.5 w-3.5' /> {formatRawTime(job.scheduled_at)}
                      </span>
                    ) : (
                      <span className='text-xs italic text-muted-foreground'>Pending...</span>
                    )}
                  </td>
                  )}
                  {visibleColumns.endTime && (
                    <td className='px-4 py-3 font-mono'>
                    {job.end_time ? formatRawTime(job.end_time) : <span className='italic text-blue-500'>Running...</span>}
                  </td>
                  )}
                  {visibleColumns.duration && (
                    <td className='px-4 py-3 font-mono'>
                    {job.duration || calculateDuration(job.start_time, job.end_time)}
                  </td>
                  )}
                  {visibleColumns.status && (
                    <td className='px-4 py-3'>
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-bold ${
                        job.status === 'Success'
                          ? 'bg-emerald-100 text-emerald-700'
                          : isRunningState(job.status)
                            ? 'bg-blue-100 text-blue-700'
                            : job.status === 'Cancelled'
                              ? 'bg-slate-200 text-slate-700'
                              : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {isRunningState(job.status) && <RefreshCw className='h-3 w-3 animate-spin' />}
                      {job.status}
                    </span>
                  </td>
                  )}
                  {visibleColumns.events && (
                    <td className='px-4 py-3 text-center font-bold text-blue-600'>{job.total_events ?? 0}</td>
                  )}
                  {visibleColumns.actions && (
                    <td className='px-4 py-3'>
                    <div className='flex justify-end gap-1'>
                      {isRunningState(job.status) && (
                        <button
                          className='inline-flex items-center gap-1 rounded border border-red-200 px-2 py-1 text-red-500 hover:bg-red-50'
                          type='button'
                          onClick={() => handleStop(job.id)}
                        >
                          <StopCircle className='h-4 w-4' /> STOP
                        </button>
                      )}

                      {job.date_since && (
                        <button
                          className='rounded p-2 text-purple-600 hover:bg-purple-50'
                          type='button'
                          title='Download Raw JSON'
                          onClick={() => handleDownloadRaw(job.id)}
                        >
                          <Download className='h-4 w-4' />
                        </button>
                      )}

                      {['Failed', 'Cancelled', 'Success', 'Skipped'].includes(job.status) && (
                        <button
                          className='inline-flex items-center gap-1 rounded border border-blue-200 px-2 py-1 text-blue-600 hover:bg-blue-50'
                          type='button'
                          onClick={() => handleRun('retry', job.id)}
                        >
                          <RotateCcw className='h-4 w-4' />
                          {job.status === 'Cancelled' ? 'Resume' : 'Retry'}
                        </button>
                      )}

                      <button
                        className='rounded p-2 text-blue-600 hover:bg-blue-50'
                        type='button'
                        onClick={() => setSelectedJob(job)}
                      >
                        <FileText className='h-4 w-4' />
                      </button>

                      <button
                        className='rounded p-2 text-muted-foreground hover:bg-muted hover:text-red-600'
                        type='button'
                        onClick={() => handleDeleteSingle(job.id)}
                      >
                        <Trash2 className='h-4 w-4' />
                      </button>
                    </div>
                  </td>
                  )}
                </tr>
              ))}
            </tbody>
            </table>
            <ScrollBar orientation='horizontal' />
          </ScrollArea>

          <div className='border-t bg-muted/30 p-3'>
            <SimpleTablePagination
              page={pagination.current_page}
              totalPages={pagination.total_pages}
              totalRecords={pagination.total_records || 0}
              pageSize={limit}
              pageSizeOptions={LIMIT_OPTIONS}
              onPageChange={handlePageChange}
              onPageSizeChange={handleLimitChange}
            />
          </div>
        </div>
      </div>

      <Dialog open={!!selectedJob} onOpenChange={(open) => !open && setSelectedJob(null)}>
        <DialogContent className='w-[calc(100vw-1.5rem)] max-w-4xl'>
          <DialogHeader>
            <DialogTitle>Log Details #{selectedJob?.id}</DialogTitle>
          </DialogHeader>

          <div className='rounded-md bg-slate-900 p-4 font-mono text-xs text-green-400'>
            <div className='max-h-[420px] overflow-auto whitespace-pre-wrap'>
              {selectedJob?.logs || 'No logs recorded.'}
            </div>
          </div>

          <div className='flex flex-col justify-end gap-2 sm:flex-row'>
            {selectedJob && isRunningState(selectedJob.status) && (
              <Button
                variant='destructive'
                className='w-full sm:w-auto'
                onClick={() => handleStop(selectedJob.id)}
              >
                <StopCircle className='mr-2 h-4 w-4' /> Stop
              </Button>
            )}
            {selectedJob && (
              <Button
                variant='outline'
                className='w-full border-slate-300 bg-slate-100 text-slate-800 hover:bg-slate-200 sm:w-auto'
                onClick={() => handleRun('retry', selectedJob.id)}
              >
                <RotateCcw className='mr-2 h-4 w-4' /> Retry
              </Button>
            )}
            <Button
              variant='ghost'
              className='w-full bg-slate-100 text-slate-800 hover:bg-slate-200 sm:w-auto'
              onClick={() => setSelectedJob(null)}
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showManualModal} onOpenChange={setShowManualModal}>
        <DialogContent className='w-[calc(100vw-1.5rem)] max-w-lg'>
          <DialogHeader>
            <DialogTitle className='flex items-center gap-2'>
              <RotateCcw className='h-4 w-4 text-emerald-600' /> Create Manual Job
            </DialogTitle>
          </DialogHeader>

          <div className='space-y-4'>
            <div>
              <Label>Selected Project</Label>
              <select
                className='mt-2 h-9 w-full rounded-md border bg-background px-3 text-sm'
                value={manualConfig.appId}
                onChange={(e) =>
                  setManualConfig((prev) => ({ ...prev, appId: e.target.value }))
                }
              >
                {apps.map((app) => (
                  <option key={app.id} value={app.id}>
                    {app.name} (ID: {app.id})
                  </option>
                ))}
              </select>
            </div>

            <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
              <div>
                <Label>From (Start Time)</Label>
                <Input
                  type='datetime-local'
                  value={manualConfig.startTime}
                  onChange={(e) =>
                    setManualConfig((prev) => ({ ...prev, startTime: e.target.value }))
                  }
                  className='mt-2'
                />
              </div>

              <div>
                <Label>To (End Time)</Label>
                <Input
                  type='datetime-local'
                  value={manualConfig.endTime}
                  onChange={(e) =>
                    setManualConfig((prev) => ({ ...prev, endTime: e.target.value }))
                  }
                  className='mt-2'
                />
              </div>
            </div>

            <div>
              <Label className='flex items-center gap-2'>
                <Clock className='h-4 w-4' /> Schedule Execution (Optional)
              </Label>
              <Input
                type='datetime-local'
                value={manualConfig.executionTime}
                onChange={(e) =>
                  setManualConfig((prev) => ({ ...prev, executionTime: e.target.value }))
                }
                className='mt-2'
              />
              <p className='mt-1 text-xs text-muted-foreground'>
                {manualConfig.executionTime
                  ? 'Job will stay pending and run at this time.'
                  : 'Leave empty to run immediately.'}
              </p>
            </div>
          </div>

          <div className='flex flex-col justify-end gap-2 sm:flex-row'>
            <Button
              variant='outline'
              className='w-full border-slate-300 bg-slate-100 text-slate-800 hover:bg-slate-200 sm:w-auto'
              onClick={() => setShowManualModal(false)}
            >
              <X className='mr-2 h-4 w-4' /> Cancel
            </Button>
            <Button
              className='w-full bg-emerald-600 hover:bg-emerald-700 sm:w-auto'
              onClick={handleSubmitManual}
            >
              <Play className='mr-2 h-4 w-4' /> Create Job
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {!selectedApp && (
        <div className='rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground'>
          No project found. Please create/select project in System Settings.
        </div>
      )}
    </div>
  );
}
