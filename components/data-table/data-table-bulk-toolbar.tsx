'use client';

import { X } from 'lucide-react';
import { ReactNode } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface BulkAction {
  label: string;
  icon?: ReactNode;
  onClick: () => void;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost';
  disabled?: boolean;
}

interface DataTableBulkToolbarProps {
  selectedCount: number;
  onClearSelection: () => void;
  actions: BulkAction[];
  className?: string;
}

export function DataTableBulkToolbar({
  selectedCount,
  onClearSelection,
  actions,
  className,
}: DataTableBulkToolbarProps) {
  if (selectedCount === 0) return null;

  return (
    <div
      className={cn(
        'fixed bottom-6 left-1/2 z-50 -translate-x-1/2',
        'flex items-center gap-2 rounded-full px-4 py-2',
        'bg-white/80 dark:bg-gray-900/80',
        'bg-clip-padding backdrop-filter backdrop-blur-xl',
        'border dark:border-white/10 shadow-lg',
        'hover:scale-105 transition-all duration-200',
        'animate-in fade-in slide-in-from-bottom-4',
        className,
      )}
    >
      <Button variant="ghost" size="icon-sm" onClick={onClearSelection} className="rounded-full">
        <X className="size-4" />
      </Button>
      <Badge variant="secondary" className="rounded-full px-3 font-medium">
        {selectedCount}
      </Badge>
      <span className="text-sm text-muted-foreground max-sm:hidden">items selected</span>
      <div className="ml-1 flex items-center gap-1.5">
        {actions.map((action, i) => (
          <Button
            key={i}
            variant={action.variant || 'default'}
            size="sm"
            onClick={action.onClick}
            disabled={action.disabled}
            className="gap-1.5 rounded-full"
          >
            {action.icon}
            <span className="max-sm:hidden">{action.label}</span>
          </Button>
        ))}
      </div>
    </div>
  );
}
