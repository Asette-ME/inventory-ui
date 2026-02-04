'use client';

import { KeyRound, Plus, Search, RefreshCw, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

import { PageLayout, FilterBar, EmptyState, DeleteDialog, TableSkeleton } from '@/components/crud';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getRoles, deleteRole } from '@/lib/actions/entities';
import { PaginationMeta } from '@/types/common';
import { Role } from '@/types/entities';

import { RoleSheet } from './role-sheet';

export default function RolesPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  // Sheet state
  const [sheetOpen, setSheetOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);

  // Delete dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState<Role | null>(null);

  const fetchRoles = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await getRoles({ search, page, limit: 10 });
      setRoles(response.data);
      setPagination(response.pagination);
    } catch {
      toast.error('Failed to load roles');
    } finally {
      setIsLoading(false);
    }
  }, [search, page]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void fetchRoles();
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchRoles]);

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
        <FilterBar>
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
          <Button variant="outline" onClick={fetchRoles} disabled={isLoading} className="gap-2">
            <RefreshCw className={isLoading ? 'animate-spin' : ''} />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
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
                  <TableHead>Name</TableHead>
                  <TableHead>Color</TableHead>
                  <TableHead>Created At</TableHead>
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
