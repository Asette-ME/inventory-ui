'use client';

import { ArrowRight, Check, FileImage, ImageIcon, Loader2, Scale, X } from 'lucide-react';

import type { ImageProcessingStats, ProcessingProgress } from '@/app/image-uploader/lib/image-processor';
import { formatDimensions, formatFileSize } from '@/app/image-uploader/lib/image-processor';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface ProcessingStatsProps {
  stats?: ImageProcessingStats;
  progress?: ProcessingProgress;
  className?: string;
  compact?: boolean;
}

export function ProcessingStats({ stats, progress, className, compact = false }: ProcessingStatsProps) {
  if (!stats && !progress) return null;

  // Show progress state
  if (progress && progress.stage !== 'complete') {
    return (
      <div className={cn('space-y-2 rounded-lg border bg-muted/50 p-3', className)}>
        <div className="flex items-center gap-2">
          {progress.stage === 'error' ? (
            <X className="h-4 w-4 text-destructive" />
          ) : (
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
          )}
          <span className="text-sm font-medium">{progress.message}</span>
        </div>
        {progress.stage !== 'error' && (
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
            <div className="h-full bg-primary transition-all duration-300" style={{ width: `${progress.progress}%` }} />
          </div>
        )}
      </div>
    );
  }

  // Show stats after processing
  if (!stats) return null;

  if (compact) {
    return (
      <div className={cn('flex flex-wrap gap-1.5', className)}>
        {stats.wasResized && (
          <Badge variant="secondary" className="text-xs">
            <Scale className="h-3 w-3" />
            Resized
          </Badge>
        )}
        {stats.wasConverted && (
          <Badge variant="secondary" className="text-xs">
            <FileImage className="h-3 w-3" />
            Converted
          </Badge>
        )}
        {stats.compressionRatio > 0 && (
          <Badge variant="outline" className="text-xs text-green-600 dark:text-green-400">
            <Check className="h-3 w-3" />
            {stats.compressionRatio}% smaller
          </Badge>
        )}
      </div>
    );
  }

  return (
    <div className={cn('space-y-3 rounded-lg border bg-muted/50 p-3 text-sm', className)}>
      {/* File Name */}
      <div className="flex items-center gap-2 text-muted-foreground">
        <FileImage className="h-4 w-4 shrink-0" />
        <span className="truncate font-medium">{stats.originalFileName}</span>
      </div>

      {/* Resolution */}
      <div className="flex items-center gap-2">
        <ImageIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
        <span className="text-muted-foreground">Resolution:</span>
        <span className={cn(stats.wasResized && 'text-muted-foreground line-through')}>
          {formatDimensions(stats.originalWidth, stats.originalHeight)}
        </span>
        {stats.wasResized && (
          <>
            <ArrowRight className="h-3 w-3 text-primary" />
            <span className="font-medium text-primary">
              {formatDimensions(stats.processedWidth, stats.processedHeight)}
            </span>
          </>
        )}
      </div>

      {/* File Size */}
      <div className="flex items-center gap-2">
        <Scale className="h-4 w-4 shrink-0 text-muted-foreground" />
        <span className="text-muted-foreground">Size:</span>
        <span className={cn(stats.compressionRatio > 0 && 'text-muted-foreground line-through')}>
          {formatFileSize(stats.originalSize)}
        </span>
        <ArrowRight className="h-3 w-3 text-primary" />
        <span className="font-medium text-primary">{formatFileSize(stats.processedSize)}</span>
        {stats.compressionRatio > 0 && (
          <Badge variant="outline" className="ml-1 text-xs text-green-600 dark:text-green-400">
            -{stats.compressionRatio}%
          </Badge>
        )}
      </div>

      {/* Extension */}
      {stats.wasConverted && (
        <div className="flex items-center gap-2">
          <FileImage className="h-4 w-4 shrink-0 text-muted-foreground" />
          <span className="text-muted-foreground">Format:</span>
          <span className="text-muted-foreground line-through uppercase">.{stats.originalExtension}</span>
          <ArrowRight className="h-3 w-3 text-primary" />
          <span className="font-medium text-primary uppercase">.{stats.processedExtension}</span>
        </div>
      )}

      {/* Summary badges */}
      <div className="flex flex-wrap gap-1.5 pt-1">
        {stats.wasResized && (
          <Badge variant="secondary" className="text-xs">
            <Check className="h-3 w-3" />
            Resized
          </Badge>
        )}
        {stats.wasConverted && (
          <Badge variant="secondary" className="text-xs">
            <Check className="h-3 w-3" />
            Converted
          </Badge>
        )}
        <Badge variant="secondary" className="text-xs">
          <Check className="h-3 w-3" />
          Compressed
        </Badge>
      </div>
    </div>
  );
}
