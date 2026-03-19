import { useQuery } from '@tanstack/react-query';
import systemMonitorService from '@/services/system-monitor.service';

export const useMonitorHistory = (
  appId: number | null,
  page: number,
  limit: number,
  startDate: string,
  endDate: string
) => {
  return useQuery({
    queryKey: ['monitor-history', appId, page, limit, startDate, endDate],
    queryFn: () =>
      systemMonitorService.getHistory({
        appId: appId as number,
        page,
        limit,
        startDate,
        endDate
      }),
    enabled: !!appId,
    refetchInterval: 3000,
    placeholderData: (previousData) => previousData
  });
};
