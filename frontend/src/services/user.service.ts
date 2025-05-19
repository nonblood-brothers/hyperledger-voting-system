import api from './api.service';
import { ApiResponse, KycApplicationStatus } from '../types';

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