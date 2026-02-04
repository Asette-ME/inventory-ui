'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { ColorPicker } from '@/components/crud/color-picker';
import { EntitySheet } from '@/components/crud/entity-sheet';
import { FormField, FormFieldWrapper } from '@/components/crud/form-field';
import { GeoEditor } from '@/components/crud/geo-editor';
import { Textarea } from '@/components/ui/textarea';
import { createAttraction, updateAttraction } from '@/lib/actions/entities';
import { attractionCreateSchema, AttractionFormData } from '@/lib/validations/entities';
import { Coordinates, Boundaries } from '@/types/common';
import { Attraction } from '@/types/entities';

interface AttractionSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  attraction: Attraction | null;
  onSuccess: () => void;
}

export function AttractionSheet({ open, onOpenChange, attraction, onSuccess }: AttractionSheetProps) {
  const isEditing = !!attraction;

  const [coordinates, setCoordinates] = useState<Coordinates | null>(null);
  const [boundaries, setBoundaries] = useState<Boundaries | null>(null);

  const form = useForm<AttractionFormData>({
    resolver: zodResolver(attractionCreateSchema),
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
  } = form;
  const colorValue = watch('color');

  useEffect(() => {
    if (attraction) {
      reset({
        name: attraction.name,
        description: attraction.description,
        icon: attraction.icon,
        image: attraction.image,
        color: attraction.color,
        coordinates: attraction.coordinates,
        boundaries: attraction.boundaries?.coordinates ?? null,
      });
      setCoordinates(attraction.coordinates);
      setBoundaries(attraction.boundaries);
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
      setCoordinates(null);
      setBoundaries(null);
    }
  }, [attraction, reset]);

  function handleCoordinatesChange(coords: Coordinates | null) {
    setCoordinates(coords);
    setValue('coordinates', coords);
  }

  function handleBoundariesChange(boundaryCoords: number[][][] | number[][][][] | null) {
    if (boundaryCoords) {
      setBoundaries({ type: 'MultiPolygon', coordinates: boundaryCoords as number[][][][] });
    } else {
      setBoundaries(null);
    }
    setValue('boundaries', boundaryCoords);
  }

  async function onSubmit(data: AttractionFormData) {
    try {
      if (isEditing) {
        await updateAttraction(attraction.id, data);
        toast.success('Attraction updated successfully');
      } else {
        await createAttraction(data);
        toast.success('Attraction created successfully');
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
      title={isEditing ? 'Edit Attraction' : 'Create Attraction'}
      description={
        isEditing ? `Update the "${attraction.name}" attraction` : 'Add a new tourist attraction or point of interest'
      }
      isSubmitting={isSubmitting}
      onSubmit={handleSubmit(onSubmit)}
      submitLabel={isEditing ? 'Update Attraction' : 'Create Attraction'}
    >
      <form className="space-y-6">
        <FormField control={control} name="name" label="Name" placeholder="e.g., Eiffel Tower, Central Park" required />

        <FormFieldWrapper label="Description" description="A brief description of the attraction">
          <Textarea
            placeholder="Describe the attraction..."
            value={watch('description') ?? ''}
            onChange={(e) => setValue('description', e.target.value || null)}
            className="min-h-24"
          />
          {errors.description && <p className="text-sm text-destructive">{errors.description.message}</p>}
        </FormFieldWrapper>

        <FormField
          control={control}
          name="icon"
          label="Icon"
          placeholder="e.g., landmark, castle, tree"
          description="Lucide icon name (optional)"
        />

        <FormField
          control={control}
          name="image"
          label="Image URL"
          placeholder="https://example.com/attraction.png"
          description="URL to an image (optional)"
        />

        <FormFieldWrapper label="Color" description="Choose a color for this attraction">
          <ColorPicker value={colorValue} onChange={(color) => setValue('color', color)} />
        </FormFieldWrapper>

        <FormFieldWrapper label="Location" description="Set the coordinates and boundaries for this attraction">
          <GeoEditor
            coordinates={coordinates}
            boundaries={boundaries}
            onCoordinatesChange={handleCoordinatesChange}
            onBoundariesChange={handleBoundariesChange}
          />
        </FormFieldWrapper>
      </form>
    </EntitySheet>
  );
}
