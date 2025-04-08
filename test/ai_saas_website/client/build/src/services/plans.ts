import axiosInstance from '@/lib/axios';

export interface Plan {
  id: number;
  name: string;
  description: string;
  pricePerMonth: number;
  pricePerYear?: number;
  features: string[];
  credits: number;
  popular?: boolean;
  highlight?: boolean;
  badge?: string;
}

const plansService = {
  // Get all available plans
  getAllPlans: async (): Promise<Plan[]> => {
    const response = await axiosInstance.get(`api/plans`);
    return response.data;
  },

  // Get a specific plan
  getPlan: async (planId: number): Promise<Plan> => {
    const response = await axiosInstance.get(`api/plans/${planId}`);
    return response.data;
  },

  // Subscribe to a plan
  subscribeToPlan: async (planId: number, paymentMethodId: string): Promise<{ success: boolean; subscriptionId: string }> => {
    const response = await axiosInstance.post(`api/subscriptions`, {
      plan_id: planId,
      payment_method_id: paymentMethodId
    });
    return response.data;
  },

  // Method to get cached plans or refresh from API
  getCachedPlans: async (): Promise<Plan[]> => {
    // Check if we have cached plans in localStorage
    const cachedPlans = localStorage.getItem('cachedPlans');
    const cachedTime = localStorage.getItem('cachedPlansTime');
    
    // If we have cached plans and they're less than 1 hour old, use them
    if (cachedPlans && cachedTime) {
      const now = new Date().getTime();
      const cacheTime = parseInt(cachedTime, 10);
      
      // Cache valid for 1 hour (3600000 ms)
      if (now - cacheTime < 3600000) {
        return JSON.parse(cachedPlans);
      }
    }
    
    // Otherwise, fetch fresh plans from the API
    try {
      const plans = await plansService.getAllPlans();
      
      // Cache the plans
      localStorage.setItem('cachedPlans', JSON.stringify(plans));
      localStorage.setItem('cachedPlansTime', new Date().getTime().toString());
      
      return plans;
    } catch (error) {
      console.error('Error fetching plans:', error);
      
      // If we have cached plans but they're expired, still use them as fallback
      if (cachedPlans) {
        return JSON.parse(cachedPlans);
      }
      
      // Return empty array if all else fails
      return [];
    }
  }
};

export default plansService;
