'use client';

import { Trash2 } from 'lucide-react';
import { useMemo } from 'react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { IconDisplay } from '@/components/ui/icon-display';
import { Item, ItemContent, ItemDescription, ItemHeader, ItemTitle } from '@/components/ui/item';
import { Map, MapFitBounds, MapMarker, MapPolygon, MapTileLayer } from '@/components/ui/map';
import { cn, swapCoordinates } from '@/lib/utils';
import { Attraction } from '@/types/entities';

interface AttractionCardProps {
  data: Attraction;
  onClick?: (data: Attraction) => void;
  onDelete?: (data: Attraction) => void;
}

export function AttractionCard({ data, onClick, onDelete }: AttractionCardProps) {
  const boundaries = useMemo(() => {
    if (!data.boundaries?.coordinates) return null;
    return swapCoordinates(data.boundaries.coordinates);
  }, [data.boundaries]);

  const markerPosition = useMemo((): [number, number] | null => {
    if (!data.coordinates?.latitude || !data.coordinates?.longitude) return null;
    return [data.coordinates.latitude, data.coordinates.longitude];
  }, [data.coordinates]);

  const defaultCenter: [number, number] = [25.2048, 55.2708];

  return (
    <Item
      className={cn(
        'relative rounded-lg cursor-pointer p-0 overflow-hidden group',
        'hover:scale-102 hover:shadow-lg transition-transform duration-300',
      )}
      variant="outline"
      onClick={() => onClick?.(data)}
    >
      {onDelete && (
        <Button
          variant="destructive"
          size="icon-sm"
          className="absolute top-2 right-2 z-[1002] opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(data);
          }}
        >
          <Trash2 className="size-4" />
        </Button>
      )}
      <ItemHeader className="h-[300px] overflow-hidden rounded-lg">
        <div className="h-full w-full">
          <Map
            key={data.id}
            center={markerPosition || defaultCenter}
            zoom={markerPosition ? 14 : 4}
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
            {boundaries && (
              <>
                <MapFitBounds bounds={boundaries} padding={[20, 20]} />
                <MapPolygon positions={boundaries} className="fill-purple-600 stroke-purple-600 stroke-1" />
              </>
            )}
            {markerPosition && <MapMarker position={markerPosition} />}
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
          <div className="flex items-center gap-2 min-w-0">
            {data.image ? (
              <Avatar className="size-6 rounded-full shrink-0">
                <AvatarImage src={data.image} alt={data.name} />
                <AvatarFallback className="rounded-full text-[10px]">{data.name[0]}</AvatarFallback>
              </Avatar>
            ) : data.icon ? (
              <IconDisplay name={data.icon} className="size-5 shrink-0" />
            ) : null}
            <ItemTitle className="text-lg truncate">{data.name}</ItemTitle>
          </div>
          {data.color && (
            <ItemDescription className="shrink-0">
              <Badge className="h-7 px-2 inset-ring inset-ring-white/20" style={{ backgroundColor: data.color }}>
                <span className="text-white text-xs font-mono">{data.color}</span>
              </Badge>
            </ItemDescription>
          )}
        </ItemContent>
      </div>
    </Item>
  );
}
