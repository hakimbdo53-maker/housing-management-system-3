import { createWriteStream, existsSync, mkdirSync } from "fs";
import { join } from "path";
import { randomUUID } from "crypto";
import { TRPCError } from "@trpc/server";

// File upload configuration
const UPLOAD_CONFIG = {
  ALLOWED_TYPES: ["image/jpeg", "image/png", "application/pdf"],
  ALLOWED_EXTENSIONS: [".jpg", ".jpeg", ".png", ".pdf"],
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB in bytes
  UPLOAD_DIR: join(process.cwd(), "..", "uploads", "private", "receipts"),
};

// Error messages in Arabic
const ERROR_MESSAGES = {
  INVALID_TYPE: "نوع الملف غير مسموح. الملفات المسموحة: JPEG, PNG, PDF فقط",
  INVALID_SIZE: "حجم الملف يتجاوز الحد المسموح (5MB)",
  MISSING_FILE: "الملف مفقود",
  UPLOAD_FAILED: "فشل رفع الملف، حاول مرة أخرى",
  NO_FILENAME: "اسم الملف غير محدد",
};

/**
 * Validate file type based on MIME type
 */
export function validateFileType(mimeType: string): boolean {
  return UPLOAD_CONFIG.ALLOWED_TYPES.includes(mimeType);
}

/**
 * Validate file size
 */
export function validateFileSize(sizeInBytes: number): boolean {
  return sizeInBytes <= UPLOAD_CONFIG.MAX_FILE_SIZE;
}

/**
 * Generate unique filename with UUID and timestamp
 */
export function generateUniqueFilename(originalFilename: string): string {
  if (!originalFilename) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: ERROR_MESSAGES.NO_FILENAME,
    });
  }

  // Get file extension
  const fileExtension = originalFilename.substring(
    originalFilename.lastIndexOf(".")
  ).toLowerCase();

  // Validate extension
  if (!UPLOAD_CONFIG.ALLOWED_EXTENSIONS.includes(fileExtension)) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: ERROR_MESSAGES.INVALID_TYPE,
    });
  }

  // Generate unique name: timestamp_uuid_extension
  const timestamp = Date.now();
  const uuid = randomUUID();
  return `${timestamp}_${uuid}${fileExtension}`;
}

/**
 * Ensure upload directory exists
 */
export function ensureUploadDirectory(): void {
  try {
    if (!existsSync(UPLOAD_CONFIG.UPLOAD_DIR)) {
      mkdirSync(UPLOAD_CONFIG.UPLOAD_DIR, { recursive: true });
    }
  } catch (error) {
    console.error("Failed to create upload directory:", error);
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: ERROR_MESSAGES.UPLOAD_FAILED,
    });
  }
}

/**
 * Validate and prepare file for upload
 * Throws TRPCError if validation fails
 */
export function validateFileForUpload(
  mimeType: string | undefined,
  fileSize: number | undefined,
  originalFilename: string | undefined
): { isValid: true; uniqueFilename: string } | never {
  // Validate MIME type
  if (!mimeType || !validateFileType(mimeType)) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: ERROR_MESSAGES.INVALID_TYPE,
    });
  }

  // Validate file size
  if (!fileSize || !validateFileSize(fileSize)) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: ERROR_MESSAGES.INVALID_SIZE,
    });
  }

  // Generate unique filename
  const uniqueFilename = generateUniqueFilename(originalFilename || "file");

  return {
    isValid: true,
    uniqueFilename,
  };
}

/**
 * Get file upload path for storage
 */
export function getFileUploadPath(filename: string): string {
  return join(UPLOAD_CONFIG.UPLOAD_DIR, filename);
}

/**
 * Get file storage URL (for reference, but files are not served directly for security)
 */
export function getFileStorageReference(filename: string): string {
  return `private/receipts/${filename}`;
}

export { UPLOAD_CONFIG, ERROR_MESSAGES };
