'use client';

/**
 * FileUploader Component - Drag-and-drop file upload with validation
 * Validates: Requirements 1.1, 1.2, 1.3, 1.5
 */

import { ACCEPTED_FILE_EXTENSIONS, validateFile } from '@/app/payment-plan/lib/validators';
import type { FileUploaderProps } from '@/app/payment-plan/types';
import { Button } from '@/components/ui/button';
import { FileWarning, Upload } from 'lucide-react';
import { useCallback, useRef, useState } from 'react';

export function FileUploader({
  onFileSelect,
  acceptedTypes,
  maxSizeMB,
  disabled = false,
}: FileUploaderProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    (file: File) => {
      setError(null);
      const validation = validateFile({ file });
      if (!validation.valid) {
        setError(validation.error);
        return;
      }
      onFileSelect(file);
    },
    [onFileSelect]
  );

  const handleDragOver = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      event.stopPropagation();
      if (!disabled) setIsDragOver(true);
    },
    [disabled]
  );

  const handleDragLeave = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      event.stopPropagation();
      setIsDragOver(false);
      if (disabled) return;
      const files = event.dataTransfer.files;
      if (files.length > 0) handleFile(files[0]);
    },
    [disabled, handleFile]
  );

  const handleFileInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = event.target.files;
      if (files && files.length > 0) handleFile(files[0]);
      event.target.value = '';
    },
    [handleFile]
  );

  const handleButtonClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!disabled && (e.key === 'Enter' || e.key === ' ')) {
        e.preventDefault();
        handleButtonClick();
      }
    },
    [disabled, handleButtonClick]
  );

  const acceptedExtensionsDisplay = ACCEPTED_FILE_EXTENSIONS.map((ext) =>
    ext.toUpperCase()
  ).join(', ');

  const dropZoneClasses = `
    relative flex flex-col items-center justify-center w-full min-h-[200px] p-8
    border-2 border-dashed rounded-lg transition-colors duration-200
    ${disabled ? 'opacity-50 cursor-not-allowed bg-muted' : 'cursor-pointer'}
    ${isDragOver && !disabled ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50'}
    ${error ? 'border-destructive bg-destructive/5' : ''}
  `;

  const iconContainerClasses = `
    mb-4 p-4 rounded-full
    ${isDragOver && !disabled ? 'bg-primary/10' : 'bg-muted'}
    ${error ? 'bg-destructive/10' : ''}
  `;

  return (
    <div className="w-full">
      <input
        ref={fileInputRef}
        type="file"
        accept={acceptedTypes.join(',')}
        onChange={handleFileInputChange}
        className="hidden"
        disabled={disabled}
        aria-label="File input"
      />

      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={dropZoneClasses}
        role="button"
        tabIndex={disabled ? -1 : 0}
        onClick={disabled ? undefined : handleButtonClick}
        onKeyDown={handleKeyDown}
        aria-label="Drop zone for file upload"
        aria-disabled={disabled}
      >
        <div className={iconContainerClasses}>
          {error ? (
            <FileWarning className="w-8 h-8 text-destructive" />
          ) : (
            <Upload className={`w-8 h-8 ${isDragOver && !disabled ? 'text-primary' : 'text-muted-foreground'}`} />
          )}
        </div>

        <div className="text-center space-y-2">
          <p className="text-sm font-medium text-foreground">
            {isDragOver && !disabled ? 'Drop your file here' : 'Drag and drop your file here'}
          </p>
          <p className="text-xs text-muted-foreground">or</p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={disabled}
            onClick={(e) => {
              e.stopPropagation();
              handleButtonClick();
            }}
          >
            Browse Files
          </Button>
        </div>

        <p className="mt-4 text-xs text-muted-foreground">
          Accepted formats: {acceptedExtensionsDisplay} (Max {maxSizeMB}MB)
        </p>
      </div>

      {error && (
        <div
          className="mt-3 flex items-center gap-2 p-3 rounded-md bg-destructive/10 border border-destructive/20"
          role="alert"
          aria-live="polite"
        >
          <FileWarning className="w-4 h-4 text-destructive flex-shrink-0" />
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}
    </div>
  );
}
