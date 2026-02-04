'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { EntitySheet } from '@/components/crud/entity-sheet';
import { FormField, FormFieldWrapper } from '@/components/crud/form-field';
import { GeoEditor } from '@/components/crud/geo-editor';
import { createCountry, updateCountry } from '@/lib/actions/entities';
import { countryCreateSchema, CountryFormData } from '@/lib/validations/entities';
import { Coordinates } from '@/types/common';
import { Country } from '@/types/entities';

interface CountrySheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  country: Country | null;
  onSuccess: () => void;
}

export function CountrySheet({ open, onOpenChange, country, onSuccess }: CountrySheetProps) {
  const isEditing = !!country;

  const form = useForm<CountryFormData>({
    resolver: zodResolver(countryCreateSchema),
    defaultValues: {
      name: '',
      code: '',
      currency: '',
      phone_code: '',
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
    formState: { isSubmitting },
  } = form;

  const coordinatesValue = watch('coordinates') as Coordinates | null;
  const boundariesValue = watch('boundaries');

  useEffect(() => {
    if (country) {
      reset({
        name: country.name,
        code: country.code,
        currency: country.currency || '',
        phone_code: country.phone_code || '',
        coordinates: country.coordinates || null,
        boundaries: country.boundaries?.coordinates || null,
      });
    } else {
      reset({
        name: '',
        code: '',
        currency: '',
        phone_code: '',
        coordinates: null,
        boundaries: null,
      });
    }
  }, [country, reset]);

  async function onSubmit(data: CountryFormData) {
    try {
      const payload = {
        name: data.name,
        code: data.code,
        currency: data.currency || null,
        phone_code: data.phone_code || null,
        coordinates: data.coordinates,
        boundaries: data.boundaries,
      };

      if (isEditing) {
        await updateCountry(country.id, payload);
        toast.success('Country updated successfully');
      } else {
        await createCountry(payload);
        toast.success('Country created successfully');
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
      title={isEditing ? 'Edit Country' : 'Create Country'}
      description={isEditing ? `Update "${country.name}"` : 'Add a new country to the system'}
      isSubmitting={isSubmitting}
      onSubmit={handleSubmit(onSubmit)}
      submitLabel={isEditing ? 'Update Country' : 'Create Country'}
    >
      <form className="space-y-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField
            control={control}
            name="name"
            label="Name"
            placeholder="e.g., United Arab Emirates"
            required
            description="Full name of the country"
          />

          <FormField
            control={control}
            name="code"
            label="Code"
            placeholder="e.g., UAE, USA"
            description="3 character country code"
            required
          />

          <FormField
            control={control}
            name="currency"
            label="Currency"
            placeholder="e.g., AED, USD"
            description="3-letter currency code"
          />

          <FormField
            control={control}
            name="phone_code"
            label="Phone Code"
            placeholder="e.g., 971"
            description="Do not include + prefix"
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
