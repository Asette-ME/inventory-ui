'use client';

/**
 * FilePreview Component - Display preview of uploaded files
 *
 * Displays image preview for uploaded images (PNG, JPG, JPEG)
 * and PDF icon with filename for PDF files.
 *
 * Validates: Requirement 1.4
 */

import { isImageFile, isPdfFile } from '@/app/payment-plan/lib/validators';
import type { FilePreviewProps } from '@/app/payment-plan/types';
import { Button } from '@/components/ui/button';
import { FileText, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

/**
 * Formats file size in human-readable format
 */
function formatFileSize({ bytes }: { bytes: number }): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

/**
 * FilePreview component displays a preview of the uploaded file
 * with a remove button to clear the selection.
 */
export function FilePreview({ file, onRemove }: FilePreviewProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  // Determine file type
  const isImage = useMemo(() => {
    if (!file) return false;
    return isImageFile({ filename: file.name });
  }, [file]);

  const isPdf = useMemo(() => {
    if (!file) return false;
    return isPdfFile({ filename: file.name });
  }, [file]);

  // Create and cleanup object URL for image preview
  useEffect(() => {
    if (!file || !isImage) {
      setImageUrl(null);
      return;
    }

    const url = URL.createObjectURL(file);
    setImageUrl(url);

    // Cleanup function to revoke object URL on unmount or file change
    return () => {
      URL.revokeObjectURL(url);
    };
  }, [file, isImage]);

  // Don't render if no file
  if (!file) {
    return null;
  }

  const fileSize = formatFileSize({ bytes: file.size });

  return (
    <div
      className="relative w-full rounded-lg border border-border bg-card p-4"
      role="region"
      aria-label="File preview"
    >
      <div className="flex items-start gap-4">
        {/* Preview Area */}
        <div className="flex-shrink-0">
          {isImage && imageUrl ? (
            <ImagePreview imageUrl={imageUrl} fileName={file.name} />
          ) : isPdf ? (
            <PdfPreview />
          ) : null}
        </div>

        {/* File Info */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground truncate" title={file.name}>
            {file.name}
          </p>
          <p className="text-xs text-muted-foreground mt-1">{fileSize}</p>
        </div>

        {/* Remove Button */}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="flex-shrink-0 h-8 w-8 text-muted-foreground hover:text-destructive"
          onClick={onRemove}
          aria-label="Remove file"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

/**
 * ImagePreview sub-component for displaying image files
 */
function ImagePreview({ imageUrl, fileName }: { imageUrl: string; fileName: string }) {
  return (
    <div className="relative w-20 h-20 rounded-md overflow-hidden bg-muted">
      <img src={imageUrl} alt={`Preview of ${fileName}`} className="w-full h-full object-cover" />
    </div>
  );
}

/**
 * PdfPreview sub-component for displaying PDF files
 */
function PdfPreview() {
  return (
    <div className="flex items-center justify-center w-20 h-20 rounded-md bg-muted" aria-label="PDF file">
      <FileText className="w-10 h-10 text-muted-foreground" />
    </div>
  );
}
