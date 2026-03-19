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
  Download,
  Globe,
  Loader2,
  Search,
  Smartphone,
  X
} from 'lucide-react';
import { toast } from 'sonner';

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
import {
  useDataCheckFilterOptions,
  useDataCheckList
} from '@/features/data-check/hooks/use-data-check-list';
import {
  DataCheckPagination,
  DataCheckRow,
  TrackingApp
} from '@/features/data-check/types';
import {
  resolveSelectedAppId,
  SELECTED_APP_CHANGED_EVENT,
  writeSelectedAppId
} from '@/lib/selected-app';
import dataCheckService from '@/services/data-check.service';

const VIEW_COLUMNS_KEY = 'data_check_view_columns';
const EMPTY_ROWS: DataCheckRow[] = [];
const DEFAULT_LIMIT = 50;
const LIMIT_OPTIONS = [10, 20, 50, 100, 200, 500] as const;

const defaultPagination: DataCheckPagination = {
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

  return {
    start: format(start),
    end: format(end)
  };
};

const formatBoosterName = (key: string) => {
  const clean = key.replace('booster_', '');
  return `Booster ${clean.charAt(0).toUpperCase()}${clean.slice(1)}`;
};

const getDropColor = (rate: number) => {
  if (rate > 50) return 'text-red-600 font-bold bg-red-50';
  if (rate > 30) return 'text-orange-600 font-bold bg-orange-50';
  return 'text-slate-600 font-medium';
};

const renderCell = (val: number | undefined | null, suffix = '') => {
  const finalVal = val ?? 0;
  if (finalVal === 0) return <span className='text-slate-400'>0{suffix}</span>;
  return (
    <span className='font-medium text-slate-700'>
      {finalVal.toLocaleString()}
      {suffix}
    </span>
  );
};

type ColumnMeta = {
  id: string;
  label: string;
  className?: string;
  headerClassName?: string;
  render: (row: DataCheckRow) => React.ReactNode;
};

