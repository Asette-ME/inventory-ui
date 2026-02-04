'use client';

import { Table } from '@tanstack/react-table';
import { RefreshCw, Search } from 'lucide-react';

import { DataTableViewOptions } from '@/components/data-table';
import { Button } from '@/components/ui/button';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group';
import { Category } from '@/types/entities';

interface CategoriesToolbarProps {
  table: Table<Category>;
  search: string;
  onSearchChange: (search: string) => void;
  onRefresh: () => void;
  isLoading?: boolean;
}

export function CategoriesToolbar({ table, search, onSearchChange, onRefresh, isLoading }: CategoriesToolbarProps) {
  return (
    <div className="flex items-center justify-between gap-2">
      <div className="flex flex-1 items-center gap-2">
        <InputGroup className="w-full sm:w-64 bg-white dark:bg-muted/50">
          <InputGroupAddon>
            <Search />
          </InputGroupAddon>
          <InputGroupInput
            placeholder="Search categories..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </InputGroup>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline" onClick={onRefresh} disabled={isLoading} className="max-sm:size-8 max-sm:p-0">
          <RefreshCw className={isLoading ? 'animate-spin' : ''} />
          <span className="max-sm:hidden">Refresh</span>
        </Button>
        <DataTableViewOptions table={table} />
      </div>
    </div>
  );
}
