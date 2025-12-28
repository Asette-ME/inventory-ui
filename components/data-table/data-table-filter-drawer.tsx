'use client';

import { ChevronDown, ChevronUp, Search, X } from 'lucide-react';
import { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

import { FilterOption } from './data-table-faceted-filter';

export interface FilterGroup {
  id: string;
  title: string;
  options: FilterOption[];
  selectedValues: string[];
  onChange: (values: string[]) => void;
}

interface DataTableFilterDrawerProps {
  filters: FilterGroup[];
  onReset: () => void;
  totalSelected: number;
}

export function DataTableFilterDrawer({ filters, onReset, totalSelected }: DataTableFilterDrawerProps) {
  const [open, setOpen] = useState(false);

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button variant="outline" size="icon-sm" className="relative">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
          </svg>
          {totalSelected > 0 && (
            <Badge
              variant="default"
              className="absolute -top-2 -right-2 size-5 p-0 text-xs flex items-center justify-center"
            >
              {totalSelected}
            </Badge>
          )}
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Filters</DrawerTitle>
        </DrawerHeader>
        <div className="px-4 pb-4 max-h-[60vh] overflow-y-auto">
          {filters.map((filter) => (
            <FilterSection key={filter.id} filter={filter} />
          ))}
        </div>
        <DrawerFooter className="flex-row gap-2">
          {totalSelected > 0 && (
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => {
                onReset();
                setOpen(false);
              }}
            >
              Clear all
            </Button>
          )}
          <DrawerClose asChild>
            <Button className="flex-1">Close</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

function FilterSection({ filter }: { filter: FilterGroup }) {
  const [isOpen, setIsOpen] = useState(filter.selectedValues.length > 0);
  const [search, setSearch] = useState('');

  const filteredOptions = filter.options.filter((option) => option.label.toLowerCase().includes(search.toLowerCase()));

  const handleSelect = (value: string) => {
    const newValues = filter.selectedValues.includes(value)
      ? filter.selectedValues.filter((v) => v !== value)
      : [...filter.selectedValues, value];
    filter.onChange(newValues);
  };

  const handleClear = () => {
    filter.onChange([]);
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="border-b">
      <CollapsibleTrigger className="flex w-full items-center justify-between py-4">
        <span className="font-medium">{filter.title}</span>
        <div className="flex items-center gap-2">
          {filter.selectedValues.length > 0 && (
            <Badge
              variant="secondary"
              className="cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                handleClear();
              }}
            >
              {filter.selectedValues.length}
              <X className="ml-1 size-3" />
            </Badge>
          )}
          {isOpen ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent className="pb-4">
        <div className="relative mb-3">
          <Search className="absolute left-2 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search" value={search} onChange={(e) => setSearch(e.target.value)} className="h-9 pl-8" />
        </div>
        <div className="max-h-48 overflow-y-auto space-y-1">
          {filteredOptions.length === 0 ? (
            <div className="py-4 text-center text-sm text-muted-foreground">No results found.</div>
          ) : (
            filteredOptions.map((option) => {
              const isSelected = filter.selectedValues.includes(option.value);
              return (
                <div
                  key={option.value}
                  className={cn(
                    'flex items-center gap-2 px-2 py-2 rounded-md cursor-pointer hover:bg-accent',
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
      </CollapsibleContent>
    </Collapsible>
  );
}
