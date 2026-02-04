'use client';

import { getCoreRowModel, getFilteredRowModel, RowSelectionState, useReactTable } from '@tanstack/react-table';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { DeleteDialog } from '@/components/crud/delete-dialog';
import { DataTable, DataTablePagination } from '@/components/data-table';
import { Button } from '@/components/ui/button';
import { useTableState } from '@/hooks/use-table-state';
import { useUsers } from '@/hooks/use-users';
import { useUsersParams } from '@/hooks/use-users-params';
import { deleteUser } from '@/lib/actions/entities';
import { cn } from '@/lib/utils';
import { User } from '@/types/entities';

import { UserSheet } from './user-sheet';
import { DEFAULT_VISIBLE_COLUMNS, getUsersColumns } from './users-columns';
import { UsersToolbar } from './users-toolbar';

export function UsersTable() {
  const { params, setParams, resetParams } = useUsersParams();
  const { users, pagination, isLoading, isInitialLoading, refetch } = useUsers(params);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  // Sheet state
  const [sheetOpen, setSheetOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Delete dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  const { columnVisibility, columnOrder, onColumnVisibilityChange, onColumnOrderChange } = useTableState({
    key: 'users',
    defaultVisibility: DEFAULT_VISIBLE_COLUMNS,
    pinnedLeft: ['select'],
    pinnedRight: ['actions'],
  });

  function handleEdit(user: User) {
    setSelectedUser(user);
    setSheetOpen(true);
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

  function handleCreate() {
    setSelectedUser(null);
    setSheetOpen(true);
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
      <div className="flex items-center justify-between gap-4">
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
        <Button onClick={handleCreate} className="gap-2 shrink-0">
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Add User</span>
        </Button>
      </div>
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

      {/* User Sheet for Create/Edit */}
      <UserSheet open={sheetOpen} onOpenChange={setSheetOpen} user={selectedUser} onSuccess={refetch} />

      {/* Delete Confirmation Dialog */}
      <DeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete User"
        itemName={userToDelete?.username}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
