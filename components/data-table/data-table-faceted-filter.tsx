'use client';

import { PlusCircle, Search } from 'lucide-react';
import { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

export interface FilterOption {
  label: string;
  value: string;
  icon?: React.ComponentType<{ className?: string }>;
  count?: number;
}

interface DataTableFacetedFilterProps {
  title: string;
  options: FilterOption[];
  selectedValues: string[];
  onChange: (values: string[]) => void;
}

export function DataTableFacetedFilter({ title, options, selectedValues, onChange }: DataTableFacetedFilterProps) {
  const [search, setSearch] = useState('');

  const filteredOptions = options.filter((option) => option.label.toLowerCase().includes(search.toLowerCase()));

  const handleSelect = (value: string) => {
    const newValues = selectedValues.includes(value)
      ? selectedValues.filter((v) => v !== value)
      : [...selectedValues, value];
    onChange(newValues);
  };

  const handleClear = () => {
    onChange([]);
    setSearch('');
  };

  const selectedLabels = options.filter((opt) => selectedValues.includes(opt.value)).map((opt) => opt.label);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 border-dashed">
          <PlusCircle className="size-4" />
          {title}
          {selectedLabels.length > 0 && (
            <>
              <Separator orientation="vertical" className="mx-2 h-4" />
              <div className="flex gap-1">
                {selectedLabels.length > 2 ? (
                  <Badge variant="secondary" className="rounded-sm px-1 font-normal">
                    {selectedLabels.length} selected
                  </Badge>
                ) : (
                  selectedLabels.map((label) => (
                    <Badge key={label} variant="secondary" className="rounded-sm px-1 font-normal">
                      {label}
                    </Badge>
                  ))
                )}
              </div>
            </>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-52 p-0" align="start">
        <div className="p-2">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={title}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-8 pl-8"
            />
          </div>
        </div>
        <div className="max-h-64 overflow-y-auto">
          {filteredOptions.length === 0 ? (
            <div className="py-6 text-center text-sm text-muted-foreground">No results found.</div>
          ) : (
            filteredOptions.map((option) => {
              const isSelected = selectedValues.includes(option.value);
              return (
                <div
                  key={option.value}
                  className={cn(
                    'flex items-center gap-2 px-2 py-1.5 cursor-pointer hover:bg-accent',
                    isSelected && 'bg-accent',
                  )}
                  onClick={() => handleSelect(option.value)}
                >
                  <Checkbox checked={isSelected} className="pointer-events-none" />
                  {option.icon && <option.icon className="size-4 text-muted-foreground" />}
                  <span className="flex-1 text-sm">{option.label}</span>
                  {option.count !== undefined && (
                    <span className="text-xs text-muted-foreground tabular-nums">{option.count}</span>
                  )}
                </div>
              );
            })
          )}
        </div>
        {selectedValues.length > 0 && (
          <>
            <Separator />
            <div className="p-1">
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-center text-sm font-normal"
                onClick={handleClear}
              >
                Clear filters
              </Button>
            </div>
          </>
        )}
      </PopoverContent>
    </Popover>
  );
}
