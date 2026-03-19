import { useQuery } from '@tanstack/react-query';

import {
  getDashboardOverview,
  type GetDashboardOverviewInput
} from '@/api/dashboard';

export const useDashboardOverview = ({
  appId,
  startDate,
  endDate
}: GetDashboardOverviewInput) => {
  return useQuery({
    queryKey: ['dashboard-overview', appId, startDate, endDate],
    queryFn: () => getDashboardOverview({ appId, startDate, endDate }),
    enabled: !!appId,
    staleTime: 1000 * 60 * 5,
    placeholderData: (previousData) => previousData
  });
};

