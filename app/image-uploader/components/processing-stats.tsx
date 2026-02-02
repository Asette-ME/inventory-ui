'use client';

import { ArrowRight, Check, FileImage, ImageIcon, Loader2, Scale, X } from 'lucide-react';

import type { ImageProcessingStats, ProcessingProgress } from '@/app/image-uploader/lib/image-processor';
import { formatFileSize } from '@/app/image-uploader/lib/image-processor';
import { Badge } from '@/components/ui/badge';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
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
    // Show a single, clean compression badge
    return (
      <Badge variant="outline" className={cn('text-xs text-green-600 dark:text-green-400 shrink-0', className)}>
        <Check className="h-3 w-3 mr-1" />
        {stats.compressionRatio > 0 ? `${stats.compressionRatio}% smaller` : 'Optimized'}
      </Badge>
    );
  }

  // Full stats display - horizontal badges
  return (
    <ScrollArea>
      <div className={cn('flex items-center gap-2', className)}>
        {/* File Size Badge */}
        <Badge variant="secondary" className="text-xs gap-1">
          <Scale className="h-3 w-3" />
          <span className="text-muted-foreground line-through">{formatFileSize(stats.originalSize)}</span>
          <ArrowRight className="h-3 w-3" />
          <span className="font-medium">{formatFileSize(stats.processedSize)}</span>
        </Badge>

        {/* Resolution Badge (if resized) */}
        {stats.wasResized && (
          <Badge variant="secondary" className="text-xs gap-1">
            <ImageIcon className="h-3 w-3" />
            <span className="text-muted-foreground line-through">
              {stats.originalWidth}×{stats.originalHeight}
            </span>
            <ArrowRight className="h-3 w-3" />
            <span className="font-medium">
              {stats.processedWidth}×{stats.processedHeight}
            </span>
          </Badge>
        )}

        {/* Format Badge (if converted) */}
        {stats.wasConverted && (
          <Badge variant="secondary" className="text-xs gap-1">
            <FileImage className="h-3 w-3" />
            <span className="text-muted-foreground line-through uppercase">.{stats.originalExtension}</span>
            <ArrowRight className="h-3 w-3" />
            <span className="font-medium uppercase">.{stats.processedExtension}</span>
          </Badge>
        )}

        {/* Compression Badge */}
        {stats.compressionRatio > 0 && (
          <Badge variant="outline" className="text-xs text-green-600 dark:text-green-400">
            <Check className="h-3 w-3 mr-1" />
            {stats.compressionRatio}% smaller
          </Badge>
        )}
      </div>
      <ScrollBar orientation="horizontal" className="hidden" />
    </ScrollArea>
  );
}
