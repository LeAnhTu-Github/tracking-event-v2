import { api } from '@/services/api';

const gameService = {
  getGames: async (): Promise<string[]> => {
    return api.get<string[]>('/games');
  }
};

export default gameService;
