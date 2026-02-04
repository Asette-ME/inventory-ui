'use client';

import { Paintbrush } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

const PRESET_COLORS = [
  '#ef4444',
  '#f97316',
  '#f59e0b',
  '#eab308',
  '#84cc16',
  '#22c55e',
  '#10b981',
  '#14b8a6',
  '#06b6d4',
  '#0ea5e9',
  '#3b82f6',
  '#6366f1',
  '#8b5cf6',
  '#a855f7',
  '#d946ef',
  '#ec4899',
  '#f43f5e',
  '#78716c',
  '#71717a',
  '#000000',
];

interface ColorPickerProps {
  value?: string | null;
  onChange?: (color: string | null) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function ColorPicker({ value, onChange, disabled = false, placeholder = 'Select color' }: ColorPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value || '');

  useEffect(() => {
    setInputValue(value || '');
  }, [value]);

  function handleColorSelect(color: string) {
    setInputValue(color);
    onChange?.(color);
    setIsOpen(false);
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const newValue = e.target.value;
    setInputValue(newValue);
    if (newValue === '' || /^#[0-9A-Fa-f]{6}$/.test(newValue)) {
      onChange?.(newValue || null);
    }
  }

  function handleClear() {
    setInputValue('');
    onChange?.(null);
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={isOpen}
          disabled={disabled}
          className="w-full justify-start gap-2 font-normal"
        >
          {value ? (
            <>
              <div className="h-4 w-4 rounded border" style={{ backgroundColor: value }} />
              <span>{value}</span>
            </>
          ) : (
            <>
              <Paintbrush className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">{placeholder}</span>
            </>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-3" align="start">
        <div className="space-y-3">
          <div className="flex gap-2">
            <Input value={inputValue} onChange={handleInputChange} placeholder="#000000" className="font-mono" />
            {value && (
              <Button variant="ghost" size="sm" onClick={handleClear}>
                Clear
              </Button>
            )}
          </div>
          <div className="grid grid-cols-5 gap-2">
            {PRESET_COLORS.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => handleColorSelect(color)}
                className={cn(
                  'h-8 w-8 rounded-md border-2 transition-transform hover:scale-110',
                  value === color ? 'border-primary ring-2 ring-primary ring-offset-2' : 'border-transparent',
                )}
                style={{ backgroundColor: color }}
                title={color}
              />
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
