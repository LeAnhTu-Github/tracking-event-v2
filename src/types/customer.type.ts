export interface ICustomer {
  id: number;
  username: string;
  avatar?: string;
  phoneNumber: string;
  status: 'ACTIVE' | 'INACTIVE';
  isVip: number;
  vipExpiredAt: string;
  packageCode: string;
  packageAmount: number;
  registerTime: string;
  renewTime: string;
  unregisterTime: string;
  isRating: number;
  spinCount: number;
  lastLoginTime: string;
}

export interface ITransaction {
  mpsReceivingResult: {
    id: number;
    msisdn: string;
    channel: string;
    params: string;
    content: string;
    chargetime: string;
    command: string;
    mode: string;
    amount: string;
    transid: string;
    type: string;
    username: string;
    password: string;
    serviceid: string;
    createdTime: string;
    createdBy: string | null;
    lastUpdatedTime: string | null;
    lastUpdatedBy: string | null;
    status: string;
    actionType: string;
  } | null;

  user: {
    id: number;
    phoneNumber: string;
    username: string;
    avatar: string | null;
    lang: string;
    status: string;
    lastLoginTime: string | null;
    isVip: number;
    vipExpiredAt: string;
    packageCode: string;
    packageAmount: number;
    registerTime: string;
    renewTime: string;
    unregisterTime: string;
    isRating: number;
    spinCount: number | null;
  } | null;
}

export interface ITransactionList {
  id: number;
  msisdn: string;
  params: string;
  content: string;
  chargetime: string;
  command: string;
  mode: string;
  amount: string;
  transid: string;
  type: string;
  username: string;
  password: string;
  serviceid: string;
  createdTime: string;
  createdBy: string | null;
  lastUpdatedTime: string | null;
  lastUpdatedBy: string | null;
  status: string;
  actionType: string;
  channel: string;
}
