/**
 * Image Processing Utilities
 * Handles resize, compress, and convert operations for images
 */

export interface ImageProcessingStats {
  originalFileName: string;
  originalExtension: string;
  originalSize: number;
  originalWidth: number;
  originalHeight: number;
  processedExtension: string;
  processedSize: number;
  processedWidth: number;
  processedHeight: number;
  wasResized: boolean;
  wasConverted: boolean;
  compressionRatio: number;
}

export interface ProcessingProgress {
  stage: 'loading' | 'resizing' | 'compressing' | 'complete' | 'error';
  progress: number;
  message: string;
}

export interface ProcessedImage {
  file: File;
  blob: Blob;
  dataUrl: string;
  stats: ImageProcessingStats;
}

const MAX_DIMENSION = 1000;
const JPEG_QUALITY = 0.85; // Good balance between quality and compression

/**
 * Load an image file and return an HTMLImageElement
 */
function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error(`Failed to load image: ${file.name}`));
    };

    img.src = url;
  });
}

/**
 * Calculate new dimensions while maintaining aspect ratio
 */
function calculateNewDimensions(
  width: number,
  height: number,
  maxDimension: number,
): { width: number; height: number; needsResize: boolean } {
  if (width <= maxDimension && height <= maxDimension) {
    return { width, height, needsResize: false };
  }

  const aspectRatio = width / height;

  let newWidth: number;
  let newHeight: number;

  if (width > height) {
    // Landscape: constrain by width
    newWidth = maxDimension;
    newHeight = Math.round(maxDimension / aspectRatio);
  } else {
    // Portrait or square: constrain by height
    newHeight = maxDimension;
    newWidth = Math.round(maxDimension * aspectRatio);
  }

  return { width: newWidth, height: newHeight, needsResize: true };
}

/**
 * Get file extension from filename
 */
function getFileExtension(filename: string): string {
  const parts = filename.split('.');
  return parts.length > 1 ? parts.pop()!.toLowerCase() : '';
}

/**
 * Process a single image: resize, compress, and convert to JPG
 */
export async function processImage(
  file: File,
  onProgress?: (progress: ProcessingProgress) => void,
): Promise<ProcessedImage> {
  const originalExtension = getFileExtension(file.name);

  // Stage 1: Loading
  onProgress?.({
    stage: 'loading',
    progress: 10,
    message: 'Loading image...',
  });

  const img = await loadImage(file);
  const originalWidth = img.width;
  const originalHeight = img.height;

  // Stage 2: Calculate resize dimensions
  onProgress?.({
    stage: 'resizing',
    progress: 30,
    message: 'Calculating dimensions...',
  });

  const {
    width: newWidth,
    height: newHeight,
    needsResize,
  } = calculateNewDimensions(originalWidth, originalHeight, MAX_DIMENSION);

  // Stage 3: Resize and compress using canvas
  onProgress?.({
    stage: 'compressing',
    progress: 50,
    message: needsResize ? 'Resizing and compressing...' : 'Compressing...',
  });

  const canvas = document.createElement('canvas');
  canvas.width = newWidth;
  canvas.height = newHeight;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Failed to create canvas context');
  }

  // Enable image smoothing for better resize quality
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  // Draw the image onto the canvas
  ctx.drawImage(img, 0, 0, newWidth, newHeight);

  onProgress?.({
    stage: 'compressing',
    progress: 70,
    message: 'Converting to JPEG...',
  });

  // Convert to JPEG blob
  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Failed to convert canvas to blob'));
        }
      },
      'image/jpeg',
      JPEG_QUALITY,
    );
  });

  onProgress?.({
    stage: 'compressing',
    progress: 90,
    message: 'Finalizing...',
  });

  // Create a new File from the blob with .jpg extension
  const baseFileName = file.name.replace(/\.[^/.]+$/, '');
  const newFileName = `${baseFileName}.jpg`;
  const processedFile = new File([blob], newFileName, { type: 'image/jpeg' });

  // Create data URL for preview
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });

  const stats: ImageProcessingStats = {
    originalFileName: file.name,
    originalExtension: originalExtension || 'unknown',
    originalSize: file.size,
    originalWidth,
    originalHeight,
    processedExtension: 'jpg',
    processedSize: blob.size,
    processedWidth: newWidth,
    processedHeight: newHeight,
    wasResized: needsResize,
    wasConverted: originalExtension !== 'jpg',
    compressionRatio: Math.round((1 - blob.size / file.size) * 100),
  };

  onProgress?.({
    stage: 'complete',
    progress: 100,
    message: 'Processing complete!',
  });

  return {
    file: processedFile,
    blob,
    dataUrl,
    stats,
  };
}

/**
 * Process multiple images in parallel with progress tracking
 */
export async function processImages(
  files: File[],
  onFileProgress?: (fileIndex: number, progress: ProcessingProgress) => void,
  onOverallProgress?: (completed: number, total: number) => void,
): Promise<ProcessedImage[]> {
  const results: ProcessedImage[] = [];
  let completed = 0;

  const processFile = async (file: File, index: number): Promise<ProcessedImage> => {
    const result = await processImage(file, (progress) => {
      onFileProgress?.(index, progress);
    });
    completed++;
    onOverallProgress?.(completed, files.length);
    return result;
  };

  // Process files in parallel (limit concurrency to 3)
  const concurrency = 3;
  for (let i = 0; i < files.length; i += concurrency) {
    const batch = files.slice(i, i + concurrency);
    const batchResults = await Promise.all(batch.map((file, batchIndex) => processFile(file, i + batchIndex)));
    results.push(...batchResults);
  }

  return results;
}

/**
 * Format bytes to human-readable size
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

/**
 * Format dimensions
 */
export function formatDimensions(width: number, height: number): string {
  return `${width} × ${height}`;
}

/**
 * Validate that file is an image
 */
export function isValidImageFile(file: File): boolean {
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/bmp', 'image/tiff'];
  return validTypes.includes(file.type) || /\.(jpe?g|png|gif|webp|bmp|tiff?)$/i.test(file.name);
}

/**
 * Get accepted file types for input
 */
export const ACCEPTED_IMAGE_TYPES = 'image/jpeg,image/jpg,image/png,image/gif,image/webp,image/bmp,image/tiff';
