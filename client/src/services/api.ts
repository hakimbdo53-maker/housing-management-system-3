import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';

/**
 * =====================================
 * CENTRALIZED API CONFIGURATION
 * =====================================
 * 
 * Single source of truth for all API communication
 * 
 * Features:
 * - Axios instance with baseURL from VITE_API_URL
 * - Request logging (method, URL, headers)
 * - Response logging (status, data)
 * - Error logging with detailed information
 * - Token authentication (Bearer token)
 * - Global error handling
 * - Response unwrapping utilities
 */

// Get API URL from environment variables
const API_URL = import.meta.env.VITE_API_URL || 'http://housingms.runasp.net/api';

/**
 * Logger utility for API requests and responses
 */
const logger = {
  request: (config: InternalAxiosRequestConfig) => {
    const { method, url, headers, data } = config;
    console.group(`📤 API Request: ${method?.toUpperCase()} ${url}`);
    console.log('Headers:', {
      'Content-Type': headers?.['Content-Type'],
      'Authorization': headers?.['Authorization'] ? '***Bearer token***' : 'None',
    });
    if (data) {
      console.log('Body:', data);
    }
    console.groupEnd();
  },

  response: (status: number, statusText: string, data: any, url: string) => {
    console.group(`✅ API Response: ${status} ${statusText}`);
    console.log('URL:', url);
    console.log('Data:', data);
    console.groupEnd();
  },

  error: (error: AxiosError) => {
    const { config, response, message } = error;
    console.group(`❌ API Error: ${response?.status} ${response?.statusText || message}`);
    console.log('Method:', config?.method?.toUpperCase());
    console.log('URL:', config?.url);
    console.log('Status:', response?.status);
    console.log('Status Text:', response?.statusText);
    if (response?.data) {
      console.log('Error Data:', response.data);
    }
    console.log('Message:', message);
    console.groupEnd();
  },
};

/**
 * Create centralized Axios instance
 * 
 * Configuration:
 * - baseURL: From VITE_API_URL environment variable
 * - Timeout: 30 seconds
 * - Default headers: JSON content type
 */
export const apiClient: AxiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 30000, // 30 seconds
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Request interceptor
 * - Adds Bearer token from localStorage
 * - Logs request details
 */
apiClient.interceptors.request.use(
  (config) => {
    // Add token if available
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Log request
    logger.request(config);

    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error.message);
    return Promise.reject(error);
  }
);

/**
 * Response interceptor
 * - Logs successful responses
 * - Handles global errors (401, 500, etc.)
 * - Logs all errors with details
 */
apiClient.interceptors.response.use(
  (response) => {
    // Log successful response
    const { status, statusText, data, config } = response;
    logger.response(status, statusText, data, config.url || '');

    return response;
  },
  (error: AxiosError) => {
    // Log error details
    logger.error(error);

    // Handle specific error codes
    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect
      console.warn('⚠️ Unauthorized (401) - Clearing token');
      localStorage.removeItem('token');
    }

    if (error.response?.status === 403) {
      console.warn('⚠️ Forbidden (403) - Access denied');
    }

    if (error.response?.status === 404) {
      console.warn('⚠️ Not Found (404) - Resource does not exist');
    }

    if (error.response?.status === 500) {
      console.error('❌ Server Error (500) - Internal server error');
    }

    if (error.response?.status === 503) {
      console.error('❌ Service Unavailable (503) - Server is down');
    }

    if (!error.response) {
      console.error('❌ Network Error - No response received');
    }

    return Promise.reject(error);
  }
);

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
   * Submits payment for a specific fee using FeePaymentDto
   */
  makePayment: async (paymentData: {
    feeId: string;
    studentId: string;
    transactionCode: string;
    receiptFilePath?: string;
  }) => {
    try {
      // Construct endpoint with feeId
      const endpoint = `/api/student/payments/pay/${paymentData.feeId}`;
      
      // Prepare payload matching FeePaymentDto
      const payload = {
        studentId: paymentData.studentId,
        transactionCode: paymentData.transactionCode,
        receiptFilePath: paymentData.receiptFilePath || null,
      };
      
      const response = await apiClient.post(endpoint, payload);
      return extractObject(response.data);
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
   * Endpoint: /api/Application/SearchByNationalId/{nationalId} (Swagger Primary)
   * Returns: Array of applications or empty array
   */
  searchByNationalId: async (nationalId: string): Promise<any[]> => {
    try {
      // Clean national ID: remove spaces and non-digit characters
      const cleanedNationalId = nationalId.trim().replace(/\D/g, '');
      
      // Validate: must be exactly 14 digits
      if (!cleanedNationalId || cleanedNationalId.length !== 14) {
        throw new Error('الرقم القومي يجب أن يكون 14 رقم');
      }

      // Primary endpoint from Swagger API documentation
      const endpoint = `/api/Application/SearchByNationalId/${cleanedNationalId}`;
      console.log(`[API] Calling ${endpoint}`);
      
      const response = await apiClient.get(endpoint);
      
      // Handle different response formats from API
      const data = extractArray(response.data);
      if (data && data.length > 0) {
        return data;
      }
      
      // Try single object format (in case API returns single object)
      if (response.data && typeof response.data === 'object' && !Array.isArray(response.data)) {
        return [response.data];
      }
      
      // Return empty array if no data found
      return [];
    } catch (err: any) {
      console.error('[API] Error in searchByNationalId:', err.message);
      
      // Handle specific HTTP status codes
      if (err?.response?.status === 404) {
        throw new Error('لم يتم العثور على طلب بهذا الرقم القومي');
      }
      
      // Handle connection errors
      if (err?.code === 'ECONNREFUSED' || err?.code === 'ENOTFOUND') {
        throw new Error('فشل الاتصال بالخادم، يرجى المحاولة لاحقاً');
      }
      
      // Handle authorization errors
      if (err?.response?.status === 401 || err?.response?.status === 403) {
        throw new Error('ليس لديك صلاحية للوصول إلى هذه البيانات');
      }
      
      // Handle server errors
      if (err?.response?.status >= 500) {
        throw new Error('خطأ في الخادم. يرجى المحاولة مرة أخرى لاحقاً');
      }

      // Preserve validation errors
      if (err.message && typeof err.message === 'string' && err.message.includes('يجب أن يكون')) {
        throw err;
      }
      
      // Default error handling: use server response message or fallback
      const errorMessage = err?.response?.data?.message 
        || err?.response?.data?.error 
        || err?.message 
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
