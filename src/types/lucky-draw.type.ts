export interface ILuckyDraw {
  id: number;
  code: string;
  obtainTime: string;
  userId: number;
  username: string;
  userPhoneNumber: string;
  poolId: number;
  poolName: string;
  prizeIcon: string;
  prizeId: number;
  prizeLevel: number;
  prizeName: string;
  prizeType: string;
  rewardStatus: number;
  rewardTime: string;
  status: number;
}

export interface ILuckyDrawRes {
  id: number;
  name: string;
  startTime: string;
  endTime: string;
  status: number;
  limitReward: number;
}

export interface ILuckyDrawPrize {
  name: string;
  quantity: number;
}

export interface ILuckyDrawHistory {
  id: number;
  rewardStatus: number;
  rewardTime: string;
  code: string;
  userId: number;
  userName: string;
  userPhoneNumber: string;
  poolId: number;
  poolName: string | null;
  poolType: string;
  prizeLevel: number;
  prizeLevelName: string;
  prizes: ILuckyDrawPrize[];
}

export interface ILuckyDrawCode {
  id: number;
  code: string;
  obtainTime: string;
  status: number;
  userId: number;
  username: string;
  userPhoneNumber: string;
  usedWeekly: number;
  usedMonthly: number;
  content: string;
}

export interface ILuckyDrawReq {
  id?: number;
  names: {
    name: string;
    languageCode: string;
  }[];
  startTime: string;
  endTime: string;
  limitReward: number;
  status: number;
  rules: {
    description: string;
    languageCode: string;
  }[];
}

export interface IGetLuckyDraw {
  id: number;
  names: {
    name: string;
    languageCode: string;
  }[];
  startTime: string;
  endTime: string;
  status: number;
  limitReward: number;
  rule: {
    id: number;
    descriptions: {
      id: number;
      languageCode: string;
      description: string;
    }[];
  };
  quantity: number;
}

export interface IRankingLuckyDraw {
  id: number;
  prizeLevel: number;
  quantity: number;
  type: string;
  levelNames: {
    name: string;
    languageCode: string;
  }[];
  prizeList?: {
    id: string;
    icon: string | null;
    type: string;
    prizeQuantity: number;
    packageCode: string | null;
    cardDenominationCode: string | null;
    spinCount: number | null;
    pointQuantity: number | null;
    labels: {
      name: string;
      description: string | null;
      languageCode: string;
    }[];
  }[];
}

export interface IRankingLuckyDrawReq {
  prizeLevel: number;
  type: string;
  levelNames: {
    name: string;
    languageCode: string;
  }[];
}

export interface IPoolLuckyDraw {
  id: number;
  labels: {
    name: string;
    description: string;
    languageCode: string;
  }[];
  status: number;
  type: string;
  totalCode: number;
  periodId: number;
  periodName: string;
  fromTime: string;
  toTime: string;
}

export interface IPoolLuckyDrawReq {
  fromTime: string;
  toTime: string;
  type: string;
  periodId: number;
  labels: {
    name: string;
    description: string | null;
    languageCode: string;
  }[];
}

export interface ICodePoolLuckyDraw {
  id: number;
  code: string;
  userId: number;
  username: string;
  userPhoneNumber: string;
  prizeId: number;
  prizeLevel: number;
  prizeName: string;
}
