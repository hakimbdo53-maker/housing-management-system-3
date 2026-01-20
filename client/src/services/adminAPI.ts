import { apiClient, extractArray } from './api';

/**
 * Admin Applications API Calls
 */
export const adminApplicationsAPI = {
  /**
   * Get all applications
   */
  getAll: async () => {
    try {
      const response = await apiClient.get('/api/admin/applications');
      return extractArray(response.data);
    } catch (error) {
      console.error('Error fetching applications:', error);
      return [];
    }
  },

  /**
   * Get application details
   */
  getDetails: async (applicationId: number) => {
    try {
      const response = await apiClient.get(`/api/admin/applications/${applicationId}/details`);
      return response.data || {};
    } catch (error) {
      console.error('Error fetching application details:', error);
      return {};
    }
  },

  /**
   * Accept an application
   */
  accept: async (applicationId: number) => {
    try {
      const response = await apiClient.post(`/api/admin/applications/${applicationId}/accept`);
      return response.data || {};
    } catch (error) {
      console.error('Error accepting application:', error);
      throw error;
    }
  },

  /**
   * Reject an application
   */
  reject: async (applicationId: number) => {
    try {
      const response = await apiClient.post(`/api/admin/applications/${applicationId}/reject`);
      return response.data || {};
    } catch (error) {
      console.error('Error rejecting application:', error);
      throw error;
    }
  },

  /**
   * Set fees for an application
   */
  setFees: async (applicationId: number, feesData: any) => {
    try {
      const response = await apiClient.post(
        `/api/admin/applications/${applicationId}/fees`,
        feesData
      );
      return response.data || {};
    } catch (error) {
      console.error('Error setting fees:', error);
      throw error;
    }
  },

  /**
   * Send notification for an application
   */
  sendNotification: async (applicationId: number, notificationData: any) => {
    try {
      const response = await apiClient.post(
        `/api/admin/applications/${applicationId}/notifications`,
        notificationData
      );
      return response.data || {};
    } catch (error) {
      console.error('Error sending notification:', error);
      throw error;
    }
  },
};

/**
 * Admin Complaints API Calls
 */
export const adminComplaintsAPI = {
  /**
   * Get all unresolved complaints
   */
  getUnresolved: async () => {
    try {
      const response = await apiClient.get('/api/admin/complaints/unresolved');
      return extractArray(response.data);
    } catch (error) {
      console.error('Error fetching unresolved complaints:', error);
      return [];
    }
  },

  /**
   * Resolve a complaint
   */
  resolve: async (complaintId: number, resolutionData: { resolutionMessage: string }) => {
    try {
      const response = await apiClient.post(
        `/api/admin/complaints/resolve/${complaintId}`,
        resolutionData
      );
      return response.data || {};
    } catch (error) {
      console.error('Error resolving complaint:', error);
      throw error;
    }
  },
};

/**
 * Admin Fee Payments API Calls
 */
export const adminPaymentsAPI = {
  /**
   * Get pending payments
   */
  getPending: async () => {
    try {
      const response = await apiClient.get('/api/admin/payments/pending');
      return extractArray(response.data);
    } catch (error) {
      console.error('Error fetching pending payments:', error);
      return [];
    }
  },

  /**
   * Approve a payment
   */
  approve: async (feePaymentId: number) => {
    try {
      const response = await apiClient.post(
        `/api/admin/payments/approve/${feePaymentId}`
      );
      return response.data || {};
    } catch (error) {
      console.error('Error approving payment:', error);
      throw error;
    }
  },

  /**
   * Reject a payment
   */
  reject: async (feePaymentId: number) => {
    try {
      const response = await apiClient.post(
        `/api/admin/payments/reject/${feePaymentId}`
      );
      return response.data || {};
    } catch (error) {
      console.error('Error rejecting payment:', error);
      throw error;
    }
  },
};

/**
 * Admin Housing Fees API Calls
 */
