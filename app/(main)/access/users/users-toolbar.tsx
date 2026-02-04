'use client';

import { Table } from '@tanstack/react-table';
import { KeyRound, RefreshCw, Search, Shield, X } from 'lucide-react';
import { useEffect, useState } from 'react';

import { DataTableFacetedFilter, DataTableFilterDrawer, DataTableViewOptions } from '@/components/data-table';
import { FilterOption } from '@/components/data-table/data-table-faceted-filter';
import { FilterGroup } from '@/components/data-table/data-table-filter-drawer';
import { Button } from '@/components/ui/button';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group';
import { getRoles } from '@/lib/actions/entities';
import { User, Role } from '@/types/entities';

interface UsersToolbarProps {
  table: Table<User>;
  search: string;
  roles: string[];
  onSearchChange: (search: string) => void;
  onRolesChange: (roles: string[]) => void;
  onReset: () => void;
  onRefresh: () => void;
  isLoading?: boolean;
}

export function UsersToolbar({
  table,
  search,
  roles,
  onSearchChange,
  onRolesChange,
  onReset,
  onRefresh,
  isLoading,
}: UsersToolbarProps) {
  const [searchValue, setSearchValue] = useState(search);
  const [roleOptions, setRoleOptions] = useState<FilterOption[]>([]);
  const [rolesLoading, setRolesLoading] = useState(true);
  const hasFilters = search || roles.length > 0;
  const filterCount = roles.length;

  // Fetch roles from backend
  useEffect(() => {
    async function fetchRoles() {
      try {
        const response = await getRoles({ limit: 100 });
        setRoleOptions(
          response.data.map((role: Role) => ({
            label: role.name,
            value: role.id,
            icon: Shield,
          })),
        );
      } catch (error) {
        console.error('Failed to fetch roles:', error);
      } finally {
        setRolesLoading(false);
      }
    }
    fetchRoles();
  }, []);

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

  const filterGroups: FilterGroup[] = [
    {
      id: 'roles',
      title: 'Role',
      options: roleOptions,
      selectedValues: roles,
      onChange: onRolesChange,
    },
  ];

  const handleResetFilters = () => {
    onRolesChange([]);
  };

  return (
    <div className="flex items-center justify-between gap-2">
      <div className="flex flex-1 items-center gap-2">
        <InputGroup className="w-full sm:w-64 bg-white">
          <InputGroupAddon>
            <Search />
          </InputGroupAddon>
          <InputGroupInput
            placeholder="Filter users..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
          />
        </InputGroup>

        {/* Desktop: Show faceted filter */}
        <div className="hidden sm:flex items-center gap-2">
          <DataTableFacetedFilter
            title="Role"
            options={roleOptions}
            selectedValues={roles}
            onChange={onRolesChange}
            prependIcon={KeyRound}
            disabled={rolesLoading}
          />
          {hasFilters && (
            <Button className="flex items-center gap-2" variant="ghost" onClick={onReset}>
              <X />
              <span>Reset</span>
            </Button>
          )}
        </div>

        {/* Mobile: Show filter drawer trigger */}
        <div className="sm:hidden">
          <DataTableFilterDrawer filters={filterGroups} onReset={handleResetFilters} totalSelected={filterCount} />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline" onClick={onRefresh} disabled={isLoading} className="max-sm:size-8 max-sm:p-0">
          <RefreshCw className={`${isLoading ? 'animate-spin' : ''}`} />
          <span className="max-sm:hidden">Refresh</span>
        </Button>
        <DataTableViewOptions table={table} />
      </div>
    </div>
  );
}
