import { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import { User } from '../types';

export const useAuthProvider = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      // Validate token and get user data
      validateToken();
    } else {
      setIsLoading(false);
    }
  }, []);

  const validateToken = async () => {
    try {
      // Simple token validation - if we have a token, consider it valid for demo
      const token = localStorage.getItem('auth_token');
      if (token) {
        // Set a mock user for demo purposes
        setUser({
          id: '1',
          name: 'Demo User',
          email: 'demo@assetalchemyprime.org',
          country: 'GB',
          isVerified: true,
          has2FA: true,
          referralCode: 'DEMO123'
        });
      }
      setIsLoading(false);
    } catch (error) {
      // Token is invalid
      localStorage.removeItem('auth_token');
      setUser(null);
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await apiService.login(email, password);
      setUser(response.user);
    } catch (error) {
      throw error;
    }
  };

  const register = async (userData: any) => {
    try {
      const response = await apiService.register(userData);
      setUser(response.user);
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    apiService.logout();
    setUser(null);
  };

  return {
    user,
    isLoading,
    login,
    register,
    logout,
    isAuthenticated: !!user || !!localStorage.getItem('auth_token'),
  };
};