import axiosInstance from '@/lib/axios';

// The API URL is now handled by the axios instance

export interface UserProfile {
  id: number;
  name: string;
  email: string;
  firstName?: string;
  lastName?: string;
  createdAt: string;
  emailVerified: boolean;
}

export interface ProfileUpdateData {
  name?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
}

export interface SubscriptionDetails {
  id: number;
  status: string;
  planName: string;
  planDescription: string;
  pricePerMonth: number;
  credits: number;
  daysUntilRenewal: number;
  isActive: boolean;
  startDate: string;
  endDate: string | null;
  features: string[];
}

const userService = {
  // Get user profile details
  getProfile: async (): Promise<UserProfile> => {
    const response = await axiosInstance.get(`api/user/profile`);
    return response.data;
  },

  // Update user profile
  updateProfile: async (data: ProfileUpdateData): Promise<UserProfile> => {
    const response = await axiosInstance.put(`api/user/profile`, data);
    return response.data;
  },

  // Get user subscription details
  getSubscription: async (): Promise<SubscriptionDetails> => {
    const response = await axiosInstance.get(`api/user/subscription`);
    return response.data;
  },

  // Change password
  changePassword: async (currentPassword: string, newPassword: string, confirmPassword: string): Promise<{message: string}> => {
    const response = await axiosInstance.post(`api/user/change-password`, {
      current_password: currentPassword,
      password: newPassword,
      password_confirmation: confirmPassword
    });
    return response.data;
  }
};

export default userService;
