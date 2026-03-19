import Cookies from 'js-cookie';

const exportService = {
  exportTransactionsToExcel: async (params: Record<string, any>) => {
    try {
      return await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/export?${new URLSearchParams(params).toString()}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${Cookies.get('token')}`
          },
          signal: AbortSignal.timeout(3600000)
        }
      );
    } catch (error) {
      // handle error
      throw error;
    }
  },

  exportLoyaltyToExcel: async (params: Record<string, any>) => {
    try {
      return await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/export/loyalty?${new URLSearchParams(params).toString()}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${Cookies.get('token')}`
          },
          signal: AbortSignal.timeout(3600000) // 1 hour timeout
        }
      );
    } catch (error) {
      // handle error
      throw error;
    }
  }
};

export default exportService;
