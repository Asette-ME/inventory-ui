'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { EntitySheet } from '@/components/crud/entity-sheet';
import { FormField, FormFieldWrapper } from '@/components/crud/form-field';
import { GeoEditor } from '@/components/crud/geo-editor';
import { createArea, updateArea } from '@/lib/actions/entities';
import { areaCreateSchema, AreaFormData } from '@/lib/validations/entities';
import { Coordinates } from '@/types/common';
import { Area } from '@/types/entities';

interface AreaSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  area: Area | null;
  onSuccess: () => void;
}

export function AreaSheet({ open, onOpenChange, area, onSuccess }: AreaSheetProps) {
  const isEditing = !!area;

  const form = useForm<AreaFormData>({
    resolver: zodResolver(areaCreateSchema),
    defaultValues: {
      name: '',
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
    if (area) {
      reset({
        name: area.name,
        coordinates: area.coordinates || null,
        boundaries: area.boundaries?.coordinates || null,
      });
    } else {
      reset({
        name: '',
        coordinates: null,
        boundaries: null,
      });
    }
  }, [area, reset]);

  async function onSubmit(data: AreaFormData) {
    try {
      const payload = {
        name: data.name,
        coordinates: data.coordinates,
        boundaries: data.boundaries,
      };

      if (isEditing) {
        await updateArea(area.id, payload);
        toast.success('Area updated successfully');
      } else {
        await createArea(payload);
        toast.success('Area created successfully');
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
      title={isEditing ? 'Edit Area' : 'Create Area'}
      description={isEditing ? `Update "${area.name}"` : 'Add a new area to the system'}
      isSubmitting={isSubmitting}
      onSubmit={handleSubmit(onSubmit)}
      submitLabel={isEditing ? 'Update Area' : 'Create Area'}
    >
      <form className="space-y-6">
        <FormField
          control={control}
          name="name"
          label="Name"
          placeholder="e.g., Downtown Dubai"
          description="Name of the area"
          required
        />

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
