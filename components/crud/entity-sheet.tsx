'use client';

import { Loader2 } from 'lucide-react';
import { ReactNode } from 'react';

import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

interface EntitySheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  isSubmitting?: boolean;
  onSubmit?: () => void;
  submitLabel?: string;
  showSubmit?: boolean;
  className?: string;
  side?: 'top' | 'right' | 'bottom' | 'left';
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

const sizeClasses = {
  sm: 'w-full sm:max-w-sm',
  md: 'w-full sm:max-w-md',
  lg: 'w-full sm:max-w-lg',
  xl: 'w-full sm:max-w-xl',
  full: 'w-full sm:max-w-full',
};

export function EntitySheet({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  isSubmitting = false,
  onSubmit,
  submitLabel = 'Save',
  showSubmit = true,
  className,
  side = 'right',
  size = 'xl',
}: EntitySheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side={side} className={cn('flex flex-col gap-0 overflow-hidden p-0', sizeClasses[size], className)}>
        <SheetHeader className="shrink-0 border-b p-6 animate-fade-in-down">
          <SheetTitle className="text-xl">{title}</SheetTitle>
          {description && <SheetDescription>{description}</SheetDescription>}
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-6 animate-fade-in">{children}</div>

        {(showSubmit || footer) && (
          <div className="shrink-0 border-t bg-muted/30 p-4">
            {footer || (
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
                  Cancel
                </Button>
                {showSubmit && onSubmit && (
                  <Button onClick={onSubmit} disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {submitLabel}
                  </Button>
                )}
              </div>
            )}
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
