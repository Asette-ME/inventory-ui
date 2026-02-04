'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';

import { EntitySheet } from '@/components/crud/entity-sheet';
import { FormField, FormFieldWrapper } from '@/components/crud/form-field';
import { ColorPicker } from '@/components/crud/color-picker';
import { featureTypeCreateSchema, FeatureTypeFormData } from '@/lib/validations/entities';
import { createFeatureType, updateFeatureType } from '@/lib/actions/entities';
import { FeatureType } from '@/types/entities';

interface FeatureTypeSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  featureType: FeatureType | null;
  onSuccess: () => void;
}

export function FeatureTypeSheet({ open, onOpenChange, featureType, onSuccess }: FeatureTypeSheetProps) {
  const isEditing = !!featureType;

  const form = useForm<FeatureTypeFormData>({
    resolver: zodResolver(featureTypeCreateSchema),
    defaultValues: {
      name: '',
      icon: null,
      image: null,
      color: null,
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
  const colorValue = watch('color');

  useEffect(() => {
    if (featureType) {
      reset({
        name: featureType.name,
        icon: featureType.icon,
        image: featureType.image,
        color: featureType.color,
      });
    } else {
      reset({
        name: '',
        icon: null,
        image: null,
        color: null,
      });
    }
  }, [featureType, reset]);

  async function onSubmit(data: FeatureTypeFormData) {
    try {
      if (isEditing) {
        await updateFeatureType(featureType.id, data);
        toast.success('Feature type updated successfully');
      } else {
        await createFeatureType(data);
        toast.success('Feature type created successfully');
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
      title={isEditing ? 'Edit Feature Type' : 'Create Feature Type'}
      description={isEditing ? `Update the "${featureType.name}" feature type` : 'Add a new feature type to the system'}
      isSubmitting={isSubmitting}
      onSubmit={handleSubmit(onSubmit)}
      submitLabel={isEditing ? 'Update Feature Type' : 'Create Feature Type'}
    >
      <form className="space-y-6">
        <FormField
          control={control}
          name="name"
          label="Name"
          placeholder="e.g., Residential, Commercial, Industrial"
          required
        />

        <FormField
          control={control}
          name="icon"
          label="Icon"
          placeholder="e.g., home, building, factory"
          description="Lucide icon name (optional)"
        />

        <FormField
          control={control}
          name="image"
          label="Image URL"
          placeholder="https://example.com/icon.png"
          description="URL to an image (optional)"
        />

        <FormFieldWrapper label="Color" description="Choose a color for this feature type">
          <ColorPicker value={colorValue} onChange={(color) => setValue('color', color)} />
        </FormFieldWrapper>
      </form>
    </EntitySheet>
  );
}