const baseColumns: ColumnMeta[] = [
  {
    id: 'level',
    label: 'Level',
    className: 'text-center font-bold',
    headerClassName: 'text-center bg-slate-100 text-slate-700',
    render: (row) => row.level
  },
  {
    id: 'user_start',
    label: 'User Start Level',
    className: 'text-center',
    headerClassName: 'text-center bg-gray-50/70',
    render: (row) => renderCell(row.user_start)
  },
  {
    id: 'user_win',
    label: 'User Win Level',
    className: 'text-center',
    headerClassName: 'text-center bg-gray-50/70',
    render: (row) => renderCell(row.user_win)
  },
  {
    id: 'level_drop',
    label: 'Level Drop',
    className: 'text-center',
    headerClassName: 'text-center bg-red-50/50 text-red-600',
    render: (row) => (
      <span className={getDropColor(row.level_drop)}>{renderCell(row.level_drop, '%')}</span>
    )
  },
  {
    id: 'drop_lost',
    label: 'Drop Lost',
    className: 'text-center',
    headerClassName: 'text-center bg-orange-50/50 text-orange-600',
    render: (row) => (
      <span className={getDropColor(row.drop_lost)}>{renderCell(row.drop_lost, '%')}</span>
    )
  },
  {
    id: 'next_drop',
    label: 'Drop 2 Levels',
    className: 'text-center',
    headerClassName: 'text-center bg-red-50/40 text-red-600',
    render: (row) => {
      if (row.next_drop === '-' || row.next_drop == null || row.next_drop === 0) {
        return <span className='text-slate-400'>0%</span>;
      }
      return <span className='font-medium text-slate-700'>{row.next_drop}%</span>;
    }
  },
  {
    id: 'play_count',
    label: 'Play Count',
    className: 'text-center',
    headerClassName: 'text-center',
    render: (row) => renderCell(row.play_count)
  },
  {
    id: 'unlock',
    label: 'Unlock',
    className: 'text-center',
    headerClassName: 'text-center bg-yellow-50/40 text-amber-700',
    render: (row) => renderCell(row.unlock)
  },
  {
    id: 'total_booster',
    label: 'Total Booster Used',
    className: 'text-center',
    headerClassName: 'text-center bg-blue-100/50 text-blue-800',
    render: (row) => renderCell(row.total_booster)
  },
  {
    id: 'revive_full',
    label: 'Revive Full',
    className: 'text-center',
    headerClassName: 'text-center bg-purple-50/30 text-purple-700',
    render: (row) => renderCell(row.revive_full)
  },
  {
    id: 'revive_moves',
    label: 'Revive Moves',
    className: 'text-center',
    headerClassName: 'text-center bg-purple-50/30 text-purple-700',
    render: (row) => renderCell(row.revive_moves)
  },
  {
    id: 'total_revive',
    label: 'Total Revive',
    className: 'text-center',
    headerClassName: 'text-center bg-purple-50/50 text-purple-800',
    render: (row) => renderCell(row.total_revive)
  },
  {
    id: 'avg_booster',
    label: 'Avg Booster & Revive/User',
    className: 'text-center',
    headerClassName: 'text-center bg-slate-100 text-slate-700',
    render: (row) => renderCell(row.avg_booster)
  },
  {
    id: 'avg_time',
    label: 'Avg Timeplay',
    className: 'text-center',
    headerClassName: 'text-center',
    render: (row) => renderCell(row.avg_time, 's')
  },
  {
    id: 'total_coin',
    label: 'Total Coin Spend',
    className: 'text-right font-mono',
    headerClassName: 'text-center bg-amber-50/70 text-amber-700',
    render: (row) =>
      row.total_coin > 0 ? (
        <span className='font-bold text-amber-700'>{row.total_coin.toLocaleString()}</span>
      ) : (
        <span className='text-slate-400'>0</span>
      )
  },
  {
    id: 'avg_coin',
    label: 'Avg Coin Spend/User/Level',
    className: 'text-right font-mono',
    headerClassName: 'text-center bg-amber-100/50 text-amber-800',
    render: (row) =>
      row.avg_coin > 0 ? (
        <span className='font-bold text-amber-600'>{row.avg_coin.toLocaleString()}</span>
      ) : (
        <span className='text-slate-400'>0</span>
      )
  }
];

