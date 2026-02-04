'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import type { LatLngExpression, FeatureGroup, LatLng } from 'leaflet';
import { Loader2, MapPin, Shapes, Save, X } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Map,
  MapTileLayer,
  MapZoomControl,
  MapMarker,
  MapPolygon,
  MapDrawControl,
  MapDrawMarker,
  MapDrawPolygon,
  MapDrawEdit,
  MapDrawDelete,
  MapDrawUndo,
  MapSearchControl,
} from '@/components/ui/map';
import type { PlaceFeature } from '@/components/ui/place-autocomplete';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { getCities } from '@/lib/actions/entities';
import { swapCoordinates } from '@/lib/utils';
import { districtCreateSchema, DistrictFormData } from '@/lib/validations/entities';
import { Coordinates } from '@/types/common';
import { District, DistrictCreateInput, DistrictUpdateInput, City } from '@/types/entities';

interface DistrictSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  district: District | null;
  onSave: (data: DistrictCreateInput | DistrictUpdateInput) => Promise<void>;
}

export function DistrictSheet({ open, onOpenChange, district, onSave }: DistrictSheetProps) {
  const isEditing = !!district;
  const [activeTab, setActiveTab] = useState<'map' | 'manual'>('map');
  const [coordinates, setCoordinates] = useState<Coordinates | null>(null);
  const [boundaries, setBoundaries] = useState<number[][][] | number[][][][] | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cities, setCities] = useState<City[]>([]);
  const [isLoadingCities, setIsLoadingCities] = useState(true);

  // Manual input states
  const [latInput, setLatInput] = useState('');
  const [lngInput, setLngInput] = useState('');
  const [boundariesInput, setBoundariesInput] = useState('');

  const form = useForm<DistrictFormData>({
    resolver: zodResolver(districtCreateSchema),
    defaultValues: {
      name: '',
      city_id: '',
    },
  });

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = form;

  // Fetch cities for dropdown
  useEffect(() => {
    async function loadCities() {
      setIsLoadingCities(true);
      try {
        const response = await getCities({ limit: 100 });
        setCities(response.data);
      } catch (error) {
        console.error('Failed to load cities:', error);
        toast.error('Failed to load cities');
      } finally {
        setIsLoadingCities(false);
      }
    }
    if (open) {
      loadCities();
    }
  }, [open]);

  // Reset form when district changes
  useEffect(() => {
    if (district) {
      reset({
        name: district.name,
        city_id: district.city_id,
      });
      if (district.coordinates) {
        setCoordinates(district.coordinates);
        setLatInput(district.coordinates.latitude.toString());
        setLngInput(district.coordinates.longitude.toString());
      } else {
        setCoordinates(null);
        setLatInput('');
        setLngInput('');
      }
      if (district.boundaries?.coordinates) {
        setBoundaries(district.boundaries.coordinates);
        setBoundariesInput(JSON.stringify(district.boundaries.coordinates, null, 2));
      } else {
        setBoundaries(null);
        setBoundariesInput('');
      }
    } else {
      reset({
        name: '',
        city_id: '',
      });
      setCoordinates(null);
      setBoundaries(null);
      setLatInput('');
      setLngInput('');
      setBoundariesInput('');
    }
  }, [district, reset]);

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

  async function onSubmit(data: DistrictFormData) {
    setIsSubmitting(true);
    try {
      const payload: DistrictCreateInput = {
        name: data.name,
        city_id: data.city_id,
        coordinates: coordinates,
        boundaries: boundaries,
      };
      await onSave(payload);
      toast.success(`District ${isEditing ? 'updated' : 'created'} successfully`);
      onOpenChange(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex w-full flex-col gap-0 overflow-hidden p-0 sm:max-w-xl">
        {/* Map Header */}
        <div className="relative h-64 w-full shrink-0 bg-muted">
          <Map
            key={district?.id || 'new'}
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
          <SheetHeader className="shrink-0 border-b p-6">
            <SheetTitle className="text-xl">{isEditing ? 'Edit District' : 'Create District'}</SheetTitle>
            <SheetDescription>
              {isEditing ? `Update ${district?.name}` : 'Add a new district to the system'}
            </SheetDescription>
          </SheetHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-1 flex-col overflow-hidden">
            <div className="flex-1 space-y-6 overflow-y-auto p-6">
              {/* Name Field */}
              <div className="space-y-2">
                <Label htmlFor="name">
                  Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  placeholder="e.g., Downtown, Marina District"
                  disabled={isSubmitting}
                  {...register('name')}
                  className={errors.name ? 'border-destructive' : ''}
                />
                {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
              </div>

              {/* City Field */}
              <div className="space-y-2">
                <Label htmlFor="city_id">
                  City <span className="text-destructive">*</span>
                </Label>
                <Controller
                  name="city_id"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={isSubmitting || isLoadingCities}
                    >
                      <SelectTrigger className={`w-full ${errors.city_id ? 'border-destructive' : ''}`}>
                        <SelectValue placeholder={isLoadingCities ? 'Loading cities...' : 'Select a city'} />
                      </SelectTrigger>
                      <SelectContent>
                        {cities.map((city) => (
                          <SelectItem key={city.id} value={city.id}>
                            {city.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.city_id && <p className="text-sm text-destructive">{errors.city_id.message}</p>}
              </div>

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
