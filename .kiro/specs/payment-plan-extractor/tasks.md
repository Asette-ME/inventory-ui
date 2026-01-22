# Implementation Plan: Payment Plan Extractor

## Overview

Implement a self-contained payment plan extraction tool within `app/payment-plan/` that uses Tesseract.js for OCR, pdf.js for PDF parsing, and Groq free tier for LLM-based data structuring. The implementation follows a pipeline architecture with shadcn/ui components.

## Tasks

- [ ] 1. Set up project structure and types
  - [x] 1.1 Create folder structure and TypeScript interfaces
    - Create `app/payment-plan/types/index.ts` with all interfaces (PaymentMilestone, PaymentPlan, OCRResult, etc.)
    - Create `app/payment-plan/lib/` directory for processing utilities
    - Create `app/payment-plan/components/` directory for UI components
    - Create `app/payment-plan/hooks/` directory for custom hooks
    - _Requirements: 7.1, 7.3_

  - [x] 1.2 Install required dependencies
    - Install tesseract.js for OCR
    - Install pdfjs-dist for PDF parsing
    - Install fast-check for property-based testing
    - _Requirements: 8.1, 8.2_

  - [x] 1.3 Create Zod validation schemas
    - Create `app/payment-plan/lib/validators.ts` with PaymentMilestoneSchema and PaymentPlanSchema
    - Add file validation utilities (type, size)
    - _Requirements: 1.2, 1.3, 1.5, 6.1_

  - [ ]\* 1.4 Write property tests for file validation
    - **Property 1: File Type Validation**
    - **Property 2: File Size Validation**
    - **Validates: Requirements 1.2, 1.3, 1.5**

- [ ] 2. Implement file upload component
  - [x] 2.1 Create FileUploader component
    - Create `app/payment-plan/components/file-uploader.tsx`
    - Implement drag-and-drop zone using shadcn/ui
    - Add file type and size validation
    - Display error messages for invalid files
    - _Requirements: 1.1, 1.2, 1.3, 1.5_

  - [x] 2.2 Create FilePreview component
    - Create `app/payment-plan/components/file-preview.tsx`
    - Display image preview for uploaded images
    - Display PDF icon/first page for PDFs
    - Add remove file button
    - _Requirements: 1.4_

  - [ ]\* 2.3 Write unit tests for FileUploader
    - Test file type validation
    - Test file size validation
    - Test drag-drop behavior
    - _Requirements: 1.2, 1.3, 1.5_

- [x] 3. Checkpoint - File upload working
  - Ensure file upload and preview work correctly, ask the user if questions arise.

- [ ] 4. Implement OCR engine
  - [x] 4.1 Create image preprocessor
    - Create `app/payment-plan/lib/image-preprocessor.ts`
    - Implement contrast enhancement using canvas
    - Implement noise reduction
    - _Requirements: 2.5_

  - [x] 4.2 Create OCR engine wrapper
    - Create `app/payment-plan/lib/ocr-engine.ts`
    - Initialize Tesseract.js worker
    - Implement extractText function with progress callback
    - Return OCRResult with text, confidence, and bounding boxes
    - _Requirements: 2.1, 2.3_

  - [ ]\* 4.3 Write property tests for OCR result structure
    - **Property 3: OCR Result Structure**
    - **Validates: Requirements 2.3**

- [ ] 5. Implement PDF parser
  - [ ] 5.1 Create PDF parser
    - Create `app/payment-plan/lib/pdf-parser.ts`
    - Use pdfjs-dist to extract text from all pages
    - Extract embedded images for OCR processing
    - Combine text from multiple pages
    - _Requirements: 3.1, 3.2, 3.3_

  - [ ]\* 5.2 Write property tests for PDF processing
    - **Property 4: PDF Page Processing**
    - **Validates: Requirements 3.3**

- [ ] 6. Implement LLM processor
  - [ ] 6.1 Create LLM processor
    - Create `app/payment-plan/lib/llm-processor.ts`
    - Implement Groq API client (free tier)
    - Build extraction prompt with real estate terminology
    - Parse LLM response into PaymentPlan structure
    - Handle fallback to raw text on failure
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7_

  - [ ]\* 6.2 Write property tests for LLM output structure
    - **Property 5: LLM Output Structure**
    - **Validates: Requirements 4.2**

- [ ] 7. Checkpoint - Extraction pipeline working
  - Ensure OCR, PDF parsing, and LLM structuring work end-to-end, ask the user if questions arise.