export default function DataCheckListing() {
  const [apps, setApps] = React.useState<TrackingApp[]>([]);
  const [selectedAppId, setSelectedAppId] = React.useState<number | null>(null);

  const defaultRange = React.useMemo(() => getDefaultRange(), []);
  const [filterStartDate, setFilterStartDate] = React.useState(defaultRange.start);
  const [filterEndDate, setFilterEndDate] = React.useState(defaultRange.end);
  const [version, setVersion] = React.useState('All');
  const [geo, setGeo] = React.useState('All');
  const [limit, setLimit] = React.useState(DEFAULT_LIMIT);
  const [page, setPage] = React.useState(1);
  const [isControlsOpen, setIsControlsOpen] = React.useState(true);

  const {
    data: listData,
    isLoading,
    refetch,
    isRefetching
  } = useDataCheckList(selectedAppId, page, limit, filterStartDate, filterEndDate, version, geo);
  const { data: filterOptions } = useDataCheckFilterOptions(selectedAppId);

  const rows = listData?.data ?? EMPTY_ROWS;
  const pagination = listData?.pagination || defaultPagination;

  const boosterKeys = React.useMemo(() => {
    const keys = new Set<string>();
    rows.forEach((row) => {
      if (row.boosters) {
        Object.keys(row.boosters).forEach((key) => keys.add(key));
      }
    });
    return Array.from(keys).sort();
  }, [rows]);

  const boosterColumns = React.useMemo<ColumnMeta[]>(
    () =>
      boosterKeys.map((key) => ({
        id: `booster:${key}`,
        label: formatBoosterName(key),
        className: 'text-center',
        headerClassName: 'text-center bg-blue-50/20 text-slate-600',
        render: (row) => {
          const value = row.boosters?.[key] ?? 0;
          return value > 0 ? (
            <span className='font-medium text-slate-700'>{value.toLocaleString()}</span>
          ) : (
            <span className='text-slate-400'>0</span>
          );
        }
      })),
    [boosterKeys]
  );

  const allColumns = React.useMemo(
    () => [
      ...baseColumns.slice(0, 8),
      ...boosterColumns,
      ...baseColumns.slice(8)
    ],
    [boosterColumns]
  );

  const [visibleColumns, setVisibleColumns] = React.useState<Record<string, boolean>>({});

  React.useEffect(() => {
    const stored = window.localStorage.getItem(VIEW_COLUMNS_KEY);
    const parsed = stored ? (JSON.parse(stored) as Record<string, boolean>) : {};

    const nextMap: Record<string, boolean> = {};
    allColumns.forEach((column) => {
      nextMap[column.id] = parsed[column.id] ?? true;
    });
    nextMap.level = true;

    setVisibleColumns((prev) => {
      const prevKeys = Object.keys(prev);
      const nextKeys = Object.keys(nextMap);
      if (prevKeys.length === nextKeys.length) {
        let same = true;
        for (const key of nextKeys) {
          if (prev[key] !== nextMap[key]) {
            same = false;
            break;
          }
        }
        if (same) return prev;
      }
      return nextMap;
    });
  }, [allColumns]);

  React.useEffect(() => {
    if (Object.keys(visibleColumns).length === 0) return;
    window.localStorage.setItem(VIEW_COLUMNS_KEY, JSON.stringify(visibleColumns));
  }, [visibleColumns]);

  const displayedColumns = React.useMemo(
    () => allColumns.filter((column) => visibleColumns[column.id]),
    [allColumns, visibleColumns]
  );

  const loadApps = React.useCallback(async () => {
    try {
      const appList = await dataCheckService.getApps();
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
    const syncSelectedApp = () => {
      const nextId = resolveSelectedAppId(apps, 1);
      if (!nextId) return;
      setSelectedAppId((prev) => (prev === nextId ? prev : nextId));
    };

    syncSelectedApp();
    window.addEventListener(
      SELECTED_APP_CHANGED_EVENT,
      syncSelectedApp as EventListener
    );
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

  React.useEffect(() => {
    loadApps();
  }, [loadApps]);

  React.useEffect(() => {
    setPage(1);
  }, [selectedAppId, filterStartDate, filterEndDate, version, geo, limit]);

  React.useEffect(() => {
    const syncByViewport = () => {
      setIsControlsOpen(window.innerWidth >= 640);
    };
    syncByViewport();
    window.addEventListener('resize', syncByViewport);
    return () => window.removeEventListener('resize', syncByViewport);
  }, []);

  const toggleColumn = (id: string, checked: boolean) => {
    if (id === 'level') return;
    setVisibleColumns((prev) => ({
      ...prev,
      [id]: checked
    }));
  };

  const handleExport = async () => {
    if (!selectedAppId) return;
    try {
      const res = await fetch(
        dataCheckService.getExportUrl({
          appId: selectedAppId,
          startDate: filterStartDate,
          endDate: filterEndDate,
          version,
          geo
        })
      );

      if (!res.ok) throw new Error();
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `App_${selectedAppId}_DataCheck.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch {
      toast.error('Export failed');
    }
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
            <h3 className='min-w-0 wrap-break-word text-lg font-bold'>Data Check</h3>
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
                  {allColumns.map((column) => (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      checked={!!visibleColumns[column.id]}
                      disabled={column.id === 'level'}
                      onCheckedChange={(checked) => toggleColumn(column.id, !!checked)}
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
            <div className='grid w-full min-w-0 grid-cols-1 gap-2 lg:grid-cols-3'>
              <div className='flex w-full min-w-0 flex-col gap-1'>
                <Label className='flex items-center gap-1 text-xs text-muted-foreground'>
                  <Calendar className='h-3.5 w-3.5' /> Start Date
                </Label>
                <Input
                  type='date'
                  value={filterStartDate}
                  onChange={(e) => setFilterStartDate(e.target.value)}
                  className='h-9'
                />
              </div>

              <div className='flex w-full min-w-0 flex-col gap-1'>
                <Label className='flex items-center gap-1 text-xs text-muted-foreground'>
                  <Calendar className='h-3.5 w-3.5' /> End Date
                </Label>
                <Input
                  type='date'
                  value={filterEndDate}
                  onChange={(e) => setFilterEndDate(e.target.value)}
                  className='h-9'
                />
              </div>

              <div className='flex w-full min-w-0 items-end gap-2'>
                <Button
                  size='sm'
                  variant='outline'
                  className='h-9 border-slate-300 bg-slate-100 px-3 text-xs text-slate-800 hover:bg-slate-200'
                  onClick={() => {
                    const range = getDefaultRange();
                    setFilterStartDate(range.start);
                    setFilterEndDate(range.end);
                    setVersion('All');
                    setGeo('All');
                  }}
                >
                  <X className='mr-1 h-4 w-4' /> Reset
                </Button>
                <Button size='sm' className='h-9 px-3 text-xs' onClick={() => refetch()}>
                  {isRefetching ? (
                    <Loader2 className='mr-1 h-4 w-4 animate-spin' />
                  ) : (
                    <Search className='mr-1 h-4 w-4' />
                  )}
                  Check
                </Button>
              </div>
            </div>

            <div className='grid w-full min-w-0 grid-cols-1 gap-2 lg:grid-cols-4'>
              <div className='flex w-full min-w-0 flex-col gap-1'>
                <Label className='flex items-center gap-1 text-xs text-muted-foreground'>
                  <Smartphone className='h-3.5 w-3.5' /> Version
                </Label>
                <select
                  className='h-9 w-full min-w-0 rounded-md border bg-background px-2.5 text-sm'
                  value={version}
                  onChange={(e) => setVersion(e.target.value)}
                >
                  {(filterOptions?.versions || ['All']).map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>

              <div className='flex w-full min-w-0 flex-col gap-1'>
                <Label className='flex items-center gap-1 text-xs text-muted-foreground'>
                  <Globe className='h-3.5 w-3.5' /> Geo
                </Label>
                <select
                  className='h-9 w-full min-w-0 rounded-md border bg-background px-2.5 text-sm'
                  value={geo}
                  onChange={(e) => setGeo(e.target.value)}
                >
                  {(filterOptions?.geos || ['All']).map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>

              <div className='flex items-end'>
                <Button
                  size='sm'
                  className='h-9 border-slate-300 bg-slate-100 px-3 text-xs text-slate-800 hover:bg-slate-200'
                  variant='outline'
                  onClick={handleExport}
                >
                  <Download className='mr-1 h-4 w-4' /> Export
                </Button>
              </div>

              <div />
            </div>
          </div>
        </div>
      </div>

      <div className='relative flex min-h-0 w-full flex-1'>
        <div className='absolute inset-0 flex min-w-0 flex-col overflow-hidden rounded-xl border bg-card'>
          <ScrollArea className='min-h-0 w-full flex-1'>
            <table className='w-full min-w-[1600px] border-collapse text-left text-sm'>
              <thead className='sticky top-0 z-10 bg-muted/80'>
                <tr>
                  {displayedColumns.map((column) => (
                    <th
                      key={column.id}
                      className={`px-3 py-3 text-xs font-semibold ${column.headerClassName || column.className || ''}`}
                    >
                      {column.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {!isLoading && rows.length === 0 && (
                  <tr>
                    <td
                      colSpan={Math.max(displayedColumns.length, 1)}
                      className='p-10 text-center text-muted-foreground'
                    >
                      No data found for this filter.
                    </td>
                  </tr>
                )}

                {rows.map((row) => (
                  <tr key={row.level} className='border-t hover:bg-muted/30'>
                    {displayedColumns.map((column) => (
                      <td key={column.id} className={`px-3 py-3 ${column.className || ''}`}>
                        {column.render(row)}
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
    </div>
  );
}