export const adminHousingFeesAPI = {
  /**
   * Set global housing fees
   */
  setGlobal: async (amount: number, notes?: string) => {
    try {
      const params = new URLSearchParams();
      params.append('amount', amount.toString());
      if (notes) params.append('notes', notes);
      
      const response = await apiClient.post(
        `/api/admin/housing-fees/set-global?${params.toString()}`
      );
      return response.data || {};
    } catch (error) {
      console.error('Error setting global housing fees:', error);
      throw error;
    }
  },

  /**
   * Get all housing fees
   */
  getAll: async () => {
    try {
      const response = await apiClient.get('/api/admin/housing-fees');
      return extractArray(response.data);
    } catch (error) {
      console.error('Error fetching housing fees:', error);
      return [];
    }
  },

  /**
   * Get student's housing fees
   */
  getByStudent: async (studentId: number) => {
    try {
      const response = await apiClient.get(`/api/admin/housing-fees/student/${studentId}`);
      return extractArray(response.data);
    } catch (error) {
      console.error('Error fetching student housing fees:', error);
      return [];
    }
  },

  /**
   * Update housing fee
   */
  update: async (id: number, amount: number) => {
    try {
      const response = await apiClient.put(
        `/api/admin/housing-fees/${id}`,
        amount
      );
      return response.data || {};
    } catch (error) {
      console.error('Error updating housing fee:', error);
      throw error;
    }
  },

  /**
   * Delete housing fee
   */
  delete: async (id: number) => {
    try {
      const response = await apiClient.delete(`/api/admin/housing-fees/${id}`);
      return response.data || {};
    } catch (error) {
      console.error('Error deleting housing fee:', error);
      throw error;
    }
  },

  /**
   * Mark housing fee as paid
   */
  markPaid: async (id: number) => {
    try {
      const response = await apiClient.put(
        `/api/admin/housing-fees/${id}/mark-paid`
      );
      return response.data || {};
    } catch (error) {
      console.error('Error marking housing fee as paid:', error);
      throw error;
    }
  },
};

/**
 * Admin Notifications API Calls
 */
export const adminNotificationsAPI = {
  /**
   * Send notification to all students
   */
  sendToAll: async (notificationData: { title: string; message: string }) => {
    try {
      const response = await apiClient.post(
        '/api/admin/notifications/send-to-all',
        notificationData
      );
      return response.data || {};
    } catch (error) {
      console.error('Error sending notification to all:', error);
      throw error;
    }
  },
};

/**
 * Admin Application Statuses API Calls
 */
export const adminApplicationStatusAPI = {
  /**
   * Get all application statuses
   */
  getAll: async () => {
    try {
      const response = await apiClient.get('/api/admin/application-statuses');
      return extractArray(response.data);
    } catch (error) {
      console.error('Error fetching application statuses:', error);
      return [];
    }
  },

  /**
   * Create application status
   */
  create: async (statusData: any) => {
    try {
      const response = await apiClient.post(
        '/api/admin/application-statuses',
        statusData
      );
      return response.data || {};
    } catch (error) {
      console.error('Error creating application status:', error);
      throw error;
    }
  },

  /**
   * Get specific status
   */
  get: async (id: number) => {
    try {
      const response = await apiClient.get(`/api/admin/application-statuses/${id}`);
      return response.data || {};
    } catch (error) {
      console.error('Error fetching application status:', error);
      return {};
    }
  },

  /**
   * Update status
   */
  update: async (id: number, statusData: any) => {
    try {
      const response = await apiClient.put(
        `/api/admin/application-statuses/${id}`,
        statusData
      );
      return response.data || {};
    } catch (error) {
      console.error('Error updating application status:', error);
      throw error;
    }
  },

  /**
   * Delete status
   */
  delete: async (id: number) => {
    try {
      const response = await apiClient.delete(`/api/admin/application-statuses/${id}`);
      return response.data || {};
    } catch (error) {
      console.error('Error deleting application status:', error);
      throw error;
    }
  },
};

/**
 * Admin Application Windows API Calls
 */
export const adminApplicationWindowAPI = {
  /**
   * Get all application windows
   */
  getAll: async () => {
    try {
      const response = await apiClient.get('/api/admin/application-windows');
      return extractArray(response.data);
    } catch (error) {
      console.error('Error fetching application windows:', error);
      return [];
    }
  },

  /**
   * Get active application window
   */
  getActive: async () => {
    try {
      const response = await apiClient.get('/api/admin/application-windows/active');
      return response.data || {};
    } catch (error) {
      console.error('Error fetching active application window:', error);
      return {};
    }
  },

  /**
   * Create application window
   */
  create: async (windowData: any) => {
    try {
      const response = await apiClient.post(
        '/api/admin/application-windows',
        windowData
      );
      return response.data || {};
    } catch (error) {
      console.error('Error creating application window:', error);
      throw error;
    }
  },

  /**
   * Get specific window
   */
  get: async (id: number) => {
    try {
      const response = await apiClient.get(`/api/admin/application-windows/${id}`);
      return response.data || {};
    } catch (error) {
      console.error('Error fetching application window:', error);
      return {};
    }
  },

  /**
   * Update window
   */
  update: async (id: number, windowData: any) => {
    try {
      const response = await apiClient.put(
        `/api/admin/application-windows/${id}`,
        windowData
      );
      return response.data || {};
    } catch (error) {
      console.error('Error updating application window:', error);
      throw error;
    }
  },

  /**
   * Delete window
   */
  delete: async (id: number) => {
    try {
      const response = await apiClient.delete(`/api/admin/application-windows/${id}`);
      return response.data || {};
    } catch (error) {
      console.error('Error deleting application window:', error);
      throw error;
    }
  },
};

