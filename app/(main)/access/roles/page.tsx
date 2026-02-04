'use client';

import { KeyRound, MoreHorizontal, Pencil, Plus, RefreshCw, Search, Settings2, Trash2 } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

import { DeleteDialog, EmptyState, FilterBar, PageLayout, TableSkeleton } from '@/components/crud';
import { DataTableColumnHeader } from '@/components/data-table';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { deleteRole, getRoles } from '@/lib/actions/entities';
import { PaginationMeta } from '@/types/common';
import { Role } from '@/types/entities';

import { RoleSheet } from './role-sheet';

type SortOrder = 'asc' | 'desc';

export default function RolesPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState<string>('created_at');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  // Sheet state
  const [sheetOpen, setSheetOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);

  // Delete dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState<Role | null>(null);

  const fetchRoles = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await getRoles({ search, page, limit: 10, sort_by: sortBy, sort_order: sortOrder });
      setRoles(response.data);
      setPagination(response.pagination);
    } catch {
      toast.error('Failed to load roles');
    } finally {
      setIsLoading(false);
    }
  }, [search, page, sortBy, sortOrder]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void fetchRoles();
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchRoles]);

  function handleSort(key: string, order: SortOrder) {
    setSortBy(key);
    setSortOrder(order);
  }

  function handleCreate() {
    setSelectedRole(null);
    setSheetOpen(true);
  }

  function handleEdit(role: Role) {
    setSelectedRole(role);
    setSheetOpen(true);
  }

  function handleDeleteClick(role: Role) {
    setRoleToDelete(role);
    setDeleteDialogOpen(true);
  }

  async function handleDeleteConfirm() {
    if (!roleToDelete) return;
    try {
      await deleteRole(roleToDelete.id);
      toast.success(`Role "${roleToDelete.name}" deleted successfully`);
      void fetchRoles();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete role');
    }
  }

  return (
    <PageLayout
      title="Roles"
      description="Manage roles and permissions"
      icon={KeyRound}
      onAdd={handleCreate}
      addLabel="Add Role"
    >
      <div className="space-y-4">
        <FilterBar
          actions={
            <>
              <Button variant="outline" onClick={fetchRoles} disabled={isLoading} className="gap-2">
                <RefreshCw className={isLoading ? 'animate-spin' : ''} />
                <span className="hidden sm:inline">Refresh</span>
              </Button>
              <ViewOptionsButton />
            </>
          }
        >
          <InputGroup className="w-full sm:w-64 bg-white dark:bg-muted/50">
            <InputGroupAddon>
              <Search />
            </InputGroupAddon>
            <InputGroupInput
              placeholder="Search roles..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </InputGroup>
        </FilterBar>

        <div className="bg-white dark:bg-muted/50 rounded-xl shadow-sm border overflow-hidden">
          {isLoading && roles.length === 0 ? (
            <div className="p-4">
              <TableSkeleton rows={5} columns={4} />
            </div>
          ) : roles.length === 0 ? (
            <EmptyState
              title="No roles found"
              description={search ? 'Try adjusting your search' : 'Get started by creating your first role'}
              icon={KeyRound}
              action={
                !search && (
                  <Button onClick={handleCreate} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add Role
                  </Button>
                )
              }
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    <DataTableColumnHeader
                      column={{} as never}
                      title="Name"
                      sortKey="name"
                      currentSortBy={sortBy}
                      currentSortOrder={sortOrder}
                      onSort={handleSort}
                    />
                  </TableHead>
                  <TableHead>Color</TableHead>
                  <TableHead>
                    <DataTableColumnHeader
                      column={{} as never}
                      title="Created At"
                      sortKey="created_at"
                      currentSortBy={sortBy}
                      currentSortOrder={sortOrder}
                      onSort={handleSort}
                    />
                  </TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {roles.map((role) => (
                  <TableRow key={role.id}>
                    <TableCell className="font-medium">{role.name}</TableCell>
                    <TableCell>
                      {role.color ? (
                        <div className="flex items-center gap-2">
                          <div className="h-4 w-4 rounded border" style={{ backgroundColor: role.color }} />
                          <span className="text-sm text-muted-foreground font-mono">{role.color}</span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>{new Date(role.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon-sm">
                            <MoreHorizontal />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEdit(role)}>
                            <Pencil />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem variant="destructive" onClick={() => handleDeleteClick(role)}>
                            <Trash2 />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>

        {pagination && pagination.total_pages > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Showing {(page - 1) * 10 + 1} to {Math.min(page * 10, pagination.total)} of {pagination.total} roles
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={!pagination.has_previous}
                onClick={() => setPage((p) => p - 1)}
              >
                Previous
              </Button>
              <Button variant="outline" size="sm" disabled={!pagination.has_next} onClick={() => setPage((p) => p + 1)}>
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      <RoleSheet open={sheetOpen} onOpenChange={setSheetOpen} role={selectedRole} onSuccess={fetchRoles} />

      <DeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Role"
        itemName={roleToDelete?.name}
        onConfirm={handleDeleteConfirm}
      />
    </PageLayout>
  );
}

function ViewOptionsButton() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Settings2 />
          <span className="hidden sm:inline">View</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-48">
        <p className="text-sm text-muted-foreground">Column visibility options coming soon.</p>
      </PopoverContent>
    </Popover>
  );
}
