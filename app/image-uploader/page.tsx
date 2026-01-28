import { ImageUp } from 'lucide-react';
import { Suspense } from 'react';

import { BuildingGrid } from '@/app/image-uploader/components/building-grid';
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
    <div className="flex flex-1 flex-col gap-4 p-4">
      <div>
        <div className="flex items-center gap-2">
          <ImageUp className="text-primary" />
          <h1 className="text-2xl font-bold mb-0">Image Uploader</h1>
        </div>
        <p className="text-muted-foreground">
          Upload building images to AWS S3. Only JPG files under 150KB are allowed.
        </p>
      </div>

      <Suspense fallback={<GridSkeleton />}>
        <BuildingGridLoader />
      </Suspense>
    </div>
  );
}
