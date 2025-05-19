import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, TokenPayload, KycApplicationStatus, UserRole } from '../types';
import { authApi } from '../services/auth.service';
import { decodeToken } from '../utils/jwt.utils';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isKycVerified: boolean;
  isAdmin: boolean;
  login: (studentIdNumber: string, password: string, secretKey: string) => Promise<void>;
  register: (firstName: string, lastName: string, studentIdNumber: string, password: string, secretKey: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Check if the user is authenticated on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          // Decode the token to get the user ID
          const decoded = decodeToken<TokenPayload>(token);

          // Get the user info
          const userInfo = await authApi.getCurrentUser();
          setUser(userInfo);
        }
      } catch (error) {
        console.error('Authentication error:', error);
        localStorage.removeItem('token');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Login function
  const login = async (studentIdNumber: string, password: string, secretKey: string) => {
    setIsLoading(true);
    try {
      const { token } = await authApi.login(studentIdNumber, password, secretKey);
      localStorage.setItem('token', token);

      // Get the user info
      const userInfo = await authApi.getCurrentUser();
      setUser(userInfo);

      // Redirect based on user role and KYC status
      if (userInfo.role === UserRole.ADMIN) {
        navigate('/admin/dashboard');
      } else if (userInfo.kycStatus === KycApplicationStatus.PENDING) {
        navigate('/kyc-pending');
      } else if (userInfo.kycStatus === KycApplicationStatus.REJECTED) {
        navigate('/kyc-rejected');
      } else {
        navigate('/polls');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Register function
  const register = async (firstName: string, lastName: string, studentIdNumber: string, password: string, secretKey: string) => {
    setIsLoading(true);
    try {
      await authApi.register(firstName, lastName, studentIdNumber, password, secretKey);
      // After registration, redirect to login page
      navigate('/login', { state: { message: 'Registration successful! Please log in.' } });
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    navigate('/login');
  };

  // Refresh user info
  const refreshUser = async () => {
    try {
      const userInfo = await authApi.getCurrentUser();
      setUser(userInfo);
    } catch (error) {
      console.error('Error refreshing user:', error);
      throw error;
    }
  };

  // Computed properties
  const isAuthenticated = !!user;
  const isKycVerified = user?.kycStatus === KycApplicationStatus.APPROVED;
  const isAdmin = user?.role === UserRole.ADMIN;

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated,
        isKycVerified,
        isAdmin,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
