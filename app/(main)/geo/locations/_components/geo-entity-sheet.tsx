'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import type { FeatureGroup, LatLng, LatLngExpression } from 'leaflet';
import { Loader2, MapPin, Save, Shapes, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import type { FieldValues } from 'react-hook-form';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
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
import type { PlaceFeature } from '@/components/ui/place-autocomplete';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { swapCoordinates } from '@/lib/utils';
import { Boundaries, Coordinates } from '@/types/common';

interface GeoEntitySheetProps<
  T extends { id: string; name: string; coordinates?: Coordinates | null; boundaries?: Boundaries | null },
> {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entity: T | null;
  entityName: string;
  schema: z.ZodType<FieldValues>;
  onSave: (data: any) => Promise<void>;
  renderExtraFields?: (control: any, isDisabled: boolean) => React.ReactNode;
  extraDefaultValues?: Record<string, any>;
}

export function GeoEntitySheet<
  T extends { id: string; name: string; coordinates?: Coordinates | null; boundaries?: Boundaries | null },
>({
  open,
  onOpenChange,
  entity,
  entityName,
  schema,
  onSave,
  renderExtraFields,
  extraDefaultValues = {},
}: GeoEntitySheetProps<T>) {
  const isEditing = !!entity;
  const [activeTab, setActiveTab] = useState<'map' | 'manual'>('map');
  const [coordinates, setCoordinates] = useState<Coordinates | null>(null);
  const [boundaries, setBoundaries] = useState<number[][][] | number[][][][] | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Manual input states
  const [latInput, setLatInput] = useState('');
  const [lngInput, setLngInput] = useState('');
  const [boundariesInput, setBoundariesInput] = useState('');

  const form = useForm({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(schema as any),
    defaultValues: {
      name: '',
      ...extraDefaultValues,
    },
  });

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = form;

  // Reset form when entity changes
  useEffect(() => {
    if (entity) {
      const entityWithCoords = entity as any;
      reset({
        name: entity.name,
        ...(entityWithCoords.code && { code: entityWithCoords.code }),
        ...(entityWithCoords.currency && { currency: entityWithCoords.currency }),
        ...(entityWithCoords.phone_code && { phone_code: entityWithCoords.phone_code }),
        ...(entityWithCoords.timezone && { timezone: entityWithCoords.timezone }),
        ...(entityWithCoords.country_id && { country_id: entityWithCoords.country_id }),
        ...(entityWithCoords.city_id && { city_id: entityWithCoords.city_id }),
      });
      if (entity.coordinates) {
        setCoordinates(entity.coordinates);
        setLatInput(entity.coordinates.latitude.toString());
        setLngInput(entity.coordinates.longitude.toString());
      } else {
        setCoordinates(null);
        setLatInput('');
        setLngInput('');
      }
      if (entity.boundaries?.coordinates) {
        setBoundaries(entity.boundaries.coordinates);
        setBoundariesInput(JSON.stringify(entity.boundaries.coordinates, null, 2));
      } else {
        setBoundaries(null);
        setBoundariesInput('');
      }
    } else {
      reset({ name: '', ...extraDefaultValues });
      setCoordinates(null);
      setBoundaries(null);
      setLatInput('');
      setLngInput('');
      setBoundariesInput('');
    }
  }, [entity, reset, extraDefaultValues]);

  const center: LatLngExpression = coordinates ? [coordinates.latitude, coordinates.longitude] : [25.2048, 55.2708];

  const boundaryPositions = useMemo(() => {
    if (!boundaries) return null;
    return swapCoordinates(boundaries);
  }, [boundaries]);

  const handleLatChange = (value: string) => {
    setLatInput(value);
    const lat = parseFloat(value);
    if (!isNaN(lat) && lat >= -90 && lat <= 90) {
      const lng = coordinates?.longitude ?? 0;
      setCoordinates({ latitude: lat, longitude: lng });
    }
  };

  const handleLngChange = (value: string) => {
    setLngInput(value);
    const lng = parseFloat(value);
    if (!isNaN(lng) && lng >= -180 && lng <= 180) {
      const lat = coordinates?.latitude ?? 0;
      setCoordinates({ latitude: lat, longitude: lng });
    }
  };

  const handleBoundariesInputChange = (value: string) => {
    setBoundariesInput(value);
    try {
      if (value.trim() === '') {
        setBoundaries(null);
        return;
      }
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) {
        setBoundaries(parsed);
      }
    } catch {
      // Invalid JSON, ignore
    }
  };

  const handleLayersChange = (featureGroup: FeatureGroup) => {
    const layers = featureGroup.getLayers();
    layers.forEach((layer: any) => {
      if (layer.getLatLng) {
        const latlng: LatLng = layer.getLatLng();
        const newCoords = { latitude: latlng.lat, longitude: latlng.lng };
        setCoordinates(newCoords);
        setLatInput(latlng.lat.toString());
        setLngInput(latlng.lng.toString());
      }
      if (layer.getLatLngs) {
        const latlngs = layer.getLatLngs();
        const convertToGeoJson = (coords: any[]): any[] => {
          if (Array.isArray(coords[0]) && typeof coords[0][0] !== 'number') {
            return coords.map(convertToGeoJson);
          }
          return coords.map((ll: LatLng) => [ll.lng, ll.lat]);
        };
        const geoJsonCoords = convertToGeoJson(latlngs);
        setBoundaries([geoJsonCoords]);
        setBoundariesInput(JSON.stringify([geoJsonCoords], null, 2));
      }
    });
  };

  const handlePlaceSelect = (feature: PlaceFeature) => {
    const [lng, lat] = feature.geometry.coordinates;
    const newCoords = { latitude: lat, longitude: lng };
    setCoordinates(newCoords);
    setLatInput(lat.toString());
    setLngInput(lng.toString());
  };

  async function onSubmit(data: any) {
    setIsSubmitting(true);
    try {
      const payload = {
        ...data,
        coordinates: coordinates,
        boundaries: boundaries,
      };
      await onSave(payload);
      toast.success(`${entityName} ${isEditing ? 'updated' : 'created'} successfully`);
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right">
        <SheetHeader className="shrink-0 border-b p-6">
          <SheetTitle className="text-xl">{isEditing ? `Edit ${entityName}` : `Create ${entityName}`}</SheetTitle>
          <SheetDescription>
            {isEditing ? `Update ${entity?.name}` : `Add a new ${entityName.toLowerCase()}`}
          </SheetDescription>
        </SheetHeader>

        {/* Map Header */}
        <div className="relative h-50 w-full shrink-0 bg-muted">
          <Map
            key={entity?.id || 'new'}
            center={center}
            zoom={coordinates ? 10 : 4}
            bounds={boundaryPositions}
            className="h-full w-full"
          >
            <MapTileLayer />
            <MapZoomControl className="top-2 right-2 left-auto" />
            <MapSearchControl className="top-2 left-2" onPlaceSelect={handlePlaceSelect} />

            <MapDrawControl onLayersChange={handleLayersChange}>
              <MapDrawMarker />
              <MapDrawPolygon />
              <MapDrawEdit />
              <MapDrawDelete />
              <MapDrawUndo />
            </MapDrawControl>

            {coordinates && <MapMarker position={[coordinates.latitude, coordinates.longitude]} />}
            {boundaryPositions && (
              <MapPolygon positions={boundaryPositions} className="fill-primary/20 stroke-primary stroke-2" />
            )}
          </Map>
        </div>

        {/* Form Content */}
        <div className="flex flex-1 flex-col overflow-hidden">
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-1 flex-col overflow-hidden">
            <div className="flex-1 space-y-6 overflow-y-auto p-6">
              {/* Name Field */}
              <div className="space-y-2">
                <Label htmlFor="name">
                  Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  placeholder={`Enter ${entityName.toLowerCase()} name`}
                  disabled={isSubmitting}
                  {...register('name')}
                  className={errors.name ? 'border-destructive' : ''}
                />
                {errors.name && <p className="text-sm text-destructive">{String(errors.name.message)}</p>}
              </div>

              {/* Extra fields (code, currency, etc.) */}
              {renderExtraFields?.(control, isSubmitting)}

              <Separator />

              {/* Geo Input Tabs */}
              <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'map' | 'manual')}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="map">
                    <MapPin className="mr-2 h-4 w-4" />
                    From Map
                  </TabsTrigger>
                  <TabsTrigger value="manual">
                    <Shapes className="mr-2 h-4 w-4" />
                    Manual Input
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="map" className="mt-4">
                  <div className="rounded-lg border bg-muted/30 p-4">
                    <p className="text-sm text-muted-foreground">
                      Use the map above to place markers for coordinates and draw polygons for boundaries. Search for a
                      location using the search bar on the map.
                    </p>
                    {coordinates && (
                      <div className="mt-3 flex items-center gap-4 text-sm">
                        <span className="font-medium">Current coordinates:</span>
                        <span className="font-mono">
                          {coordinates.latitude.toFixed(6)}, {coordinates.longitude.toFixed(6)}
                        </span>
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="manual" className="mt-4 space-y-4">
                  <div className="space-y-3">
                    <Label className="flex items-center gap-2 text-sm font-medium">
                      <MapPin className="h-4 w-4" />
                      Coordinates
                    </Label>
                    <div className="grid grid-cols-2 gap-3">
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
                          disabled={isSubmitting}
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
                          disabled={isSubmitting}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label className="flex items-center gap-2 text-sm font-medium">
                      <Shapes className="h-4 w-4" />
                      Boundaries (GeoJSON)
                    </Label>
                    <Textarea
                      placeholder="[[[[55.0, 25.0], [55.5, 25.0], [55.5, 25.5], [55.0, 25.5], [55.0, 25.0]]]]"
                      value={boundariesInput}
                      onChange={(e) => handleBoundariesInputChange(e.target.value)}
                      disabled={isSubmitting}
                      className="min-h-32 font-mono text-xs"
                    />
                    <p className="text-xs text-muted-foreground">
                      Enter GeoJSON MultiPolygon coordinates: [[[[lng, lat], ...]]]
                    </p>
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            {/* Footer */}
            <div className="shrink-0 border-t bg-muted/30 p-4">
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
                  <X className="mr-2 h-4 w-4" />
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                  {isEditing ? 'Update' : 'Create'}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </SheetContent>
    </Sheet>
  );
}
