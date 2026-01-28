'use client';

import { Building as BuildingIcon, ImageIcon, Loader2, Upload } from 'lucide-react';
import Image from 'next/image';
import { ChangeEvent, useRef, useState } from 'react';
import { toast } from 'sonner';

import { uploadImageAction } from '@/app/image-uploader/actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { getImageUrl } from '@/lib/s3-client';
import { Building } from '@/types/building';

const MAX_FILE_SIZE = 150 * 1024; // 150KB

interface BuildingCardProps {
  building: Building;
}

export function BuildingCard({ building }: BuildingCardProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [imageUrl, setImageUrl] = useState(getImageUrl(building.uuid));
  const [imageError, setImageError] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset input so same file can be selected again
    e.target.value = '';

    // Client-side validation
    if (file.type !== 'image/jpeg') {
      toast.error('Only JPG files are allowed');
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      toast.error('File size must be under 150KB');
      return;
    }

    setIsUploading(true);
    setUploadProgress(30);

    try {
      const formData = new FormData();
      formData.append('file', file);

      setUploadProgress(60);

      const result = await uploadImageAction(building.uuid, formData);

      if (result.success && result.imageUrl) {
        setUploadProgress(100);
        setImageUrl(result.imageUrl);
        setImageError(false);
        toast.success(`Image uploaded for ${building.title}`);
      } else {
        toast.error(result.error || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload image');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const hasImage = !imageError;

  return (
    <Card className="overflow-hidden py-0 gap-0">
      {/* Image Area */}
      <div className="relative aspect-video bg-muted">
        {hasImage ? (
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

        {/* Upload Overlay */}
        {isUploading && (
          <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center gap-2">
            <Loader2 className="w-8 h-8 text-white animate-spin" />
            <Progress value={uploadProgress} className="w-3/4 h-2" />
          </div>
        )}
      </div>

      {/* Content */}
      <CardContent className="p-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex-1 min-w-0 flex items-center gap-2 ">
            <BuildingIcon className="w-4 h-4 text-muted-foreground shrink-0" />
            <h2 className="font-medium truncate">{building.title}</h2>
          </div>

          <Button
            variant={hasImage ? 'outline' : 'default'}
            size="sm"
            disabled={isUploading}
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="w-4 h-4" />
            {hasImage ? 'Replace' : 'Upload'}
          </Button>
        </div>

        <input ref={fileInputRef} type="file" accept="image/jpeg" className="hidden" onChange={handleFileSelect} />
      </CardContent>
    </Card>
  );
}
