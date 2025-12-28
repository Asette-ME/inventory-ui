'use client';

import { ColumnDef } from '@tanstack/react-table';

import { DataTableColumnHeader } from '@/components/data-table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { getUserInitials } from '@/lib/utils';
import { User } from '@/types/user';

interface ColumnOptions {
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  onSort: (sortBy: string, sortOrder: 'asc' | 'desc') => void;
}

export function getUsersColumns({ sortBy, sortOrder, onSort }: ColumnOptions): ColumnDef<User>[] {
  return [
    {
      id: 'username',
      accessorKey: 'username',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="Username"
          sortKey="username"
          currentSortBy={sortBy}
          currentSortOrder={sortOrder}
          onSort={onSort}
        />
      ),
      cell: ({ row }) => {
        const user = row.original;
        return (
          <div className="flex items-center gap-3">
            <Avatar className="size-8 rounded-full">
              <AvatarImage src={user.image || undefined} alt={user.username} />
              <AvatarFallback className="rounded-full text-xs">{getUserInitials(user.username)}</AvatarFallback>
            </Avatar>
            <span className="font-medium">{user.username}</span>
          </div>
        );
      },
    },
    {
      id: 'email',
      accessorKey: 'email',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="Email"
          sortKey="email"
          currentSortBy={sortBy}
          currentSortOrder={sortOrder}
          onSort={onSort}
        />
      ),
    },
    {
      id: 'phone',
      accessorKey: 'phone',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="Phone"
          sortKey="phone"
          currentSortBy={sortBy}
          currentSortOrder={sortOrder}
          onSort={onSort}
        />
      ),
      cell: ({ row }) => row.original.phone || '—',
    },
    {
      id: 'roles',
      accessorKey: 'roles',
      header: 'Roles',
      cell: ({ row }) => {
        const roles = row.original.roles;
        if (!roles.length) return <span className="text-muted-foreground">—</span>;
        return (
          <div className="flex flex-wrap gap-1">
            {roles.map((role) => (
              <Badge key={role.id} variant="secondary">
                {role.name}
              </Badge>
            ))}
          </div>
        );
      },
    },
    {
      id: 'created_at',
      accessorKey: 'created_at',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="Created At"
          sortKey="created_at"
          currentSortBy={sortBy}
          currentSortOrder={sortOrder}
          onSort={onSort}
        />
      ),
      cell: ({ row }) => new Date(row.original.created_at).toLocaleDateString(),
    },
    {
      id: 'last_login_at',
      accessorKey: 'last_login_at',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="Last Login"
          sortKey="last_login_at"
          currentSortBy={sortBy}
          currentSortOrder={sortOrder}
          onSort={onSort}
        />
      ),
      cell: ({ row }) => (row.original.last_login_at ? new Date(row.original.last_login_at).toLocaleDateString() : '—'),
    },
    {
      id: 'updated_at',
      accessorKey: 'updated_at',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="Updated At"
          sortKey="updated_at"
          currentSortBy={sortBy}
          currentSortOrder={sortOrder}
          onSort={onSort}
        />
      ),
      cell: ({ row }) => new Date(row.original.updated_at).toLocaleDateString(),
    },
  ];
}

// Default visible columns
export const DEFAULT_VISIBLE_COLUMNS = {
  username: true,
  email: true,
  phone: true,
  roles: true,
  created_at: false,
  last_login_at: false,
  updated_at: false,
};
