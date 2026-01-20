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

/**
 * Utility function to extract object from API response
 * 
 * Handles different response wrapper formats:
 * - { data: {...} }
 * - { data: { data: {...} } }
 * - { isSuccess: true, data: {...} }
 * - Direct object response
 */
export const extractObject = (response: any): any => {
  if (!response) return {};
  
  // Direct object response
  if (typeof response === 'object' && !Array.isArray(response)) {
    // Check if wrapped in data property
    if (response?.data && typeof response.data === 'object' && !Array.isArray(response.data)) {
      return response.data;
    }
    // Check for double wrapped
    if (response?.data?.data && typeof response.data.data === 'object' && !Array.isArray(response.data.data)) {
      return response.data.data;
    }
    // Return as-is if it's a plain object
    return response;
  }
  
  return {};
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
 * Student Payments API Calls
 */
export const studentPaymentsAPI = {
  /**
   * Get student fees/payments
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
   * Make a payment
   */
  makePayment: async (paymentData: {
    feeId?: string;
    amount: number;
    paymentMethod?: string;
  }) => {
    try {
      const response = await apiClient.post('/api/student/payments', paymentData);
      return response.data || {};
    } catch (error) {
      console.error('Error making payment:', error);
      throw error;
    }
  },

  /**
   * Get payment history
   */
  getPaymentHistory: async (studentId?: string) => {
    try {
      const endpoint = studentId
        ? `/api/Student/${studentId}/Payments`
        : '/api/student/payments';
      const response = await apiClient.get(endpoint);
      return extractArray(response.data);
    } catch (error) {
      console.error('Error fetching payment history:', error);
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

/**
 * Application API Calls - External API Integration
 */
export const applicationAPI = {
  /**
   * Submit a new housing application to external API
   * @param applicationData - Application form data
   */
  submitApplication: async (applicationData: {
    studentType: 'new' | 'old';
    fullName: string;
    studentId: string;
    nationalId?: string | null;
    email: string;
    phone: string;
    major: string;
    gpa: string;
    address: string;
    governorate: string;
    familyIncome: string;
    additionalInfo?: string | null;
  }) => {
    try {
      // Clean national ID before sending
      const cleanedNationalId = applicationData.nationalId?.trim().replace(/\D/g, '') || null;
      
      const response = await apiClient.post('/api/student/applications/submit', {
        studentType: applicationData.studentType,
        fullName: applicationData.fullName,
        studentId: applicationData.studentId,
        nationalId: cleanedNationalId,
        email: applicationData.email,
        phone: applicationData.phone,
        major: applicationData.major,
        gpa: applicationData.gpa,
        address: applicationData.address,
        governorate: applicationData.governorate,
        familyIncome: applicationData.familyIncome,
        additionalInfo: applicationData.additionalInfo || null,
      });
      
      // Handle different response formats
      if (response.data?.data) {
        return response.data.data;
      }
      return response.data || {};
    } catch (error: any) {
      console.error('Error submitting application:', error);
      const errorMessage = error.response?.data?.message || error.response?.data?.error || error.message || 'فشل تقديم الطلب';
      throw new Error(errorMessage);
    }
  },

  /**
   * Search for application by national ID from external API
   * @param nationalId - Student's national ID (14 digits)
   */
  searchByNationalId: async (nationalId: string): Promise<any[]> => {
    try {
      // Clean national ID: remove spaces and non-digit characters
      const cleanedNationalId = nationalId.trim().replace(/\D/g, '');
      
      if (!cleanedNationalId || cleanedNationalId.length !== 14) {
        throw new Error('الرقم القومي يجب أن يكون 14 رقم');
      }

      // Try different possible endpoints
      const endpoints = [
        `/api/Application/SearchByNationalId/${cleanedNationalId}`,
        `/api/Application/GetByNationalId/${cleanedNationalId}`,
        `/api/Application/NationalId/${cleanedNationalId}`,
        `/api/Application?nationalId=${cleanedNationalId}`,
      ];

      let lastError: any = null;
      
      for (const endpoint of endpoints) {
        try {
          const response = await apiClient.get(endpoint);
          
          // Handle different response formats
          const data = extractArray(response.data);
          if (data.length > 0) {
            return data;
          }
          
          // Try single object format
          if (response.data && typeof response.data === 'object' && !Array.isArray(response.data)) {
            return [response.data];
          }
        } catch (err: any) {
          lastError = err;
          // Continue to next endpoint
          continue;
        }
      }

      // If all endpoints failed, check the error type
      if (lastError?.response?.status === 404) {
        throw new Error('لم يتم العثور على طلب بهذا الرقم القومي');
      }
      
      if (lastError?.code === 'ECONNREFUSED' || lastError?.code === 'ENOTFOUND') {
        throw new Error('لا يمكن الاتصال بخادم البحث. تأكد من أن API الخارجي متاح.');
      }
      
      if (lastError?.response?.status === 401 || lastError?.response?.status === 403) {
        throw new Error('ليس لديك صلاحية للوصول إلى هذه البيانات');
      }
      
      if (lastError?.response?.status >= 500) {
        throw new Error('خطأ في الخادم. يرجى المحاولة مرة أخرى لاحقاً');
      }

      // If we get here, all endpoints failed
      throw new Error('فشل البحث عن الطلب. تأكد من الرقم القومي والمحاولة مرة أخرى.');
    } catch (error: any) {
      console.error('Error searching application:', error);
      
      // If error already has a friendly message, use it
      if (error.message && !error.message.includes('Error:') && !error.message.includes('Network Error')) {
        throw error;
      }
      
      // Otherwise, create a user-friendly message
      const errorMessage = error.response?.data?.message 
        || error.response?.data?.error 
        || error.message 
        || 'فشل البحث عن الطلب. يرجى المحاولة مرة أخرى.';
      
      throw new Error(errorMessage);
    }
  },

  /**
   * Get application status by national ID
   */
  getApplicationStatus: async (nationalId: string) => {
    try {
      const applications = await applicationAPI.searchByNationalId(nationalId);
      if (applications.length === 0) {
        return null;
      }
      // Return the most recent application
      const sorted = [...applications].sort((a, b) => {
        const dateA = new Date(a.submittedAt || a.createdAt || a.date || 0).getTime();
        const dateB = new Date(b.submittedAt || b.createdAt || b.date || 0).getTime();
        return dateB - dateA;
      });
      return sorted[0];
    } catch (error) {
      console.error('Error getting application status:', error);
      throw error;
    }
  },
};

// Default export with all APIs organized
export default {
  profile: studentProfileAPI,
  complaints: studentComplaintsAPI,
  applications: applicationAPI,
};
