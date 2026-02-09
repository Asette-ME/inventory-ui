'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { ColorPicker } from '@/components/crud/color-picker';
import { EntitySheet } from '@/components/crud/entity-sheet';
import { FormField, FormFieldWrapper } from '@/components/crud/form-field';
import { IconPicker } from '@/components/ui/icon-picker';
import { Input } from '@/components/ui/input';
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
  const [imagePreview, setImagePreview] = useState<string | null>(null);

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
    setImagePreview(null);
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

        <FormFieldWrapper label="Image" description="Upload an image for this structure type">
          {structureType?.image && !imagePreview && (
            <div className="mb-2">
              <img src={structureType.image} alt="" className="h-16 w-16 rounded-md object-cover" />
            </div>
          )}
          {imagePreview && (
            <div className="mb-2">
              <img src={imagePreview} alt="" className="h-16 w-16 rounded-md object-cover" />
            </div>
          )}
          <Input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                setValue('image', file as any);
                setImagePreview(URL.createObjectURL(file));
              }
            }}
          />
        </FormFieldWrapper>

        <FormFieldWrapper label="Color" description="Choose a color for this structure type">
          <ColorPicker value={colorValue} onChange={(color) => setValue('color', color)} />
        </FormFieldWrapper>
      </form>
    </EntitySheet>
  );
}
