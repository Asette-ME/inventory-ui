/**
 * OCR Engine Wrapper for Tesseract.js
 *
 * Provides text extraction from images using Tesseract.js.
 * Includes progress callbacks for UI feedback and returns
 * structured OCR results with text, confidence, and bounding boxes.
 *
 * Validates: Requirements 2.1, 2.3
 */

import { preprocessImage } from '@/app/payment-plan/lib/image-preprocessor';
import type { BoundingBox, OCRResult, TextBlock } from '@/app/payment-plan/types';
import Tesseract, { createWorker, RecognizeResult, Worker } from 'tesseract.js';

// ============================================================================
// Types
// ============================================================================

interface ExtractTextParams {
  imageBlob: Blob;
  onProgress?: (progress: number, message: string) => void;
  skipPreprocessing?: boolean;
}

interface TesseractBlock {
  text: string;
  confidence: number;
  bbox: {
    x0: number;
    y0: number;
    x1: number;
    y1: number;
  };
}

// ============================================================================
// Worker Management
// ============================================================================

let workerInstance: Worker | null = null;

/**
 * Initializes a Tesseract.js worker with English language support.
 * Reuses existing worker if available.
 *
 * @param onProgress - Optional progress callback
 * @returns Promise<Worker> - The initialized worker
 */
async function initializeWorker({
  onProgress,
}: {
  onProgress?: (progress: number, message: string) => void;
}): Promise<Worker> {
  if (workerInstance) {
    return workerInstance;
  }

  onProgress?.(5, 'Initializing OCR engine...');

  const worker = await createWorker('eng', 1, {
    logger: (m) => {
      if (m.status === 'recognizing text') {
        const progress = Math.round(30 + m.progress * 50);
        onProgress?.(progress, 'Recognizing text...');
      }
    },
  });

  workerInstance = worker;
  onProgress?.(10, 'OCR engine ready');

  return worker;
}

/**
 * Terminates the Tesseract worker and cleans up resources.
 */
export async function terminateWorker(): Promise<void> {
  if (workerInstance) {
    await workerInstance.terminate();
    workerInstance = null;
  }
}

// ============================================================================
// Main Extraction Function
// ============================================================================

/**
 * Extracts text from an image blob using Tesseract.js OCR.
 * Applies image preprocessing for better accuracy.
 *
 * @param params - Extraction parameters
 * @param params.imageBlob - The image to process
 * @param params.onProgress - Optional progress callback (progress: 0-100, message: string)
 * @param params.skipPreprocessing - Skip image preprocessing (default: false)
 * @returns Promise<OCRResult> - Extracted text with confidence and bounding boxes
 */
export async function extractText({
  imageBlob,
  onProgress,
  skipPreprocessing = false,
}: ExtractTextParams): Promise<OCRResult> {
  try {
    onProgress?.(0, 'Starting text extraction...');

    // Step 1: Preprocess image for better OCR accuracy
    let processedBlob = imageBlob;
    if (!skipPreprocessing) {
      onProgress?.(5, 'Preprocessing image...');
      processedBlob = await preprocessImage({ imageBlob });
      onProgress?.(15, 'Image preprocessing complete');
    }

    // Step 2: Initialize worker
    const worker = await initializeWorker({ onProgress });

    // Step 3: Perform OCR recognition
    onProgress?.(20, 'Starting OCR recognition...');
    const result: RecognizeResult = await worker.recognize(processedBlob);

    onProgress?.(85, 'Processing OCR results...');

    // Step 4: Transform Tesseract result to our OCRResult format
    const ocrResult = transformResult({ result });

    onProgress?.(100, 'Text extraction complete');

    return ocrResult;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown OCR error';
    throw new Error(`OCR extraction failed: ${errorMessage}`);
  }
}

// ============================================================================
// Result Transformation
// ============================================================================

/**
 * Transforms Tesseract.js recognition result to our OCRResult format.
 *
 * @param result - The Tesseract recognition result
 * @returns OCRResult - Structured OCR result
 */
function transformResult({ result }: { result: RecognizeResult }): OCRResult {
  const { data } = result;

  // Extract text blocks from paragraphs or blocks
  const blocks: TextBlock[] = extractTextBlocks({ data });

  // Calculate overall confidence (0-1 scale)
  const confidence = data.confidence / 100;

  return {
    text: data.text,
    confidence,
    blocks,
  };
}

/**
 * Extracts text blocks with bounding boxes from Tesseract data.
 * Uses paragraphs within blocks for better semantic grouping.
 *
 * @param data - Tesseract recognition data
 * @returns TextBlock[] - Array of text blocks with positions
 */
function extractTextBlocks({ data }: { data: Tesseract.Page }): TextBlock[] {
  const textBlocks: TextBlock[] = [];

  // Extract paragraphs from blocks for semantic grouping
  if (data.blocks && data.blocks.length > 0) {
    for (const block of data.blocks) {
      // Each block contains paragraphs
      if (block.paragraphs && block.paragraphs.length > 0) {
        for (const paragraph of block.paragraphs) {
          if (paragraph.text.trim()) {
            textBlocks.push(createTextBlock({ block: paragraph as TesseractBlock }));
          }
        }
      } else if (block.text.trim()) {
        // Fallback to block level if no paragraphs
        textBlocks.push(createTextBlock({ block: block as TesseractBlock }));
      }
    }
  }

  return textBlocks;
}

/**
 * Creates a TextBlock from a Tesseract block/paragraph.
 *
 * @param block - Tesseract block with bbox
 * @returns TextBlock - Formatted text block
 */
function createTextBlock({ block }: { block: TesseractBlock }): TextBlock {
  const bbox = transformBoundingBox({ tesseractBbox: block.bbox });

  return {
    text: block.text.trim(),
    bbox,
    confidence: block.confidence / 100,
  };
}

/**
 * Transforms Tesseract bounding box format to our BoundingBox format.
 *
 * @param tesseractBbox - Tesseract bbox with x0, y0, x1, y1
 * @returns BoundingBox - Our format with x, y, width, height
 */
function transformBoundingBox({
  tesseractBbox,
}: {
  tesseractBbox: { x0: number; y0: number; x1: number; y1: number };
}): BoundingBox {
  return {
    x: tesseractBbox.x0,
    y: tesseractBbox.y0,
    width: tesseractBbox.x1 - tesseractBbox.x0,
    height: tesseractBbox.y1 - tesseractBbox.y0,
  };
}
