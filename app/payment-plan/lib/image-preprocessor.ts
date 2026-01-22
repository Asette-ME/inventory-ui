/**
 * Image Preprocessor for OCR Enhancement
 *
 * Provides image preprocessing functions to improve OCR accuracy.
 * Uses HTML Canvas API for browser-based image manipulation.
 *
 * Validates: Requirement 2.5
 */

// ============================================================================
// Types
// ============================================================================

interface PreprocessOptions {
  enableGrayscale?: boolean;
  enableContrast?: boolean;
  enableNoiseReduction?: boolean;
  contrastFactor?: number;
}

const DEFAULT_OPTIONS: PreprocessOptions = {
  enableGrayscale: true,
  enableContrast: true,
  enableNoiseReduction: true,
  contrastFactor: 1.5,
};

// ============================================================================
// Main Preprocessing Function
// ============================================================================

/**
 * Main preprocessing function that applies all enhancements to an image blob.
 * Returns a processed Blob ready for Tesseract.js OCR.
 *
 * @param imageBlob - The input image as a Blob
 * @param options - Optional preprocessing configuration
 * @returns Promise<Blob> - The processed image blob
 */
export async function preprocessImage({
  imageBlob,
  options = DEFAULT_OPTIONS,
}: {
  imageBlob: Blob;
  options?: PreprocessOptions;
}): Promise<Blob> {
  const mergedOptions = { ...DEFAULT_OPTIONS, ...options };

  // Create an image element from the blob
  const imageBitmap = await createImageBitmap(imageBlob);

  // Create canvas and get context
  const canvas = document.createElement('canvas');
  canvas.width = imageBitmap.width;
  canvas.height = imageBitmap.height;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Failed to get canvas 2D context');
  }

  // Draw original image to canvas
  ctx.drawImage(imageBitmap, 0, 0);

  // Get image data for pixel manipulation
  let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

  // Apply preprocessing steps in order
  if (mergedOptions.enableGrayscale) {
    imageData = convertToGrayscale({ imageData });
  }

  if (mergedOptions.enableContrast) {
    imageData = enhanceContrast({
      imageData,
      factor: mergedOptions.contrastFactor ?? 1.5,
    });
  }

  if (mergedOptions.enableNoiseReduction) {
    imageData = reduceNoise({ imageData });
  }

  // Put processed image data back to canvas
  ctx.putImageData(imageData, 0, 0);

  // Convert canvas to blob
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

// ============================================================================
// Grayscale Conversion
// ============================================================================

/**
 * Converts an image to grayscale for better OCR recognition.
 * Uses luminosity method: 0.299*R + 0.587*G + 0.114*B
 *
 * @param imageData - The input ImageData object
 * @returns ImageData - The grayscale ImageData
 */
export function convertToGrayscale({ imageData }: { imageData: ImageData }): ImageData {
  const data = imageData.data;
  const length = data.length;

  for (let i = 0; i < length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    // Luminosity method for perceptually accurate grayscale
    const gray = Math.round(0.299 * r + 0.587 * g + 0.114 * b);

    data[i] = gray; // R
    data[i + 1] = gray; // G
    data[i + 2] = gray; // B
    // Alpha channel (data[i + 3]) remains unchanged
  }

  return imageData;
}

// ============================================================================
// Contrast Enhancement
// ============================================================================

/**
 * Enhances image contrast to make text more distinguishable from background.
 * Uses linear contrast adjustment: newValue = factor * (value - 128) + 128
 *
 * @param imageData - The input ImageData object
 * @param factor - Contrast factor (1.0 = no change, >1.0 = more contrast)
 * @returns ImageData - The contrast-enhanced ImageData
 */
export function enhanceContrast({ imageData, factor = 1.5 }: { imageData: ImageData; factor?: number }): ImageData {
  const data = imageData.data;
  const length = data.length;

  for (let i = 0; i < length; i += 4) {
    // Apply contrast adjustment to RGB channels
    data[i] = clampPixelValue(factor * (data[i] - 128) + 128);
    data[i + 1] = clampPixelValue(factor * (data[i + 1] - 128) + 128);
    data[i + 2] = clampPixelValue(factor * (data[i + 2] - 128) + 128);
    // Alpha channel remains unchanged
  }

  return imageData;
}

// ============================================================================
// Noise Reduction
// ============================================================================

/**
 * Applies simple noise reduction using a 3x3 averaging filter.
 * This helps reduce speckle noise that can interfere with OCR.
 *
 * @param imageData - The input ImageData object
 * @returns ImageData - The noise-reduced ImageData
 */
export function reduceNoise({ imageData }: { imageData: ImageData }): ImageData {
  const { width, height, data } = imageData;
  const output = new Uint8ClampedArray(data);

  // Apply 3x3 averaging filter (skip edge pixels)
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = (y * width + x) * 4;

      // Process each color channel
      for (let c = 0; c < 3; c++) {
        const sum = getNeighborSum({ data, width, x, y, channel: c });
        output[idx + c] = Math.round(sum / 9);
      }
      // Preserve alpha channel
      output[idx + 3] = data[idx + 3];
    }
  }

  return new ImageData(output, width, height);
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Clamps a pixel value to the valid range [0, 255]
 */
function clampPixelValue(value: number): number {
  return Math.max(0, Math.min(255, Math.round(value)));
}

/**
 * Gets the sum of a 3x3 neighborhood for a specific channel
 */
function getNeighborSum({
  data,
  width,
  x,
  y,
  channel,
}: {
  data: Uint8ClampedArray;
  width: number;
  x: number;
  y: number;
  channel: number;
}): number {
  let sum = 0;

  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      const neighborIdx = ((y + dy) * width + (x + dx)) * 4 + channel;
      sum += data[neighborIdx];
    }
  }

  return sum;
}
