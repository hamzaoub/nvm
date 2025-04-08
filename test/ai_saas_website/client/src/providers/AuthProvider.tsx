import React, { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import axiosInstance from '@/lib/axios';
import { authService } from '@/services/auth';

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const { setUser } = useAuth();
  const [hasCheckedAuth, setHasCheckedAuth] = React.useState(false);

  useEffect(() => {
    // Skip if we've already checked auth status to prevent update loops
    if (hasCheckedAuth) return;

    const checkAuth = async () => {
      try {
        // Set token from localStorage if it exists
        const token = localStorage.getItem('token');
        if (!token) {
          // No token means not authenticated
          setUser(null);
          setHasCheckedAuth(true);
          return;
        }
        
        // Set auth header with token
        authService.setAuthHeader(token);
        
        // Try to get user data
        const response = await axiosInstance.get('/api/auth/user');
        setUser(response.data.user);
      } catch (error) {
        // If authentication fails, clear token and user
        console.error('Auth check failed:', error);
        localStorage.removeItem('token');
        setUser(null);
      } finally {
        // Mark that we've checked auth status
        setHasCheckedAuth(true);
      }
    };

    checkAuth();
  }, [setUser, hasCheckedAuth]);

  return <>{children}</>;
};
