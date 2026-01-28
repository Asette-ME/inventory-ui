'use client';

import { BuildingCard } from '@/app/image-uploader/components/building-card';
import { Building } from '@/types/building';

interface BuildingGridProps {
  buildings: Building[];
}

export function BuildingGrid({ buildings }: BuildingGridProps) {
  if (buildings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
        <p>No buildings found</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {buildings.map((building) => (
        <BuildingCard key={building.uuid} building={building} />
      ))}
    </div>
  );
}