/**
 * Admin Base Housing Fees API Calls
 */
export const adminBaseHousingFeesAPI = {
  /**
   * Set base housing fees
   */
  setGlobal: async (amount: number, notes?: string) => {
    try {
      const params = new URLSearchParams();
      params.append('amount', amount.toString());
      if (notes) params.append('notes', notes);
      
      const response = await apiClient.post(
        `/api/admin/base-housing-fees/set-global?${params.toString()}`
      );
      return response.data || {};
    } catch (error) {
      console.error('Error setting base housing fees:', error);
      throw error;
    }
  },

  /**
   * Update base housing fees
   */
  updateGlobal: async (newAmount: number) => {
    try {
      const params = new URLSearchParams();
      params.append('newAmount', newAmount.toString());
      
      const response = await apiClient.put(
        `/api/admin/base-housing-fees/update-global?${params.toString()}`
      );
      return response.data || {};
    } catch (error) {
      console.error('Error updating base housing fees:', error);
      throw error;
    }
  },

  /**
   * Get base housing fees
   */
  getAll: async () => {
    try {
      const response = await apiClient.get('/api/admin/base-housing-fees');
      return extractArray(response.data);
    } catch (error) {
      console.error('Error fetching base housing fees:', error);
      return [];
    }
  },

  /**
   * Delete base housing fee
   */
  delete: async (id: number) => {
    try {
      const response = await apiClient.delete(`/api/admin/base-housing-fees/${id}`);
      return response.data || {};
    } catch (error) {
      console.error('Error deleting base housing fee:', error);
      throw error;
    }
  },
};

/**
 * Admin Buildings API Calls
 */
export const adminBuildingsAPI = {
  /**
   * Get all buildings
   */
  getAll: async () => {
    try {
      const response = await apiClient.get('/api/Building');
      return extractArray(response.data);
    } catch (error) {
      console.error('Error fetching buildings:', error);
      return [];
    }
  },

  /**
   * Create building
   */
  create: async (buildingData: any) => {
    try {
      const response = await apiClient.post('/api/Building', buildingData);
      return response.data || {};
    } catch (error) {
      console.error('Error creating building:', error);
      throw error;
    }
  },

  /**
   * Get specific building
   */
  get: async (id: number) => {
    try {
      const response = await apiClient.get(`/api/Building/${id}`);
      return response.data || {};
    } catch (error) {
      console.error('Error fetching building:', error);
      return {};
    }
  },

  /**
   * Update building
   */
  update: async (id: number, buildingData: any) => {
    try {
      const response = await apiClient.put(`/api/Building/${id}`, buildingData);
      return response.data || {};
    } catch (error) {
      console.error('Error updating building:', error);
      throw error;
    }
  },

  /**
   * Delete building
   */
  delete: async (id: number) => {
    try {
      const response = await apiClient.delete(`/api/Building/${id}`);
      return response.data || {};
    } catch (error) {
      console.error('Error deleting building:', error);
      throw error;
    }
  },
};

/**
 * Admin Rooms API Calls
 */
export const adminRoomsAPI = {
  /**
   * Get all rooms
   */
  getAll: async () => {
    try {
      const response = await apiClient.get('/api/Room');
      return extractArray(response.data);
    } catch (error) {
      console.error('Error fetching rooms:', error);
      return [];
    }
  },

  /**
   * Create room
   */
  create: async (roomData: any) => {
    try {
      const response = await apiClient.post('/api/Room', roomData);
      return response.data || {};
    } catch (error) {
      console.error('Error creating room:', error);
      throw error;
    }
  },

  /**
   * Get specific room
   */
  get: async (id: number) => {
    try {
      const response = await apiClient.get(`/api/Room/${id}`);
      return response.data || {};
    } catch (error) {
      console.error('Error fetching room:', error);
      return {};
    }
  },

  /**
   * Update room
   */
  update: async (id: number, roomData: any) => {
    try {
      const response = await apiClient.put(`/api/Room/${id}`, roomData);
      return response.data || {};
    } catch (error) {
      console.error('Error updating room:', error);
      throw error;
    }
  },

  /**
   * Delete room
   */
  delete: async (id: number) => {
    try {
      const response = await apiClient.delete(`/api/Room/${id}`);
      return response.data || {};
    } catch (error) {
      console.error('Error deleting room:', error);
      throw error;
    }
  },
};

/**
 * Admin Room Assignments API Calls
 */
