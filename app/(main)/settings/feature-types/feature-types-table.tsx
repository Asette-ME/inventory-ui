'use client';

import { getCoreRowModel, getFilteredRowModel, RowSelectionState, useReactTable } from '@tanstack/react-table';
import { Plus, Sparkles, Trash2 } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

import { DeleteDialog, EmptyState, TableSkeleton } from '@/components/crud';
import { DataTable, DataTableBulkToolbar, DataTablePagination } from '@/components/data-table';
import { Button } from '@/components/ui/button';
import { useTableState } from '@/hooks/use-table-state';
import { bulkDelete, deleteFeatureType, getFeatureTypes } from '@/lib/actions/entities';
import { cn } from '@/lib/utils';
import { PaginationMeta } from '@/types/common';
import { FeatureType } from '@/types/entities';

import { FeatureTypeSheet } from './feature-type-sheet';
import { DEFAULT_VISIBLE_COLUMNS, getFeatureTypesColumns } from './feature-types-columns';
import { FeatureTypesToolbar } from './feature-types-toolbar';

interface FeatureTypesTableProps {
  sheetOpen: boolean;
  onSheetOpenChange: (open: boolean) => void;
}

export function FeatureTypesTable({ sheetOpen, onSheetOpenChange }: FeatureTypesTableProps) {
  const [items, setItems] = useState<FeatureType[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [sortBy, setSortBy] = useState<string>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [selectedItem, setSelectedItem] = useState<FeatureType | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<FeatureType | null>(null);

  const { columnVisibility, columnOrder, onColumnVisibilityChange, onColumnOrderChange } = useTableState({
    key: 'feature-types',
    defaultVisibility: DEFAULT_VISIBLE_COLUMNS,
    pinnedRight: ['actions'],
  });

  const fetchItems = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await getFeatureTypes({ search, page, limit, sort_by: sortBy, sort_order: sortOrder });
      setItems(response.data);
      setPagination(response.pagination);
    } catch {
      toast.error('Failed to load feature types');
    } finally {
      setIsLoading(false);
    }
  }, [search, page, limit, sortBy, sortOrder]);

  useEffect(() => {
    const timer = setTimeout(() => void fetchItems(), 300);
    return () => clearTimeout(timer);
  }, [fetchItems]);

  useEffect(() => {
    if (sheetOpen && !selectedItem) setSelectedItem(null);
  }, [sheetOpen, selectedItem]);

  function handleEdit(item: FeatureType) {
    setSelectedItem(item);
    onSheetOpenChange(true);
  }

  function handleDelete(item: FeatureType) {
    setItemToDelete(item);
    setDeleteDialogOpen(true);
  }

  async function confirmDelete() {
    if (!itemToDelete) return;
    try {
      await deleteFeatureType(itemToDelete.id);
      toast.success(`Feature type "${itemToDelete.name}" deleted successfully`);
      void fetchItems();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete feature type');
    }
  }

  function handleSheetChange(open: boolean) {
    if (!open) setSelectedItem(null);
    onSheetOpenChange(open);
  }

  const columns = getFeatureTypesColumns({
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
    data: items,
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

  const isInitialLoading = isLoading && items.length === 0;

  return (
    <div className="space-y-4">
      <FeatureTypesToolbar
        table={table}
        search={search}
        onSearchChange={(v) => {
          setSearch(v);
          setPage(1);
        }}
        onRefresh={fetchItems}
        isLoading={isLoading}
      />
      <div className={cn('bg-white dark:bg-muted/50 rounded-xl shadow-sm border overflow-hidden')}>
        {isInitialLoading ? (
          <div className="p-4">
            <TableSkeleton rows={5} columns={5} />
          </div>
        ) : items.length === 0 ? (
          <EmptyState
            title="No feature types found"
            description={search ? 'Try adjusting your search' : 'Get started by creating your first feature type'}
            icon={Sparkles}
            action={
              !search && (
                <Button onClick={() => onSheetOpenChange(true)} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Feature Type
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
        onLimitChange={(l) => {
          setLimit(l);
          setPage(1);
        }}
      />
      <FeatureTypeSheet
        open={sheetOpen}
        onOpenChange={handleSheetChange}
        featureType={selectedItem}
        onSuccess={fetchItems}
      />
      <DeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Feature Type"
        itemName={itemToDelete?.name}
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
              const results = await bulkDelete(deleteFeatureType, ids);
              const succeeded = results.filter((r) => r.status === 'fulfilled').length;
              const failed = results.filter((r) => r.status === 'rejected').length;
              if (succeeded > 0) toast.success(`${succeeded} feature types deleted`);
              if (failed > 0) toast.error(`${failed} deletions failed`);
              setRowSelection({});
              void fetchItems();
            },
          },
        ]}
      />
    </div>
  );
}
