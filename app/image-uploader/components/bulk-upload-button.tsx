'use client';

import { Upload } from 'lucide-react';

import { useBulkUpload } from '@/app/image-uploader/components/bulk-upload-context';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

export function BulkUploadButton() {
  const { open, isReady } = useBulkUpload();

  if (!isReady) {
    return <Skeleton className="h-9 w-[120px] shrink-0" />;
  }

  return (
    <Button onClick={open} variant="outline" size="lg">
      <Upload className="h-4 w-4" />
      Bulk Upload
    </Button>
  );
}
