import api from './api';

export interface CoinData {
  coin_balance: number;
  max_coins: number;
  current_plan_max: number; // Max coins for the current plan
  subscription: {
    plan: string;
    renewal_days: number;
    theme?: string;
    icon?: string;
  };
}

const coinsService = {
  /**
   * Get the authenticated user's coin information
   * 
   * @returns Promise containing the user's coin data
   */
  getUserCoins: async (): Promise<CoinData> => {
    const response = await api.get('/api/user/coins');
    return response.data.data;
  }
};

export default coinsService;
