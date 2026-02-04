'use client';

import { Check, ChevronsUpDown, icons, X } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { IconDisplay, popularIcons } from '@/components/ui/icon-display';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface IconPickerProps {
  value: string | null | undefined;
  onChange: (value: string | null) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

// Convert PascalCase to kebab-case
function toKebabCase(name: string): string {
  return name.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
}

// Get all icon names in kebab-case
function getAllIconNames(): string[] {
  return Object.keys(icons).map(toKebabCase);
}

export function IconPicker({ value, onChange, placeholder = 'Select icon...', disabled, className }: IconPickerProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  const allIcons = useMemo(() => getAllIconNames(), []);

  const filteredIcons = useMemo(() => {
    if (!search) {
      // Show popular icons first when no search
      return popularIcons.filter((icon) => allIcons.includes(icon));
    }
    const searchLower = search.toLowerCase();
    return allIcons.filter((icon) => icon.includes(searchLower)).slice(0, 100); // Limit to 100 results
  }, [search, allIcons]);

  const handleSelect = useCallback(
    (iconName: string) => {
      onChange(iconName === value ? null : iconName);
      setOpen(false);
      setSearch('');
    },
    [onChange, value],
  );

  const handleClear = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onChange(null);
    },
    [onChange],
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn('w-full justify-between font-normal', !value && 'text-muted-foreground', className)}
          disabled={disabled}
        >
          <span className="flex items-center gap-2 truncate">
            {value ? (
              <>
                <IconDisplay name={value} className="h-4 w-4 shrink-0" />
                <span className="truncate">{value}</span>
              </>
            ) : (
              placeholder
            )}
          </span>
          <span className="flex items-center gap-1 shrink-0">
            {value && !disabled && (
              <X
                className="h-4 w-4 opacity-50 hover:opacity-100 cursor-pointer"
                onClick={handleClear}
                aria-label="Clear selection"
              />
            )}
            <ChevronsUpDown className="h-4 w-4 opacity-50" />
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Search icons..."
            value={search}
            onValueChange={setSearch}
            className="border-0 focus:ring-0"
          />
          <CommandList>
            <CommandEmpty>No icons found.</CommandEmpty>
            <CommandGroup heading={search ? `Results (${filteredIcons.length})` : 'Popular Icons'}>
              <ScrollArea className="h-[300px]">
                <div className="grid grid-cols-4 gap-1 p-2">
                  {filteredIcons.map((iconName) => (
                    <CommandItem
                      key={iconName}
                      value={iconName}
                      onSelect={() => handleSelect(iconName)}
                      className={cn(
                        'flex flex-col items-center justify-center gap-1 p-2 cursor-pointer rounded-md',
                        'hover:bg-accent hover:text-accent-foreground',
                        value === iconName && 'bg-accent text-accent-foreground',
                      )}
                    >
                      <IconDisplay name={iconName} className="h-5 w-5" />
                      <span className="text-[10px] text-center truncate w-full" title={iconName}>
                        {iconName.length > 8 ? iconName.slice(0, 7) + '...' : iconName}
                      </span>
                      {value === iconName && <Check className="h-3 w-3 absolute top-1 right-1 text-primary" />}
                    </CommandItem>
                  ))}
                </div>
              </ScrollArea>
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
