'use client';

import {
  AlertCircle,
  AlertTriangle,
  Building as BuildingIcon,
  Check,
  ChevronDown,
  Images,
  Loader2,
  Plus,
  Upload,
  X,
} from 'lucide-react';
import Image from 'next/image';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';

import { uploadImagesAction } from '@/app/image-uploader/actions';
import { ProcessingStats } from '@/app/image-uploader/components/processing-stats';
import { findBestMatch, searchBuildings } from '@/app/image-uploader/lib/building-matcher';
import type { ProcessedImage, ProcessingProgress } from '@/app/image-uploader/lib/image-processor';
import {
  ACCEPTED_IMAGE_TYPES,
  formatFileSize,
  isValidImageFile,
  processImage,
} from '@/app/image-uploader/lib/image-processor';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import type { BuildingWithImage } from '@/types/building';

interface BulkUploadItem {
  id: string;
  file: File;
  building: BuildingWithImage | null;
  matchScore: number;
  processingProgress: ProcessingProgress | null;
  processedImage: ProcessedImage | null;
  uploadStatus: 'pending' | 'processing' | 'processed' | 'uploading' | 'uploaded' | 'error';
  error?: string;
}

interface BulkUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  buildings: BuildingWithImage[];
  onComplete?: () => void;
}

export function BulkUploadDialog({ open, onOpenChange, buildings, onComplete }: BulkUploadDialogProps) {
  const [items, setItems] = useState<BulkUploadItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reset state when dialog closes
  useEffect(() => {
    if (!open) {
      setItems([]);
      setIsProcessing(false);
      setIsUploading(false);
    }
  }, [open]);

  const handleFilesSelected = useCallback(
    (files: FileList | File[]) => {
      const fileArray = Array.from(files).filter(isValidImageFile);

      if (fileArray.length === 0) {
        toast.error('No valid image files selected');
        return;
      }

      // Create items with initial building matches
      const newItems: BulkUploadItem[] = fileArray.map((file, index) => {
        const match = findBestMatch(file.name, buildings);
        return {
          id: `${Date.now()}-${index}`,
          file,
          building: match.building,
          matchScore: match.score,
          processingProgress: null,
          processedImage: null,
          uploadStatus: 'pending',
        };
      });

      setItems(newItems);

      // Start processing immediately
      processAllImages(newItems);
    },
    [buildings],
  );

  const processAllImages = async (itemsToProcess: BulkUploadItem[]) => {
    setIsProcessing(true);

    for (let i = 0; i < itemsToProcess.length; i++) {
      const item = itemsToProcess[i];

      try {
        // Update status to processing
        setItems((prev) =>
          prev.map((it) =>
            it.id === item.id
              ? {
                  ...it,
                  uploadStatus: 'processing' as const,
                  processingProgress: { stage: 'loading', progress: 0, message: 'Loading...' },
                }
              : it,
          ),
        );

        // Process the image
        const processed = await processImage(item.file, (progress) => {
          setItems((prev) => prev.map((it) => (it.id === item.id ? { ...it, processingProgress: progress } : it)));
        });

        // Update with processed image
        setItems((prev) =>
          prev.map((it) =>
            it.id === item.id
              ? {
                  ...it,
                  processedImage: processed,
                  uploadStatus: 'processed' as const,
                  processingProgress: { stage: 'complete', progress: 100, message: 'Ready' },
                }
              : it,
          ),
        );
      } catch (error) {
        setItems((prev) =>
          prev.map((it) =>
            it.id === item.id
              ? {
                  ...it,
                  uploadStatus: 'error' as const,
                  error: error instanceof Error ? error.message : 'Processing failed',
                  processingProgress: { stage: 'error', progress: 0, message: 'Failed' },
                }
              : it,
          ),
        );
      }
    }

    setIsProcessing(false);
  };

  const handleBuildingChange = useCallback((itemId: string, building: BuildingWithImage | null) => {
    setItems((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, building, matchScore: building ? 1 : 0 } : item)),
    );
  }, []);

  const handleRemoveItem = useCallback((itemId: string) => {
    setItems((prev) => prev.filter((item) => item.id !== itemId));
  }, []);

  const handleUploadAll = async () => {
    const readyItems = items.filter(
      (item) => item.uploadStatus === 'processed' && item.building && item.processedImage,
    );

    if (readyItems.length === 0) {
      toast.error('No images ready to upload');
      return;
    }

    setIsUploading(true);

    // Mark items as uploading
    setItems((prev) =>
      prev.map((item) =>
        readyItems.some((ri) => ri.id === item.id) ? { ...item, uploadStatus: 'uploading' as const } : item,
      ),
    );

    // Prepare upload data
    const uploads = readyItems.map((item) => {
      const formData = new FormData();
      formData.append('file', item.processedImage!.file);
      return {
        uuid: item.building!.uuid,
        formData,
      };
    });

    try {
      const results = await uploadImagesAction(uploads);

      // Update items based on results
      results.forEach((result, index) => {
        const item = readyItems[index];
        setItems((prev) =>
          prev.map((it) =>
            it.id === item.id
              ? result.result.success
                ? { ...it, uploadStatus: 'uploaded' as const }
                : { ...it, uploadStatus: 'error' as const, error: result.result.error }
              : it,
          ),
        );
      });

      const successCount = results.filter((r) => r.result.success).length;
      const failCount = results.length - successCount;

      if (successCount > 0) {
        toast.success(`Successfully uploaded ${successCount} image${successCount > 1 ? 's' : ''}`);
      }
      if (failCount > 0) {
        toast.error(`Failed to upload ${failCount} image${failCount > 1 ? 's' : ''}`);
      }

      // Call onComplete callback
      onComplete?.();
    } catch (error) {
      console.error('Bulk upload error:', error);
      toast.error('Failed to upload images');

      // Mark all as error
      setItems((prev) =>
        prev.map((item) =>
          readyItems.some((ri) => ri.id === item.id)
            ? { ...item, uploadStatus: 'error' as const, error: 'Upload failed' }
            : item,
        ),
      );
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFilesSelected(e.target.files);
    }
    e.target.value = '';
  };

  // Click handler for dropzone
  const handleDropzoneClick = () => {
    fileInputRef.current?.click();
  };

  // Drag and drop handlers for the dialog
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    if (e.clientX < rect.left || e.clientX > rect.right || e.clientY < rect.top || e.clientY > rect.bottom) {
      setIsDragOver(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    if (e.dataTransfer.files) {
      handleFilesSelected(e.dataTransfer.files);
    }
  };

  // Computed values
  const allProcessed =
    items.length > 0 && items.every((item) => item.uploadStatus !== 'pending' && item.uploadStatus !== 'processing');
  const readyCount = items.filter((item) => item.uploadStatus === 'processed' && item.building).length;
  const unmappedCount = items.filter((item) => item.uploadStatus === 'processed' && !item.building).length;
  const uploadedCount = items.filter((item) => item.uploadStatus === 'uploaded').length;
  const errorCount = items.filter((item) => item.uploadStatus === 'error').length;
  const canUpload = allProcessed && readyCount > 0 && !isUploading;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="!max-w-screen h-screen rounded-none flex flex-col px-3 sm:px-6"
        onDragOver={handleDragOver}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <DialogHeader className="shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <Images className="h-5 w-5" />
            Bulk Upload Images
          </DialogTitle>
        </DialogHeader>

        {/* Drop Zone or Items List */}
        <div className="flex-1 min-h-0 overflow-hidden">
          {items.length === 0 ? (
            /* Clickable Dropzone - Full Height */
            <div className="h-full p-4">
              <div
                onClick={handleDropzoneClick}
                className={cn(
                  'h-full flex flex-col items-center justify-center gap-4 p-8 border-2 border-dashed rounded-lg',
                  'transition-all duration-200 cursor-pointer',
                  isDragOver
                    ? 'border-primary bg-primary/5 scale-[1.005]'
                    : 'border-muted-foreground/25 hover:border-primary/50 hover:bg-primary/1',
                )}
              >
                <div
                  className={cn(
                    'rounded-full p-6 bg-muted transition-all duration-200',
                    isDragOver && 'bg-primary/20 scale-110',
                  )}
                >
                  <Upload className={cn('h-12 w-12 text-muted-foreground', isDragOver && 'text-primary')} />
                </div>
                <div className="text-center">
                  <p className="text-lg font-medium">
                    {isDragOver ? 'Drop images here' : 'Drop images here or click to browse'}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Supports JPG, PNG, GIF, WebP, BMP, TIFF - any size
                  </p>
                </div>
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                  disabled={isDragOver}
                >
                  <Images className="h-4 w-4" />
                  Select Images
                </Button>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col">
              {/* Summary bar - Responsive */}
              <div className="shrink-0 flex flex-wrap items-center gap-2 p-3 bg-muted rounded-lg mb-3">
                <Badge variant="outline">
                  <Images className="h-4 w-4" />
                  {items.length}
                  <span className="hidden sm:inline">images</span>
                </Badge>
                {isProcessing && (
                  <Badge variant="secondary">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Processing...
                  </Badge>
                )}
                {allProcessed && (
                  <>
                    {readyCount > 0 && (
                      <Badge variant="default" className="bg-green-600">
                        <Check className="h-4 w-4" />
                        {readyCount}
                        <span className="hidden sm:inline">ready</span>
                      </Badge>
                    )}
                    {unmappedCount > 0 && (
                      <Badge variant="secondary" className="text-orange-600">
                        <AlertCircle className="h-4 w-4" />
                        {unmappedCount}
                        <span className="hidden sm:inline">unmapped</span>
                      </Badge>
                    )}
                    {uploadedCount > 0 && (
                      <Badge variant="default" className="bg-blue-600">
                        <Check className="h-4 w-4" />
                        {uploadedCount}
                        <span className="hidden sm:inline">uploaded</span>
                      </Badge>
                    )}
                    {errorCount > 0 && (
                      <Badge variant="destructive">
                        <X className="h-4 w-4" />
                        {errorCount}
                        <span className="hidden sm:inline">failed</span>
                      </Badge>
                    )}
                  </>
                )}
                <div className="flex-1 min-w-0" />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isProcessing || isUploading}
                  className="shrink-0"
                >
                  <Plus className="h-4 w-4" />
                  <span className="hidden sm:inline">Add More</span>
                </Button>
              </div>

              {/* Items list - Scrollable */}
              <ScrollArea className="flex-1 min-h-0">
                <div className="space-y-3">
                  {items.map((item) => (
                    <BulkUploadItemCard
                      key={item.id}
                      item={item}
                      buildings={buildings}
                      onBuildingChange={(building) => handleBuildingChange(item.id, building)}
                      onRemove={() => handleRemoveItem(item.id)}
                      disabled={isUploading}
                    />
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}
        </div>

        <DialogFooter className="shrink-0 flex-col-reverse sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isUploading}
            className="w-full sm:w-auto"
          >
            {uploadedCount > 0 ? 'Close' : 'Cancel'}
          </Button>
          <Button onClick={handleUploadAll} disabled={!canUpload} className="w-full sm:w-auto">
            {isUploading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4" />
                Upload {readyCount} Image{readyCount !== 1 ? 's' : ''}
              </>
            )}
          </Button>
        </DialogFooter>

        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPTED_IMAGE_TYPES}
          multiple
          className="hidden"
          onChange={handleFileInputChange}
        />
      </DialogContent>
    </Dialog>
  );
}

