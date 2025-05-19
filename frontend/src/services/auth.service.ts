import api from './api.service';
import { ApiResponse, User } from '../types';

// Helper function to hash a string (in a real app, this would be done on the server)
export async function hashString(str: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

// Authentication API
export const authApi = {
  // Login user
  login: async (studentIdNumber: string, password: string, secretKey: string) => {
    const response = await api.post<{ token: string }>('/authenticate', {
      studentIdNumber,
      password,
      secretKey,
    });
    return response.data;
  },

  // Register user
  register: async (firstName: string, lastName: string, studentIdNumber: string, password: string, secretKey: string) => {
    // Hash password and secretKey on client side (in a real app, this would be done on the server)
    const passwordHash = await hashString(password);
    const secretKeyHash = await hashString(secretKey);

    const response = await api.post<ApiResponse<void>>('/tx/submit', {
      method: 'RegisterUser',
      args: [firstName, lastName, studentIdNumber, passwordHash, secretKeyHash],
    });
    return response.data;
  },

  // Check if user is authenticated
  isAuthenticated: async () => {
    const response = await api.post<ApiResponse<{ authenticated: boolean; studentIdNumber: string }>>('/tx/evaluate', {
      method: 'IsAuthenticated',
      args: [],
    });
    return response.data.result;
  },

  // Check if user is KYC verified
  isKycVerified: async () => {
    const response = await api.post<ApiResponse<{ kycVerified: boolean; studentIdNumber: string }>>('/tx/evaluate', {
      method: 'IsKycVerified',
      args: [],
    });
    return response.data.result;
  },

  // Get current user info
  getCurrentUser: async () => {
    const response = await api.post<ApiResponse<User>>('/tx/evaluate', {
      method: 'GetCurrentUserInfo',
      args: [],
    });
    return response.data.result;
  },
};