'use client';

import { Building2, MoreHorizontal, Pencil, Plus, RefreshCw, Search, Settings2, Trash2 } from 'lucide-react';
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
import { deleteStructureType, getStructureTypes } from '@/lib/actions/entities';
import { PaginationMeta } from '@/types/common';
import { StructureType } from '@/types/entities';

import { StructureTypeSheet } from './structure-type-sheet';

type SortOrder = 'asc' | 'desc';

export default function StructureTypesPage() {
  const [structureTypes, setStructureTypes] = useState<StructureType[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState<string>('created_at');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  const [sheetOpen, setSheetOpen] = useState(false);
  const [selectedStructureType, setSelectedStructureType] = useState<StructureType | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [structureTypeToDelete, setStructureTypeToDelete] = useState<StructureType | null>(null);

  const fetchStructureTypes = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await getStructureTypes({ search, page, limit: 10, sort_by: sortBy, sort_order: sortOrder });
      setStructureTypes(response.data);
      setPagination(response.pagination);
    } catch {
      toast.error('Failed to load structure types');
    } finally {
      setIsLoading(false);
    }
  }, [search, page, sortBy, sortOrder]);

  useEffect(() => {
    const timer = setTimeout(() => void fetchStructureTypes(), 300);
    return () => clearTimeout(timer);
  }, [fetchStructureTypes]);

  function handleSort(key: string, order: SortOrder) {
    setSortBy(key);
    setSortOrder(order);
  }

  function handleCreate() {
    setSelectedStructureType(null);
    setSheetOpen(true);
  }

  function handleEdit(structureType: StructureType) {
    setSelectedStructureType(structureType);
    setSheetOpen(true);
  }

  function handleDeleteClick(structureType: StructureType) {
    setStructureTypeToDelete(structureType);
    setDeleteDialogOpen(true);
  }

  async function handleDeleteConfirm() {
    if (!structureTypeToDelete) return;
    try {
      await deleteStructureType(structureTypeToDelete.id);
      toast.success(`Structure type "${structureTypeToDelete.name}" deleted successfully`);
      void fetchStructureTypes();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete structure type');
    }
  }

  return (
    <PageLayout
      title="Structure Types"
      description="Manage structure types for properties"
      icon={Building2}
      onAdd={handleCreate}
      addLabel="Add Structure Type"
    >
      <div className="space-y-4">
        <FilterBar
          actions={
            <>
              <Button variant="outline" onClick={fetchStructureTypes} disabled={isLoading} className="gap-2">
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
              placeholder="Search structure types..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </InputGroup>
        </FilterBar>

        <div className="bg-white dark:bg-muted/50 rounded-xl shadow-sm border overflow-hidden">
          {isLoading && structureTypes.length === 0 ? (
            <div className="p-4">
              <TableSkeleton rows={5} columns={5} />
            </div>
          ) : structureTypes.length === 0 ? (
            <EmptyState
              title="No structure types found"
              description={search ? 'Try adjusting your search' : 'Get started by creating your first structure type'}
              icon={Building2}
              action={
                !search && (
                  <Button onClick={handleCreate} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add Structure Type
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
                {structureTypes.map((structureType) => (
                  <TableRow key={structureType.id}>
                    <TableCell className="font-medium">{structureType.name}</TableCell>
                    <TableCell>
                      <IconDisplay
                        name={structureType.icon}
                        className="h-5 w-5"
                        fallback={<span className="text-muted-foreground">—</span>}
                      />
                    </TableCell>
                    <TableCell>
                      {structureType.color ? (
                        <div className="flex items-center gap-2">
                          <div className="h-4 w-4 rounded border" style={{ backgroundColor: structureType.color }} />
                          <span className="text-sm text-muted-foreground font-mono">{structureType.color}</span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>{new Date(structureType.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon-sm">
                            <MoreHorizontal />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEdit(structureType)}>
                            <Pencil />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem variant="destructive" onClick={() => handleDeleteClick(structureType)}>
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
              Showing {(page - 1) * 10 + 1} to {Math.min(page * 10, pagination.total)} of {pagination.total} structure
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

      <StructureTypeSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        structureType={selectedStructureType}
        onSuccess={fetchStructureTypes}
      />

      <DeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Structure Type"
        itemName={structureTypeToDelete?.name}
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
