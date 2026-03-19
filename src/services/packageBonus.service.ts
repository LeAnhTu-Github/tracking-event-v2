import { api } from './api';

const API_BASE_URL = '/packageBonus';

interface IPackageBonus {
  id: number;
  packageCode: string;
}

const packageBonusService = {
  getPackageBonuses: async () => {
    return await api.get<IPackageBonus[]>(`${API_BASE_URL}/package`);
  }
};

export default packageBonusService;
