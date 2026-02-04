'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { ColorPicker } from '@/components/crud/color-picker';
import { EntitySheet } from '@/components/crud/entity-sheet';
import { FormField, FormFieldWrapper } from '@/components/crud/form-field';
import { IconPicker } from '@/components/ui/icon-picker';
import { createStructureType, updateStructureType } from '@/lib/actions/entities';
import { structureTypeCreateSchema, StructureTypeFormData } from '@/lib/validations/entities';
import { StructureType } from '@/types/entities';

interface StructureTypeSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  structureType: StructureType | null;
  onSuccess: () => void;
}

export function StructureTypeSheet({ open, onOpenChange, structureType, onSuccess }: StructureTypeSheetProps) {
  const isEditing = !!structureType;

  const form = useForm<StructureTypeFormData>({
    resolver: zodResolver(structureTypeCreateSchema),
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
    if (structureType) {
      reset({
        name: structureType.name,
        icon: structureType.icon,
        image: structureType.image,
        color: structureType.color,
      });
    } else {
      reset({
        name: '',
        icon: null,
        image: null,
        color: null,
      });
    }
  }, [structureType, reset]);

  async function onSubmit(data: StructureTypeFormData) {
    try {
      if (isEditing) {
        await updateStructureType(structureType.id, data);
        toast.success('Structure type updated successfully');
      } else {
        await createStructureType(data);
        toast.success('Structure type created successfully');
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
      title={isEditing ? 'Edit Structure Type' : 'Create Structure Type'}
      description={
        isEditing ? `Update the "${structureType.name}" structure type` : 'Add a new structure type to the system'
      }
      isSubmitting={isSubmitting}
      onSubmit={handleSubmit(onSubmit)}
      submitLabel={isEditing ? 'Update Structure Type' : 'Create Structure Type'}
    >
      <form className="space-y-6">
        <FormField
          control={control}
          name="name"
          label="Name"
          placeholder="e.g., Villa, Apartment, Townhouse"
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

        <FormFieldWrapper label="Color" description="Choose a color for this structure type">
          <ColorPicker value={colorValue} onChange={(color) => setValue('color', color)} />
        </FormFieldWrapper>
      </form>
    </EntitySheet>
  );
}
