export type DateRangePresetId = 'today' | 'last7d' | 'last30d';

type DateRange = {
  readonly startDate: string;
  readonly endDate: string;
};

const pad2 = (value: number): string => String(value).padStart(2, '0');

export const formatLocalDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = pad2(date.getMonth() + 1);
  const day = pad2(date.getDate());
  return `${year}-${month}-${day}`;
};

export const getDefaultDateRange = (): DateRange => getPresetDateRange('last7d');

export const getPresetDateRange = (presetId: DateRangePresetId): DateRange => {
  const end = new Date();
  const start = new Date();
  if (presetId === 'today') start.setDate(end.getDate());
  if (presetId === 'last7d') start.setDate(end.getDate() - 7);
  if (presetId === 'last30d') start.setDate(end.getDate() - 30);
  return { startDate: formatLocalDate(start), endDate: formatLocalDate(end) };
};