// Individual item card component - Responsive
interface BulkUploadItemCardProps {
  item: BulkUploadItem;
  buildings: BuildingWithImage[];
  onBuildingChange: (building: BuildingWithImage | null) => void;
  onRemove: () => void;
  disabled: boolean;
}

function BulkUploadItemCard({ item, buildings, onBuildingChange, onRemove, disabled }: BulkUploadItemCardProps) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredBuildings = useMemo(() => {
    return searchBuildings(searchQuery, buildings, 20);
  }, [searchQuery, buildings]);

  const isProcessing = item.uploadStatus === 'pending' || item.uploadStatus === 'processing';
  const isUploading = item.uploadStatus === 'uploading';
  const isUploaded = item.uploadStatus === 'uploaded';
  const isError = item.uploadStatus === 'error';
  const canChangeBuilding = !disabled && !isProcessing && !isUploading && !isUploaded;

  return (
    <div
      className={cn(
        'flex flex-col sm:flex-row gap-3 sm:gap-4 p-3 sm:p-4 border rounded-lg transition-all duration-200',
        isUploaded && 'border-green-500/50 bg-green-500/5',
        isError && 'border-destructive/50 bg-destructive/5',
        isUploading && 'border-blue-500/50 bg-blue-500/5',
      )}
    >
      {/* Image Preview - Responsive */}
      <div className="relative w-full sm:w-32 h-32 sm:h-24 rounded-md overflow-hidden bg-muted shrink-0">
        {item.processedImage ? (
          <Image src={item.processedImage.dataUrl} alt={item.file.name} fill className="object-cover" unoptimized />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            {isProcessing ? (
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            ) : (
              <Images className="h-6 w-6 text-muted-foreground/50" />
            )}
          </div>
        )}

        {/* Status overlay */}
        {isUploaded && (
          <div className="absolute inset-0 bg-green-500/80 flex items-center justify-center">
            <Check className="h-8 w-8 text-white" />
          </div>
        )}
        {isUploading && (
          <div className="absolute inset-0 bg-blue-500/80 flex items-center justify-center">
            <Loader2 className="h-6 w-6 text-white animate-spin" />
          </div>
        )}

        {/* Remove button on mobile - top right of image */}
        {canChangeBuilding && (
          <Button
            variant="secondary"
            size="icon"
            className="absolute top-2 right-2 h-7 w-7 sm:hidden"
            onClick={onRemove}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 space-y-2">
        {/* File info */}
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <p className="font-medium truncate text-sm sm:text-base">{item.file.name}</p>
            <p className="text-xs sm:text-sm text-muted-foreground">
              {formatFileSize(item.file.size)}
              {item.processedImage && (
                <span className="text-green-600 dark:text-green-400">
                  {' → '}
                  {formatFileSize(item.processedImage.stats.processedSize)}
                </span>
              )}
            </p>
          </div>
          {/* Remove button on desktop */}
          {canChangeBuilding && (
            <Button variant="ghost" size="icon" className="hidden sm:flex shrink-0 h-8 w-8" onClick={onRemove}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Building selector - Responsive */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <Popover open={searchOpen} onOpenChange={setSearchOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className={cn('justify-between w-full sm:max-w-xs', !item.building && 'text-muted-foreground')}
                disabled={!canChangeBuilding}
              >
                <span className="flex items-center gap-2 truncate">
                  <BuildingIcon className="h-4 w-4 shrink-0" />
                  {item.building ? item.building.title : 'Select building...'}
                </span>
                <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[calc(100vw-4rem)] sm:w-80 p-0" align="start">
              <Command>
                <CommandInput placeholder="Search buildings..." value={searchQuery} onValueChange={setSearchQuery} />
                <CommandList>
                  <CommandEmpty>No buildings found.</CommandEmpty>
                  <CommandGroup>
                    {filteredBuildings.map((building) => (
                      <CommandItem
                        key={building.uuid}
                        value={building.title}
                        onSelect={() => {
                          onBuildingChange(building);
                          setSearchOpen(false);
                          setSearchQuery('');
                        }}
                      >
                        <Check
                          className={cn(
                            'h-4 w-4 shrink-0',
                            item.building?.uuid === building.uuid ? 'opacity-100' : 'opacity-0',
                          )}
                        />
                        <BuildingIcon className="h-4 w-4 text-muted-foreground shrink-0" />
                        <span className="truncate">{building.title}</span>
                        {building.hasImage && (
                          <Badge variant="outline" className="ml-auto text-xs shrink-0">
                            Has image
                          </Badge>
                        )}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>

          {/* Match score badge */}
          {item.building && item.matchScore < 1 && (
            <Badge
              variant="outline"
              className={cn('text-xs shrink-0 w-fit', item.matchScore < 0.75 && 'text-orange-400 border-orange-400')}
            >
              {item.matchScore < 0.75 && <AlertCircle className="h-4 w-4" />}
              {Math.round(item.matchScore * 100)}% match
            </Badge>
          )}
          {!item.building && item.uploadStatus === 'processed' && (
            <Badge variant="outline" className="text-xs text-red-400 border-red-400 shrink-0 w-fit">
              <AlertTriangle className="h-4 w-4" />
              No match found
            </Badge>
          )}
        </div>

        {/* Processing/Stats info */}
        {isProcessing && item.processingProgress && (
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
              <Loader2 className="h-3 w-3 animate-spin" />
              {item.processingProgress.message}
            </div>
            <Progress value={item.processingProgress.progress} className="h-1" />
          </div>
        )}

        {item.processedImage && !isProcessing && <ProcessingStats stats={item.processedImage.stats} compact />}

        {isError && item.error && <p className="text-xs sm:text-sm text-destructive">{item.error}</p>}
      </div>
    </div>
  );
}
