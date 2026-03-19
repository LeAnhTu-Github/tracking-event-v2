export type ConfigType = 'INDIVIDUAL' | 'GENERAL';

export interface RewardItem {
  type: string;
  amount?: number;
  codeItem?: string;
  duration_days: number | null;
}

export interface PaymentVendor {
  status: string;
  paymentType: string;
  itemCode?: string;
  amount?: number;
  duration_days?: number | null;
}

export interface RewardBonus {
  percentBonus: number | null;
  typeBonus: RewardItem[];
  paymentVendor: PaymentVendor[];
}

export interface RewardConfig {
  rewardBonus: RewardBonus;
  completionRewardDefault: RewardItem[];
}

export interface LevelReward {
  id: number;
  name: string;
  gameId: string;
  type: ConfigType;
  rewardConfig: RewardConfig;
  levelNumbers: number[];
  createdTime: string;
  lastUpdatedTime: string;
}

export interface LevelRewardResponse {
  pageIndex: number;
  pageSize: number;
  totalPages: number;
  totalRecords: number;
  beginIndex: number;
  endIndex: number;
  data: LevelReward[];
}
