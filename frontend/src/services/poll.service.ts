import api from './api.service';
import { ApiResponse, Poll, PollOption, PollStatus } from '../types';

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

  // Add an option to a poll
  addPollOption: async (pollId: string, text: string) => {
    const response = await api.post<ApiResponse<void>>('/tx/submit', {
      method: 'AddPollOption',
      args: [pollId, text],
    });
    return response.data;
  },

  // Delete an option from a poll
  deletePollOption: async (pollId: string, optionId: string) => {
    const response = await api.post<ApiResponse<void>>('/tx/submit', {
      method: 'DeletePollOption',
      args: [pollId, optionId],
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
  vote: async (pollId: string, optionId: string) => {
    const response = await api.post<ApiResponse<void>>('/tx/submit', {
      method: 'GiveVote',
      args: [pollId, optionId],
    });
    return response.data;
  },

  // Get poll by ID
  getPollById: async (pollId: string) => {
    const response = await api.post<ApiResponse<Poll>>('/tx/submit', {
      method: 'GetPollById',
      args: [pollId],
    });
    return response.data.result;
  },

  // Get poll options by poll ID
  getPollOptionsByPollId: async (pollId: string) => {
    const response = await api.post<ApiResponse<PollOption[]>>('/tx/evaluate', {
      method: 'GetPollOptionsByPollId',
      args: [pollId],
    });
    return response.data.result;
  },

  // Get active polls
  getActivePolls: async () => {
    const response = await api.post<ApiResponse<Poll[]>>('/tx/evaluate', {
      method: 'GetActivePolls',
      args: [],
    });
    return response.data.result;
  },

  // Get finished polls
  getFinishedPolls: async () => {
    const response = await api.post<ApiResponse<Poll[]>>('/tx/evaluate', {
      method: 'GetFinishedPolls',
      args: [],
    });
    return response.data.result;
  },

  // Get my pending polls (polls in REVIEW status created by the current user)
  getMyPendingPolls: async () => {
    const response = await api.post<ApiResponse<Poll[]>>('/tx/evaluate', {
      method: 'GetMyPendingPolls',
      args: [],
    });
    return response.data.result;
  },
};
