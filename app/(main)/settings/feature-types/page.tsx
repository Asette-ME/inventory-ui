'use client';

import { Sparkles, Plus, Search, RefreshCw, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
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
import { getFeatureTypes, deleteFeatureType } from '@/lib/actions/entities';
import { PaginationMeta } from '@/types/common';
import { FeatureType } from '@/types/entities';

import { FeatureTypeSheet } from './feature-type-sheet';

export default function FeatureTypesPage() {
  const [featureTypes, setFeatureTypes] = useState<FeatureType[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  // Sheet state
  const [sheetOpen, setSheetOpen] = useState(false);
  const [selectedFeatureType, setSelectedFeatureType] = useState<FeatureType | null>(null);

  // Delete dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [featureTypeToDelete, setFeatureTypeToDelete] = useState<FeatureType | null>(null);

  const fetchFeatureTypes = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await getFeatureTypes({ search, page, limit: 10 });
      setFeatureTypes(response.data);
      setPagination(response.pagination);
    } catch {
      toast.error('Failed to load feature types');
    } finally {
      setIsLoading(false);
    }
  }, [search, page]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void fetchFeatureTypes();
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchFeatureTypes]);

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
        <FilterBar>
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
          <Button variant="outline" onClick={fetchFeatureTypes} disabled={isLoading} className="gap-2">
            <RefreshCw className={isLoading ? 'animate-spin' : ''} />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
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
                  <TableHead>Name</TableHead>
                  <TableHead>Icon</TableHead>
                  <TableHead>Color</TableHead>
                  <TableHead>Created At</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {featureTypes.map((featureType) => (
                  <TableRow key={featureType.id}>
                    <TableCell className="font-medium">{featureType.name}</TableCell>
                    <TableCell>
                      {featureType.icon ? (
                        <span className="text-sm text-muted-foreground">{featureType.icon}</span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
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
