'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { ColorPicker } from '@/components/crud/color-picker';
import { EntitySheet } from '@/components/crud/entity-sheet';
import { FormField, FormFieldWrapper } from '@/components/crud/form-field';
import { IconPicker } from '@/components/ui/icon-picker';
import { createFeatureType, updateFeatureType } from '@/lib/actions/entities';
import { featureTypeCreateSchema, FeatureTypeFormData } from '@/lib/validations/entities';
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
  const iconValue = watch('icon');

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

        <FormFieldWrapper label="Color" description="Choose a color for this feature type">
          <ColorPicker value={colorValue} onChange={(color) => setValue('color', color)} />
        </FormFieldWrapper>
      </form>
    </EntitySheet>
  );
}
