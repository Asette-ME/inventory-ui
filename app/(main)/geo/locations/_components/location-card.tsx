'use client';

import { Badge } from '@/components/ui/badge';
import { Item, ItemContent, ItemDescription, ItemHeader, ItemTitle } from '@/components/ui/item';
import { Map, MapPolygon, MapTileLayer } from '@/components/ui/map';
import { swapCoordinates } from '@/lib/utils';
import L from 'leaflet';
import { useMemo } from 'react';
import { GeoLocation } from './types';

interface LocationCardProps {
  data: GeoLocation;
  onClick?: (data: GeoLocation) => void;
  onEdit?: (data: GeoLocation) => void;
  onDelete?: (data: GeoLocation) => void;
}

export function LocationCard({ data, onClick, onEdit, onDelete }: LocationCardProps) {
  const center: L.LatLngExpression = [data.coordinates.latitude, data.coordinates.longitude];

  const boundaries = useMemo(() => {
    if (!data.boundaries?.coordinates) return null;
    return swapCoordinates(data.boundaries.coordinates);
  }, [data.boundaries]);

  const bounds = useMemo(() => {
    if (boundaries && boundaries.length > 0) {
      return boundaries;
    }
    return undefined;
  }, [boundaries]);

  return (
    <Item
      className="bg-white dark:bg-transparent rounded-4xl cursor-pointer card-hover transition-all duration-200"
      variant="outline"
      onClick={() => onClick?.(data)}
    >
      <ItemHeader className="rounded-3xl h-[250px] overflow-hidden">
        <Map
          key={data.id}
          bounds={bounds}
          dragging={false}
          scrollWheelZoom={false}
          doubleClickZoom={false}
          touchZoom={false}
          boxZoom={false}
          keyboard={false}
          attributionControl={false}
        >
          <MapTileLayer />
          <MapPolygon positions={boundaries} className="fill-purple-600 stroke-purple-600 stroke-1" />
        </Map>
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
