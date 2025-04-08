import { useState, useEffect } from 'react';
import { authService } from '@/services/auth';

interface UseUserRoleReturn {
  isAdmin: boolean;
  hasRole: (roleName: string) => boolean;
  roles: string[];
  isLoading: boolean;
  error: Error | null;
}

export const useUserRole = (): UseUserRoleReturn => {
  const [roles, setRoles] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchUserRoles = async () => {
      try {
        setIsLoading(true);
        const userData = await authService.getCurrentUser();
        if (userData && userData.roles) {
          setRoles(userData.roles);
        } else {
          setRoles([]);
        }
      } catch (err) {
        console.error('Error fetching user roles:', err);
        setError(err instanceof Error ? err : new Error('Failed to fetch user roles'));
        setRoles([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserRoles();
  }, []);

  return {
    isAdmin: roles.includes('admin'),
    hasRole: (roleName: string) => roles.includes(roleName),
    roles,
    isLoading,
    error
  };
};
