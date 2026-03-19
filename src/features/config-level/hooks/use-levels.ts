import { useQuery } from '@tanstack/react-query';
import { levelService } from '@/services/level.service';
import { LevelFilter } from '@/types/level.type';

export function useLevels(filter: LevelFilter) {
  return useQuery({
    queryKey: ['levels', filter],
    queryFn: () => levelService.getLevelList(filter)
  });
}

export function useLevelDetail(id: string | number) {
  return useQuery({
    queryKey: ['level', id],
    queryFn: () => levelService.getLevelDetail(id),
    enabled: !!id
  });
}
