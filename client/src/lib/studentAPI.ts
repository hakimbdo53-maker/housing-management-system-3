import axios from 'axios';
import { API_BASE_URL } from '@/const';

/**
 * API Service Module
 * 
 * Centralized API calls for student profile, notifications, fees, and complaints
 */

const getAuthHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem('token')}`,
});

const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

/**
 * Student Profile API Calls
 */
export const studentAPI = {
  // Get student profile details
  getProfile: async () => {
    const response = await apiClient.get('/api/student/profile/details', {
      headers: getAuthHeaders(),
    });
    return response.data;
  },

  // Get student notifications
  getNotifications: async () => {
    const response = await apiClient.get('/api/student/profile/notifications', {
      headers: getAuthHeaders(),
    });
    return response.data;
  },

  // Mark notification as read
  markNotificationAsRead: async (notificationId: string) => {
    const response = await apiClient.put(
      `/api/student/profile/notifications/${notificationId}/read`,
      {},
      {
        headers: getAuthHeaders(),
      }
    );
    return response.data;
  },

  // Get student fees
  getFees: async () => {
    const response = await apiClient.get('/api/student/profile/fees', {
      headers: getAuthHeaders(),
    });
    return response.data;
  },

  // Get student room assignment
  getAssignments: async () => {
    const response = await apiClient.get('/api/student/profile/assignments', {
      headers: getAuthHeaders(),
    });
    return response.data;
  },

  // Get student complaints
  getComplaints: async () => {
    const response = await apiClient.get('/api/student/complaints', {
      headers: getAuthHeaders(),
    });
    return response.data;
  },

  // Submit a new complaint
  submitComplaint: async (title: string, description: string) => {
    const response = await apiClient.post(
      '/api/student/complaints/submit',
      { title, description },
      {
        headers: getAuthHeaders(),
      }
    );
    return response.data;
  },
};

export default studentAPI;
