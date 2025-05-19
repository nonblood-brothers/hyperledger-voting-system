import axios, { AxiosRequestConfig } from 'axios';
import { ApiResponse, KycApplicationStatus, Poll, PollQuestion, PollStatus, User } from '../types';

// Create axios instance with base URL
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3001/api',
});

// Add request interceptor to add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

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

// User API
export const userApi = {
  // Get KYC applications by status (admin only)
  getKycApplicationsByStatus: async (status: KycApplicationStatus) => {
    const response = await api.post<ApiResponse<{ currentStudentId: string; data: any[] }>>('/tx/evaluate', {
      method: 'GetKycApplicationListByStatus',
      args: [status],
    });
    return response.data.result;
  },

  // Update KYC application status (admin only)
  updateKycApplicationStatus: async (kycApplicationId: string, status: KycApplicationStatus) => {
    const response = await api.post<ApiResponse<void>>('/tx/submit', {
      method: 'UpdateKycApplicationStatus',
      args: [kycApplicationId, status],
    });
    return response.data;
  },
};

// Poll API
export const pollApi = {
  // Create a new poll
  createPoll: async (title: string, description: string, plannedStartDate: number | null, plannedEndDate: number | null) => {
    const response = await api.post<ApiResponse<void>>('/tx/submit', {
      method: 'CreatePoll',
      args: [
        title,
        description,
        plannedStartDate ? plannedStartDate.toString() : 'null',
        plannedEndDate ? plannedEndDate.toString() : 'null',
      ],
    });
    return response.data;
  },

  // Add a question to a poll
  addPollQuestion: async (pollId: string, text: string) => {
    const response = await api.post<ApiResponse<void>>('/tx/submit', {
      method: 'AddPollQuestion',
      args: [pollId, text],
    });
    return response.data;
  },

  // Delete a question from a poll
  deletePollQuestion: async (pollId: string, questionId: string) => {
    const response = await api.post<ApiResponse<void>>('/tx/submit', {
      method: 'DeletePollQuestion',
      args: [pollId, questionId],
    });
    return response.data;
  },

  // Get polls in review status (admin only)
  getPollsInReviewStatus: async () => {
    const response = await api.post<ApiResponse<{ currentStudentId: string; data: Poll[] }>>('/tx/evaluate', {
      method: 'GetPollsListInReviewStatus',
      args: [],
    });
    return response.data.result;
  },

  // Update poll review status (admin only)
  updatePollReviewStatus: async (pollId: string, status: PollStatus) => {
    const response = await api.post<ApiResponse<void>>('/tx/submit', {
      method: 'UpdatePollReviewStatus',
      args: [pollId, status],
    });
    return response.data;
  },

  // Update poll details
  updatePoll: async (
    pollId: string,
    plannedStartDate: number | null,
    plannedEndDate: number | null,
    title: string,
    description: string
  ) => {
    const response = await api.post<ApiResponse<void>>('/tx/submit', {
      method: 'UpdatePoll',
      args: [
        pollId,
        plannedStartDate ? plannedStartDate.toString() : 'null',
        plannedEndDate ? plannedEndDate.toString() : 'null',
        title,
        description,
      ],
    });
    return response.data;
  },

  // Start a poll
  startPoll: async (pollId: string) => {
    const response = await api.post<ApiResponse<void>>('/tx/submit', {
      method: 'StartPoll',
      args: [pollId],
    });
    return response.data;
  },

  // Stop a poll
  stopPoll: async (pollId: string) => {
    const response = await api.post<ApiResponse<void>>('/tx/submit', {
      method: 'StopPoll',
      args: [pollId],
    });
    return response.data;
  },

  // Vote in a poll
  vote: async (pollId: string, questionId: string) => {
    const response = await api.post<ApiResponse<void>>('/tx/submit', {
      method: 'GiveVote',
      args: [pollId, questionId],
    });
    return response.data;
  },

  // Get poll by ID
  getPollById: async (pollId: string) => {
    // This endpoint doesn't exist in the contract, but we can add it for convenience
    // For now, we'll just return a mock implementation
    throw new Error('Not implemented');
  },

  // Get poll questions by poll ID
  getPollQuestionsByPollId: async (pollId: string) => {
    // This endpoint doesn't exist in the contract, but we can add it for convenience
    // For now, we'll just return a mock implementation
    throw new Error('Not implemented');
  },

  // Get active polls
  getActivePolls: async () => {
    // This endpoint doesn't exist in the contract, but we can add it for convenience
    // For now, we'll just return a mock implementation
    throw new Error('Not implemented');
  },

  // Get finished polls
  getFinishedPolls: async () => {
    // This endpoint doesn't exist in the contract, but we can add it for convenience
    // For now, we'll just return a mock implementation
    throw new Error('Not implemented');
  },
};

// Helper function to hash a string (in a real app, this would be done on the server)
async function hashString(str: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

export default api;