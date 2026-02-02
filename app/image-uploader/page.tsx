import { ImageUp } from 'lucide-react';
import { Suspense } from 'react';

import { BuildingGrid } from '@/app/image-uploader/components/building-grid';
import { BulkUploadButton } from '@/app/image-uploader/components/bulk-upload-button';
import { BulkUploadProvider } from '@/app/image-uploader/components/bulk-upload-context';
import { Skeleton } from '@/components/ui/skeleton';
import { fetchBuildingsAction } from '@/lib/actions/buildings';

function GridSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="rounded-xl border overflow-hidden">
          <Skeleton className="aspect-video" />
          <div className="p-4 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

async function BuildingGridLoader() {
  const buildings = await fetchBuildingsAction();

  // Sort alphabetically by title
  buildings.sort((a, b) => a.title.localeCompare(b.title));

  return <BuildingGrid buildings={buildings} />;
}

export default function ImageUploaderPage() {
  return (
    <BulkUploadProvider>
      <div className="flex flex-1 flex-col gap-4 p-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <ImageUp className="text-primary" />
              <h1 className="text-2xl font-bold">Image Uploader</h1>
            </div>
            <p className="text-muted-foreground">
              Upload building images to AWS S3. Drag & drop or click to upload. Images are automatically resized,
              compressed, and converted to JPG.
            </p>
          </div>
          <BulkUploadButton />
        </div>

        {/* Grid */}
        <Suspense fallback={<GridSkeleton />}>
          <BuildingGridLoader />
        </Suspense>
      </div>
    </BulkUploadProvider>
  );
}
