export const PAYMENT_METHOD_INFO: Record<
  string,
  { label: string; description: string; itemType: string }
> = {
  VIP_BENEFITS: {
    label: 'VIP Benefits',
    description: 'Free for VIP members',
    itemType: 'VIP'
  },
  WATCH_ADS: {
    label: 'Watch Ads',
    description: 'Watch an advertisement',
    itemType: 'ADS'
  },
  TOKEN: {
    label: 'Token',
    description: 'Pay with in-game tokens',
    itemType: 'TOKEN'
  },
  ITEM: {
    label: 'Item',
    description: 'Pay with inventory items',
    itemType: 'GAME_ITEM'
  }
};
