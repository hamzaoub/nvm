import axios from '@/lib/axios';

export interface PaymentIntent {
  clientSecret: string;
  amount: number;
  currency: string;
  plan: string;
}

export interface CheckoutSession {
  id: string;
  url: string;
}

export interface SessionVerificationResponse {
  success: boolean;
  subscription?: {
    id: string;
    status: string;
    plan_name: string;
  };
  message?: string;
}

export interface SubscriptionResponse {
  status: string;
  plan_id?: number;
  plan_name?: string;
  start_date?: string;
  end_date?: string;
  stripe_id?: string;
  stripe_status?: string;
  message?: string;
}

const paymentService = {
  /**
   * Get the current user's subscription
   * @returns {Promise<SubscriptionResponse>}
   */
  getSubscription: async (): Promise<SubscriptionResponse> => {
    const response = await axios.get('/payment/subscription');
    return response.data;
  },

  /**
   * Create a payment intent for Stripe checkout
   * @param {number} planId - The ID of the selected plan
   * @returns {Promise<PaymentIntent>}
   */
  createPaymentIntent: async (planId: number): Promise<PaymentIntent> => {
    const response = await axios.post('/payment/create-intent', { plan_id: planId });
    return response.data;
  },

  /**
   * Create a subscription with Stripe
   * @param {number} planId - The ID of the selected plan
   * @param {string} paymentMethodId - The Stripe payment method ID
   * @returns {Promise<SubscriptionResponse>}
   */
  createSubscription: async (planId: number, paymentMethodId: string): Promise<SubscriptionResponse> => {
    const response = await axios.post('/payment/create-subscription', {
      plan_id: planId,
      payment_method_id: paymentMethodId
    });
    return response.data;
  },

  /**
   * Cancel the current subscription
   * @returns {Promise<SubscriptionResponse>}
   */
  cancelSubscription: async (): Promise<SubscriptionResponse> => {
    const response = await axios.post('/payment/cancel-subscription');
    return response.data;
  },
  
  /**
   * Create a Stripe checkout session for the selected plan
   * @param {number} planId - The ID of the selected plan
   * @param {string} billingCycle - The billing cycle (monthly or yearly)
   * @returns {Promise<CheckoutSession>}
   */
  createCheckoutSession: async (planId: number, billingCycle: string = 'monthly'): Promise<CheckoutSession> => {
    const response = await axios.post('/payment/create-checkout-session', { 
      plan_id: planId,
      billing_cycle: billingCycle
    });
    return response.data;
  },
  
  /**
   * Verify a checkout session after redirect
   * @param {string} sessionId - The Stripe checkout session ID
   * @returns {Promise<SessionVerificationResponse>}
   */
  verifyCheckoutSession: async (sessionId: string): Promise<SessionVerificationResponse> => {
    const response = await axios.get(`/payment/verify-checkout-session?session_id=${sessionId}`);
    return response.data;
  }
};

export default paymentService;
