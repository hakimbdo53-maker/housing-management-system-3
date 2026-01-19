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
  return data.applications.filter(app => app.studentId === nationalId);
}

// TODO: add more feature queries here as your schema grows.

