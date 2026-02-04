'use client';

import { Coffee, Plus, Search, RefreshCw, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
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
import { getAmenities, deleteAmenity } from '@/lib/actions/entities';
import { PaginationMeta } from '@/types/common';
import { Amenity } from '@/types/entities';

import { AmenitySheet } from './amenity-sheet';

export default function AmenitiesPage() {
  const [amenities, setAmenities] = useState<Amenity[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  // Sheet state
  const [sheetOpen, setSheetOpen] = useState(false);
  const [selectedAmenity, setSelectedAmenity] = useState<Amenity | null>(null);

  // Delete dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [amenityToDelete, setAmenityToDelete] = useState<Amenity | null>(null);

  const fetchAmenities = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await getAmenities({ search, page, limit: 10 });
      setAmenities(response.data);
      setPagination(response.pagination);
    } catch {
      toast.error('Failed to load amenities');
    } finally {
      setIsLoading(false);
    }
  }, [search, page]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void fetchAmenities();
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchAmenities]);

  function handleCreate() {
    setSelectedAmenity(null);
    setSheetOpen(true);
  }

  function handleEdit(amenity: Amenity) {
    setSelectedAmenity(amenity);
    setSheetOpen(true);
  }

  function handleDeleteClick(amenity: Amenity) {
    setAmenityToDelete(amenity);
    setDeleteDialogOpen(true);
  }

  async function handleDeleteConfirm() {
    if (!amenityToDelete) return;
    try {
      await deleteAmenity(amenityToDelete.id);
      toast.success(`Amenity "${amenityToDelete.name}" deleted successfully`);
      void fetchAmenities();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete amenity');
    }
  }

  function truncateDescription(description: string | null, maxLength: number = 50): string {
    if (!description) return '—';
    if (description.length <= maxLength) return description;
    return description.substring(0, maxLength) + '...';
  }

  return (
    <PageLayout
      title="Amenities"
      description="Manage amenities and their locations"
      icon={Coffee}
      onAdd={handleCreate}
      addLabel="Add Amenity"
    >
      <div className="space-y-4">
        <FilterBar>
          <InputGroup className="w-full sm:w-64 bg-white dark:bg-muted/50">
            <InputGroupAddon>
              <Search />
            </InputGroupAddon>
            <InputGroupInput
              placeholder="Search amenities..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </InputGroup>
          <Button variant="outline" onClick={fetchAmenities} disabled={isLoading} className="gap-2">
            <RefreshCw className={isLoading ? 'animate-spin' : ''} />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
        </FilterBar>

        <div className="bg-white dark:bg-muted/50 rounded-xl shadow-sm border overflow-hidden">
          {isLoading && amenities.length === 0 ? (
            <div className="p-4">
              <TableSkeleton rows={5} columns={6} />
            </div>
          ) : amenities.length === 0 ? (
            <EmptyState
              title="No amenities found"
              description={search ? 'Try adjusting your search' : 'Get started by creating your first amenity'}
              icon={Coffee}
              action={
                !search && (
                  <Button onClick={handleCreate} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add Amenity
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
                {amenities.map((amenity) => (
                  <TableRow key={amenity.id}>
                    <TableCell className="font-medium">{amenity.name}</TableCell>
                    <TableCell className="text-muted-foreground">{truncateDescription(amenity.description)}</TableCell>
                    <TableCell>
                      <IconDisplay
                        name={amenity.icon}
                        className="h-5 w-5"
                        fallback={<span className="text-muted-foreground">—</span>}
                      />
                    </TableCell>
                    <TableCell>
                      {amenity.color ? (
                        <div className="flex items-center gap-2">
                          <div className="h-4 w-4 rounded border" style={{ backgroundColor: amenity.color }} />
                          <span className="text-sm text-muted-foreground font-mono">{amenity.color}</span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>{new Date(amenity.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon-sm">
                            <MoreHorizontal />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEdit(amenity)}>
                            <Pencil />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem variant="destructive" onClick={() => handleDeleteClick(amenity)}>
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
              Showing {(page - 1) * 10 + 1} to {Math.min(page * 10, pagination.total)} of {pagination.total} amenities
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

      <AmenitySheet open={sheetOpen} onOpenChange={setSheetOpen} amenity={selectedAmenity} onSuccess={fetchAmenities} />

      <DeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Amenity"
        itemName={amenityToDelete?.name}
        onConfirm={handleDeleteConfirm}
      />
    </PageLayout>
  );
}
