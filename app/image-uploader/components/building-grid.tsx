'use client';

import { Images } from 'lucide-react';
import { useCallback, useState } from 'react';

import { BuildingCard } from '@/app/image-uploader/components/building-card';
import { BulkUploadDialog } from '@/app/image-uploader/components/bulk-upload-dialog';
import { Button } from '@/components/ui/button';
import { getImageUrl } from '@/lib/s3-client';
import type { Building, BuildingWithImage } from '@/types/building';

interface BuildingGridProps {
  buildings: Building[];
}

export function BuildingGrid({ buildings }: BuildingGridProps) {
  const [bulkUploadOpen, setBulkUploadOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // Convert buildings to BuildingWithImage for the bulk upload dialog
  const buildingsWithImage: BuildingWithImage[] = buildings.map((building) => ({
    ...building,
    imageUrl: getImageUrl(building.uuid),
    hasImage: false, // We don't know if the image exists until we try to load it
  }));

  const handleBulkUploadComplete = useCallback(() => {
    // Trigger a refresh by updating the key
    setRefreshKey((prev) => prev + 1);
  }, []);

  if (buildings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
        <p>No buildings found</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Bulk Upload Button */}
      <div className="flex justify-end">
        <Button onClick={() => setBulkUploadOpen(true)} variant="outline">
          <Images className="h-4 w-4 mr-2" />
          Bulk Upload
        </Button>
      </div>

      {/* Building Grid */}
      <div key={refreshKey} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {buildings.map((building) => (
          <BuildingCard key={building.uuid} building={building} />
        ))}
      </div>

      {/* Bulk Upload Dialog */}
      <BulkUploadDialog
        open={bulkUploadOpen}
        onOpenChange={setBulkUploadOpen}
        buildings={buildingsWithImage}
        onComplete={handleBulkUploadComplete}
      />
    </div>
  );
}
