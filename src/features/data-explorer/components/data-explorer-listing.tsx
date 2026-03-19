'use client';

import * as React from 'react';
import {
  Calendar,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronsLeft,
  ChevronsRight,
  Columns3,
  FileJson,
  Loader2,
  Search,
  UserMinus,
  X
} from 'lucide-react';
import { toast } from 'sonner';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';

import { Button } from '@/components/ui/button';
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
import { useEventsSearch } from '@/features/data-explorer/hooks/use-events-search';
import type {
  EventsSearchPagination,
  TrackingApp,
  TrackingEventRow
} from '@/features/data-explorer/types';
import dataExplorerService from '@/services/data-explorer.service';
import {
  resolveSelectedAppId,
  SELECTED_APP_CHANGED_EVENT,
  writeSelectedAppId
} from '@/lib/selected-app';

import EventJsonModal from './event-json-modal';
import DropUserModal from './drop-user-modal';

const VIEW_COLUMNS_KEY = 'data_explorer_view_columns';

const KEYWORD_DEBOUNCE_MS = 350;
const DEFAULT_LIMIT = 50;
const LIMIT_OPTIONS = [10, 20, 50, 100, 200, 500] as const;

const defaultPagination: EventsSearchPagination = {
  current_page: 1,
  total_pages: 1,
  total_records: 0,
  limit: DEFAULT_LIMIT
};

const getDefaultRange = () => {
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - 1);
  const format = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };
  return { start: format(start), end: format(end) };
};

type ColumnMeta = {
  id: string;
  label: string;
  headerClassName?: string;
  cellClassName?: string;
  render: (row: TrackingEventRow) => React.ReactNode;
};

const readParam = (params: URLSearchParams, key: string, fallback: string) =>
  params.get(key) ?? fallback;

const readParamNumber = (
  params: URLSearchParams,
  key: string,
  fallback: number,
  min: number,
  max: number
) => {
  const raw = params.get(key);
  if (!raw) return fallback;
  const parsed = Number(raw);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(max, Math.max(min, Math.floor(parsed)));
};

