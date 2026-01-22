/**
 * PDF Parser using pdfjs-dist
 *
 * Extracts text content and embedded images from PDF files.
 * Text is extracted from all pages and combined.
 * Images are extracted as Blobs for OCR processing.
 *
 * Validates: Requirements 3.1, 3.2, 3.3
 */

import type { PDFContent } from '@/app/payment-plan/types';
import * as pdfjsLib from 'pdfjs-dist';
import type { PDFPageProxy, TextContent, TextItem } from 'pdfjs-dist/types/src/display/api';

// ============================================================================
// Types
// ============================================================================

interface ParsePDFParams {
  pdfBlob: Blob;
  onProgress?: (progress: number, message: string) => void;
}

interface ExtractedImage {
  data: Uint8ClampedArray;
  width: number;
  height: number;
}

// ============================================================================
// Worker Configuration
// ============================================================================

/**
 * Configures the PDF.js worker for browser environment.
 * Uses CDN for reliable worker loading.
 */
function configureWorker(): void {
  if (typeof window !== 'undefined' && !pdfjsLib.GlobalWorkerOptions.workerSrc) {
    // Use CDN worker matching the installed version
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;
  }
}

// ============================================================================
// Main Parsing Function
// ============================================================================

/**
 * Parses a PDF blob and extracts text content and embedded images.
 *
 * @param params - Parsing parameters
 * @param params.pdfBlob - The PDF file as a Blob
 * @param params.onProgress - Optional progress callback (progress: 0-100, message: string)
 * @returns Promise<PDFContent> - Extracted text, page count, and images
 */
export async function parsePDF({ pdfBlob, onProgress }: ParsePDFParams): Promise<PDFContent> {
  try {
    onProgress?.(0, 'Initializing PDF parser...');
    configureWorker();

    // Convert Blob to ArrayBuffer for pdfjs
    onProgress?.(5, 'Reading PDF file...');
    const arrayBuffer = await pdfBlob.arrayBuffer();

    // Load the PDF document
    onProgress?.(10, 'Loading PDF document...');
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdfDocument = await loadingTask.promise;

    const numPages = pdfDocument.numPages;
    onProgress?.(15, `Processing ${numPages} page(s)...`);

    // Extract text and images from all pages
    const textParts: string[] = [];
    const images: Blob[] = [];

    for (let pageNum = 1; pageNum <= numPages; pageNum++) {
      const pageProgress = 15 + ((pageNum - 1) / numPages) * 70;
      onProgress?.(pageProgress, `Processing page ${pageNum} of ${numPages}...`);

      const page = await pdfDocument.getPage(pageNum);

      // Extract text from page
      const pageText = await extractTextFromPage({ page });
      if (pageText.trim()) {
        textParts.push(pageText);
      }

      // Extract images from page
      const pageImages = await extractImagesFromPage({ page });
      images.push(...pageImages);
    }

    // Cleanup
    await pdfDocument.destroy();

    onProgress?.(95, 'Finalizing extraction...');

    const result: PDFContent = {
      text: textParts.join('\n\n'),
      pages: numPages,
      images,
    };

    onProgress?.(100, 'PDF parsing complete');

    return result;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown PDF parsing error';
    throw new Error(`PDF parsing failed: ${errorMessage}`);
  }
}

// ============================================================================
// Text Extraction
// ============================================================================

/**
 * Extracts text content from a single PDF page.
 *
 * @param page - The PDF page to extract text from
 * @returns Promise<string> - Extracted text content
 */
async function extractTextFromPage({ page }: { page: PDFPageProxy }): Promise<string> {
  const textContent: TextContent = await page.getTextContent();

  // Combine text items, preserving some structure
  const textItems = textContent.items.filter((item): item is TextItem => 'str' in item).map((item) => item.str);

  return textItems.join(' ');
}

// ============================================================================
// Image Extraction
// ============================================================================

/**
 * Extracts embedded images from a PDF page.
 * Uses the operator list to find image objects.
 *
 * @param page - The PDF page to extract images from
 * @returns Promise<Blob[]> - Array of image blobs
 */
async function extractImagesFromPage({ page }: { page: PDFPageProxy }): Promise<Blob[]> {
  const images: Blob[] = [];

  try {
    const operatorList = await page.getOperatorList();
    const { OPS } = pdfjsLib;

    for (let i = 0; i < operatorList.fnArray.length; i++) {
      // Check for image painting operations
      if (operatorList.fnArray[i] === OPS.paintImageXObject || operatorList.fnArray[i] === OPS.paintXObject) {
        const imageName = operatorList.argsArray[i][0];
        const imageBlob = await extractImageByName({ page, imageName });
        if (imageBlob) {
          images.push(imageBlob);
        }
      }
    }
  } catch {
    // Image extraction is optional - continue without images if it fails
    console.warn('Image extraction failed for page, continuing without images');
  }

  return images;
}

/**
 * Extracts a specific image from a page by its name/reference.
 *
 * @param page - The PDF page containing the image
 * @param imageName - The name/reference of the image
 * @returns Promise<Blob | null> - The image as a Blob, or null if extraction fails
 */
async function extractImageByName({
  page,
  imageName,
}: {
  page: PDFPageProxy;
  imageName: string;
}): Promise<Blob | null> {
  try {
    // Get the image object from common objects
    const imgData = (await page.objs.get(imageName)) as ExtractedImage | null;

    if (!imgData || !imgData.data || !imgData.width || !imgData.height) {
      return null;
    }

    // Convert image data to Blob using canvas
    const blob = await imageDataToBlob({
      data: imgData.data,
      width: imgData.width,
      height: imgData.height,
    });

    return blob;
  } catch {
    // Individual image extraction can fail - return null
    return null;
  }
}

/**
 * Converts raw image data to a Blob using canvas.
 *
 * @param data - Raw image pixel data
 * @param width - Image width
 * @param height - Image height
 * @returns Promise<Blob> - The image as a PNG Blob
 */
async function imageDataToBlob({
  data,
  width,
  height,
}: {
  data: Uint8ClampedArray;
  width: number;
  height: number;
}): Promise<Blob> {
  // Create canvas and draw image data
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Failed to get canvas context');
  }

  const imageData = new ImageData(new Uint8ClampedArray(data), width, height);
  ctx.putImageData(imageData, 0, 0);

  // Convert canvas to Blob
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Failed to convert canvas to blob'));
        }
      },
      'image/png',
      1.0,
    );
  });
}
