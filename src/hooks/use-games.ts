import { useQuery } from '@tanstack/react-query';
import gameService from '@/services/game.service';

export function useGames() {
  return useQuery({
    queryKey: ['games'],
    queryFn: () => gameService.getGames()
  });
}
