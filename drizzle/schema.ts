import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = sqliteTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: integer("id").primaryKey({ autoIncrement: true }),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: text("openId").unique(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  studentId: text("studentId").notNull().unique(),
  
  // Profile data (Basic student information) - unified field names
  fullName: text("fullName"),
  email: text("email"),
  phoneNumber: text("phoneNumber"), // Unified name
  nationalId: text("nationalId"), // Added for profile data
  
  loginMethod: text("loginMethod"),
  role: text("role").default("user").notNull(),
  createdAt: integer("createdAt", { mode: "timestamp" }).default(new Date()).notNull(),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).default(new Date()).notNull(),
  lastSignedIn: integer("lastSignedIn", { mode: "timestamp" }).default(new Date()).notNull(),
});

/**
 * Housing Applications table
 * Stores all housing application submissions from students
 */
export const applications = sqliteTable("applications", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("userId").notNull(),
  studentType: text("studentType").notNull(), // 'new' or 'old'
  fullName: text("fullName").notNull(),
  studentId: text("studentId").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  major: text("major").notNull(),
  gpa: text("gpa").notNull(),
  address: text("address").notNull(),
  governorate: text("governorate").notNull(),
  familyIncome: text("familyIncome").notNull(),
  additionalInfo: text("additionalInfo"),
  status: text("status").default("submitted").notNull(), // 'submitted', 'review', 'approved', 'rejected'
  submittedAt: integer("submittedAt", { mode: "timestamp" }).default(new Date()).notNull(),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).default(new Date()).notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Application = typeof applications.$inferSelect;
export type InsertApplication = typeof applications.$inferInsert;