import axios from 'axios';
import { API_BASE_URL } from '@/const';

/**
 * API Service Module
 * 
 * Centralized API client for all student-related requests
 * Handles:
 * - Profile data
 * - Notifications
 * - Fees
 * - Complaints
 */

/**
 * Utility function to extract array from API response
 * 
 * Handles different response wrapper formats:
 * - { data: [...] }
 * - { data: { data: [...] } }
 * - { isSuccess: true, data: [...] }
 */
export const extractArray = (response: any): any[] => {
  if (!response) return [];
  
  // Direct array response
  if (Array.isArray(response)) return response;
  
  // Wrapped in data property: { data: [...] }
  if (Array.isArray(response?.data)) return response.data;
  
  // Double wrapped: { data: { data: [...] } }
  if (Array.isArray(response?.data?.data)) return response.data.data;
  
  // Single object response (convert to array)
  if (response?.id || response?.name || response?.title) return [response];
  
  return [];
};

// Create axios instance with base configuration
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to every request
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle response errors globally
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized - redirect to login if needed
      localStorage.removeItem('token');
    }
    return Promise.reject(error);
  }
);

/**
 * Student Profile API Calls
 */
export const studentProfileAPI = {
  /**
   * Get student profile details
   * @param studentId - Student's national ID or student ID
   */
  getProfile: async (studentId?: string) => {
    try {
      const endpoint = studentId 
        ? `/api/Student/${studentId}` 
        : '/api/student/profile/details';
      
      const response = await apiClient.get(endpoint);
      const data = response.data;
      
      // Return single object or empty object
      if (data?.data && typeof data.data === 'object' && !Array.isArray(data.data)) {
        return data.data;
      }
      if (typeof data === 'object' && !Array.isArray(data)) {
        return data;
      }
      return {};
    } catch (error) {
      console.error('Error fetching profile:', error);
      return {};
    }
  },

  /**
   * Get student notifications
   * @param studentId - Student's national ID or student ID (optional)
   */
  getNotifications: async (studentId?: string) => {
    try {
      const endpoint = studentId
        ? `/api/Student/${studentId}/Notifications`
        : '/api/student/profile/notifications';
        
      const response = await apiClient.get(endpoint);
      return extractArray(response.data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return [];
    }
  },

  /**
   * Mark notification as read
   */
  markNotificationAsRead: async (notificationId: string) => {
    try {
      const response = await apiClient.put(
        `/api/student/profile/notifications/${notificationId}/read`,
        {}
      );
      return response.data || {};
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return {};
    }
  },

  /**
   * Get student fees
   * @param studentId - Student's national ID or student ID (optional)
   */
  getFees: async (studentId?: string) => {
    try {
      const endpoint = studentId
        ? `/api/Student/${studentId}/Fees`
        : '/api/student/profile/fees';
        
      const response = await apiClient.get(endpoint);
      return extractArray(response.data);
    } catch (error) {
      console.error('Error fetching fees:', error);
      return [];
    }
  },

  /**
   * Get student room assignment
   * @param studentId - Student's national ID or student ID (optional)
   */
  getAssignments: async (studentId?: string) => {
    try {
      const endpoint = studentId
        ? `/api/Student/${studentId}/Assignment`
        : '/api/student/profile/assignments';
        
      const response = await apiClient.get(endpoint);
      return extractArray(response.data);
    } catch (error) {
      console.error('Error fetching assignments:', error);
      return [];
    }
  },
};

/**
 * Student Complaints API Calls
 */
export const studentComplaintsAPI = {
  /**
   * Get all student complaints
   */
  getComplaints: async () => {
    try {
      const response = await apiClient.get('/api/student/complaints');
      return extractArray(response.data);
    } catch (error) {
      console.error('Error fetching complaints:', error);
      return [];
    }
  },

  /**
   * Submit a new complaint
   */
  submitComplaint: async (title: string, description: string) => {
    try {
      const response = await apiClient.post('/api/student/complaints/submit', {
        title,
        description,
      });
      return response.data || {};
    } catch (error) {
      console.error('Error submitting complaint:', error);
      throw error;
    }
  },
};

// Default export with all APIs organized
export default {
  profile: studentProfileAPI,
  complaints: studentComplaintsAPI,
};
