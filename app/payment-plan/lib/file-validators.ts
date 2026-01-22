/**
 * Payment Plan Extractor - File Validation Utilities
 *
 * Utilities for validating file type and size for uploads.
 *
 * Validates: Requirements 1.2, 1.3, 1.5
 */

import type { FileValidation } from '@/app/payment-plan/types';

// ============================================================================
// Constants
// ============================================================================

/**
 * Accepted file extensions (case-insensitive)
 * Validates: Requirement 1.2
 */
export const ACCEPTED_FILE_EXTENSIONS = ['png', 'jpg', 'jpeg', 'pdf'] as const;

/**
 * Accepted MIME types for file uploads
 */
export const ACCEPTED_MIME_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'application/pdf'] as const;

/**
 * Maximum file size in bytes (10MB)
 * Validates: Requirement 1.5
 */
export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

/**
 * Maximum file size in MB for display
 */
export const MAX_FILE_SIZE_MB = 10;

// ============================================================================
// File Validation Utilities
// ============================================================================

/**
 * Extracts the file extension from a filename (case-insensitive)
 */
export function getFileExtension({ filename }: { filename: string }): string {
  const parts = filename.split('.');
  if (parts.length < 2) {
    return '';
  }
  return parts[parts.length - 1].toLowerCase();
}

/**
 * Validates if a file type is accepted
 * Validates: Requirements 1.2, 1.3
 *
 * @param file - The file to validate or filename string
 * @returns FileValidation result with valid boolean and error message
 */
export function validateFileType({ file }: { file: File | string }): FileValidation {
  const filename = typeof file === 'string' ? file : file.name;
  const extension = getFileExtension({ filename });

  if (!extension) {
    return {
      valid: false,
      error: 'File must have an extension',
    };
  }

  const isValidExtension = ACCEPTED_FILE_EXTENSIONS.includes(extension as (typeof ACCEPTED_FILE_EXTENSIONS)[number]);

  if (!isValidExtension) {
    return {
      valid: false,
      error: 'Please upload a PNG, JPG, or PDF file',
    };
  }

  return {
    valid: true,
    error: null,
  };
}

/**
 * Validates if a file size is within the allowed limit
 * Validates: Requirement 1.5
 *
 * @param sizeInBytes - The file size in bytes
 * @param maxSizeMB - Optional custom max size in MB (defaults to 10MB)
 * @returns FileValidation result with valid boolean and error message
 */
export function validateFileSize({
  sizeInBytes,
  maxSizeMB = MAX_FILE_SIZE_MB,
}: {
  sizeInBytes: number;
  maxSizeMB?: number;
}): FileValidation {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;

  if (sizeInBytes > maxSizeBytes) {
    return {
      valid: false,
      error: `File size exceeds ${maxSizeMB}MB limit`,
    };
  }

  return {
    valid: true,
    error: null,
  };
}

/**
 * Validates a file for both type and size
 * Validates: Requirements 1.2, 1.3, 1.5
 *
 * @param file - The file to validate
 * @returns FileValidation result with valid boolean and error message
 */
export function validateFile({ file }: { file: File }): FileValidation {
  // First validate file type
  const typeValidation = validateFileType({ file });
  if (!typeValidation.valid) {
    return typeValidation;
  }

  // Then validate file size
  const sizeValidation = validateFileSize({ sizeInBytes: file.size });
  if (!sizeValidation.valid) {
    return sizeValidation;
  }

  return {
    valid: true,
    error: null,
  };
}

/**
 * Checks if a file extension is an image type
 */
export function isImageFile({ filename }: { filename: string }): boolean {
  const extension = getFileExtension({ filename });
  return ['png', 'jpg', 'jpeg'].includes(extension);
}

/**
 * Checks if a file extension is a PDF
 */
export function isPdfFile({ filename }: { filename: string }): boolean {
  const extension = getFileExtension({ filename });
  return extension === 'pdf';
}
