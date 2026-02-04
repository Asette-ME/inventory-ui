'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { EntitySheet } from '@/components/crud/entity-sheet';
import { FormField, FormFieldWrapper } from '@/components/crud/form-field';
import { GeoEditor } from '@/components/crud/geo-editor';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { createCity, updateCity } from '@/lib/actions/entities';
import { cityCreateSchema, CityFormData } from '@/lib/validations/entities';
import { Coordinates } from '@/types/common';
import { City, Country } from '@/types/entities';

interface CitySheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  city: City | null;
  countries: Country[];
  onSuccess: () => void;
}

export function CitySheet({ open, onOpenChange, city, countries, onSuccess }: CitySheetProps) {
  const isEditing = !!city;

  const form = useForm<CityFormData>({
    resolver: zodResolver(cityCreateSchema),
    defaultValues: {
      name: '',
      country_id: '',
      timezone: '',
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

  const selectedCountryId = watch('country_id');
  const coordinatesValue = watch('coordinates') as Coordinates | null;
  const boundariesValue = watch('boundaries');

  useEffect(() => {
    if (city) {
      reset({
        name: city.name,
        country_id: city.country_id,
        timezone: city.timezone || '',
        coordinates: city.coordinates || null,
        boundaries: city.boundaries?.coordinates || null,
      });
    } else {
      reset({
        name: '',
        country_id: '',
        timezone: '',
        coordinates: null,
        boundaries: null,
      });
    }
  }, [city, reset]);

  async function onSubmit(data: CityFormData) {
    try {
      const payload = {
        name: data.name,
        country_id: data.country_id,
        timezone: data.timezone || null,
        coordinates: data.coordinates,
        boundaries: data.boundaries,
      };

      if (isEditing) {
        await updateCity(city.id, payload);
        toast.success('City updated successfully');
      } else {
        await createCity(payload);
        toast.success('City created successfully');
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
      title={isEditing ? 'Edit City' : 'Create City'}
      description={isEditing ? `Update "${city.name}"` : 'Add a new city to the system'}
      isSubmitting={isSubmitting}
      onSubmit={handleSubmit(onSubmit)}
      submitLabel={isEditing ? 'Update City' : 'Create City'}
    >
      <form className="space-y-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField
            control={control}
            name="name"
            label="Name"
            placeholder="e.g., Dubai, New York"
            description="Name of the city"
            required
          />

          <FormFieldWrapper label="Country" required error={errors.country_id?.message}>
            <Select
              value={selectedCountryId}
              onValueChange={(value) => setValue('country_id', value, { shouldValidate: true })}
              disabled={isSubmitting}
            >
              <SelectTrigger className={errors.country_id ? 'border-destructive' : ''}>
                <SelectValue placeholder="Select a country" />
              </SelectTrigger>
              <SelectContent>
                {countries.map((country) => (
                  <SelectItem key={country.id} value={country.id}>
                    {country.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormFieldWrapper>

          <FormField
            control={control}
            name="timezone"
            label="Timezone"
            placeholder="e.g., Asia/Dubai"
            description="IANA timezone identifier"
            className="sm:col-span-2"
          />
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
