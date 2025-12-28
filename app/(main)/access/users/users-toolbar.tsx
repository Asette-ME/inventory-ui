'use client';

import { Table } from '@tanstack/react-table';
import { Search, Shield, ShieldCheck, User as UserIcon, X } from 'lucide-react';
import { useEffect, useState } from 'react';

import { DataTableFacetedFilter, DataTableViewOptions } from '@/components/data-table';
import { FilterOption } from '@/components/data-table/data-table-faceted-filter';
import { Button } from '@/components/ui/button';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group';
import { User } from '@/types/user';

// Hardcoded roles for now - will be fetched from API later
const ROLE_OPTIONS: FilterOption[] = [
  { label: 'Superadmin', value: 'superadmin', icon: ShieldCheck },
  { label: 'Admin', value: 'admin', icon: Shield },
  { label: 'User', value: 'user', icon: UserIcon },
];

interface UsersToolbarProps {
  table: Table<User>;
  search: string;
  roles: string[];
  onSearchChange: (search: string) => void;
  onRolesChange: (roles: string[]) => void;
  onReset: () => void;
}

export function UsersToolbar({ table, search, roles, onSearchChange, onRolesChange, onReset }: UsersToolbarProps) {
  const [searchValue, setSearchValue] = useState(search);
  const hasFilters = search || roles.length > 0;

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchValue !== search) {
        onSearchChange(searchValue);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchValue, search, onSearchChange]);

  // Sync external search changes
  useEffect(() => {
    setSearchValue(search);
  }, [search]);

  return (
    <div className="flex items-center justify-between gap-2">
      <div className="flex flex-1 items-center gap-2">
        <InputGroup className="w-64 bg-white">
          <InputGroupAddon>
            <Search />
          </InputGroupAddon>
          <InputGroupInput
            placeholder="Filter users..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
          />
        </InputGroup>
        <DataTableFacetedFilter title="Role" options={ROLE_OPTIONS} selectedValues={roles} onChange={onRolesChange} />
        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={onReset}>
            Reset
            <X className="size-4" />
          </Button>
        )}
      </div>
      <DataTableViewOptions table={table} />
    </div>
  );
}
