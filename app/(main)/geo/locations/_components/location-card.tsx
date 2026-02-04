'use client';

import type { LatLngBoundsExpression } from 'leaflet';
import { useMemo } from 'react';
import { useMap } from 'react-leaflet';

import { GeoLocation } from '@/app/(main)/geo/locations/_components/types';
import { Badge } from '@/components/ui/badge';
import { Item, ItemContent, ItemDescription, ItemHeader, ItemTitle } from '@/components/ui/item';
import { Map, MapPolygon, MapTileLayer } from '@/components/ui/map';
import { swapCoordinates } from '@/lib/utils';

interface FitBoundsProps {
  bounds: LatLngBoundsExpression | null;
}

function FitBounds({ bounds }: FitBoundsProps) {
  const map = useMap();

  if (bounds) map.fitBounds(bounds, { padding: [20, 20] });

  return null;
}

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
      className="bg-white dark:bg-transparent rounded-lg cursor-pointer card-hover transition-all duration-200"
      variant="outline"
      onClick={() => onClick?.(data)}
    >
      <ItemHeader className="h-[250px] overflow-hidden">
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
            <FitBounds bounds={boundaries} />
            <MapPolygon positions={boundaries} className="fill-purple-600 stroke-purple-600 stroke-1" />
          </Map>
        </div>
      </ItemHeader>

      <ItemContent>
        <ItemTitle className="text-lg">{data.name}</ItemTitle>
        <ItemDescription>
          <Badge>{data.code}</Badge>
        </ItemDescription>
      </ItemContent>
    </Item>
  );
}
