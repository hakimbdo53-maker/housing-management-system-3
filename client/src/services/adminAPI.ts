import { apiClient, extractArray, extractObject } from './api';

/**
 * Admin Applications API Calls
 */
export const adminApplicationsAPI = {
  /**
   * Get all applications
   */
  getAll: async () => {
    try {
      const endpoint = '/api/admin/applications';
      const response = await apiClient.get(endpoint);
      return extractArray(response.data, endpoint);
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
      const endpoint = `/api/admin/applications/${applicationId}/details`;
      const response = await apiClient.get(endpoint);
      return extractObject(response.data, endpoint);
    } catch (error) {
      console.error('Error fetching application details:', error);
      throw error;
    }
  },

  /**
   * Accept an application
   */
  accept: async (applicationId: number) => {
    try {
      const endpoint = `/api/admin/applications/${applicationId}/accept`;
      const response = await apiClient.post(endpoint);
      return extractObject(response.data, endpoint);
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
      const endpoint = `/api/admin/applications/${applicationId}/reject`;
      const response = await apiClient.post(endpoint);
      return extractObject(response.data, endpoint);
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
      const endpoint = `/api/admin/applications/${applicationId}/fees`;
      const response = await apiClient.post(endpoint, feesData);
      return extractObject(response.data, endpoint);
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
      const endpoint = `/api/admin/applications/${applicationId}/notifications`;
      const response = await apiClient.post(endpoint, notificationData);
      return extractObject(response.data, endpoint);
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
      const endpoint = '/api/admin/complaints/unresolved';
      const response = await apiClient.get(endpoint);
      return extractArray(response.data, endpoint);
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
      const endpoint = `/api/admin/complaints/resolve/${complaintId}`;
      const response = await apiClient.post(endpoint, resolutionData);
      return extractObject(response.data, endpoint);
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
      const endpoint = '/api/admin/payments/pending';
      const response = await apiClient.get(endpoint);
      return extractArray(response.data, endpoint);
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
      const endpoint = `/api/admin/payments/approve/${feePaymentId}`;
      const response = await apiClient.post(endpoint);
      return extractObject(response.data, endpoint);
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
      const endpoint = `/api/admin/payments/reject/${feePaymentId}`;
      const response = await apiClient.post(endpoint);
      return extractObject(response.data, endpoint);
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
      
      const endpoint = `/api/admin/housing-fees/set-global?${params.toString()}`;
      const response = await apiClient.post(endpoint);
      return extractObject(response.data, endpoint);
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
      const endpoint = '/api/admin/housing-fees';
      const response = await apiClient.get(endpoint);
      return extractArray(response.data, endpoint);
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
      const endpoint = `/api/admin/housing-fees/student/${studentId}`;
      const response = await apiClient.get(endpoint);
      return extractArray(response.data, endpoint);
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
      const endpoint = `/api/admin/housing-fees/${id}`;
      const response = await apiClient.put(endpoint, amount);
      return extractObject(response.data, endpoint);
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
      const endpoint = `/api/admin/housing-fees/${id}`;
      const response = await apiClient.delete(endpoint);
      return extractObject(response.data, endpoint);
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
      const endpoint = `/api/admin/housing-fees/${id}/mark-paid`;
      const response = await apiClient.put(endpoint);
      return extractObject(response.data, endpoint);
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
      const endpoint = '/api/admin/notifications/send-to-all';
      const response = await apiClient.post(endpoint, notificationData);
      return extractObject(response.data, endpoint);
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
      const endpoint = '/api/admin/application-statuses';
      const response = await apiClient.get(endpoint);
      return extractArray(response.data, endpoint);
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
      const endpoint = '/api/admin/application-statuses';
      const response = await apiClient.post(endpoint, statusData);
      return extractObject(response.data, endpoint);
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
      const endpoint = `/api/admin/application-statuses/${id}`;
      const response = await apiClient.get(endpoint);
      return extractObject(response.data, endpoint);
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
      const endpoint = `/api/admin/application-statuses/${id}`;
      const response = await apiClient.put(endpoint, statusData);
      return extractObject(response.data, endpoint);
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
      const endpoint = `/api/admin/application-statuses/${id}`;
      const response = await apiClient.delete(endpoint);
      return extractObject(response.data, endpoint);
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
      const endpoint = '/api/admin/application-windows';
      const response = await apiClient.get(endpoint);
      return extractArray(response.data, endpoint);
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
      const endpoint = '/api/admin/application-windows/active';
      const response = await apiClient.get(endpoint);
      return extractObject(response.data, endpoint);
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
      const endpoint = '/api/admin/application-windows';
      const response = await apiClient.post(endpoint, windowData);
      return extractObject(response.data, endpoint);
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
      const endpoint = `/api/admin/application-windows/${id}`;
      const response = await apiClient.get(endpoint);
      return extractObject(response.data, endpoint);
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
      const endpoint = `/api/admin/application-windows/${id}`;
      const response = await apiClient.put(endpoint, windowData);
      return extractObject(response.data, endpoint);
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
      const endpoint = `/api/admin/application-windows/${id}`;
      const response = await apiClient.delete(endpoint);
      return extractObject(response.data, endpoint);
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
      
      const endpoint = `/api/admin/base-housing-fees/set-global?${params.toString()}`;
      const response = await apiClient.post(endpoint);
      return extractObject(response.data, endpoint);
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
      
      const endpoint = `/api/admin/base-housing-fees/update-global?${params.toString()}`;
      const response = await apiClient.put(endpoint);
      return extractObject(response.data, endpoint);
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
      const endpoint = '/api/admin/base-housing-fees';
      const response = await apiClient.get(endpoint);
      return extractArray(response.data, endpoint);
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
      const endpoint = `/api/admin/base-housing-fees/${id}`;
      const response = await apiClient.delete(endpoint);
      return extractObject(response.data, endpoint);
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
      const endpoint = '/api/Building';
      const response = await apiClient.get(endpoint);
      return extractArray(response.data, endpoint);
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
      const endpoint = '/api/Building';
      const response = await apiClient.post(endpoint, buildingData);
      return extractObject(response.data, endpoint);
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
      const endpoint = `/api/Building/${id}`;
      const response = await apiClient.get(endpoint);
      return extractObject(response.data, endpoint);
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
      const endpoint = `/api/Building/${id}`;
      const response = await apiClient.put(endpoint, buildingData);
      return extractObject(response.data, endpoint);
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
      const endpoint = `/api/Building/${id}`;
      const response = await apiClient.delete(endpoint);
      return extractObject(response.data, endpoint);
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
      const endpoint = '/api/Room';
      const response = await apiClient.get(endpoint);
      return extractArray(response.data, endpoint);
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
      const endpoint = '/api/Room';
      const response = await apiClient.post(endpoint, roomData);
      return extractObject(response.data, endpoint);
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
      const endpoint = `/api/Room/${id}`;
      const response = await apiClient.get(endpoint);
      return extractObject(response.data, endpoint);
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
      const endpoint = `/api/Room/${id}`;
      const response = await apiClient.put(endpoint, roomData);
      return extractObject(response.data, endpoint);
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
      const endpoint = `/api/Room/${id}`;
      const response = await apiClient.delete(endpoint);
      return extractObject(response.data, endpoint);
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
      
      const endpoint = `/api/RoomAssignment/assign?${params.toString()}`;
      const response = await apiClient.post(endpoint);
      return extractObject(response.data, endpoint);
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
      const endpoint = `/api/RoomAssignment/${id}`;
      const response = await apiClient.delete(endpoint);
      return extractObject(response.data, endpoint);
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
      const endpoint = '/api/Fees';
      const response = await apiClient.get(endpoint);
      return extractArray(response.data, endpoint);
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
      const endpoint = '/api/Fees';
      const response = await apiClient.post(endpoint, feeData);
      return extractObject(response.data, endpoint);
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
      const endpoint = `/api/Fees/${id}`;
      const response = await apiClient.get(endpoint);
      return extractObject(response.data, endpoint);
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
      const endpoint = `/api/Fees/${id}`;
      const response = await apiClient.put(endpoint, feeData);
      return extractObject(response.data, endpoint);
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
      const endpoint = `/api/Fees/${id}`;
      const response = await apiClient.delete(endpoint);
      return extractObject(response.data, endpoint);
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
      const endpoint = '/api/Student';
      const response = await apiClient.get(endpoint);
      return extractArray(response.data, endpoint);
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
      const endpoint = '/api/Student';
      const response = await apiClient.post(endpoint, studentData);
      return extractObject(response.data, endpoint);
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
      const endpoint = `/api/Student/${id}`;
      const response = await apiClient.get(endpoint);
      return extractObject(response.data, endpoint);
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
      const endpoint = `/api/Student/${id}`;
      const response = await apiClient.put(endpoint, studentData);
      return extractObject(response.data, endpoint);
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
      const endpoint = `/api/Student/${id}`;
      const response = await apiClient.delete(endpoint);
      return extractObject(response.data, endpoint);
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
      const endpoint = '/api/Reports/summary';
      const response = await apiClient.get(endpoint);
      return extractObject(response.data, endpoint);
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
      const endpoint = `/api/users/${id}`;
      const response = await apiClient.delete(endpoint);
      return extractObject(response.data, endpoint);
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
