'use client';

import { getCoreRowModel, getFilteredRowModel, RowSelectionState, useReactTable } from '@tanstack/react-table';
import { Shield, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { DeleteDialog } from '@/components/crud/delete-dialog';
import { DataTable, DataTableBulkToolbar, DataTablePagination } from '@/components/data-table';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { useTableState } from '@/hooks/use-table-state';
import { useUsers } from '@/hooks/use-users';
import { useUsersParams } from '@/hooks/use-users-params';
import { bulkAssignRoles, bulkDelete, deleteUser, getRoles } from '@/lib/actions/entities';
import { cn } from '@/lib/utils';
import { Role, User } from '@/types/entities';

import { UserSheet } from './user-sheet';
import { DEFAULT_VISIBLE_COLUMNS, getUsersColumns } from './users-columns';
import { UsersToolbar } from './users-toolbar';

interface UsersTableContentProps {
  sheetOpen: boolean;
  onSheetOpenChange: (open: boolean) => void;
}

export function UsersTableContent({ sheetOpen, onSheetOpenChange }: UsersTableContentProps) {
  const { params, setParams, resetParams } = useUsersParams();
  const { users, pagination, isLoading, isInitialLoading, refetch } = useUsers(params);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Delete dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  // Bulk delete dialog state
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);

  // Bulk assign roles dialog state
  const [bulkRoleDialogOpen, setBulkRoleDialogOpen] = useState(false);
  const [availableRoles, setAvailableRoles] = useState<Role[]>([]);
  const [bulkRoleIds, setBulkRoleIds] = useState<string[]>([]);
  const [rolesLoading, setRolesLoading] = useState(false);
  const [bulkAssigning, setBulkAssigning] = useState(false);

  const { columnVisibility, columnOrder, onColumnVisibilityChange, onColumnOrderChange } = useTableState({
    key: 'users',
    defaultVisibility: DEFAULT_VISIBLE_COLUMNS,
    pinnedLeft: ['select'],
    pinnedRight: ['actions'],
  });

  // Reset selected user when sheet opens for create
  useEffect(() => {
    if (sheetOpen && !selectedUser) {
      setSelectedUser(null);
    }
  }, [sheetOpen, selectedUser]);

  function handleEdit(user: User) {
    setSelectedUser(user);
    onSheetOpenChange(true);
  }

  function handleDelete(user: User) {
    setUserToDelete(user);
    setDeleteDialogOpen(true);
  }

  async function confirmDelete() {
    if (!userToDelete) return;
    try {
      await deleteUser(userToDelete.id);
      toast.success(`User "${userToDelete.username}" deleted successfully`);
      refetch();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete user');
    }
  }

  function handleSheetChange(open: boolean) {
    if (!open) {
      setSelectedUser(null);
    }
    onSheetOpenChange(open);
  }

  const columns = getUsersColumns({
    sortBy: params.sort_by,
    sortOrder: params.sort_order,
    onSort: (sort_by, sort_order) => setParams({ sort_by, sort_order }),
    onEdit: handleEdit,
    onDelete: handleDelete,
  });

  const table = useReactTable({
    data: users,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange,
    onColumnOrderChange,
    onRowSelectionChange: setRowSelection,
    getRowId: (row) => row.id,
    state: { columnVisibility, columnOrder, rowSelection },
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
  });

  return (
    <div className="space-y-4">
      <UsersToolbar
        table={table}
        search={params.search || ''}
        roles={params.roles || []}
        onSearchChange={(search) => setParams({ search: search || undefined })}
        onRolesChange={(roles) => setParams({ roles: roles.length > 0 ? roles : undefined })}
        onReset={resetParams}
        onRefresh={refetch}
        isLoading={isLoading}
      />
      <div
        className={cn(
          'bg-white dark:bg-muted/50 rounded-xl shadow-sm border',
          'border-gray-200 dark:border-0 overflow-hidden',
        )}
      >
        <DataTable table={table} columns={columns} isLoading={isLoading} isInitialLoading={isInitialLoading} />
      </div>
      <DataTablePagination
        pagination={pagination}
        limit={params.limit || 10}
        onPageChange={(page) => setParams({ page })}
        onLimitChange={(limit) => setParams({ limit, page: 1 })}
      />

      <UserSheet open={sheetOpen} onOpenChange={handleSheetChange} user={selectedUser} onSuccess={refetch} />

      <DeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete User"
        itemName={userToDelete?.username}
        onConfirm={confirmDelete}
      />

      <DeleteDialog
        open={bulkDeleteDialogOpen}
        onOpenChange={setBulkDeleteDialogOpen}
        title="Delete Users"
        itemName={`${Object.keys(rowSelection).length} selected users`}
        onConfirm={async () => {
          const ids = Object.keys(rowSelection);
          const results = await bulkDelete(deleteUser, ids);
          const succeeded = results.filter((r) => r.status === 'fulfilled').length;
          const failed = results.filter((r) => r.status === 'rejected').length;
          if (succeeded > 0) toast.success(`${succeeded} users deleted`);
          if (failed > 0) toast.error(`${failed} deletions failed`);
          setRowSelection({});
          refetch();
        }}
      />

      <DataTableBulkToolbar
        selectedCount={Object.keys(rowSelection).length}
        onClearSelection={() => setRowSelection({})}
        actions={[
          {
            label: 'Assign Roles',
            icon: <Shield className="size-4" />,
            onClick: async () => {
              setBulkRoleDialogOpen(true);
              setBulkRoleIds([]);
              setRolesLoading(true);
              try {
                const res = await getRoles({ limit: 100 });
                setAvailableRoles(res.data);
              } catch {
                toast.error('Failed to load roles');
              } finally {
                setRolesLoading(false);
              }
            },
          },
          {
            label: 'Delete',
            icon: <Trash2 className="size-4" />,
            variant: 'destructive' as const,
            onClick: () => setBulkDeleteDialogOpen(true),
          },
        ]}
      />

      <Dialog open={bulkRoleDialogOpen} onOpenChange={setBulkRoleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Roles</DialogTitle>
            <DialogDescription>
              Select roles to assign to {Object.keys(rowSelection).length} selected users.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {rolesLoading ? (
              <div className="grid grid-cols-2 gap-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full rounded-md" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {availableRoles.map((role) => (
                  <label
                    key={role.id}
                    className={cn(
                      'flex items-center gap-2 rounded-md border p-3',
                      'cursor-pointer hover:bg-muted/50 transition-colors',
                    )}
                  >
                    <Checkbox
                      checked={bulkRoleIds.includes(role.id)}
                      onCheckedChange={(checked) => {
                        setBulkRoleIds((prev) => (checked ? [...prev, role.id] : prev.filter((id) => id !== role.id)));
                      }}
                    />
                    <span className="text-sm font-medium">{role.name}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBulkRoleDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              disabled={bulkRoleIds.length === 0 || bulkAssigning}
              onClick={async () => {
                setBulkAssigning(true);
                try {
                  const ids = Object.keys(rowSelection);
                  const results = await bulkAssignRoles(ids, bulkRoleIds);
                  const succeeded = results.filter((r) => r.status === 'fulfilled').length;
                  const failed = results.filter((r) => r.status === 'rejected').length;
                  if (succeeded > 0) toast.success(`Roles assigned to ${succeeded} users`);
                  if (failed > 0) toast.error(`${failed} assignments failed`);
                  setRowSelection({});
                  setBulkRoleDialogOpen(false);
                  refetch();
                } catch {
                  toast.error('Failed to assign roles');
                } finally {
                  setBulkAssigning(false);
                }
              }}
            >
              {bulkAssigning ? 'Assigning...' : 'Assign Roles'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
