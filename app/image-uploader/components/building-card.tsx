'use client';

import { Building as BuildingIcon, ImageIcon, Loader2, Upload, X } from 'lucide-react';
import Image from 'next/image';
import { useCallback, useRef, useState } from 'react';
import { toast } from 'sonner';

import { uploadImageAction } from '@/app/image-uploader/actions';
import { ProcessingStats } from '@/app/image-uploader/components/processing-stats';
import type {
  ImageProcessingStats,
  ProcessedImage,
  ProcessingProgress,
} from '@/app/image-uploader/lib/image-processor';
import { ACCEPTED_IMAGE_TYPES, isValidImageFile, processImage } from '@/app/image-uploader/lib/image-processor';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { getImageUrl } from '@/lib/s3-client';
import { cn } from '@/lib/utils';
import { Building } from '@/types/building';

interface BuildingCardProps {
  building: Building;
}

type UploadStage = 'idle' | 'processing' | 'uploading' | 'complete' | 'error';

export function BuildingCard({ building }: BuildingCardProps) {
  const [uploadStage, setUploadStage] = useState<UploadStage>('idle');
  const [processingProgress, setProcessingProgress] = useState<ProcessingProgress | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [imageUrl, setImageUrl] = useState(getImageUrl(building.uuid));
  const [imageError, setImageError] = useState(false);
  const [processedStats, setProcessedStats] = useState<ImageProcessingStats | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetState = useCallback(() => {
    setUploadStage('idle');
    setProcessingProgress(null);
    setUploadProgress(0);
    setProcessedStats(null);
    setPreviewUrl(null);
  }, []);

  const handleFile = useCallback(
    async (file: File) => {
      // Validate file is an image
      if (!isValidImageFile(file)) {
        toast.error('Please select a valid image file (JPG, PNG, GIF, WebP, BMP, or TIFF)');
        return;
      }

      resetState();
      setUploadStage('processing');

      try {
        // Process the image (resize, compress, convert)
        const processed: ProcessedImage = await processImage(file, (progress) => {
          setProcessingProgress(progress);
        });

        setProcessedStats(processed.stats);
        setPreviewUrl(processed.dataUrl);

        // Upload the processed image
        setUploadStage('uploading');
        setUploadProgress(30);

        const formData = new FormData();
        formData.append('file', processed.file);

        setUploadProgress(60);

        const result = await uploadImageAction(building.uuid, formData);

        if (result.success && result.imageUrl) {
          setUploadProgress(100);
          setUploadStage('complete');
          setImageUrl(result.imageUrl);
          setImageError(false);
          toast.success(`Image uploaded for ${building.title}`);

          // Clear stats after a delay to show completion
          setTimeout(() => {
            resetState();
          }, 3000);
        } else {
          setUploadStage('error');
          toast.error(result.error || 'Upload failed');
        }
      } catch (error) {
        console.error('Upload error:', error);
        setUploadStage('error');
        setProcessingProgress({
          stage: 'error',
          progress: 0,
          message: error instanceof Error ? error.message : 'Failed to process image',
        });
        toast.error('Failed to upload image');
      }
    },
    [building.uuid, building.title, resetState],
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        handleFile(file);
      }
      // Reset input so same file can be selected again
      e.target.value = '';
    },
    [handleFile],
  );

  // Drag and drop handlers
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Only set to false if leaving the card entirely
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;
    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      setIsDragOver(false);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);

      const files = e.dataTransfer.files;
      if (files.length > 0) {
        handleFile(files[0]);
      }
    },
    [handleFile],
  );

  const isProcessing = uploadStage === 'processing' || uploadStage === 'uploading';
  const hasImage = !imageError;
  const showStats = processedStats && (uploadStage === 'uploading' || uploadStage === 'complete');

  return (
    <Card
      className={cn(
        'relative overflow-hidden py-0 gap-0 transition-all duration-300',
        isDragOver && 'ring-2 ring-primary ring-offset-2 scale-[1.02]',
        isProcessing && 'pointer-events-none',
      )}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {/* Image Area */}
      <div className="relative aspect-video bg-muted">
        {/* Current or Preview Image */}
        {previewUrl ? (
          <Image src={previewUrl} alt={building.title} fill className="object-cover" unoptimized />
        ) : hasImage ? (
          <Image
            src={imageUrl}
            alt={building.title}
            fill
            className="object-cover"
            onError={() => setImageError(true)}
            unoptimized
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ImageIcon className="w-12 h-12 text-muted-foreground/30" />
          </div>
        )}

        {/* Drag Over Overlay */}
        {isDragOver && (
          <div
            className={cn(
              'absolute inset-0 bg-primary/20 backdrop-blur-[2px] flex flex-col items-center justify-center gap-2 z-10',
              'transition-all duration-200',
            )}
          >
            <div className="rounded-full bg-primary p-3 animate-bounce">
              <Upload className="w-6 h-6 text-primary-foreground" />
            </div>
            <p className="text-sm font-medium text-primary">Drop image here</p>
          </div>
        )}

        {/* Processing Overlay */}
        {uploadStage === 'processing' && (
          <div
            className={cn(
              'absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center gap-3 z-10',
              'transition-all duration-200',
            )}
          >
            <Loader2 className="w-8 h-8 text-white animate-spin" />
            <p className="text-sm text-white font-medium">{processingProgress?.message || 'Processing...'}</p>
            {processingProgress && <Progress value={processingProgress.progress} className="w-3/4 h-2" />}
          </div>
        )}

        {/* Upload Overlay */}
        {uploadStage === 'uploading' && (
          <div
            className={cn(
              'absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center gap-3 z-10',
              'transition-all duration-200',
            )}
          >
            <Loader2 className="w-8 h-8 text-white animate-spin" />
            <p className="text-sm text-white font-medium">Uploading to S3...</p>
            <Progress value={uploadProgress} className="w-3/4 h-2" />
          </div>
        )}

        {/* Error Overlay */}
        {uploadStage === 'error' && (
          <div
            className={cn(
              'absolute inset-0 bg-destructive/20 backdrop-blur-sm flex flex-col items-center justify-center gap-2 ',
              'z-10 transition-all duration-200',
            )}
          >
            <div className="rounded-full bg-destructive p-2">
              <X className="w-5 h-5 text-destructive-foreground" />
            </div>
            <p className="text-sm font-medium text-destructive">{processingProgress?.message || 'Upload failed'}</p>
            <Button variant="outline" size="sm" onClick={resetState}>
              Try Again
            </Button>
          </div>
        )}
      </div>

      {/* Content */}
      <CardContent className="p-4 relative overflow-hidden">
        {/* Default state: Building title and button */}
        <div
          className={cn(
            'flex items-center justify-between gap-2 transition-all duration-300',
            showStats ? 'opacity-0 translate-y-2 absolute inset-x-4' : 'opacity-100 translate-y-0',
          )}
        >
          <div className="flex-1 min-w-0 flex items-center gap-2">
            <BuildingIcon className="w-4 h-4 text-muted-foreground shrink-0" />
            <h2 className="font-medium truncate">{building.title}</h2>
          </div>

          <Button
            variant={hasImage ? 'outline' : 'default'}
            size="sm"
            disabled={isProcessing}
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="w-4 h-4" />
            {hasImage ? 'Replace' : 'Upload'}
          </Button>
        </div>

        {/* Stats state: Only show stats with animation */}
        <div
          className={cn(
            'transition-all duration-300',
            showStats ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 absolute inset-x-4',
          )}
        >
          {processedStats && <ProcessingStats stats={processedStats} />}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPTED_IMAGE_TYPES}
          className="hidden"
          onChange={handleFileSelect}
        />
      </CardContent>

      {/* Subtle drag hint border animation */}
      <div
        className={cn(
          'absolute inset-0 pointer-events-none rounded-xl border-2 border-transparent transition-all duration-300',
          isDragOver && 'border-primary border-dashed animate-pulse',
        )}
      />
    </Card>
  );
}