- [ ] 8. Implement editable data table
  - [ ] 8.1 Create EditableTable component
    - Create `app/payment-plan/components/editable-table.tsx`
    - Display columns: Milestone, Percentage, Amount, Due Date
    - Implement inline cell editing
    - Use shadcn/ui Table component
    - _Requirements: 5.1, 5.2, 5.3_

  - [ ] 8.2 Implement row operations
    - Add row insertion at specified position
    - Add row deletion
    - Update display after operations
    - _Requirements: 5.4, 5.5_

  - [ ] 8.3 Implement percentage validation
    - Calculate sum of percentages
    - Display warning if sum ≠ 100%
    - _Requirements: 5.6_

  - [ ]\* 8.4 Write property tests for table operations
    - **Property 6: Table Row Addition**
    - **Property 7: Table Row Deletion**
    - **Property 8: Percentage Sum Validation**
    - **Validates: Requirements 5.4, 5.5, 5.6**

- [ ] 9. Implement extraction state management
  - [ ] 9.1 Create extraction hook
    - Create `app/payment-plan/hooks/use-extraction.ts`
    - Implement extraction state reducer
    - Handle status transitions (idle → uploading → extracting → structuring → complete)
    - _Requirements: 2.2_

  - [ ] 9.2 Create ExtractionProgress component
    - Create `app/payment-plan/components/extraction-progress.tsx`
    - Display loading indicator with progress percentage
    - Show current status message
    - _Requirements: 2.2_

- [ ] 10. Implement submission flow
  - [ ] 10.1 Create ActionButtons component
    - Create `app/payment-plan/components/action-buttons.tsx`
    - Add Confirm and Reset buttons
    - Handle disabled states during submission
    - _Requirements: 6.1_

  - [ ] 10.2 Create payment plan hook
    - Create `app/payment-plan/hooks/use-payment-plan.ts`
    - Manage payment plan state
    - Implement validation before submission
    - Build submission payload with file reference
    - _Requirements: 6.1, 6.2, 6.5_

  - [ ]\* 10.3 Write property tests for submission
    - **Property 9: Submission Validation**
    - **Property 10: Submission Payload Completeness**
    - **Validates: Requirements 6.1, 6.2, 6.5**

- [ ] 11. Create API routes
  - [ ] 11.1 Create extraction API route
    - Create `app/payment-plan/api/extract/route.ts`
    - Handle file upload via FormData
    - Orchestrate OCR/PDF parsing and LLM processing
    - Return structured PaymentPlan or error
    - _Requirements: 2.1, 3.1, 4.1_

  - [ ] 11.2 Create submission API route
    - Create `app/payment-plan/api/submit/route.ts`
    - Validate incoming payload
    - Forward to backend API
    - Return success/error response
    - _Requirements: 6.2, 6.3, 6.4_

- [ ] 12. Checkpoint - API routes working
  - Ensure extraction and submission APIs work correctly, ask the user if questions arise.

- [ ] 13. Integrate main page
  - [ ] 13.1 Update main page component
    - Update `app/payment-plan/page.tsx`
    - Integrate FileUploader, ExtractionProgress, EditableTable, ActionButtons
    - Wire up extraction and submission flows
    - Handle all state transitions
    - _Requirements: 1.1, 2.2, 5.1, 6.3_

  - [ ] 13.2 Add error handling UI
    - Display error messages for all failure scenarios
    - Implement retry functionality
    - Show raw text fallback when LLM fails
    - _Requirements: 2.4, 3.4, 4.6, 6.4_

- [ ] 14. Implement layout detection robustness
  - [ ] 14.1 Enhance OCR for various layouts
    - Update OCR engine to handle rotated text
    - Improve text block grouping for unstructured layouts
    - Handle varying font sizes
    - _Requirements: 9.1, 9.2, 9.3, 9.5_

  - [ ]\* 14.2 Write property tests for layout robustness
    - **Property 11: Layout Detection Robustness**
    - **Validates: Requirements 9.1, 9.2, 9.3**

- [ ] 15. Final checkpoint - Full integration
  - Ensure all components work together end-to-end, ask the user if questions arise.

- [ ]\* 16. Write integration tests
  - Test happy path: Upload → Extract → Edit → Submit
  - Test PDF flow with multi-page documents
  - Test manual entry fallback
  - Test error recovery scenarios
  - _Requirements: All_

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties
- Unit tests validate specific examples and edge cases
- All code must stay within `app/payment-plan/` directory
- Use pnpm for package management
- Keep files under 200 lines, split if necessary
