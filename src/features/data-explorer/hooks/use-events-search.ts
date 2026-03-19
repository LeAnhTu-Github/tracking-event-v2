import { useQuery } from '@tanstack/react-query';

import dataExplorerService from '@/services/data-explorer.service';

export const useEventsSearch = (
  appId: number | null,
  page: number,
  limit: number,
  startDate: string,
  endDate: string,
  keyword: string,
  eventName: string,
  level: string
) => {
  return useQuery({
    queryKey: ['events-search', appId, page, limit, startDate, endDate, keyword, eventName, level],
    queryFn: () =>
      dataExplorerService.searchEvents({
        appId: appId as number,
        page,
        limit,
        startDate,
        endDate,
        keyword: keyword.trim() || undefined,
        eventName: eventName.trim() || undefined,
        level: level.trim() || undefined
      }),
    enabled: !!appId && !!startDate && !!endDate,
    placeholderData: (previousData) => previousData
  });
};

