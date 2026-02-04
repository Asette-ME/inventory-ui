'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { ColorPicker } from '@/components/crud/color-picker';
import { EntitySheet } from '@/components/crud/entity-sheet';
import { FormField, FormFieldWrapper } from '@/components/crud/form-field';
import { createRole, updateRole } from '@/lib/actions/entities';
import { roleCreateSchema, RoleFormData } from '@/lib/validations/entities';
import { Role } from '@/types/entities';

interface RoleSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  role: Role | null;
  onSuccess: () => void;
}

export function RoleSheet({ open, onOpenChange, role, onSuccess }: RoleSheetProps) {
  const isEditing = !!role;

  const form = useForm<RoleFormData>({
    resolver: zodResolver(roleCreateSchema),
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
    if (role) {
      reset({
        name: role.name,
        icon: role.icon,
        image: role.image,
        color: role.color,
      });
    } else {
      reset({
        name: '',
        icon: null,
        image: null,
        color: null,
      });
    }
  }, [role, reset]);

  async function onSubmit(data: RoleFormData) {
    try {
      if (isEditing) {
        await updateRole(role.id, data);
        toast.success('Role updated successfully');
      } else {
        await createRole(data);
        toast.success('Role created successfully');
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
      title={isEditing ? 'Edit Role' : 'Create Role'}
      description={isEditing ? `Update the "${role.name}" role` : 'Add a new role to the system'}
      isSubmitting={isSubmitting}
      onSubmit={handleSubmit(onSubmit)}
      submitLabel={isEditing ? 'Update Role' : 'Create Role'}
    >
      <form className="space-y-6">
        <FormField control={control} name="name" label="Name" placeholder="e.g., Admin, Editor, Viewer" required />

        <FormField
          control={control}
          name="icon"
          label="Icon"
          placeholder="e.g., shield, user, settings"
          description="Lucide icon name (optional)"
        />

        <FormField
          control={control}
          name="image"
          label="Image URL"
          placeholder="https://example.com/icon.png"
          description="URL to an image (optional)"
        />

        <FormFieldWrapper label="Color" description="Choose a color for this role">
          <ColorPicker value={colorValue} onChange={(color) => setValue('color', color)} />
        </FormFieldWrapper>
      </form>
    </EntitySheet>
  );
}
