interface IName {
  name: string;
  languageCode: string;
}
interface IRule {
  description: string;
  languageCode: string;
}
interface ILabel {
  name: string;
  description?: string;
  languageCode: string;
}
interface IDescription {
  id: number;
  languageCode: string;
  description: string;
}

export interface ILuckySpin {
  id: number;
  spinTime: string;
  status: string;
  createdAt: string;
  expireTime: string;
  userId: number;
  username: string;
  userPhoneNumber: string;
  prizeId: number;
  prizeName: string;
  prizeIcon: string;
  prizeDescription: string;
  prizeType: string;
  quantity: number;
}

export interface ILuckySpinHistory {
  id: number;
  content: string;
  quantity: number;
  status: string;
  recordTime: string;
  type: number;
  userId: number;
  username: string;
  userPhoneNumber: string;
}

// Lucky spin
export interface IUpdateLuckySpin {
  names: IName[];
  startTime: string;
  endTime: string;
  rule: IRule[];
}

export interface ICreateLuckySpin {
  name: IName[];
  startTime: string;
  endTime: string;
  rules: IRule[];
}

export interface ILuckySpinList {
  id: number;
  name: string;
  startTime: string;
  endTime: string;
  status: number;
}

export interface ILuckySpinDetail {
  id: number;
  names: IName[];
  startTime: string;
  endTime: string;
  status: number;
  rule: {
    id: number;
    descriptions: IDescription[];
  };
}

// Prize
export interface TLuckySpinPrize {
  id: number;
  icon: string;
  randomWeight: number;
  prizeCurrentNumber: number;
  type: string;
  packageCode?: string;
  cardDenominationCode?: string;
  spinCount?: number | null;
  labels: ILabel[];
}

export interface TBodyPrize {
  id: number;
  icon?: string;
  randomWeight: number;
  quantity: number;
  type: string;
  packageCode?: string;
  cardDenominationCode?: string;
  spinCount?: number | null;
  labels: ILabel[];
}

export interface IUpdatePrize {
  id: number;
  randomWeight: number;
  prizeQuantity: number;
  labels: ILabel[];
}

// Other

export interface PackageBonus {
  id: number;
  packageName: string;
  packageCode: string;
  packageOcsId: number;
  packageUnit: string;
  packageType: string;
  packageValue: number;
}

export interface CardDenomination {
  id: number;
  name: string;
  code: string;
  amount: number;
}
