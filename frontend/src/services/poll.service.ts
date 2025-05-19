import api from './api.service';
import { ApiResponse, Poll, PollQuestion, PollStatus } from '../types';

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
    const response = await api.post<ApiResponse<Poll>>('/tx/evaluate', {
      method: 'GetPollById',
      args: [pollId],
    });
    return response.data.result;
  },

  // Get poll questions by poll ID
  getPollQuestionsByPollId: async (pollId: string) => {
    const response = await api.post<ApiResponse<PollQuestion[]>>('/tx/evaluate', {
      method: 'GetPollQuestionsByPollId',
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
};