'use client';

import { LucideIcon, Plus } from 'lucide-react';
import { ReactNode } from 'react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface PageLayoutProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  children: ReactNode;
  actions?: ReactNode;
  onAdd?: () => void;
  addLabel?: string;
  className?: string;
}

export function PageLayout({
  title,
  description,
  icon: Icon,
  children,
  actions,
  onAdd,
  addLabel = 'Add New',
  className,
}: PageLayoutProps) {
  return (
    <div className={cn('flex h-full flex-1 flex-col gap-6 p-6', className)}>
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between animate-fade-in-down">
        <div>
          <div className="flex items-center gap-2">
            {Icon && <Icon className="h-6 w-6 transition-transform duration-200 hover:scale-110" />}
            <h1 className="text-2xl font-bold">{title}</h1>
          </div>
          {description && <p className="mt-1 text-muted-foreground">{description}</p>}
        </div>
        <div className="flex items-center gap-2">
          {actions}
          {onAdd && (
            <Button onClick={onAdd} className="gap-2 btn-press transition-all duration-200 hover:shadow-md">
              <Plus className="h-4 w-4" />
              {addLabel}
            </Button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 animate-fade-in-up">{children}</div>
    </div>
  );
}

interface FilterBarProps {
  children: ReactNode;
  className?: string;
}

export function FilterBar({ children, className }: FilterBarProps) {
  return (
    <div className={cn('flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4 animate-fade-in', className)}>
      {children}
    </div>
  );
}

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({ title, description, icon: Icon, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex min-h-48 sm:h-64 flex-col items-center justify-center gap-4 rounded-lg',
        'border border-dashed p-4 sm:p-8 text-center animate-fade-in',
        className,
      )}
    >
      {Icon && (
        <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-muted">
          <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-muted-foreground" />
        </div>
      )}
      <div className="space-y-1 max-w-xs">
        <h3 className="font-medium text-sm sm:text-base">{title}</h3>
        {description && <p className="text-xs sm:text-sm text-muted-foreground">{description}</p>}
      </div>
      {action}
    </div>
  );
}
