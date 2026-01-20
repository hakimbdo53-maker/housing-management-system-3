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
 * Validates that API response has actual content
 * Throws clear error if response is empty or null
 */
const validateResponse = (response: any, endpoint: string): void => {
  if (response === null || response === undefined) {
    throw new Error(`API endpoint ${endpoint} returned empty response (null/undefined)`);
  }
  
  if (typeof response === 'string' && response.trim() === '') {
    throw new Error(`API endpoint ${endpoint} returned empty string`);
  }
};

/**
 * Utility function to extract array from API response
 * 
 * Handles different response wrapper formats:
 * - { data: [...] }
 * - { data: { data: [...] } }
 * - Direct array: [...]
 * 
 * Returns empty array if no data found (graceful degradation)
 * Logs warnings for empty results
 */
export const extractArray = (response: any, endpoint: string = 'unknown'): any[] => {
  try {
    validateResponse(response, endpoint);
  } catch (error) {
    // Don't throw for arrays - just return empty array
    console.warn(String(error));
    return [];
  }
  
  // Direct array response
  if (Array.isArray(response)) {
    if (response.length === 0) {
      console.warn(`API endpoint ${endpoint} returned empty array`);
    }
    return response;
  }
  
  // Wrapped in data property: { data: [...] }
  if (Array.isArray(response?.data)) {
    if (response.data.length === 0) {
      console.warn(`API endpoint ${endpoint} returned empty data array`);
    }
    return response.data;
  }
  
  // Double wrapped: { data: { data: [...] } }
  if (Array.isArray(response?.data?.data)) {
    if (response.data.data.length === 0) {
      console.warn(`API endpoint ${endpoint} returned empty nested data array`);
    }
    return response.data.data;
  }
  
  // Single object response (convert to array)
  if (response?.id || response?.studentId || response?.notificationId || response?.feeId) {
    return [response];
  }
  
  // Log warning but don't throw - allow graceful degradation
  console.warn(`API endpoint ${endpoint} returned response with no array data: ${JSON.stringify(response).substring(0, 200)}`);
  return [];
};

/**
 * Validates and extracts single object response
 * Throws error if response is empty, null, or invalid
 */
export const extractObject = (response: any, endpoint: string = 'unknown'): any => {
  try {
    validateResponse(response, endpoint);
  } catch (error) {
    throw error; // Throw for objects - they must have data
  }
  
  // If response has nested data property and it's an object
  if (response?.data && typeof response.data === 'object' && !Array.isArray(response.data)) {
    return response.data;
  }
  
  // If response is already an object (not array)
  if (typeof response === 'object' && !Array.isArray(response)) {
    return response;
  }
  
  throw new Error(`API endpoint ${endpoint} returned invalid object format. Expected object, got: ${typeof response}`);
};

/**
 * Safely parse JSON from Fetch API Response
 * 
 * Validates:
 * - response.ok is true
 * - Content-Type includes application/json
 * - response body is not empty
 * 
 * Throws clear error if any validation fails
 */
export const safeJsonParse = async (response: Response, endpoint: string = 'unknown'): Promise<any> => {
  // Check if response is ok
  if (!response.ok) {
    throw new Error(`API endpoint ${endpoint} returned HTTP ${response.status}`);
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return null;
  }

  // Check Content-Type header
  const contentType = response.headers.get('content-type');
  if (!contentType || !contentType.includes('application/json')) {
    throw new Error(`API endpoint ${endpoint} returned invalid Content-Type: ${contentType || 'missing'}`);
  }

  // Check if response body is empty
  const contentLength = response.headers.get('content-length');
  if (contentLength === '0') {
    return null;
  }

  // Try to parse JSON
  try {
    const text = await response.text();
    
    // Check if text is empty
    if (!text || text.trim() === '') {
      return null;
    }

    // Parse JSON
    const data = JSON.parse(text);
    
    // Return data even if null (it's valid JSON)
    return data;
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error(`API endpoint ${endpoint} returned invalid JSON: ${error.message}`);
    }
    // Re-throw our validation errors
    throw error;
  }
};

// Create axios instance with base configuration
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Send cookies with requests
});

