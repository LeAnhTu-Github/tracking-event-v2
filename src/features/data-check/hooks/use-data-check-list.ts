import { useQuery } from '@tanstack/react-query';
import dataCheckService from '@/services/data-check.service';

export const useDataCheckList = (
  appId: number | null,
  page: number,
  limit: number,
  startDate: string,
  endDate: string,
  version: string,
  geo: string
) => {
  return useQuery({
    queryKey: ['data-check-list', appId, page, limit, startDate, endDate, version, geo],
    queryFn: () =>
      dataCheckService.getList({
        appId: appId as number,
        page,
        limit,
        startDate,
        endDate,
        version,
        geo
      }),
    enabled: !!appId,
    placeholderData: (previousData) => previousData
  });
};

export const useDataCheckFilterOptions = (appId: number | null) => {
  return useQuery({
    queryKey: ['data-check-filter-options', appId],
    queryFn: () => dataCheckService.getFilterOptions(appId as number),
    enabled: !!appId,
    staleTime: 1000 * 60 * 5
  });
};
