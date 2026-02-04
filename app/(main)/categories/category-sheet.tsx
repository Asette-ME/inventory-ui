'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { EntitySheet } from '@/components/crud/entity-sheet';
import { FormField } from '@/components/crud/form-field';
import { createCategory, updateCategory } from '@/lib/actions/entities';
import { categoryCreateSchema, CategoryFormData } from '@/lib/validations/entities';
import { Category } from '@/types/entities';

interface CategorySheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category: Category | null;
  onSuccess: () => void;
}

export function CategorySheet({ open, onOpenChange, category, onSuccess }: CategorySheetProps) {
  const isEditing = !!category;

  const form = useForm<CategoryFormData>({
    resolver: zodResolver(categoryCreateSchema),
    defaultValues: {
      name: '',
    },
  });

  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = form;

  useEffect(() => {
    if (category) {
      reset({
        name: category.name,
      });
    } else {
      reset({
        name: '',
      });
    }
  }, [category, reset]);

  async function onSubmit(data: CategoryFormData) {
    try {
      if (isEditing) {
        await updateCategory(category.id, data);
        toast.success('Category updated successfully');
      } else {
        await createCategory(data);
        toast.success('Category created successfully');
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
      title={isEditing ? 'Edit Category' : 'Create Category'}
      description={isEditing ? `Update the "${category.name}" category` : 'Add a new category to the system'}
      isSubmitting={isSubmitting}
      onSubmit={handleSubmit(onSubmit)}
      submitLabel={isEditing ? 'Update Category' : 'Create Category'}
    >
      <form className="space-y-6">
        <FormField
          control={control}
          name="name"
          label="Name"
          placeholder="e.g., Residential, Commercial, Industrial"
          required
        />
      </form>
    </EntitySheet>
  );
}
