'use client';

import { Landmark, Plus, Search, RefreshCw, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
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
import { IconDisplay } from '@/components/ui/icon-display';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getAttractions, deleteAttraction } from '@/lib/actions/entities';
import { PaginationMeta } from '@/types/common';
import { Attraction } from '@/types/entities';

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
      const response = await getAttractions({ search, page, limit: 10 });
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

  function truncateDescription(description: string | null, maxLength: number = 50): string {
    if (!description) return '';
    if (description.length <= maxLength) return description;
    return description.substring(0, maxLength) + '...';
  }

  return (
    <PageLayout
      title="Attractions"
      description="Manage tourist attractions and points of interest"
      icon={Landmark}
      onAdd={handleCreate}
      addLabel="Add Attraction"
    >
      <div className="space-y-4">
        <FilterBar>
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
          <Button variant="outline" onClick={fetchAttractions} disabled={isLoading} className="gap-2">
            <RefreshCw className={isLoading ? 'animate-spin' : ''} />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
        </FilterBar>

        <div className="bg-white dark:bg-muted/50 rounded-xl shadow-sm border overflow-hidden">
          {isLoading && attractions.length === 0 ? (
            <div className="p-4">
              <TableSkeleton rows={5} columns={6} />
            </div>
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
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Icon</TableHead>
                  <TableHead>Color</TableHead>
                  <TableHead>Created At</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {attractions.map((attraction) => (
                  <TableRow key={attraction.id}>
                    <TableCell className="font-medium">{attraction.name}</TableCell>
                    <TableCell>
                      {attraction.description ? (
                        <span className="text-muted-foreground">{truncateDescription(attraction.description)}</span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <IconDisplay
                        name={attraction.icon}
                        className="h-5 w-5"
                        fallback={<span className="text-muted-foreground">—</span>}
                      />
                    </TableCell>
                    <TableCell>
                      {attraction.color ? (
                        <div className="flex items-center gap-2">
                          <div className="h-4 w-4 rounded border" style={{ backgroundColor: attraction.color }} />
                          <span className="text-sm text-muted-foreground font-mono">{attraction.color}</span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>{new Date(attraction.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon-sm">
                            <MoreHorizontal />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEdit(attraction)}>
                            <Pencil />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem variant="destructive" onClick={() => handleDeleteClick(attraction)}>
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
              Showing {(page - 1) * 10 + 1} to {Math.min(page * 10, pagination.total)} of {pagination.total} attractions
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
