'use client';

import { ReactNode } from 'react';
import { Control, FieldPath, FieldValues, useController } from 'react-hook-form';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

interface FormFieldProps<T extends FieldValues> {
  control: Control<T>;
  name: FieldPath<T>;
  label: string;
  placeholder?: string;
  type?: 'text' | 'email' | 'password' | 'number' | 'textarea';
  disabled?: boolean;
  className?: string;
  required?: boolean;
  description?: string;
}

export function FormField<T extends FieldValues>({
  control,
  name,
  label,
  placeholder,
  type = 'text',
  disabled = false,
  className,
  required = false,
  description,
}: FormFieldProps<T>) {
  const {
    field,
    fieldState: { error },
  } = useController({ name, control });

  const inputId = `field-${name}`;
  const errorId = `${inputId}-error`;
  const descId = `${inputId}-desc`;

  const InputComponent = type === 'textarea' ? Textarea : Input;

  return (
    <div className={cn('space-y-2', className)}>
      <Label htmlFor={inputId} className="flex items-center gap-1">
        {label}
        {required && <span className="text-destructive">*</span>}
      </Label>
      {description && (
        <p id={descId} className="text-xs text-muted-foreground">
          {description}
        </p>
      )}
      <InputComponent
        id={inputId}
        type={type === 'textarea' ? undefined : type}
        placeholder={placeholder}
        disabled={disabled}
        aria-invalid={!!error}
        aria-describedby={cn(error && errorId, description && descId)}
        className={cn(error && 'border-destructive focus-visible:ring-destructive')}
        {...field}
        value={field.value ?? ''}
        onChange={(e) => {
          const value = e.target.value;
          if (type === 'number') {
            field.onChange(value === '' ? null : parseFloat(value));
          } else {
            field.onChange(value);
          }
        }}
      />
      {error && (
        <p id={errorId} className="text-sm text-destructive" role="alert">
          {error.message}
        </p>
      )}
    </div>
  );
}

interface FormFieldWrapperProps {
  label: string;
  required?: boolean;
  error?: string;
  description?: string;
  children: ReactNode;
  className?: string;
}

export function FormFieldWrapper({
  label,
  required = false,
  error,
  description,
  children,
  className,
}: FormFieldWrapperProps) {
  return (
    <div className={cn('space-y-2', className)}>
      <Label className="flex items-center gap-1">
        {label}
        {required && <span className="text-destructive">*</span>}
      </Label>
      {description && <p className="text-xs text-muted-foreground">{description}</p>}
      {children}
      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
