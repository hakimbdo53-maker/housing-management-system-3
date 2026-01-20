import { getDatabase } from "./_core/database";
import type { InsertUser, User, Application, InsertApplication } from "../drizzle/schema";

/**
 * User Database Operations
 */

export async function getDb() {
  return getDatabase();
}

/**
 * Upsert a user - update if exists by openId, otherwise create
 */
export async function upsertUser(user: InsertUser): Promise<User> {
  const db = getDatabase();
  const data = db.getData();

  if (user.openId) {
    // Check if user exists by openId
    const existingIndex = data.users.findIndex(u => u.openId === user.openId);

    if (existingIndex !== -1) {
      // Update existing user - preserve id
      const existing = data.users[existingIndex];
      const updated = {
        ...existing,
        ...(user.username && { username: user.username }),
        ...(user.password && { password: user.password }),
        ...(user.studentId && { studentId: user.studentId }),
        ...(user.fullName !== undefined && { fullName: user.fullName }),
        ...(user.email !== undefined && { email: user.email }),
        ...(user.phoneNumber !== undefined && { phoneNumber: user.phoneNumber }),
        ...(user.nationalId !== undefined && { nationalId: user.nationalId }),
        ...(user.loginMethod !== undefined && { loginMethod: user.loginMethod }),
        ...(user.role && { role: user.role }),
        updatedAt: new Date(),
        lastSignedIn: new Date(),
      };
      data.users[existingIndex] = updated;
      db.save();
      return updated as User;
    }
  }

  // Create new user
  const id = data.nextUserId++;
  const newUser: User = {
    id,
    openId: user.openId || null,
    username: user.username || "",
    password: user.password || "",
    studentId: user.studentId || "",
    fullName: user.fullName || null,
    email: user.email || null,
    phoneNumber: user.phoneNumber || null,
    nationalId: user.nationalId || null,
    loginMethod: user.loginMethod || null,
    role: user.role || "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };
  data.users.push(newUser);
  db.save();
  return newUser;
}

/**
 * Get user by openId (OAuth identifier)
 */
export async function getUserByOpenId(openId: string): Promise<User | undefined> {
  const db = getDatabase();
  const data = db.getData();
  return data.users.find(u => u.openId === openId);
}

/**
 * Get user by username
 */
export async function getUserByUsername(username: string): Promise<User | undefined> {
  const db = getDatabase();
  const data = db.getData();
  return data.users.find(u => u.username === username);
}

/**
 * Create a new user
 */
export async function createUser(user: InsertUser): Promise<User> {
  const db = getDatabase();
  const data = db.getData();

  const id = data.nextUserId++;
  const newUser: User = {
    id,
    openId: user.openId || null,
    username: user.username || "",
    password: user.password || "",
    studentId: user.studentId || "",
    fullName: user.fullName || null,
    email: user.email || null,
    phoneNumber: user.phoneNumber || null,
    nationalId: user.nationalId || null,
    loginMethod: user.loginMethod || null,
    role: user.role || "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };
  data.users.push(newUser);
  db.save();
  return newUser;
}

/**
 * Get user by ID
 */
export async function getUserById(id: number): Promise<User | undefined> {
  const db = getDatabase();
  const data = db.getData();
  return data.users.find(u => u.id === id);
}

/**
 * Application Database Operations
 */

/**
 * Create a new application
 */
export async function createApplication(
  application: InsertApplication & { userId: number }
): Promise<Application> {
  const db = getDatabase();
  const data = db.getData();

  const id = data.nextApplicationId++;
  const newApplication: Application = {
    id,
    userId: application.userId,
    studentType: application.studentType || "new",
    fullName: application.fullName || "",
    studentId: application.studentId || "",
    nationalId: application.nationalId || null,
    email: application.email || "",
    phone: application.phone || "",
    major: application.major || "",
    gpa: application.gpa || "",
    address: application.address || "",
    governorate: application.governorate || "",
    familyIncome: application.familyIncome || "",
    additionalInfo: application.additionalInfo || null,
    status: application.status || "submitted",
    submittedAt: new Date(),
    updatedAt: new Date(),
  };
  data.applications.push(newApplication);
  db.save();
  return newApplication;
}

/**
 * Get all applications for a specific user
 */
export async function getApplicationsByUserId(userId: number): Promise<Application[]> {
  const db = getDatabase();
  const data = db.getData();
  return data.applications.filter(app => app.userId === userId);
}

/**
 * Get a specific application by ID
 */
export async function getApplicationById(id: number): Promise<Application | undefined> {
  const db = getDatabase();
  const data = db.getData();
  return data.applications.find(app => app.id === id);
}

/**
 * Get all applications (admin use)
 */
export async function getAllApplications(): Promise<Application[]> {
  const db = getDatabase();
  const data = db.getData();
  return data.applications;
}

/**
 * Get applications by student's national ID
 */
export async function getApplicationsByNationalId(nationalId: string): Promise<Application[]> {
  const db = getDatabase();
  const data = db.getData();
  
  // Normalize the search value: trim whitespace and remove any non-digit characters (except empty)
  const normalizedSearchId = nationalId?.trim().replace(/\D/g, '') || '';
  
  if (!normalizedSearchId) {
    return [];
  }
  
  // Filter applications by national ID, normalizing both values for comparison
  return data.applications.filter(app => {
    if (!app.nationalId) return false;
    
    // Normalize stored national ID: trim and remove non-digit characters
    const normalizedStoredId = String(app.nationalId).trim().replace(/\D/g, '');
    
    // Compare normalized values
    return normalizedStoredId === normalizedSearchId;
  });
}

/**
 * Complaint Database Operations
 */

interface Complaint {
  id: string;
  userId: number;
  title: string;
  description: string;
  status: 'pending' | 'resolved' | 'closed';
  createdAt: Date;
  resolvedAt?: Date;
}

/**
 * Create a new complaint
 */
export async function createComplaint(complaint: Omit<Complaint, 'id'>): Promise<Complaint> {
  const db = getDatabase();
  const data = db.getData();

  // Initialize complaints array if it doesn't exist
  if (!data.complaints) {
    data.complaints = [];
  }

  const newComplaint: Complaint = {
    id: `complaint-${Date.now()}`,
    ...complaint,
  };

  data.complaints.push(newComplaint);
  db.save();
  return newComplaint;
}

/**
 * Get all complaints for a specific user
 */
export async function getComplaintsByUserId(userId: number): Promise<Complaint[]> {
  const db = getDatabase();
  const data = db.getData();

  if (!data.complaints) {
    data.complaints = [];
  }

  return data.complaints.filter(complaint => complaint.userId === userId);
}

/**
 * Get a specific complaint by ID
 */
export async function getComplaintById(id: string): Promise<Complaint | undefined> {
  const db = getDatabase();
  const data = db.getData();

  if (!data.complaints) {
    data.complaints = [];
  }

  return data.complaints.find(complaint => complaint.id === id);
}

/**
 * Notifications Database Operations
 */

export async function getNotificationsByUserId(userId: number): Promise<any[]> {
  const db = getDatabase();
  const data = db.getData();

  if (!data.notifications) {
    data.notifications = [];
  }

  return data.notifications.filter(n => n.studentId === userId || n.userId === userId);
}

export async function markNotificationAsRead(notificationId: number): Promise<any> {
  const db = getDatabase();
  const data = db.getData();

  if (!data.notifications) {
    data.notifications = [];
  }

  const notification = data.notifications.find(n => n.notificationId === notificationId);
  if (notification) {
    notification.isRead = true;
    db.save();
  }

  return notification;
}

/**
 * Fees Database Operations
 */

export async function getFeesByStudentUserId(userId: number): Promise<any[]> {
  const db = getDatabase();
  const data = db.getData();

  if (!data.fees) {
    data.fees = [];
  }

  return data.fees.filter(f => f.userId === userId);
}

/**
 * Room Assignments Database Operations
 */

export async function getRoomAssignmentsByUserId(userId: number): Promise<any[]> {
  const db = getDatabase();
  const data = db.getData();

  if (!data.roomAssignments) {
    data.roomAssignments = [];
  }

  return data.roomAssignments.filter(ra => ra.userId === userId);
}

/**
 * Student Database Operations
 */

export async function getStudentByUserId(userId: number): Promise<any | undefined> {
  const db = getDatabase();
  const data = db.getData();

  if (!data.students) {
    data.students = [];
  }

  return data.students.find(s => s.userId === userId);
}

/**
 * Full Application Database Operations
 */

export async function createFullApplication(input: {
  userId: number;
  fullForm: any;
}): Promise<any> {
  const db = getDatabase();
  const data = db.getData();

  if (!data.fullApplications) {
    data.fullApplications = [];
  }

  const id = data.fullApplications.length + 1;
  const newApplication = {
    id,
    ...input.fullForm,
    userId: input.userId,
    createdAt: new Date(),
    status: "pending",
  };

  data.fullApplications.push(newApplication);
  db.save();

  return newApplication;
}

/**
 * Fee Payment Database Operations
 */

export async function createFeePayment(input: {
  feeId: number;
  userId: number;
  studentId?: number;
  transactionCode?: string;
  receiptFilePath?: string;
  status: string;
  createdAt: Date;
}): Promise<any> {
  const db = getDatabase();
  const data = db.getData();

  if (!data.feePayments) {
    data.feePayments = [];
  }

  const id = data.feePayments.length + 1;
  const newPayment = {
    id,
    ...input,
  };

  data.feePayments.push(newPayment);
  db.save();

  return newPayment;
}

// TODO: add more feature queries here as your schema grows.

