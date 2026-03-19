export interface ICardRes {
  id: number;
  cardNumber: string;
  cardSerial: string;
  status: number;
  cardDenomination: {
    id: number;
    name: string;
    code: string;
    amount: number;
  };
  createTime: string;
  createBy: string;
}
export interface ICardReq {
  cardNumber: string;
  cardSerial: string;
  cardDenominationId: number;
  status?: number;
}

export interface ICardSpendRes {
  id: number;
  cardNumber: string;
  phoneNumber: string;
  amount: number;
  time: string;
}
