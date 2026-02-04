'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { ColorPicker } from '@/components/crud/color-picker';
import { EntitySheet } from '@/components/crud/entity-sheet';
import { FormField, FormFieldWrapper } from '@/components/crud/form-field';
import { GeoEditor } from '@/components/crud/geo-editor';
import { IconPicker } from '@/components/ui/icon-picker';
import { Textarea } from '@/components/ui/textarea';
import { createAmenity, updateAmenity } from '@/lib/actions/entities';
import { amenityCreateSchema, AmenityFormData } from '@/lib/validations/entities';
import { Coordinates } from '@/types/common';
import { Amenity } from '@/types/entities';

interface AmenitySheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  amenity: Amenity | null;
  onSuccess: () => void;
}

export function AmenitySheet({ open, onOpenChange, amenity, onSuccess }: AmenitySheetProps) {
  const isEditing = !!amenity;

  const form = useForm<AmenityFormData>({
    resolver: zodResolver(amenityCreateSchema),
    defaultValues: {
      name: '',
      description: null,
      icon: null,
      image: null,
      color: null,
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
    register,
  } = form;
  const colorValue = watch('color');
  const iconValue = watch('icon');
  const coordinatesValue = watch('coordinates') as Coordinates | null;
  const boundariesValue = watch('boundaries');

  useEffect(() => {
    if (amenity) {
      reset({
        name: amenity.name,
        description: amenity.description,
        icon: amenity.icon,
        image: amenity.image,
        color: amenity.color,
        coordinates: amenity.coordinates,
        boundaries: amenity.boundaries?.coordinates || null,
      });
    } else {
      reset({
        name: '',
        description: null,
        icon: null,
        image: null,
        color: null,
        coordinates: null,
        boundaries: null,
      });
    }
  }, [amenity, reset]);

  async function onSubmit(data: AmenityFormData) {
    try {
      if (isEditing) {
        await updateAmenity(amenity.id, data);
        toast.success('Amenity updated successfully');
      } else {
        await createAmenity(data);
        toast.success('Amenity created successfully');
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
      title={isEditing ? 'Edit Amenity' : 'Create Amenity'}
      description={isEditing ? `Update the "${amenity.name}" amenity` : 'Add a new amenity to the system'}
      isSubmitting={isSubmitting}
      onSubmit={handleSubmit(onSubmit)}
      submitLabel={isEditing ? 'Update Amenity' : 'Create Amenity'}
    >
      <form className="space-y-6">
        <FormField
          control={control}
          name="name"
          label="Name"
          placeholder="e.g., Swimming Pool, Gym, Parking"
          required
        />

        <FormFieldWrapper label="Description" description="A brief description of this amenity">
          <Textarea {...register('description')} placeholder="Enter a description..." className="min-h-24" />
          {errors.description && <p className="text-sm text-destructive">{errors.description.message}</p>}
        </FormFieldWrapper>

        <FormFieldWrapper label="Icon" description="Choose a Lucide icon (optional)">
          <IconPicker
            value={iconValue}
            onChange={(icon) => setValue('icon', icon)}
            placeholder="Select an icon..."
            disabled={isSubmitting}
          />
        </FormFieldWrapper>

        <FormField
          control={control}
          name="image"
          label="Image URL"
          placeholder="https://example.com/icon.png"
          description="URL to an image (optional)"
        />

        <FormFieldWrapper label="Color" description="Choose a color for this amenity">
          <ColorPicker value={colorValue} onChange={(color) => setValue('color', color)} />
        </FormFieldWrapper>

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
