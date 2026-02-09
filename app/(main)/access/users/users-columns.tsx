'use client';

import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react';

import { DataTableColumnHeader } from '@/components/data-table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { IconDisplay } from '@/components/ui/icon-display';
import { getUserInitials } from '@/lib/utils';
import { User } from '@/types/entities';

interface ColumnOptions {
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  onSort: (sortBy: string, sortOrder: 'asc' | 'desc') => void;
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
}

export function getUsersColumns({ sortBy, sortOrder, onSort, onEdit, onDelete }: ColumnOptions): ColumnDef<User>[] {
  return [
    {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      id: 'id',
      accessorKey: 'id',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="ID"
          sortKey="id"
          currentSortBy={sortBy}
          currentSortOrder={sortOrder}
          onSort={onSort}
        />
      ),
      cell: ({ row }) => (
        <span className="font-mono text-xs text-muted-foreground truncate max-w-[100px] block">{row.original.id}</span>
      ),
    },
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
              <Badge key={role.id} variant="secondary" className="gap-1">
                {role.image ? (
                  <Avatar className="size-4 rounded-full">
                    <AvatarImage src={role.image} alt={role.name} />
                    <AvatarFallback className="rounded-full text-[8px]">{role.name[0]}</AvatarFallback>
                  </Avatar>
                ) : role.icon ? (
                  <IconDisplay name={role.icon} className="size-3" />
                ) : null}
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
      cell: ({ row }) => new Date(row.original.created_at).toLocaleString('en-US'),
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
      cell: ({ row }) =>
        row.original.last_login_at ? new Date(row.original.last_login_at).toLocaleString('en-US') : '—',
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
      cell: ({ row }) => new Date(row.original.updated_at).toLocaleString('en-US'),
    },
    {
      id: 'actions',
      meta: { className: 'w-0' },
      header: '',
      cell: ({ row }) => {
        const user = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon-sm">
                <MoreHorizontal />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(user)}>
                <Pencil />
                Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive" onClick={() => onDelete(user)}>
                <Trash2 />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
      enableSorting: false,
      enableHiding: false,
    },
  ];
}

// Default visible columns
export const DEFAULT_VISIBLE_COLUMNS = {
  id: false,
  username: true,
  email: true,
  phone: true,
  roles: true,
  created_at: false,
  last_login_at: false,
  updated_at: false,
};