export const adminRoomAssignmentsAPI = {
  /**
   * Assign student to room
   */
  assign: async (studentId: number, roomId: number) => {
    try {
      const params = new URLSearchParams();
      params.append('studentId', studentId.toString());
      params.append('roomId', roomId.toString());
      
      const response = await apiClient.post(
        `/api/RoomAssignment/assign?${params.toString()}`
      );
      return response.data || {};
    } catch (error) {
      console.error('Error assigning room:', error);
      throw error;
    }
  },

  /**
   * Delete room assignment
   */
  delete: async (id: number) => {
    try {
      const response = await apiClient.delete(`/api/RoomAssignment/${id}`);
      return response.data || {};
    } catch (error) {
      console.error('Error deleting room assignment:', error);
      throw error;
    }
  },
};

/**
 * Admin Fees API Calls
 */
export const adminFeesAPI = {
  /**
   * Get all fees
   */
  getAll: async () => {
    try {
      const response = await apiClient.get('/api/Fees');
      return extractArray(response.data);
    } catch (error) {
      console.error('Error fetching fees:', error);
      return [];
    }
  },

  /**
   * Create fee
   */
  create: async (feeData: any) => {
    try {
      const response = await apiClient.post('/api/Fees', feeData);
      return response.data || {};
    } catch (error) {
      console.error('Error creating fee:', error);
      throw error;
    }
  },

  /**
   * Get specific fee
   */
  get: async (id: number) => {
    try {
      const response = await apiClient.get(`/api/Fees/${id}`);
      return response.data || {};
    } catch (error) {
      console.error('Error fetching fee:', error);
      return {};
    }
  },

  /**
   * Update fee
   */
  update: async (id: number, feeData: any) => {
    try {
      const response = await apiClient.put(`/api/Fees/${id}`, feeData);
      return response.data || {};
    } catch (error) {
      console.error('Error updating fee:', error);
      throw error;
    }
  },

  /**
   * Delete fee
   */
  delete: async (id: number) => {
    try {
      const response = await apiClient.delete(`/api/Fees/${id}`);
      return response.data || {};
    } catch (error) {
      console.error('Error deleting fee:', error);
      throw error;
    }
  },
};

/**
 * Admin Students API Calls
 */
export const adminStudentsAPI = {
  /**
   * Get all students
   */
  getAll: async () => {
    try {
      const response = await apiClient.get('/api/Student');
      return extractArray(response.data);
    } catch (error) {
      console.error('Error fetching students:', error);
      return [];
    }
  },

  /**
   * Create student
   */
  create: async (studentData: any) => {
    try {
      const response = await apiClient.post('/api/Student', studentData);
      return response.data || {};
    } catch (error) {
      console.error('Error creating student:', error);
      throw error;
    }
  },

  /**
   * Get specific student
   */
  get: async (id: number) => {
    try {
      const response = await apiClient.get(`/api/Student/${id}`);
      return response.data || {};
    } catch (error) {
      console.error('Error fetching student:', error);
      return {};
    }
  },

  /**
   * Update student
   */
  update: async (id: number, studentData: any) => {
    try {
      const response = await apiClient.put(`/api/Student/${id}`, studentData);
      return response.data || {};
    } catch (error) {
      console.error('Error updating student:', error);
      throw error;
    }
  },

  /**
   * Delete student
   */
  delete: async (id: number) => {
    try {
      const response = await apiClient.delete(`/api/Student/${id}`);
      return response.data || {};
    } catch (error) {
      console.error('Error deleting student:', error);
      throw error;
    }
  },
};

/**
 * Admin Reports API Calls
 */
export const adminReportsAPI = {
  /**
   * Get reports summary
   */
  getSummary: async () => {
    try {
      const response = await apiClient.get('/api/Reports/summary');
      return response.data || {};
    } catch (error) {
      console.error('Error fetching reports summary:', error);
      return {};
    }
  },
};

/**
 * Admin Users API Calls
 */
export const adminUsersAPI = {
  /**
   * Delete user
   */
  delete: async (id: number) => {
    try {
      const response = await apiClient.delete(`/api/users/${id}`);
      return response.data || {};
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  },
};

// Export all admin APIs
export default {
  applications: adminApplicationsAPI,
  complaints: adminComplaintsAPI,
  payments: adminPaymentsAPI,
  housingFees: adminHousingFeesAPI,
  notifications: adminNotificationsAPI,
  applicationStatus: adminApplicationStatusAPI,
  applicationWindow: adminApplicationWindowAPI,
  baseHousingFees: adminBaseHousingFeesAPI,
  buildings: adminBuildingsAPI,
  rooms: adminRoomsAPI,
  roomAssignments: adminRoomAssignmentsAPI,
  fees: adminFeesAPI,
  students: adminStudentsAPI,
  reports: adminReportsAPI,
  users: adminUsersAPI,
};
