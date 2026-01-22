/**
 * Payment Plan Extractor - Zod Validation Schemas
 *
 * Zod schemas for PaymentMilestone and PaymentPlan validation,
 * plus validation helper functions.
 *
 * Validates: Requirements 6.1
 */

import type { FileValidation } from '@/app/payment-plan/types';
import { z } from 'zod';

// Re-export file validators for convenience
export {
  ACCEPTED_FILE_EXTENSIONS,
  ACCEPTED_MIME_TYPES,
  getFileExtension,
  isImageFile,
  isPdfFile,
  MAX_FILE_SIZE_BYTES,
  MAX_FILE_SIZE_MB,
  validateFile,
  validateFileSize,
  validateFileType,
} from '@/app/payment-plan/lib/file-validators';

// ============================================================================
// Zod Schemas
// ============================================================================

/**
 * Schema for validating a single payment milestone
 * Validates: Requirement 6.1
 */
export const PaymentMilestoneSchema = z.object({
  id: z.string().uuid(),
  milestone: z.string().min(1, 'Milestone name is required'),
  percentage: z.number().min(0).max(100).nullable(),
  amount: z.number().min(0).nullable(),
  dueDate: z.string().nullable(),
  notes: z.string().nullable(),
});

/**
 * Schema for validating a complete payment plan
 * Validates: Requirement 6.1
 */
export const PaymentPlanSchema = z.object({
  milestones: z.array(PaymentMilestoneSchema).min(1, 'At least one milestone is required'),
  totalPercentage: z.number(),
  currency: z.string().nullable(),
  projectName: z.string().nullable(),
  rawText: z.string(),
});

// ============================================================================
// Type Exports from Schemas
// ============================================================================

export type PaymentMilestoneInput = z.infer<typeof PaymentMilestoneSchema>;
export type PaymentPlanInput = z.infer<typeof PaymentPlanSchema>;

// ============================================================================
// Validation Helper Functions
// ============================================================================

/**
 * Validates a payment milestone and returns typed errors
 */
export function validateMilestone({ milestone }: { milestone: unknown }): {
  success: boolean;
  data: PaymentMilestoneInput | null;
  errors: z.ZodError | null;
} {
  const result = PaymentMilestoneSchema.safeParse(milestone);

  if (result.success) {
    return {
      success: true,
      data: result.data,
      errors: null,
    };
  }

  return {
    success: false,
    data: null,
    errors: result.error,
  };
}

/**
 * Validates a payment plan and returns typed errors
 */
export function validatePaymentPlan({ paymentPlan }: { paymentPlan: unknown }): {
  success: boolean;
  data: PaymentPlanInput | null;
  errors: z.ZodError | null;
} {
  const result = PaymentPlanSchema.safeParse(paymentPlan);

  if (result.success) {
    return {
      success: true,
      data: result.data,
      errors: null,
    };
  }

  return {
    success: false,
    data: null,
    errors: result.error,
  };
}

/**
 * Calculates the total percentage from milestones
 */
export function calculateTotalPercentage({ milestones }: { milestones: PaymentMilestoneInput[] }): number {
  return milestones.reduce((sum, milestone) => {
    return sum + (milestone.percentage ?? 0);
  }, 0);
}

/**
 * Validates that all milestones have required fields for submission
 * Validates: Requirement 6.1
 */
export function validateMilestonesForSubmission({
  milestones,
}: {
  milestones: PaymentMilestoneInput[];
}): FileValidation {
  for (const milestone of milestones) {
    if (!milestone.milestone || milestone.milestone.trim() === '') {
      return {
        valid: false,
        error: 'Please fill in all required fields',
      };
    }
  }

  return {
    valid: true,
    error: null,
  };
}
