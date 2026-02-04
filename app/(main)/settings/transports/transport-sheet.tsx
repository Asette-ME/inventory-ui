'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { ColorPicker } from '@/components/crud/color-picker';
import { EntitySheet } from '@/components/crud/entity-sheet';
import { FormField, FormFieldWrapper } from '@/components/crud/form-field';
import { createTransport, updateTransport } from '@/lib/actions/entities';
import { transportCreateSchema, TransportFormData } from '@/lib/validations/entities';
import { Transport } from '@/types/entities';

interface TransportSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transport: Transport | null;
  onSuccess: () => void;
}

export function TransportSheet({ open, onOpenChange, transport, onSuccess }: TransportSheetProps) {
  const isEditing = !!transport;

  const form = useForm<TransportFormData>({
    resolver: zodResolver(transportCreateSchema),
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
    if (transport) {
      reset({
        name: transport.name,
        icon: transport.icon,
        image: transport.image,
        color: transport.color,
      });
    } else {
      reset({
        name: '',
        icon: null,
        image: null,
        color: null,
      });
    }
  }, [transport, reset]);

  async function onSubmit(data: TransportFormData) {
    try {
      if (isEditing) {
        await updateTransport(transport.id, data);
        toast.success('Transport updated successfully');
      } else {
        await createTransport(data);
        toast.success('Transport created successfully');
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
      title={isEditing ? 'Edit Transport' : 'Create Transport'}
      description={isEditing ? `Update the "${transport.name}" transport` : 'Add a new transport type to the system'}
      isSubmitting={isSubmitting}
      onSubmit={handleSubmit(onSubmit)}
      submitLabel={isEditing ? 'Update Transport' : 'Create Transport'}
    >
      <form className="space-y-6">
        <FormField control={control} name="name" label="Name" placeholder="e.g., Bus, Train, Metro" required />

        <FormField
          control={control}
          name="icon"
          label="Icon"
          placeholder="e.g., bus, train, car"
          description="Lucide icon name (optional)"
        />

        <FormField
          control={control}
          name="image"
          label="Image URL"
          placeholder="https://example.com/icon.png"
          description="URL to an image (optional)"
        />

        <FormFieldWrapper label="Color" description="Choose a color for this transport">
          <ColorPicker value={colorValue} onChange={(color) => setValue('color', color)} />
        </FormFieldWrapper>
      </form>
    </EntitySheet>
  );
}
