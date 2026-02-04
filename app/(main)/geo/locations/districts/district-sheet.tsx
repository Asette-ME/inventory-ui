'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { EntitySheet } from '@/components/crud/entity-sheet';
import { FormField, FormFieldWrapper } from '@/components/crud/form-field';
import { GeoEditor } from '@/components/crud/geo-editor';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { createDistrict, getCities, updateDistrict } from '@/lib/actions/entities';
import { districtCreateSchema, DistrictFormData } from '@/lib/validations/entities';
import { Coordinates } from '@/types/common';
import { City, District } from '@/types/entities';

interface DistrictSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  district: District | null;
  onSuccess: () => void;
}

export function DistrictSheet({ open, onOpenChange, district, onSuccess }: DistrictSheetProps) {
  const isEditing = !!district;
  const [cities, setCities] = useState<City[]>([]);
  const [isLoadingCities, setIsLoadingCities] = useState(false);

  const form = useForm<DistrictFormData>({
    resolver: zodResolver(districtCreateSchema),
    defaultValues: {
      name: '',
      city_id: '',
      coordinates: null,
      boundaries: null,
    },
  });

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { isSubmitting, errors },
  } = form;

  const selectedCityId = watch('city_id');
  const coordinatesValue = watch('coordinates') as Coordinates | null;
  const boundariesValue = watch('boundaries');

  // Fetch cities when sheet opens
  useEffect(() => {
    async function loadCities() {
      setIsLoadingCities(true);
      try {
        const response = await getCities({ limit: 100 });
        setCities(response.data);
      } catch {
        toast.error('Failed to load cities');
      } finally {
        setIsLoadingCities(false);
      }
    }
    if (open) {
      void loadCities();
    }
  }, [open]);

  useEffect(() => {
    if (district) {
      reset({
        name: district.name,
        city_id: district.city_id,
        coordinates: district.coordinates || null,
        boundaries: district.boundaries?.coordinates || null,
      });
    } else {
      reset({
        name: '',
        city_id: '',
        coordinates: null,
        boundaries: null,
      });
    }
  }, [district, reset]);

  async function onSubmit(data: DistrictFormData) {
    try {
      const payload = {
        name: data.name,
        city_id: data.city_id,
        coordinates: data.coordinates,
        boundaries: data.boundaries,
      };

      if (isEditing) {
        await updateDistrict(district.id, payload);
        toast.success('District updated successfully');
      } else {
        await createDistrict(payload);
        toast.success('District created successfully');
      }
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'An error occurred');
    }
  }

  return (
    <EntitySheet
      open={open}
      onOpenChange={onOpenChange}
      title={isEditing ? 'Edit District' : 'Create District'}
      description={isEditing ? `Update "${district.name}"` : 'Add a new district to the system'}
      isSubmitting={isSubmitting}
      onSubmit={handleSubmit(onSubmit)}
      submitLabel={isEditing ? 'Update District' : 'Create District'}
    >
      <form className="space-y-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField
            control={control}
            name="name"
            label="Name"
            placeholder="e.g., Downtown, Marina District"
            description="Name of the district"
            required
          />

          <FormFieldWrapper label="City" required error={errors.city_id?.message}>
            <Select
              value={selectedCityId}
              onValueChange={(value) => setValue('city_id', value, { shouldValidate: true })}
              disabled={isSubmitting || isLoadingCities}
            >
              <SelectTrigger className={errors.city_id ? 'border-destructive' : ''}>
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
          </FormFieldWrapper>
        </div>

        <FormFieldWrapper label="Location" description="Set the geographic location and boundaries">
          <GeoEditor
            coordinates={coordinatesValue}
            boundaries={boundariesValue ? { type: 'MultiPolygon', coordinates: boundariesValue } : null}
            onCoordinatesChange={(coords) => setValue('coordinates', coords)}
            onBoundariesChange={(bounds) => setValue('boundaries', bounds)}
          />
        </FormFieldWrapper>
      </form>
    </EntitySheet>
  );
}
