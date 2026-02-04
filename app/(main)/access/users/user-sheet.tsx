'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { EntitySheet } from '@/components/crud/entity-sheet';
import { FormField, FormFieldWrapper } from '@/components/crud/form-field';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import { createUser, updateUser, getRoles } from '@/lib/actions/entities';
import { cn } from '@/lib/utils';
import { userCreateSchema, userUpdateSchema, UserCreateFormData, UserUpdateFormData } from '@/lib/validations/entities';
import { User, Role } from '@/types/entities';

interface UserSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User | null;
  onSuccess: () => void;
}

export function UserSheet({ open, onOpenChange, user, onSuccess }: UserSheetProps) {
  const isEditing = !!user;
  const [roles, setRoles] = useState<Role[]>([]);
  const [rolesLoading, setRolesLoading] = useState(true);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);

  const form = useForm<UserCreateFormData | UserUpdateFormData>({
    resolver: zodResolver(isEditing ? userUpdateSchema : userCreateSchema),
    defaultValues: {
      username: '',
      email: '',
      password: '',
      phone: '',
      roles: [],
    },
  });

  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = form;

  // Fetch roles
  useEffect(() => {
    async function fetchRoles() {
      setRolesLoading(true);
      try {
        const response = await getRoles({ limit: 100 });
        setRoles(response.data);
      } catch {
        toast.error('Failed to load roles');
      } finally {
        setRolesLoading(false);
      }
    }
    if (open) {
      void fetchRoles();
    }
  }, [open]);

  // Reset form when user changes
  useEffect(() => {
    if (user) {
      reset({
        username: user.username,
        email: user.email,
        phone: user.phone || '',
      });
      setSelectedRoles(user.roles.map((r) => r.id));
    } else {
      reset({
        username: '',
        email: '',
        password: '',
        phone: '',
      });
      setSelectedRoles([]);
    }
  }, [user, reset]);

  async function onSubmit(data: UserCreateFormData | UserUpdateFormData) {
    try {
      const payload = { ...data, roles: selectedRoles };

      if (isEditing) {
        await updateUser(user.id, payload as UserUpdateFormData);
        toast.success('User updated successfully');
      } else {
        await createUser(payload as UserCreateFormData);
        toast.success('User created successfully');
      }

      onOpenChange(false);
      onSuccess();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'An error occurred');
    }
  }

  function handleRoleToggle(roleId: string, checked: boolean) {
    setSelectedRoles((prev) => (checked ? [...prev, roleId] : prev.filter((id) => id !== roleId)));
  }

  return (
    <EntitySheet
      open={open}
      onOpenChange={onOpenChange}
      title={isEditing ? 'Edit User' : 'Create User'}
      description={isEditing ? `Update ${user.username}'s information` : 'Add a new user to the system'}
      isSubmitting={isSubmitting}
      onSubmit={handleSubmit(onSubmit)}
      submitLabel={isEditing ? 'Update User' : 'Create User'}
    >
      <form className="space-y-6">
        <FormField control={control} name="username" label="Username" placeholder="johndoe" required />

        <FormField control={control} name="email" label="Email" type="email" placeholder="john@example.com" required />

        {!isEditing && (
          <FormField
            control={control}
            name="password"
            label="Password"
            type="password"
            placeholder="••••••••"
            required
          />
        )}

        <FormField control={control} name="phone" label="Phone" placeholder="+1234567890" />

        <FormFieldWrapper label="Roles" description="Select the roles for this user">
          {rolesLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-6 w-24" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {roles.map((role) => (
                <label
                  key={role.id}
                  className={cn(
                    'flex items-center gap-2 rounded-md border p-3',
                    'cursor-pointer hover:bg-muted/50 transition-colors',
                  )}
                >
                  <Checkbox
                    checked={selectedRoles.includes(role.id)}
                    onCheckedChange={(checked) => handleRoleToggle(role.id, !!checked)}
                  />
                  <span className="text-sm font-medium">{role.name}</span>
                </label>
              ))}
            </div>
          )}
        </FormFieldWrapper>
      </form>
    </EntitySheet>
  );
}
