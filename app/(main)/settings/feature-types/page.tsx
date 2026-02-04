'use client';

import { MoreHorizontal, Pencil, Plus, RefreshCw, Search, Settings2, Sparkles, Trash2 } from 'lucide-react';
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
import { IconDisplay } from '@/components/ui/icon-display';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { deleteFeatureType, getFeatureTypes } from '@/lib/actions/entities';
import { PaginationMeta } from '@/types/common';
import { FeatureType } from '@/types/entities';

import { FeatureTypeSheet } from './feature-type-sheet';

type SortOrder = 'asc' | 'desc';

export default function FeatureTypesPage() {
  const [featureTypes, setFeatureTypes] = useState<FeatureType[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState<string>('created_at');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  const [sheetOpen, setSheetOpen] = useState(false);
  const [selectedFeatureType, setSelectedFeatureType] = useState<FeatureType | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [featureTypeToDelete, setFeatureTypeToDelete] = useState<FeatureType | null>(null);

  const fetchFeatureTypes = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await getFeatureTypes({ search, page, limit: 10, sort_by: sortBy, sort_order: sortOrder });
      setFeatureTypes(response.data);
      setPagination(response.pagination);
    } catch {
      toast.error('Failed to load feature types');
    } finally {
      setIsLoading(false);
    }
  }, [search, page, sortBy, sortOrder]);

  useEffect(() => {
    const timer = setTimeout(() => void fetchFeatureTypes(), 300);
    return () => clearTimeout(timer);
  }, [fetchFeatureTypes]);

  function handleSort(key: string, order: SortOrder) {
    setSortBy(key);
    setSortOrder(order);
  }

  function handleCreate() {
    setSelectedFeatureType(null);
    setSheetOpen(true);
  }

  function handleEdit(featureType: FeatureType) {
    setSelectedFeatureType(featureType);
    setSheetOpen(true);
  }

  function handleDeleteClick(featureType: FeatureType) {
    setFeatureTypeToDelete(featureType);
    setDeleteDialogOpen(true);
  }

  async function handleDeleteConfirm() {
    if (!featureTypeToDelete) return;
    try {
      await deleteFeatureType(featureTypeToDelete.id);
      toast.success(`Feature type "${featureTypeToDelete.name}" deleted successfully`);
      void fetchFeatureTypes();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete feature type');
    }
  }

  return (
    <PageLayout
      title="Feature Types"
      description="Manage feature types for your properties"
      icon={Sparkles}
      onAdd={handleCreate}
      addLabel="Add Feature Type"
    >
      <div className="space-y-4">
        <FilterBar
          actions={
            <>
              <Button variant="outline" onClick={fetchFeatureTypes} disabled={isLoading} className="gap-2">
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
              placeholder="Search feature types..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </InputGroup>
        </FilterBar>

        <div className="bg-white dark:bg-muted/50 rounded-xl shadow-sm border overflow-hidden">
          {isLoading && featureTypes.length === 0 ? (
            <div className="p-4">
              <TableSkeleton rows={5} columns={5} />
            </div>
          ) : featureTypes.length === 0 ? (
            <EmptyState
              title="No feature types found"
              description={search ? 'Try adjusting your search' : 'Get started by creating your first feature type'}
              icon={Sparkles}
              action={
                !search && (
                  <Button onClick={handleCreate} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add Feature Type
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
                  <TableHead>Icon</TableHead>
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
                {featureTypes.map((featureType) => (
                  <TableRow key={featureType.id}>
                    <TableCell className="font-medium">{featureType.name}</TableCell>
                    <TableCell>
                      <IconDisplay
                        name={featureType.icon}
                        className="h-5 w-5"
                        fallback={<span className="text-muted-foreground">—</span>}
                      />
                    </TableCell>
                    <TableCell>
                      {featureType.color ? (
                        <div className="flex items-center gap-2">
                          <div className="h-4 w-4 rounded border" style={{ backgroundColor: featureType.color }} />
                          <span className="text-sm text-muted-foreground font-mono">{featureType.color}</span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>{new Date(featureType.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon-sm">
                            <MoreHorizontal />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEdit(featureType)}>
                            <Pencil />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem variant="destructive" onClick={() => handleDeleteClick(featureType)}>
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
              Showing {(page - 1) * 10 + 1} to {Math.min(page * 10, pagination.total)} of {pagination.total} feature
              types
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

      <FeatureTypeSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        featureType={selectedFeatureType}
        onSuccess={fetchFeatureTypes}
      />

      <DeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Feature Type"
        itemName={featureTypeToDelete?.name}
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
