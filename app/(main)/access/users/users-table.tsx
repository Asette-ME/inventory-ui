'use client';

import { getCoreRowModel, getFilteredRowModel, RowSelectionState, useReactTable } from '@tanstack/react-table';
import { useState } from 'react';

import { DataTable, DataTablePagination } from '@/components/data-table';
import { useTableState } from '@/hooks/use-table-state';
import { useUsers } from '@/hooks/use-users';
import { useUsersParams } from '@/hooks/use-users-params';

import { DEFAULT_VISIBLE_COLUMNS, getUsersColumns } from './users-columns';
import { UsersToolbar } from './users-toolbar';

export function UsersTable() {
  const { params, setParams, resetParams } = useUsersParams();
  const { users, pagination, isLoading, isInitialLoading, refetch } = useUsers(params);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  const { columnVisibility, columnOrder, onColumnVisibilityChange, onColumnOrderChange } = useTableState({
    key: 'users',
    defaultVisibility: DEFAULT_VISIBLE_COLUMNS,
    pinnedLeft: ['select'],
    pinnedRight: ['actions'],
  });

  const columns = getUsersColumns({
    sortBy: params.sort_by,
    sortOrder: params.sort_order,
    onSort: (sort_by, sort_order) => setParams({ sort_by, sort_order }),
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
      <div className="bg-white dark:bg-muted/50 rounded-xl shadow-sm border border-gray-200 dark:border-0 overflow-hidden">
        <DataTable table={table} columns={columns} isLoading={isLoading} isInitialLoading={isInitialLoading} />
      </div>
      <DataTablePagination
        pagination={pagination}
        limit={params.limit || 10}
        onPageChange={(page) => setParams({ page })}
        onLimitChange={(limit) => setParams({ limit, page: 1 })}
      />
    </div>
  );
}
