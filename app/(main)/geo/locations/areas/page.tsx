'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { Square, Plus, Search, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';

import { PageLayout, FilterBar, EmptyState, DeleteDialog, CardGridSkeleton } from '@/components/crud';
import { Button } from '@/components/ui/button';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group';
import { ItemGroup } from '@/components/ui/item';
import { getAreas, createArea, updateArea, deleteArea } from '@/lib/actions/entities';
import { Area, AreaCreateInput, AreaUpdateInput } from '@/types/entities';
import { PaginationMeta } from '@/types/common';

import { LocationCard } from '../_components/location-card';
import { AreaSheet } from './area-sheet';

export default function AreasPage() {
  const [areas, setAreas] = useState<Area[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  // Sheet state
  const [sheetOpen, setSheetOpen] = useState(false);
  const [selectedArea, setSelectedArea] = useState<Area | null>(null);

  // Delete dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [areaToDelete, setAreaToDelete] = useState<Area | null>(null);

  const fetchAreas = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await getAreas({ search, page, limit: 12 });
      setAreas(response.data);
      setPagination(response.pagination);
    } catch (error) {
      toast.error('Failed to load areas');
    } finally {
      setIsLoading(false);
    }
  }, [search, page]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchAreas();
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchAreas]);

  function handleCreate() {
    setSelectedArea(null);
    setSheetOpen(true);
  }

  function handleEdit(area: Area) {
    setSelectedArea(area);
    setSheetOpen(true);
  }

  function handleDeleteClick(area: Area) {
    setAreaToDelete(area);
    setDeleteDialogOpen(true);
  }

  async function handleDeleteConfirm() {
    if (!areaToDelete) return;
    try {
      await deleteArea(areaToDelete.id);
      toast.success(`Area "${areaToDelete.name}" deleted successfully`);
      fetchAreas();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete area');
    }
  }

  async function handleSave(data: AreaCreateInput | AreaUpdateInput) {
    if (selectedArea) {
      await updateArea(selectedArea.id, data);
    } else {
      await createArea(data as AreaCreateInput);
    }
    fetchAreas();
  }

  return (
    <PageLayout
      title="Areas"
      description="Manage areas and their geographic boundaries"
      icon={Square}
      onAdd={handleCreate}
      addLabel="Add Area"
    >
      <div className="space-y-6">
        <FilterBar>
          <InputGroup className="w-full sm:w-64 bg-white dark:bg-muted/50">
            <InputGroupAddon>
              <Search />
            </InputGroupAddon>
            <InputGroupInput
              placeholder="Search areas..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </InputGroup>
          <Button variant="outline" onClick={fetchAreas} disabled={isLoading} className="gap-2">
            <RefreshCw className={isLoading ? 'animate-spin' : ''} />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
        </FilterBar>

        {isLoading && areas.length === 0 ? (
          <CardGridSkeleton count={8} />
        ) : areas.length === 0 ? (
          <EmptyState
            title="No areas found"
            description={search ? 'Try adjusting your search' : 'Get started by creating your first area'}
            icon={Square}
            action={
              !search && (
                <Button onClick={handleCreate} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Area
                </Button>
              )
            }
          />
        ) : (
          <ItemGroup className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {areas.map((area) => (
              <LocationCard
                key={area.id}
                data={area as any}
                onClick={() => handleEdit(area)}
                onEdit={() => handleEdit(area)}
                onDelete={() => handleDeleteClick(area)}
              />
            ))}
          </ItemGroup>
        )}

        {pagination && pagination.total_pages > 1 && (
          <div className="flex items-center justify-between border-t pt-4">
            <p className="text-sm text-muted-foreground">
              Showing {(page - 1) * 12 + 1} to {Math.min(page * 12, pagination.total)} of {pagination.total} areas
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={!pagination.has_previous}
                onClick={() => setPage((p) => p - 1)}
              >
                <ChevronLeft className="mr-1 h-4 w-4" />
                Previous
              </Button>
              <Button variant="outline" size="sm" disabled={!pagination.has_next} onClick={() => setPage((p) => p + 1)}>
                Next
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      <AreaSheet open={sheetOpen} onOpenChange={setSheetOpen} area={selectedArea} onSave={handleSave} />

      <DeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Area"
        itemName={areaToDelete?.name}
        onConfirm={handleDeleteConfirm}
      />
    </PageLayout>
  );
}
