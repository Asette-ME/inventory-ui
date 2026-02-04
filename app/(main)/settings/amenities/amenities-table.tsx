'use client';

import { getCoreRowModel, getFilteredRowModel, useReactTable } from '@tanstack/react-table';
import { Coffee, Plus } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

import { DeleteDialog, EmptyState, TableSkeleton } from '@/components/crud';
import { DataTable, DataTablePagination } from '@/components/data-table';
import { Button } from '@/components/ui/button';
import { useTableState } from '@/hooks/use-table-state';
import { deleteAmenity, getAmenities } from '@/lib/actions/entities';
import { cn } from '@/lib/utils';
import { PaginationMeta } from '@/types/common';
import { Amenity } from '@/types/entities';

import { DEFAULT_VISIBLE_COLUMNS, getAmenitiesColumns } from './amenities-columns';
import { AmenitiesToolbar } from './amenities-toolbar';
import { AmenitySheet } from './amenity-sheet';

interface AmenitiesTableProps {
  sheetOpen: boolean;
  onSheetOpenChange: (open: boolean) => void;
}

export function AmenitiesTable({ sheetOpen, onSheetOpenChange }: AmenitiesTableProps) {
  const [items, setItems] = useState<Amenity[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [sortBy, setSortBy] = useState<string>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const [selectedItem, setSelectedItem] = useState<Amenity | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<Amenity | null>(null);

  const { columnVisibility, columnOrder, onColumnVisibilityChange, onColumnOrderChange } = useTableState({
    key: 'amenities',
    defaultVisibility: DEFAULT_VISIBLE_COLUMNS,
    pinnedRight: ['actions'],
  });

  const fetchItems = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await getAmenities({ search, page, limit, sort_by: sortBy, sort_order: sortOrder });
      setItems(response.data);
      setPagination(response.pagination);
    } catch {
      toast.error('Failed to load amenities');
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

  function handleEdit(item: Amenity) {
    setSelectedItem(item);
    onSheetOpenChange(true);
  }

  function handleDelete(item: Amenity) {
    setItemToDelete(item);
    setDeleteDialogOpen(true);
  }

  async function confirmDelete() {
    if (!itemToDelete) return;
    try {
      await deleteAmenity(itemToDelete.id);
      toast.success(`Amenity "${itemToDelete.name}" deleted successfully`);
      void fetchItems();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete amenity');
    }
  }

  function handleSheetChange(open: boolean) {
    if (!open) setSelectedItem(null);
    onSheetOpenChange(open);
  }

  const columns = getAmenitiesColumns({
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
      <AmenitiesToolbar
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
            <TableSkeleton rows={5} columns={6} />
          </div>
        ) : items.length === 0 ? (
          <EmptyState
            title="No amenities found"
            description={search ? 'Try adjusting your search' : 'Get started by creating your first amenity'}
            icon={Coffee}
            action={
              !search && (
                <Button onClick={() => onSheetOpenChange(true)} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Amenity
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
      <AmenitySheet open={sheetOpen} onOpenChange={handleSheetChange} amenity={selectedItem} onSuccess={fetchItems} />
      <DeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Amenity"
        itemName={itemToDelete?.name}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
