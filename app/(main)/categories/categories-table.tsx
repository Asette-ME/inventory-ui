'use client';

import { getCoreRowModel, getFilteredRowModel, useReactTable } from '@tanstack/react-table';
import { Plus, Tags } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

import { DeleteDialog, EmptyState, TableSkeleton } from '@/components/crud';
import { DataTable, DataTablePagination } from '@/components/data-table';
import { Button } from '@/components/ui/button';
import { useTableState } from '@/hooks/use-table-state';
import { deleteCategory, getCategories } from '@/lib/actions/entities';
import { cn } from '@/lib/utils';
import { PaginationMeta } from '@/types/common';
import { Category } from '@/types/entities';

import { DEFAULT_VISIBLE_COLUMNS, getCategoriesColumns } from './categories-columns';
import { CategoriesToolbar } from './categories-toolbar';
import { CategorySheet } from './category-sheet';

interface CategoriesTableProps {
  sheetOpen: boolean;
  onSheetOpenChange: (open: boolean) => void;
}

export function CategoriesTable({ sheetOpen, onSheetOpenChange }: CategoriesTableProps) {
  const [items, setItems] = useState<Category[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [sortBy, setSortBy] = useState<string>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const [selectedItem, setSelectedItem] = useState<Category | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<Category | null>(null);

  const { columnVisibility, columnOrder, onColumnVisibilityChange, onColumnOrderChange } = useTableState({
    key: 'categories',
    defaultVisibility: DEFAULT_VISIBLE_COLUMNS,
    pinnedRight: ['actions'],
  });

  const fetchItems = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await getCategories({ search, page, limit, sort_by: sortBy, sort_order: sortOrder });
      setItems(response.data);
      setPagination(response.pagination);
    } catch {
      toast.error('Failed to load categories');
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

  function handleEdit(item: Category) {
    setSelectedItem(item);
    onSheetOpenChange(true);
  }

  function handleDelete(item: Category) {
    setItemToDelete(item);
    setDeleteDialogOpen(true);
  }

  async function confirmDelete() {
    if (!itemToDelete) return;
    try {
      await deleteCategory(itemToDelete.id);
      toast.success(`Category "${itemToDelete.name}" deleted successfully`);
      void fetchItems();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete category');
    }
  }

  function handleSheetChange(open: boolean) {
    if (!open) setSelectedItem(null);
    onSheetOpenChange(open);
  }

  const columns = getCategoriesColumns({
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
    getRowId: (row) => row.id,
    state: { columnVisibility, columnOrder },
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
  });

  const isInitialLoading = isLoading && items.length === 0;

  return (
    <div className="space-y-4">
      <CategoriesToolbar
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
            <TableSkeleton rows={5} columns={3} />
          </div>
        ) : items.length === 0 ? (
          <EmptyState
            title="No categories found"
            description={search ? 'Try adjusting your search' : 'Get started by creating your first category'}
            icon={Tags}
            action={
              !search && (
                <Button onClick={() => onSheetOpenChange(true)} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Category
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
      <CategorySheet open={sheetOpen} onOpenChange={handleSheetChange} category={selectedItem} onSuccess={fetchItems} />
      <DeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Category"
        itemName={itemToDelete?.name}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
