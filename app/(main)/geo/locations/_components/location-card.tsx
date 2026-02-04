'use client';

import { useMemo } from 'react';

import { GeoLocation } from '@/app/(main)/geo/locations/_components/types';
import { Badge } from '@/components/ui/badge';
import { Item, ItemContent, ItemDescription, ItemHeader, ItemTitle } from '@/components/ui/item';
import { Map, MapFitBounds, MapPolygon, MapTileLayer } from '@/components/ui/map';
import { cn, swapCoordinates } from '@/lib/utils';

interface LocationCardProps {
  data: GeoLocation;
  onClick?: (data: GeoLocation) => void;
}

export function LocationCard({ data, onClick }: LocationCardProps) {
  const boundaries = useMemo(() => {
    if (!data.boundaries?.coordinates) return null;
    return swapCoordinates(data.boundaries.coordinates);
  }, [data.boundaries]);

  const defaultCenter: [number, number] = [25.2048, 55.2708];

  return (
    <Item
      className={cn(
        'relative rounded-lg cursor-pointer p-0 overflow-hidden',
        'hover:scale-102 hover:shadow-lg transition-transform duration-300',
      )}
      variant="outline"
      onClick={() => onClick?.(data)}
    >
      <ItemHeader className="h-[300px] overflow-hidden rounded-lg">
        <div className="h-full w-full">
          <Map
            key={data.id}
            center={defaultCenter}
            zoom={4}
            dragging={false}
            scrollWheelZoom={false}
            doubleClickZoom={false}
            touchZoom={false}
            boxZoom={false}
            keyboard={false}
            attributionControl={false}
            className="h-full w-full"
          >
            <MapTileLayer />
            <MapFitBounds bounds={boundaries} padding={[20, 20]} />
            {boundaries && <MapPolygon positions={boundaries} className="fill-purple-600 stroke-purple-600 stroke-1" />}
          </Map>
        </div>
      </ItemHeader>

      <div className="absolute z-1001 bottom-0 left-0 w-full p-2">
        <ItemContent
          className={cn(
            'rounded-xl p-3',
            'bg-clip-padding backdrop-filter backdrop-blur-xl',
            'dark:border dark:border-white-900 shadow',
            'flex flex-row items-start justify-between gap-2',
          )}
        >
          <ItemTitle className="text-lg">{data.name}</ItemTitle>
          <ItemDescription className="shrink-0">
            <Badge className="w-12 h-7 bg-primary/10 text-primary inset-ring inset-ring-primary/40">{data.code}</Badge>
          </ItemDescription>
        </ItemContent>
      </div>
    </Item>
  );
}
