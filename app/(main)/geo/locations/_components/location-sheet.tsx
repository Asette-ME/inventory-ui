'use client';

import L from 'leaflet';
import { useMemo } from 'react';

import { Map, MapMarker, MapPolygon, MapTileLayer, MapZoomControl } from '@/components/ui/map';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { swapCoordinates } from '@/lib/utils';

import { GeoLocation } from './types';

interface LocationSheetProps {
  data: GeoLocation | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LocationSheet({ data, open, onOpenChange }: LocationSheetProps) {
  // Safe center
  const center: L.LatLngExpression = data ? [data.coordinates.latitude, data.coordinates.longitude] : [0, 0];

  const boundaries = useMemo(() => {
    if (!data?.boundaries?.coordinates) return null;
    return swapCoordinates(data.boundaries.coordinates);
  }, [data]);

  // Don't render content if no data, but keep Sheet mounted for animation if needed?
  // Shadcn Sheet handles close animation even if content changes, but best to keep structure.

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-xl w-full p-0 flex flex-col gap-0 overflow-hidden" side="right">
        {data && (
          <>
            <div className="relative h-64 w-full bg-muted shrink-0">
              <Map key={data.id} bounds={boundaries} className="h-full w-full rounded-none">
                <MapTileLayer />
                <MapZoomControl className="top-2 right-2 left-auto" />
                <MapPolygon positions={boundaries} className="fill-purple-600 stroke-purple-600 stroke-1" />
                <MapMarker position={center} />
              </Map>
            </div>

            <div className="flex flex-col p-6 overflow-y-auto flex-1">
              <SheetHeader>
                <SheetTitle className="text-2xl">{data.name}</SheetTitle>
                <SheetDescription>Detailed information about {data.name}</SheetDescription>
              </SheetHeader>

              <div className="mt-8 space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Coordinates
                    </div>
                    <div className="text-sm font-mono">
                      {data.coordinates.latitude.toFixed(4)}, {data.coordinates.longitude.toFixed(4)}
                    </div>
                  </div>
                  {/* Dynamic fields */}
                  {Object.entries(data).map(([key, value]) => {
                    if (
                      [
                        'id',
                        'name',
                        'coordinates',
                        'boundaries',
                        'created_at',
                        'updated_at',
                        'success',
                        'message',
                        'pagination',
                      ].includes(key)
                    )
                      return null;
                    if (typeof value === 'object' && value !== null) return null;
                    return (
                      <div key={key} className="space-y-1">
                        <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          {key.replace(/_/g, ' ')}
                        </div>
                        <div className="text-sm">{String(value)}</div>
                      </div>
                    );
                  })}

                  <div className="space-y-1">
                    <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Created At</div>
                    <div className="text-sm">{new Date(data['created_at'] || Date.now()).toLocaleDateString()}</div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
