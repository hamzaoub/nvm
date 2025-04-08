import { create } from 'zustand';
import { authService } from '@/services/auth';
import { toast } from 'sonner';

// API error interface for properly typing error responses
interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
}

// Role interface based on your Laravel Spatie roles structure
interface Role {
  id: number;
  name: string;
  guard_name: string;
  created_at: string;
  updated_at: string;
  pivot?: {
    model_id: number;
    model_type: string;
    role_id: number;
  };
}

interface User {
  id: number;
  name: string;
  lastName: string;
  email: string;
  emailVerified: boolean;
  isAdmin?: boolean; // Flag to indicate if user has admin privileges
  roles?: Role[]; // Array of user roles from Spatie
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  login: (email: string, password: string, navigate: (path: string) => void) => Promise<void>;
  register: (email: string, password: string, name: string, lastName: string, confirmPassword: string, navigate: (path: string) => void) => Promise<void>;
  logout: () => Promise<void>;
  signInWithGoogle: (isRegistration?: boolean, navigate?: (path: string) => void) => Promise<void>;
}

const useAuth = create<AuthState>((set) => ({
  
  user: null,
  isAuthenticated: false,
  isLoading: true,

  setUser: (user) => set({ user, isAuthenticated: !!user, isLoading: false }),

  login: async (email, password, navigate) => {
    try {
      const response = await authService.login(email, password);
      if (response.user) {
        set({ user: response.user, isAuthenticated: true });
        toast.success(response.message || 'Logged in successfully');

        // Navigate to the redirect path from the server or default to dashboard
        navigate(response.redirect || '/dashboard');
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error: unknown) {
      const message = error instanceof Error 
        ? error.message 
        : ((error as ApiError)?.response?.data?.message || 'Login failed');
      toast.error(message);
      throw error;
    }
  },

  register: async (email, password, name, lastName, confirmPassword, navigate) => {
    try {
      const response = await authService.register(email, password, name, lastName, confirmPassword);
      if (response.user) {
        set({ user: response.user, isAuthenticated: true });
        toast.success(response.message || 'Registered successfully');

        // Check if OTP verification is required
        if (response.requires_otp && response.redirect) {
          navigate(response.redirect); // Redirect to OTP verification page
        } else {
          navigate(response.redirect || '/welcome'); // Use server-provided redirect or default
        }
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error: unknown) {
      const message = error instanceof Error 
        ? error.message 
        : ((error as ApiError)?.response?.data?.message || 'Registration failed');
      toast.error(message);
      throw error;
    }
  },

  logout: async () => {
    try {
      await authService.logout();
      set({ user: null, isAuthenticated: false });
      toast.success('Logged out successfully');
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : 'Logout failed');
      throw error;
    }
  },

  signInWithGoogle: async (isRegistration = false, navigate) => {
    try {
      const { data } = await authService.signInWithGoogle(isRegistration);
      if (data.user) {
        set({ user: data.user, isAuthenticated: true });
        toast.success(data.message || 'Signed in with Google successfully');

        // Check if OTP verification is required
        if (data.requires_otp && data.redirect && navigate) {
          navigate(data.redirect); // Redirect to OTP verification page
        } else if (navigate) {
          navigate(data.redirect || '/welcome'); // Use server-provided redirect or default
        }
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error: unknown) {
      const message = error instanceof Error 
        ? error.message 
        : ((error as ApiError)?.response?.data?.message || 'Google sign-in failed');
      toast.error(message);
      throw error;
    }
  },
}));

export { useAuth };
export type { User };
