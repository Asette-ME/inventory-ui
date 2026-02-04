'use client';

import { useState, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
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
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { swapCoordinates } from '@/lib/utils';
import { countryCreateSchema, CountryFormData } from '@/lib/validations/entities';
import { Country, CountryCreateInput, CountryUpdateInput, Coordinates } from '@/types/entities';
import { Loader2, MapPin, Shapes, Save, X } from 'lucide-react';
import type { LatLngExpression, FeatureGroup, LatLng } from 'leaflet';

interface CountrySheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  country: Country | null;
  onSave: (data: CountryCreateInput | CountryUpdateInput) => Promise<void>;
}

export function CountrySheet({ open, onOpenChange, country, onSave }: CountrySheetProps) {
  const isEditing = !!country;
  const [activeTab, setActiveTab] = useState<'map' | 'manual'>('map');
  const [coordinates, setCoordinates] = useState<Coordinates | null>(null);
  const [boundaries, setBoundaries] = useState<number[][][] | number[][][][] | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Manual input states
  const [latInput, setLatInput] = useState('');
  const [lngInput, setLngInput] = useState('');
  const [boundariesInput, setBoundariesInput] = useState('');

  const form = useForm<CountryFormData>({
    resolver: zodResolver(countryCreateSchema),
    defaultValues: {
      name: '',
      code: '',
      currency: '',
      phone_code: '',
    },
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = form;

  // Reset form when country changes
  useEffect(() => {
    if (country) {
      reset({
        name: country.name,
        code: country.code,
        currency: country.currency || '',
        phone_code: country.phone_code || '',
      });
      if (country.coordinates) {
        setCoordinates(country.coordinates);
        setLatInput(country.coordinates.latitude.toString());
        setLngInput(country.coordinates.longitude.toString());
      } else {
        setCoordinates(null);
        setLatInput('');
        setLngInput('');
      }
      if (country.boundaries?.coordinates) {
        setBoundaries(country.boundaries.coordinates);
        setBoundariesInput(JSON.stringify(country.boundaries.coordinates, null, 2));
      } else {
        setBoundaries(null);
        setBoundariesInput('');
      }
    } else {
      reset({
        name: '',
        code: '',
        currency: '',
        phone_code: '',
      });
      setCoordinates(null);
      setBoundaries(null);
      setLatInput('');
      setLngInput('');
      setBoundariesInput('');
    }
  }, [country, reset]);

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

  const handlePlaceSelect = (place: { lat: number; lng: number; name: string }) => {
    const newCoords = { latitude: place.lat, longitude: place.lng };
    setCoordinates(newCoords);
    setLatInput(place.lat.toString());
    setLngInput(place.lng.toString());
  };

  async function onSubmit(data: CountryFormData) {
    setIsSubmitting(true);
    try {
      const payload: CountryCreateInput = {
        name: data.name,
        code: data.code,
        currency: data.currency || null,
        phone_code: data.phone_code || null,
        coordinates: coordinates,
        boundaries: boundaries,
      };
      await onSave(payload);
      toast.success(`Country ${isEditing ? 'updated' : 'created'} successfully`);
      onOpenChange(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex w-full flex-col gap-0 overflow-hidden p-0 sm:max-w-xl max-sm:h-full">
        {/* Map Header */}
        <div className="relative h-48 sm:h-64 w-full shrink-0 bg-muted">
          <Map
            key={country?.id || 'new'}
            center={center}
            zoom={coordinates ? 6 : 2}
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
            <SheetTitle className="text-xl">{isEditing ? 'Edit Country' : 'Create Country'}</SheetTitle>
            <SheetDescription>
              {isEditing ? `Update ${country?.name}` : 'Add a new country to the system'}
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
                  placeholder="e.g., United Arab Emirates"
                  disabled={isSubmitting}
                  {...register('name')}
                  className={errors.name ? 'border-destructive' : ''}
                />
                {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
              </div>

              {/* Code Field */}
              <div className="space-y-2">
                <Label htmlFor="code">
                  Code <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="code"
                  placeholder="e.g., UAE, USA"
                  maxLength={3}
                  disabled={isSubmitting}
                  {...register('code')}
                  className={errors.code ? 'border-destructive' : ''}
                />
                {errors.code && <p className="text-sm text-destructive">{errors.code.message}</p>}
                <p className="text-xs text-muted-foreground">2-3 character country code</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Currency Field */}
                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Input
                    id="currency"
                    placeholder="e.g., AED, USD"
                    maxLength={3}
                    disabled={isSubmitting}
                    {...register('currency')}
                  />
                  <p className="text-xs text-muted-foreground">3-letter currency code</p>
                </div>

                {/* Phone Code Field */}
                <div className="space-y-2">
                  <Label htmlFor="phone_code">Phone Code</Label>
                  <Input
                    id="phone_code"
                    placeholder="e.g., +971"
                    maxLength={5}
                    disabled={isSubmitting}
                    {...register('phone_code')}
                  />
                  <p className="text-xs text-muted-foreground">Include + prefix</p>
                </div>
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
