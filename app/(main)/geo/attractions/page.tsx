'use client';

import { ChevronLeft, ChevronRight, Landmark, Plus, RefreshCw, Search } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

import { LocationGroup } from '@/app/(main)/geo/locations/_components/location-group';
import { CardGridSkeleton, DeleteDialog, EmptyState, FilterBar, PageLayout } from '@/components/crud';
import { Button } from '@/components/ui/button';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group';
import { deleteAttraction, getAttractions } from '@/lib/actions/entities';
import { PaginationMeta } from '@/types/common';
import { Attraction } from '@/types/entities';

import { AttractionCard } from './attraction-card';
import { AttractionSheet } from './attraction-sheet';

export default function AttractionsPage() {
  const [attractions, setAttractions] = useState<Attraction[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  // Sheet state
  const [sheetOpen, setSheetOpen] = useState(false);
  const [selectedAttraction, setSelectedAttraction] = useState<Attraction | null>(null);

  // Delete dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [attractionToDelete, setAttractionToDelete] = useState<Attraction | null>(null);

  const fetchAttractions = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await getAttractions({ search, page, limit: 12 });
      setAttractions(response.data);
      setPagination(response.pagination);
    } catch {
      toast.error('Failed to load attractions');
    } finally {
      setIsLoading(false);
    }
  }, [search, page]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void fetchAttractions();
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchAttractions]);

  function handleCreate() {
    setSelectedAttraction(null);
    setSheetOpen(true);
  }

  function handleEdit(attraction: Attraction) {
    setSelectedAttraction(attraction);
    setSheetOpen(true);
  }

  function handleDeleteClick(attraction: Attraction) {
    setAttractionToDelete(attraction);
    setDeleteDialogOpen(true);
  }

  async function handleDeleteConfirm() {
    if (!attractionToDelete) return;
    try {
      await deleteAttraction(attractionToDelete.id);
      toast.success(`Attraction "${attractionToDelete.name}" deleted successfully`);
      void fetchAttractions();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete attraction');
    }
  }

  return (
    <PageLayout
      title="Attractions"
      description="Manage tourist attractions and points of interest"
      icon={Landmark}
      onAdd={handleCreate}
      addLabel="Add Attraction"
    >
      <div className="space-y-6">
        <FilterBar
          actions={
            <Button variant="outline" onClick={fetchAttractions} disabled={isLoading} className="gap-2">
              <RefreshCw className={isLoading ? 'animate-spin' : ''} />
              <span className="hidden sm:inline">Refresh</span>
            </Button>
          }
        >
          <InputGroup className="w-full sm:w-64 bg-white dark:bg-muted/50">
            <InputGroupAddon>
              <Search />
            </InputGroupAddon>
            <InputGroupInput
              placeholder="Search attractions..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </InputGroup>
        </FilterBar>

        {isLoading && attractions.length === 0 ? (
          <CardGridSkeleton count={8} />
        ) : attractions.length === 0 ? (
          <EmptyState
            title="No attractions found"
            description={search ? 'Try adjusting your search' : 'Get started by creating your first attraction'}
            icon={Landmark}
            action={
              !search && (
                <Button onClick={handleCreate} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Attraction
                </Button>
              )
            }
          />
        ) : (
          <LocationGroup>
            {attractions.map((attraction) => (
              <AttractionCard
                key={attraction.id}
                data={attraction}
                onClick={() => handleEdit(attraction)}
                onDelete={() => handleDeleteClick(attraction)}
              />
            ))}
          </LocationGroup>
        )}

        {pagination && pagination.total_pages > 1 && (
          <div className="flex items-center justify-between border-t pt-4">
            <p className="text-sm text-muted-foreground">
              Showing {(page - 1) * 12 + 1} to {Math.min(page * 12, pagination.total)} of {pagination.total} attractions
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

      <AttractionSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        attraction={selectedAttraction}
        onSuccess={fetchAttractions}
      />

      <DeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Attraction"
        itemName={attractionToDelete?.name}
        onConfirm={handleDeleteConfirm}
      />
    </PageLayout>
  );
}
