import { useQuery } from '@tanstack/react-query';

import { getApps } from '@/api/apps';

/**
 * React Query hook to load tracking apps list.
 */
export const useApps = () => {
  return useQuery({
    queryKey: ['apps'],
    queryFn: () => getApps(),
    staleTime: 1000 * 60 * 5
  });
};