// Add Bearer token to every request if available (for backward compatibility)
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Validate response structure and content before returning
apiClient.interceptors.response.use(
  (response) => {
    // 204 No Content is valid - return empty success
    if (response.status === 204) {
      return {
        ...response,
        data: null,
      };
    }

    // Validate Content-Type is JSON
    const contentType = response.headers['content-type'];
    if (contentType && !contentType.includes('application/json')) {
      throw new Error(`Invalid Content-Type: ${contentType}. Expected application/json from ${response.config.url}`);
    }

    // Check if response data is empty
    if (response.data === null || response.data === undefined) {
      // Some endpoints may return null as valid response
      return response;
    }

    if (typeof response.data === 'string' && response.data.trim() === '') {
      throw new Error(`API endpoint ${response.config.url} returned empty string`);
    }

    return response;
  },
  (error) => {
    // Enhanced error messages for axios errors
    if (error.response) {
      // Response received but status code is outside 2xx range
      const status = error.response.status;
      const endpoint = error.config?.url || 'unknown endpoint';
      
      // 204 No Content is valid
      if (status === 204) {
        return Promise.resolve({
          ...error.response,
          data: null,
          status: 204,
        });
      }
      
      if (status === 401) {
        // Handle unauthorized - clear token and redirect to login if needed
        localStorage.removeItem('token');
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        return Promise.reject(new Error('جلستك منتهية. يرجى تسجيل الدخول مجددا'));
      }
      
      if (status === 403) {
        return Promise.reject(new Error('ليس لديك صلاحية للوصول إلى هذا المورد'));
      }
      
      if (status === 404) {
        return Promise.reject(new Error(`لم يتم العثور على: ${endpoint}`));
      }
      
      if (status >= 500) {
        return Promise.reject(new Error('خطأ في الخادم. يرجى المحاولة لاحقا'));
      }
      
      // Try to get error message from response
      let errorMessage: string | undefined;
      try {
        if (error.response.data) {
          if (typeof error.response.data === 'string') {
            errorMessage = error.response.data;
          } else if (error.response.data.message) {
            errorMessage = error.response.data.message;
          } else if (error.response.data.error) {
            errorMessage = error.response.data.error;
          }
        }
      } catch (e) {
        // Ignore parse errors
      }
      
      return Promise.reject(new Error(errorMessage || error.message || `خطأ HTTP ${status}`));
    } else if (error.request) {
      // Request made but no response received
      return Promise.reject(new Error('لا يمكن الاتصال بالخادم. تأكد من اتصالك بالإنترنت'));
    } else {
      // Error in request setup
      return Promise.reject(error);
    }
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
      return extractObject(response.data, endpoint);
    } catch (error) {
      console.error(`Error fetching profile from ${endpoint}:`, error);
      throw error;
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
      return extractArray(response.data, endpoint);
    } catch (error) {
      console.error(`Error fetching notifications from ${endpoint}:`, error);
      return [];
    }
  },

  /**
   * Mark notification as read
   */
  markNotificationAsRead: async (notificationId: string) => {
    try {
      const endpoint = `/api/student/profile/notifications/${notificationId}/read`;
      const response = await apiClient.put(endpoint, {});
      return extractObject(response.data, endpoint);
    } catch (error) {
      console.error(`Error marking notification as read:`, error);
      throw error;
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
      return extractArray(response.data, endpoint);
    } catch (error) {
      console.error(`Error fetching fees from ${endpoint}:`, error);
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
      return extractArray(response.data, endpoint);
    } catch (error) {
      console.error(`Error fetching assignments from ${endpoint}:`, error);
      return [];
    }
  },

  /**
   * Update student's own profile
   * @param profileData - Updated profile data
   */
  updateProfile: async (profileData: any) => {
    try {
      const endpoint = '/api/Student/self-update';
      const response = await apiClient.put(endpoint, profileData);
      return extractObject(response.data, endpoint);
    } catch (error) {
      console.error(`Error updating profile:`, error);
      throw error;
    }
  },
};

/**
 * Student Payments API Calls
 */
export const studentPaymentsAPI = {
  /**
   * Submit payment for a fee
   * @param feeId - The fee ID to pay for
   * @param paymentData - Payment data (transaction code, receipt file path)
   */
  submitPayment: async (feeId: number, paymentData: {
    transactionCode: string;
    receiptFilePath?: string;
  }) => {
    try {
      const endpoint = `/api/student/payments/pay/${feeId}`;
      const response = await apiClient.post(endpoint, paymentData);
      return extractObject(response.data, endpoint);
    } catch (error) {
      console.error(`Error submitting payment for fee ${feeId}:`, error);
      throw error;
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
      const endpoint = '/api/student/complaints';
      const response = await apiClient.get(endpoint);
      return extractArray(response.data, endpoint);
    } catch (error) {
      console.error(`Error fetching complaints:`, error);
      return [];
    }
  },

  /**
   * Submit a new complaint
   */
  submitComplaint: async (title: string, description: string) => {
    try {
      const endpoint = '/api/student/complaints/submit';
      const response = await apiClient.post(endpoint, {
        title,
        message: description, // API expects 'message' not 'description'
      });
      return extractObject(response.data, endpoint);
    } catch (error) {
      console.error(`Error submitting complaint:`, error);
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
      
      const endpoint = '/api/Application/Submit';
      const response = await apiClient.post(endpoint, {
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
      
      // Extract response data
      return extractObject(response.data, endpoint);
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

      // Try primary endpoint first
      const endpoint = `/api/Application/SearchByNationalId/${cleanedNationalId}`;
      try {
        const response = await apiClient.get(endpoint);
        const data = extractArray(response.data, endpoint);
        return data.length > 0 ? data : [];
      } catch (err: any) {
        // Handle specific error codes
        if (err.response?.status === 404) {
          throw new Error('لم يتم العثور على طلب بهذا الرقم القومي');
        }
        if (err.response?.status === 401 || err.response?.status === 403) {
          throw new Error('ليس لديك صلاحية للوصول إلى هذه البيانات');
        }
        if (err.response?.status >= 500) {
          throw new Error('خطأ في الخادم. يرجى المحاولة مرة أخرى لاحقاً');
        }
        if (err.code === 'ECONNREFUSED' || err.code === 'ENOTFOUND') {
          throw new Error('لا يمكن الاتصال بخادم البحث. تأكد من أن API الخارجي متاح.');
        }
        
        throw err;
      }
    } catch (error: any) {
      console.error('Error searching application by national ID:', error);
      throw error;
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
  payments: studentPaymentsAPI,
  applications: applicationAPI,
};
