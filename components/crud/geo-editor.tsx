'use client';

import type { FeatureGroup, LatLng, LatLngExpression } from 'leaflet';
import { Map as MapIcon, MapPin, Shapes } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Map,
  MapDrawControl,
  MapDrawDelete,
  MapDrawEdit,
  MapDrawMarker,
  MapDrawPolygon,
  MapDrawUndo,
  MapMarker,
  MapPolygon,
  MapSearchControl,
  MapTileLayer,
  MapZoomControl,
} from '@/components/ui/map';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { cn, swapCoordinates } from '@/lib/utils';
import { Boundaries, Coordinates } from '@/types/common';

interface GeoEditorProps {
  coordinates: Coordinates | null;
  boundaries: Boundaries | null;
  onCoordinatesChange: (coordinates: Coordinates | null) => void;
  onBoundariesChange: (boundaries: number[][][] | number[][][][] | null) => void;
  disabled?: boolean;
  className?: string;
  showCoordinates?: boolean;
  showBoundaries?: boolean;
}

export function GeoEditor({
  coordinates,
  boundaries,
  onCoordinatesChange,
  onBoundariesChange,
  disabled = false,
  className,
  showCoordinates = true,
  showBoundaries = true,
}: GeoEditorProps) {
  const [activeTab, setActiveTab] = useState<'map' | 'manual'>('map');
  const [latInput, setLatInput] = useState(coordinates?.latitude?.toString() || '');
  const [lngInput, setLngInput] = useState(coordinates?.longitude?.toString() || '');
  const [boundariesInput, setBoundariesInput] = useState('');

  // Sync inputs with props
  useEffect(() => {
    setLatInput(coordinates?.latitude?.toString() || '');
    setLngInput(coordinates?.longitude?.toString() || '');
  }, [coordinates]);

  useEffect(() => {
    if (boundaries?.coordinates) {
      setBoundariesInput(JSON.stringify(boundaries.coordinates, null, 2));
    } else {
      setBoundariesInput('');
    }
  }, [boundaries]);

  const center: LatLngExpression = coordinates ? [coordinates.latitude, coordinates.longitude] : [25.2048, 55.2708]; // Default to Dubai

  const boundaryPositions = useMemo(() => {
    if (!boundaries?.coordinates) return null;
    return swapCoordinates(boundaries.coordinates);
  }, [boundaries]);

  const handleLatChange = (value: string) => {
    setLatInput(value);
    const lat = parseFloat(value);
    if (!isNaN(lat) && lat >= -90 && lat <= 90) {
      const lng = coordinates?.longitude ?? 0;
      onCoordinatesChange({ latitude: lat, longitude: lng });
    }
  };

  const handleLngChange = (value: string) => {
    setLngInput(value);
    const lng = parseFloat(value);
    if (!isNaN(lng) && lng >= -180 && lng <= 180) {
      const lat = coordinates?.latitude ?? 0;
      onCoordinatesChange({ latitude: lat, longitude: lng });
    }
  };

  const handleBoundariesInputChange = (value: string) => {
    setBoundariesInput(value);
    try {
      if (value.trim() === '') {
        onBoundariesChange(null);
        return;
      }
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) {
        onBoundariesChange(parsed);
      }
    } catch {
      // Invalid JSON, ignore
    }
  };

  const handleLayersChange = useCallback(
    (featureGroup: FeatureGroup) => {
      const layers = featureGroup.getLayers();

      layers.forEach((layer: any) => {
        // Handle marker (coordinates)
        if (layer.getLatLng && showCoordinates) {
          const latlng: LatLng = layer.getLatLng();
          onCoordinatesChange({
            latitude: latlng.lat,
            longitude: latlng.lng,
          });
        }

        // Handle polygon (boundaries)
        if (layer.getLatLngs && showBoundaries) {
          const latlngs = layer.getLatLngs();
          // Convert to GeoJSON format [lng, lat]
          const convertToGeoJson = (coords: any[]): any[] => {
            if (Array.isArray(coords[0]) && typeof coords[0][0] !== 'number') {
              return coords.map(convertToGeoJson);
            }
            return coords.map((ll: LatLng) => [ll.lng, ll.lat]);
          };
          const geoJsonCoords = convertToGeoJson(latlngs);
          // Wrap in array for MultiPolygon format
          onBoundariesChange([geoJsonCoords]);
        }
      });
    },
    [onCoordinatesChange, onBoundariesChange, showCoordinates, showBoundaries],
  );

  const handlePlaceSelect = (place: { lat: number; lng: number; name: string }) => {
    onCoordinatesChange({
      latitude: place.lat,
      longitude: place.lng,
    });
  };

  return (
    <div className={cn('space-y-4', className)}>
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'map' | 'manual')}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="map" disabled={disabled} className="text-xs sm:text-sm">
            <MapIcon className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden xs:inline">Interactive </span>Map
          </TabsTrigger>
          <TabsTrigger value="manual" disabled={disabled} className="text-xs sm:text-sm">
            <Shapes className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
            Manual<span className="hidden xs:inline"> Input</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="map" className="mt-4">
          <div className="relative h-60 sm:h-80 w-full overflow-hidden rounded-lg border">
            <Map center={center} zoom={coordinates ? 12 : 4} bounds={boundaryPositions} className="h-full w-full">
              <MapTileLayer />
              <MapZoomControl className="top-2 right-2 left-auto" />
              <MapSearchControl className="top-2 left-2" onPlaceSelect={handlePlaceSelect} />

              {!disabled && (
                <MapDrawControl onLayersChange={handleLayersChange}>
                  {showCoordinates && <MapDrawMarker />}
                  {showBoundaries && <MapDrawPolygon />}
                  <MapDrawEdit />
                  <MapDrawDelete />
                  <MapDrawUndo />
                </MapDrawControl>
              )}

              {/* Display existing data */}
              {coordinates && <MapMarker position={[coordinates.latitude, coordinates.longitude]} />}
              {boundaryPositions && (
                <MapPolygon positions={boundaryPositions} className="fill-primary/20 stroke-primary stroke-2" />
              )}
            </Map>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Use the drawing tools on the bottom left to add markers or draw boundaries. Search for a location using the
            search bar.
          </p>
        </TabsContent>

        <TabsContent value="manual" className="mt-4 space-y-4">
          {showCoordinates && (
            <div className="space-y-3">
              <Label className="flex items-center gap-2 text-sm font-medium">
                <MapPin className="h-4 w-4" />
                Coordinates
              </Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="latitude" className="text-xs text-muted-foreground">
                    Latitude (-90 to 90)
                  </Label>
                  <Input
                    id="latitude"
                    type="number"
                    step="any"
                    min="-90"
                    max="90"
                    placeholder="e.g., 25.2048"
                    value={latInput}
                    onChange={(e) => handleLatChange(e.target.value)}
                    disabled={disabled}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="longitude" className="text-xs text-muted-foreground">
                    Longitude (-180 to 180)
                  </Label>
                  <Input
                    id="longitude"
                    type="number"
                    step="any"
                    min="-180"
                    max="180"
                    placeholder="e.g., 55.2708"
                    value={lngInput}
                    onChange={(e) => handleLngChange(e.target.value)}
                    disabled={disabled}
                  />
                </div>
              </div>
            </div>
          )}

          {showBoundaries && (
            <div className="space-y-3">
              <Label className="flex items-center gap-2 text-sm font-medium">
                <Shapes className="h-4 w-4" />
                Boundaries (GeoJSON coordinates)
              </Label>
              <Textarea
                placeholder="[[[[55.0, 25.0], [55.5, 25.0], [55.5, 25.5], [55.0, 25.5], [55.0, 25.0]]]]"
                value={boundariesInput}
                onChange={(e) => handleBoundariesInputChange(e.target.value)}
                disabled={disabled}
                className="min-h-32 font-mono text-xs"
              />
              <p className="text-xs text-muted-foreground">
                Enter GeoJSON MultiPolygon coordinates format: [[[[lng, lat], ...]]]
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
