'use client';

import { getCoreRowModel, getFilteredRowModel, RowSelectionState, useReactTable } from '@tanstack/react-table';
import { KeyRound, Plus, Trash2 } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

import { DeleteDialog, EmptyState, TableSkeleton } from '@/components/crud';
import { DataTable, DataTableBulkToolbar, DataTablePagination } from '@/components/data-table';
import { Button } from '@/components/ui/button';
import { useTableState } from '@/hooks/use-table-state';
import { bulkDelete, deleteRole, getRoles } from '@/lib/actions/entities';
import { cn } from '@/lib/utils';
import { PaginationMeta } from '@/types/common';
import { Role } from '@/types/entities';

import { RoleSheet } from './role-sheet';
import { DEFAULT_VISIBLE_COLUMNS, getRolesColumns } from './roles-columns';
import { RolesToolbar } from './roles-toolbar';

interface RolesTableProps {
  sheetOpen: boolean;
  onSheetOpenChange: (open: boolean) => void;
}

export function RolesTable({ sheetOpen, onSheetOpenChange }: RolesTableProps) {
  const [roles, setRoles] = useState<Role[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [sortBy, setSortBy] = useState<string>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState<Role | null>(null);

  const { columnVisibility, columnOrder, onColumnVisibilityChange, onColumnOrderChange } = useTableState({
    key: 'roles',
    defaultVisibility: DEFAULT_VISIBLE_COLUMNS,
    pinnedRight: ['actions'],
  });

  const fetchRoles = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await getRoles({ search, page, limit, sort_by: sortBy, sort_order: sortOrder });
      setRoles(response.data);
      setPagination(response.pagination);
    } catch {
      toast.error('Failed to load roles');
    } finally {
      setIsLoading(false);
    }
  }, [search, page, limit, sortBy, sortOrder]);

  useEffect(() => {
    const timer = setTimeout(() => void fetchRoles(), 300);
    return () => clearTimeout(timer);
  }, [fetchRoles]);

  useEffect(() => {
    if (sheetOpen && !selectedRole) {
      setSelectedRole(null);
    }
  }, [sheetOpen, selectedRole]);

  function handleEdit(role: Role) {
    setSelectedRole(role);
    onSheetOpenChange(true);
  }

  function handleDelete(role: Role) {
    setRoleToDelete(role);
    setDeleteDialogOpen(true);
  }

  async function confirmDelete() {
    if (!roleToDelete) return;
    try {
      await deleteRole(roleToDelete.id);
      toast.success(`Role "${roleToDelete.name}" deleted successfully`);
      void fetchRoles();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete role');
    }
  }

  function handleSheetChange(open: boolean) {
    if (!open) setSelectedRole(null);
    onSheetOpenChange(open);
  }

  const columns = getRolesColumns({
    sortBy,
    sortOrder,
    onSort: (key, order) => {
      setSortBy(key);
      setSortOrder(order);
    },
    onEdit: handleEdit,
    onDelete: handleDelete,
  });

  const table = useReactTable({
    data: roles,
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

  const isInitialLoading = isLoading && roles.length === 0;

  return (
    <div className="space-y-4">
      <RolesToolbar
        table={table}
        search={search}
        onSearchChange={(value) => {
          setSearch(value);
          setPage(1);
        }}
        onRefresh={fetchRoles}
        isLoading={isLoading}
      />
      <div className={cn('bg-white dark:bg-muted/50 rounded-xl shadow-sm border overflow-hidden')}>
        {isInitialLoading ? (
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
                <Button onClick={() => onSheetOpenChange(true)} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Role
                </Button>
              )
            }
          />
        ) : (
          <DataTable table={table} columns={columns} isLoading={isLoading} isInitialLoading={isInitialLoading} />
        )}
      </div>
      <DataTablePagination
        pagination={pagination}
        limit={limit}
        onPageChange={setPage}
        onLimitChange={(newLimit) => {
          setLimit(newLimit);
          setPage(1);
        }}
      />

      <RoleSheet open={sheetOpen} onOpenChange={handleSheetChange} role={selectedRole} onSuccess={fetchRoles} />
      <DeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Role"
        itemName={roleToDelete?.name}
        onConfirm={confirmDelete}
      />
      <DataTableBulkToolbar
        selectedCount={Object.keys(rowSelection).length}
        onClearSelection={() => setRowSelection({})}
        actions={[
          {
            label: 'Delete',
            icon: <Trash2 className="size-4" />,
            variant: 'destructive' as const,
            onClick: async () => {
              const ids = Object.keys(rowSelection);
              const results = await bulkDelete(deleteRole, ids);
              const succeeded = results.filter((r) => r.status === 'fulfilled').length;
              const failed = results.filter((r) => r.status === 'rejected').length;
              if (succeeded > 0) toast.success(`${succeeded} roles deleted`);
              if (failed > 0) toast.error(`${failed} deletions failed`);
              setRowSelection({});
              void fetchRoles();
            },
          },
        ]}
      />
    </div>
  );
}