export default function DataExplorerListing() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [apps, setApps] = React.useState<TrackingApp[]>([]);
  const [selectedAppId, setSelectedAppId] = React.useState<number | null>(null);

  const defaultRange = React.useMemo(() => getDefaultRange(), []);

  const [startDate, setStartDate] = React.useState(defaultRange.start);
  const [endDate, setEndDate] = React.useState(defaultRange.end);
  const [limit, setLimit] = React.useState(DEFAULT_LIMIT);
  const [page, setPage] = React.useState(1);

  const [keywordInput, setKeywordInput] = React.useState('');
  const [keyword, setKeyword] = React.useState('');
  const [eventName, setEventName] = React.useState('');
  const [level, setLevel] = React.useState('');

  const [isControlsOpen, setIsControlsOpen] = React.useState(true);
  const [selectedRow, setSelectedRow] = React.useState<TrackingEventRow | null>(null);
  const [isDropUserOpen, setIsDropUserOpen] = React.useState(false);

  const baseColumns = React.useMemo<ColumnMeta[]>(
    () => [
      {
        id: 'id',
        label: 'ID',
        headerClassName: 'w-[96px]',
        cellClassName: 'font-mono text-muted-foreground',
        render: (row) => `#${row.id}`
      },
      {
        id: 'created_at',
        label: 'Time',
        headerClassName: 'w-[240px]',
        cellClassName: 'font-mono text-xs',
        render: (row) => row.created_at
      },
      {
        id: 'event_name',
        label: 'Event Name',
        headerClassName: 'w-[240px]',
        render: (row) => (
          <span className='inline-flex items-center rounded-md border bg-background px-2 py-1 text-xs font-semibold'>
            {row.event_name}
          </span>
        )
      },
      {
        id: 'key_info',
        label: 'Key Info',
        headerClassName: 'w-[320px]',
        cellClassName: 'text-xs',
        render: (row) =>
          row.key_info ? (
            <span className='text-slate-700'>{row.key_info}</span>
          ) : (
            <span className='text-muted-foreground italic'>-</span>
          )
      },
      {
        id: 'raw_preview',
        label: 'Raw Preview',
        cellClassName: 'font-mono text-[11px] text-muted-foreground max-w-[520px]',
        render: (row) => {
          let preview = '';
          try {
            preview = JSON.stringify(row.event_json);
          } catch {
            preview = '';
          }
          return <span className='block truncate'>{preview}</span>;
        }
      },
      {
        id: 'actions',
        label: '',
        headerClassName: 'w-[72px] text-right',
        cellClassName: 'text-right',
        render: (row) => (
          <button
            type='button'
            className='inline-flex rounded p-2 text-muted-foreground hover:bg-muted hover:text-primary'
            onClick={() => setSelectedRow(row)}
            title='View JSON'
          >
            <FileJson className='h-4 w-4' />
          </button>
        )
      }
    ],
    []
  );

  const [visibleColumns, setVisibleColumns] = React.useState<Record<string, boolean>>({});

  React.useEffect(() => {
    const stored = window.localStorage.getItem(VIEW_COLUMNS_KEY);
    const parsed = stored ? (JSON.parse(stored) as Record<string, boolean>) : {};

    const isMobile = window.innerWidth < 640;
    const nextMap: Record<string, boolean> = {};
    baseColumns.forEach((col) => {
      const defaultVisible =
        col.id === 'actions'
          ? true
          : col.id === 'raw_preview'
            ? !isMobile
            : true;
      nextMap[col.id] = parsed[col.id] ?? defaultVisible;
    });
    nextMap.actions = true;

    setVisibleColumns((prev) => {
      const prevKeys = Object.keys(prev);
      const nextKeys = Object.keys(nextMap);
      if (prevKeys.length === nextKeys.length) {
        let isSame = true;
        for (const key of nextKeys) {
          if (prev[key] !== nextMap[key]) {
            isSame = false;
            break;
          }
        }
        if (isSame) return prev;
      }
      return nextMap;
    });
  }, [baseColumns]);

  React.useEffect(() => {
    if (Object.keys(visibleColumns).length === 0) return;
    window.localStorage.setItem(VIEW_COLUMNS_KEY, JSON.stringify(visibleColumns));
  }, [visibleColumns]);

  const displayedColumns = React.useMemo(
    () => baseColumns.filter((col) => visibleColumns[col.id]),
    [baseColumns, visibleColumns]
  );

  const loadApps = React.useCallback(async () => {
    try {
      const appList = await dataExplorerService.getApps();
      setApps(appList);

      if (appList.length === 0) {
        setSelectedAppId(null);
        return;
      }

      const initialId = resolveSelectedAppId(appList, 1);
      if (!initialId) return;

      setSelectedAppId(initialId);
      writeSelectedAppId(initialId);
    } catch {
      setApps([]);
      toast.error('Load apps failed');
    }
  }, []);

  React.useEffect(() => {
    loadApps();
  }, [loadApps]);

  React.useEffect(() => {
    const syncSelectedApp = () => {
      const nextId = resolveSelectedAppId(apps, 1);
      if (!nextId) return;
      setSelectedAppId((prev) => (prev === nextId ? prev : nextId));
    };

    syncSelectedApp();
    window.addEventListener(SELECTED_APP_CHANGED_EVENT, syncSelectedApp as EventListener);
    window.addEventListener('storage', syncSelectedApp);
    window.addEventListener('focus', syncSelectedApp);
    return () => {
      window.removeEventListener(
        SELECTED_APP_CHANGED_EVENT,
        syncSelectedApp as EventListener
      );
      window.removeEventListener('storage', syncSelectedApp);
      window.removeEventListener('focus', syncSelectedApp);
    };
  }, [apps]);

  const { data: levels } = useQuery({
    queryKey: ['data-explorer-levels', selectedAppId],
    queryFn: () => dataExplorerService.getLevels(selectedAppId as number),
    enabled: !!selectedAppId,
    staleTime: 1000 * 60 * 10
  });

  React.useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    const nextStart = readParam(params, 'start_date', defaultRange.start);
    const nextEnd = readParam(params, 'end_date', defaultRange.end);
    const nextLimit = readParamNumber(params, 'limit', DEFAULT_LIMIT, 1, 500);
    const nextPage = readParamNumber(params, 'page', 1, 1, 1_000_000);
    const nextKeyword = readParam(params, 'keyword', '');
    const nextEventName = readParam(params, 'event_name', '');
    const nextLevel = readParam(params, 'level', '');

    setStartDate(nextStart);
    setEndDate(nextEnd);
    setLimit(nextLimit);
    setPage(nextPage);
    setKeywordInput(nextKeyword);
    setKeyword(nextKeyword);
    setEventName(nextEventName);
    setLevel(nextLevel);
  }, [searchParams, defaultRange.start, defaultRange.end]);

  React.useEffect(() => {
    const handle = window.setTimeout(() => {
      setKeyword(keywordInput);
      setPage(1);
    }, KEYWORD_DEBOUNCE_MS);
    return () => window.clearTimeout(handle);
  }, [keywordInput]);

  React.useEffect(() => {
    const syncByViewport = () => {
      setIsControlsOpen(window.innerWidth >= 640);
    };
    syncByViewport();
    window.addEventListener('resize', syncByViewport);
    return () => window.removeEventListener('resize', syncByViewport);
  }, []);

  React.useEffect(() => {
    const params = new URLSearchParams();
    params.set('start_date', startDate);
    params.set('end_date', endDate);
    params.set('limit', String(limit));
    params.set('page', String(page));
    if (keyword.trim()) params.set('keyword', keyword.trim());
    if (eventName.trim()) params.set('event_name', eventName.trim());
    if (level.trim()) params.set('level', level.trim());

    const qs = params.toString();
    router.replace(qs ? `?${qs}` : '?');
  }, [router, startDate, endDate, limit, page, keyword, eventName, level]);

  React.useEffect(() => {
    setPage(1);
  }, [selectedAppId, startDate, endDate, limit, eventName, level]);

  const { data, isLoading, refetch, isRefetching, error } = useEventsSearch(
    selectedAppId,
    page,
    limit,
    startDate,
    endDate,
    keyword,
    eventName,
    level
  );

  React.useEffect(() => {
    if (!error) return;
    toast.error(error instanceof Error ? error.message : 'Load events failed');
  }, [error]);

  const rows = data?.data ?? [];
  const pagination = data?.pagination ?? defaultPagination;

  const toggleColumn = (id: string, checked: boolean) => {
    if (id === 'actions') return;
    setVisibleColumns((prev) => ({ ...prev, [id]: checked }));
  };

  const handlePageChange = (nextPage: number) => {
    if (nextPage < 1 || nextPage > pagination.total_pages) return;
    setPage(nextPage);
  };

  const handleLimitChange = (nextLimit: number) => {
    if (!Number.isFinite(nextLimit) || nextLimit < 1) return;
    setLimit(nextLimit);
    setPage(1);
  };

  const handleReset = () => {
    const range = getDefaultRange();
    setStartDate(range.start);
    setEndDate(range.end);
    setLimit(DEFAULT_LIMIT);
    setPage(1);
    setKeywordInput('');
    setKeyword('');
    setEventName('');
    setLevel('');
  };

  const showLoading = isLoading || isRefetching;

  return (
    <div className='flex min-h-0 w-full max-w-full flex-1 flex-col gap-4 overflow-x-hidden'>
      <div className='w-full max-w-full overflow-hidden rounded-xl border bg-card p-3 sm:p-4'>
        <div className='flex min-w-0 flex-col gap-2 p-1'>
          <div className='flex items-center justify-between gap-2'>
            <h3 className='min-w-0 wrap-break-word text-lg font-bold'>Events Explorer</h3>
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
                <DropdownMenuContent align='end' className='max-h-[60vh] w-64'>
                  <DropdownMenuLabel>Visible Columns</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {baseColumns.map((col) => (
                    <DropdownMenuCheckboxItem
                      key={col.id}
                      checked={!!visibleColumns[col.id]}
                      disabled={col.id === 'actions'}
                      onCheckedChange={(checked) => toggleColumn(col.id, !!checked)}
                    >
                      {col.label || 'Actions'}
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

          <div className={`${isControlsOpen ? 'flex' : 'hidden'} w-full min-w-0 flex-col gap-3 sm:flex`}>
            <div className='grid w-full min-w-0 grid-cols-1 gap-2 lg:grid-cols-4'>
              <div className='flex w-full min-w-0 flex-col gap-1 lg:col-span-2'>
                <Label className='text-xs text-muted-foreground'>Keyword / User ID</Label>
                <div className='relative'>
                  <Search className='absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
                  <Input
                    value={keywordInput}
                    onChange={(e) => setKeywordInput(e.target.value)}
                    placeholder='Search Context...'
                    className='h-9 pl-9'
                  />
                </div>
              </div>

              <div className='flex w-full min-w-0 flex-col gap-1'>
                <Label className='text-xs text-muted-foreground'>Event Name</Label>
                <Input
                  value={eventName}
                  onChange={(e) => setEventName(e.target.value)}
                  placeholder='e.g. level_win'
                  className='h-9'
                />
              </div>

              <div className='flex w-full min-w-0 flex-col gap-1'>
                <Label className='text-xs text-muted-foreground'>Level Filter</Label>
                <select
                  className='h-9 w-full min-w-0 rounded-md border bg-background px-2.5 text-sm'
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                >
                  <option value=''>All Levels</option>
                  {(levels || []).map((lvl) => (
                    <option key={lvl} value={lvl}>
                      Level {lvl}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className='grid w-full min-w-0 grid-cols-1 gap-2 lg:grid-cols-4'>
              <div className='flex w-full min-w-0 flex-col gap-1'>
                <Label className='flex items-center gap-1 text-xs text-muted-foreground'>
                  <Calendar className='h-3.5 w-3.5' /> From
                </Label>
                <Input
                  type='date'
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className='h-9'
                />
              </div>

              <div className='flex w-full min-w-0 flex-col gap-1'>
                <Label className='flex items-center gap-1 text-xs text-muted-foreground'>
                  <Calendar className='h-3.5 w-3.5' /> To
                </Label>
                <Input
                  type='date'
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className='h-9'
                />
              </div>
              <div className='flex items-end gap-2'>
                <Button
                  size='sm'
                  className='h-9 px-3 text-xs'
                  onClick={() => {
                    setPage(1);
                    refetch();
                  }}
                  type='button'
                  disabled={!selectedAppId}
                >
                  {showLoading ? (
                    <Loader2 className='mr-1 h-4 w-4 animate-spin' />
                  ) : (
                    <Search className='mr-1 h-4 w-4' />
                  )}
                  Search
                </Button>
                <Button
                  size='sm'
                  className='h-9 bg-orange-500 px-3 text-xs hover:bg-orange-600'
                  onClick={() => setIsDropUserOpen(true)}
                  type='button'
                  disabled={!selectedAppId}
                >
                  <UserMinus className='mr-1 h-4 w-4' /> Tìm DropUser
                </Button>
                <Button
                  size='sm'
                  variant='outline'
                  className='h-9 border-slate-300 bg-slate-100 px-3 text-xs text-slate-800 hover:bg-slate-200'
                  onClick={handleReset}
                  type='button'
                >
                  <X className='mr-1 h-4 w-4' /> Clear
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className='relative flex min-h-0 w-full flex-1'>
        <div className='absolute inset-0 flex min-w-0 flex-col overflow-hidden rounded-xl border bg-card'>
          <ScrollArea className='min-h-0 w-full flex-1'>
            <table className='w-full min-w-[1200px] border-collapse text-left text-sm'>
              <thead className='sticky top-0 z-10 bg-muted/80'>
                <tr>
                  {displayedColumns.map((col) => (
                    <th
                      key={col.id}
                      className={`px-3 py-3 text-xs font-semibold ${col.headerClassName || ''}`}
                    >
                      {col.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {!showLoading && rows.length === 0 && (
                  <tr>
                    <td
                      colSpan={Math.max(displayedColumns.length, 1)}
                      className='p-10 text-center text-muted-foreground'
                    >
                      No events found for this filter.
                    </td>
                  </tr>
                )}
                {rows.map((row) => (
                  <tr key={row.id} className='border-t hover:bg-muted/30'>
                    {displayedColumns.map((col) => (
                      <td
                        key={col.id}
                        className={`px-3 py-3 align-top ${col.cellClassName || ''}`}
                      >
                        {col.render(row)}
                      </td>
                    ))}
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

      <EventJsonModal row={selectedRow} onClose={() => setSelectedRow(null)} />
      {selectedAppId && (
        <DropUserModal
          isOpen={isDropUserOpen}
          appId={selectedAppId}
          startDate={startDate}
          endDate={endDate}
          defaultLevel={level}
          onClose={() => setIsDropUserOpen(false)}
          onPickUuid={(uuid) => {
            setIsDropUserOpen(false);
            setKeywordInput(uuid);
            setKeyword(uuid);
            setEventName('');
            setLevel('');
            setPage(1);
            refetch();
          }}
        />
      )}
    </div>
  );
}

