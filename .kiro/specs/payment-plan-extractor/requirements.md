# Requirements Document

## Introduction

The Payment Plan Extractor is a standalone tool within the payment-plan folder that extracts payment plan data from images or PDFs containing real estate off-plan property payment schedules. The tool uses OCR and optional free LLM processing to convert unstructured payment plan documents into structured, editable tabular data that can be submitted to an API endpoint.

## Glossary

- **Payment_Plan_Extractor**: The main system that processes uploaded files and extracts payment schedule data
- **OCR_Engine**: The text extraction component using Tesseract.js for optical character recognition
- **PDF_Parser**: The component using pdf.js to extract text and images from PDF files
- **LLM_Processor**: The optional component using free LLM APIs (Ollama/Groq) to structure unstructured text data
- **Data_Table**: The editable table component displaying extracted payment plan data
- **File_Uploader**: The component handling file uploads for images (PNG, JPG) and PDFs
- **Payment_Milestone**: A single row in a payment plan containing milestone name, percentage, amount, and optional date
- **Extracted_Data**: The structured JSON representation of payment plan information

## Requirements

### Requirement 1: File Upload

**User Story:** As a user, I want to upload payment plan images or PDFs, so that I can extract payment schedule data from them.

#### Acceptance Criteria

1. WHEN a user accesses the payment plan page, THE File_Uploader SHALL display a drag-and-drop zone with a file selection button
2. WHEN a user uploads a file, THE File_Uploader SHALL accept PNG, JPG, and PDF file formats
3. WHEN a user uploads an unsupported file format, THE File_Uploader SHALL display an error message and reject the file
4. WHEN a file is uploaded, THE File_Uploader SHALL display a preview of the uploaded file
5. WHEN a file exceeds 10MB, THE File_Uploader SHALL reject the file and display a size limit error

### Requirement 2: Text Extraction from Images

**User Story:** As a user, I want the system to extract text from uploaded images, so that payment plan data can be identified and processed.

#### Acceptance Criteria

1. WHEN an image file is uploaded, THE OCR_Engine SHALL process the image using Tesseract.js
2. WHEN OCR processing begins, THE Payment_Plan_Extractor SHALL display a loading indicator with progress
3. WHEN OCR processing completes, THE OCR_Engine SHALL return the extracted raw text with position data
4. IF OCR processing fails, THEN THE Payment_Plan_Extractor SHALL display an error message and allow retry
5. THE OCR_Engine SHALL apply image preprocessing (contrast enhancement, noise reduction) to improve extraction accuracy

### Requirement 9: Robust Layout Detection

**User Story:** As a user, I want the system to handle various payment plan layouts, so that I can extract data from both structured tables and unstructured documents.

#### Acceptance Criteria

1. WHEN processing a structured tabular layout, THE Payment_Plan_Extractor SHALL detect table boundaries and cell positions
2. WHEN processing an unstructured layout (scattered text, infographics), THE Payment_Plan_Extractor SHALL use spatial analysis to group related data
3. WHEN processing a timeline-style layout, THE Payment_Plan_Extractor SHALL identify milestone markers and associated values
4. WHEN processing a mixed layout, THE Payment_Plan_Extractor SHALL combine multiple detection strategies
5. THE Payment_Plan_Extractor SHALL handle rotated text and varying font sizes
6. THE Payment_Plan_Extractor SHALL extract data from payment plans with percentage circles, progress bars, or graphical elements

### Requirement 3: PDF Processing

**User Story:** As a user, I want to upload PDF files containing payment plans, so that I can extract data from PDF documents.

#### Acceptance Criteria

1. WHEN a PDF file is uploaded, THE PDF_Parser SHALL extract text content using pdf.js
2. WHEN a PDF contains embedded images, THE PDF_Parser SHALL extract images and pass them to the OCR_Engine
3. WHEN a PDF has multiple pages, THE PDF_Parser SHALL process all pages and combine extracted text
4. IF PDF parsing fails, THEN THE Payment_Plan_Extractor SHALL display an error message with details

### Requirement 4: Data Structuring

**User Story:** As a user, I want the extracted text to be converted into structured payment plan data, so that I can review it in a table format.

#### Acceptance Criteria

1. WHEN raw text is extracted, THE LLM_Processor SHALL analyze the text to identify payment milestones
2. WHEN structuring data, THE LLM_Processor SHALL extract milestone name, percentage, amount, and date fields
3. WHEN the source data is in tabular format, THE LLM_Processor SHALL preserve the table structure
4. WHEN the source data is unstructured (infographics, timelines, scattered text), THE LLM_Processor SHALL infer the payment schedule structure using context clues
5. THE LLM_Processor SHALL use only free LLM APIs (Ollama local or Groq free tier)
6. IF LLM processing fails, THEN THE Payment_Plan_Extractor SHALL display raw text for manual entry
7. THE LLM_Processor SHALL handle real estate payment terminology (booking, down payment, handover, completion, post-handover installments)
8. WHEN multiple payment schedules exist in one document, THE LLM_Processor SHALL identify and separate them

### Requirement 5: Editable Data Table

**User Story:** As a user, I want to view and edit the extracted payment plan data in a table, so that I can correct any extraction errors.

#### Acceptance Criteria

1. WHEN data extraction completes, THE Data_Table SHALL display the extracted data in an editable table
2. THE Data_Table SHALL display columns for: Milestone, Percentage, Amount, and Due Date
3. WHEN a user clicks on a cell, THE Data_Table SHALL allow inline editing of the cell value
4. WHEN a user adds a row, THE Data_Table SHALL insert a new empty row at the specified position
5. WHEN a user deletes a row, THE Data_Table SHALL remove the row and update the display
6. THE Data_Table SHALL validate that percentages sum to 100% and display a warning if not

### Requirement 6: Data Submission

**User Story:** As a user, I want to submit the confirmed payment plan data to an API, so that it can be saved in the system.

#### Acceptance Criteria

1. WHEN a user clicks the confirm button, THE Payment_Plan_Extractor SHALL validate all required fields are filled
2. WHEN validation passes, THE Payment_Plan_Extractor SHALL send the data to the API endpoint in JSON format
3. WHEN the API returns success, THE Payment_Plan_Extractor SHALL display a success message and reset the form
4. IF the API returns an error, THEN THE Payment_Plan_Extractor SHALL display the error message and preserve the data
5. THE Payment_Plan_Extractor SHALL include the original file reference in the submission payload

### Requirement 7: Self-Contained Architecture

**User Story:** As a developer, I want all payment plan extractor code to be contained within the payment-plan folder, so that the feature is modular and maintainable.

#### Acceptance Criteria

1. THE Payment_Plan_Extractor SHALL have all components within the `app/payment-plan/` directory
2. THE Payment_Plan_Extractor SHALL use shared UI components from `@/components/ui/`
3. THE Payment_Plan_Extractor SHALL define feature-specific types within the payment-plan folder
4. THE Payment_Plan_Extractor SHALL keep individual files under 200 lines of code

### Requirement 8: Free Solution Constraint

**User Story:** As a project stakeholder, I want the solution to use only free tools and APIs, so that there are no ongoing costs.

#### Acceptance Criteria

1. THE OCR_Engine SHALL use Tesseract.js which is free and open source
2. THE PDF_Parser SHALL use pdf.js which is free and open source
3. WHERE LLM processing is needed, THE LLM_Processor SHALL use Ollama (local) or Groq free tier
4. THE Payment_Plan_Extractor SHALL NOT require any paid API keys or subscriptions
