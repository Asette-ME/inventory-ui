/**
 * Payment Plan Extractor - TypeScript Interfaces
 * 
 * Core interfaces for the payment plan extraction feature.
 * Validates: Requirements 7.1, 7.3
 */

// ============================================================================
// Core Data Interfaces
// ============================================================================

/**
 * Represents a single payment milestone in a payment plan
 */
export interface PaymentMilestone {
  id: string;
  milestone: string;
  percentage: number | null;
  amount: number | null;
  dueDate: string | null;
  notes: string | null;
}

/**
 * Represents a complete payment plan with all milestones
 */
export interface PaymentPlan {
  milestones: PaymentMilestone[];
  totalPercentage: number;
  currency: string | null;
  projectName: string | null;
  rawText: string;
}

/**
 * Result of the extraction process
 */
export interface ExtractionResult {
  success: boolean;
  data: PaymentPlan | null;
  error: string | null;
  confidence: number;
}

// ============================================================================
// OCR Interfaces
// ============================================================================

/**
 * Result from OCR text extraction
 */
export interface OCRResult {
  text: string;
  confidence: number;
  blocks: TextBlock[];
}

/**
 * A block of text with position and confidence data
 */
export interface TextBlock {
  text: string;
  bbox: BoundingBox;
  confidence: number;
}

/**
 * Bounding box coordinates for text positioning
 */
export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

// ============================================================================
// PDF Interfaces
// ============================================================================

/**
 * Content extracted from a PDF file
 */
export interface PDFContent {
  text: string;
  pages: number;
  images: Blob[];
}

// ============================================================================
// Validation Interfaces
// ============================================================================

/**
 * Result of file validation
 */
export interface FileValidation {
  valid: boolean;
  error: string | null;
}

// ============================================================================
// State Management Interfaces
// ============================================================================

/**
 * Current state of the extraction process
 */
export interface ExtractionState {
  status: 'idle' | 'uploading' | 'extracting' | 'structuring' | 'complete' | 'error';
  progress: number;
  message: string;
}

/**
 * Actions for the extraction state reducer
 */
export type ExtractionAction =
  | { type: 'START_UPLOAD' }
  | { type: 'START_EXTRACTION' }
  | { type: 'UPDATE_PROGRESS'; progress: number; message: string }
  | { type: 'START_STRUCTURING' }
  | { type: 'COMPLETE'; data: PaymentPlan }
  | { type: 'ERROR'; error: string }
  | { type: 'RESET' };

// ============================================================================
// API Interfaces
// ============================================================================

/**
 * Payload for submitting a payment plan to the API
 */
export interface SubmissionPayload {
  paymentPlan: PaymentPlan;
  originalFileName: string;
  extractedAt: string;
}

/**
 * Response from the extraction API
 */
export interface ExtractResponse {
  success: boolean;
  data: PaymentPlan | null;
  error: string | null;
}

/**
 * Response from the submission API
 */
export interface SubmitResponse {
  success: boolean;
  id: string | null;
  error: string | null;
}

// ============================================================================
// Component Props Interfaces
// ============================================================================

/**
 * Props for the FileUploader component
 */
export interface FileUploaderProps {
  onFileSelect: (file: File) => void;
  acceptedTypes: string[];
  maxSizeMB: number;
  disabled?: boolean;
}

/**
 * Props for the EditableTable component
 */
export interface EditableTableProps {
  data: PaymentMilestone[];
  onDataChange: (data: PaymentMilestone[]) => void;
  onAddRow: (index: number) => void;
  onDeleteRow: (index: number) => void;
}

/**
 * Props for the ExtractionProgress component
 */
export interface ExtractionProgressProps {
  state: ExtractionState;
}

/**
 * Props for the ActionButtons component
 */
export interface ActionButtonsProps {
  onConfirm: () => void;
  onReset: () => void;
  disabled: boolean;
  isSubmitting: boolean;
}

/**
 * Props for the FilePreview component
 */
export interface FilePreviewProps {
  file: File | null;
  onRemove: () => void;
}
