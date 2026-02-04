'use client';

import { ChevronLeft, ChevronRight, MapPinned, Plus, RefreshCw, Search } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

import { CardGridSkeleton, DeleteDialog, EmptyState, FilterBar, PageLayout } from '@/components/crud';
import { Button } from '@/components/ui/button';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group';
import { ItemGroup } from '@/components/ui/item';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { deleteDistrict, getCities, getDistricts } from '@/lib/actions/entities';
import { PaginationMeta } from '@/types/common';
import { City, District } from '@/types/entities';

import { LocationCard } from '../_components/location-card';
import { DistrictSheet } from './district-sheet';

export default function DistrictsPage() {
  const [districts, setDistricts] = useState<District[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [cityFilter, setCityFilter] = useState<string>('');
  const [page, setPage] = useState(1);

  // Sheet state
  const [sheetOpen, setSheetOpen] = useState(false);
  const [selectedDistrict, setSelectedDistrict] = useState<District | null>(null);

  // Delete dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [districtToDelete, setDistrictToDelete] = useState<District | null>(null);

  // Fetch cities for filter dropdown
  useEffect(() => {
    async function loadCities() {
      try {
        const response = await getCities({ limit: 100 });
        setCities(response.data);
      } catch (err) {
        console.error('Failed to load cities:', err);
      }
    }
    void loadCities();
  }, []);

  const fetchDistricts = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await getDistricts({
        search,
        page,
        limit: 12,
        city_id: cityFilter || undefined,
      });
      setDistricts(response.data);
      setPagination(response.pagination);
    } catch {
      toast.error('Failed to load districts');
    } finally {
      setIsLoading(false);
    }
  }, [search, page, cityFilter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void fetchDistricts();
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchDistricts]);

  function handleCreate() {
    setSelectedDistrict(null);
    setSheetOpen(true);
  }

  function handleEdit(district: District) {
    setSelectedDistrict(district);
    setSheetOpen(true);
  }

  function handleDeleteClick(district: District) {
    setDistrictToDelete(district);
    setDeleteDialogOpen(true);
  }

  async function handleDeleteConfirm() {
    if (!districtToDelete) return;
    try {
      await deleteDistrict(districtToDelete.id);
      toast.success(`District "${districtToDelete.name}" deleted successfully`);
      void fetchDistricts();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete district');
    }
  }

  function handleCityFilterChange(value: string) {
    setCityFilter(value === 'all' ? '' : value);
    setPage(1);
  }

  return (
    <PageLayout
      title="Districts"
      description="Manage districts and their geographic boundaries"
      icon={MapPinned}
      onAdd={handleCreate}
      addLabel="Add District"
    >
      <div className="space-y-6">
        <FilterBar>
          <InputGroup className="w-full sm:w-64 bg-white dark:bg-muted/50">
            <InputGroupAddon>
              <Search />
            </InputGroupAddon>
            <InputGroupInput
              placeholder="Search districts..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </InputGroup>
          <Select value={cityFilter || 'all'} onValueChange={handleCityFilterChange}>
            <SelectTrigger className="w-full sm:w-48 bg-white dark:bg-muted/50">
              <SelectValue placeholder="Filter by city" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Cities</SelectItem>
              {cities.map((city) => (
                <SelectItem key={city.id} value={city.id}>
                  {city.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={fetchDistricts} disabled={isLoading} className="gap-2">
            <RefreshCw className={isLoading ? 'animate-spin' : ''} />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
        </FilterBar>

        {isLoading && districts.length === 0 ? (
          <CardGridSkeleton count={8} />
        ) : districts.length === 0 ? (
          <EmptyState
            title="No districts found"
            description={
              search || cityFilter ? 'Try adjusting your filters' : 'Get started by creating your first district'
            }
            icon={MapPinned}
            action={
              !search &&
              !cityFilter && (
                <Button onClick={handleCreate} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add District
                </Button>
              )
            }
          />
        ) : (
          <ItemGroup className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {districts.map((district) => (
              <LocationCard key={district.id} data={district as any} onClick={() => handleEdit(district)} />
            ))}
          </ItemGroup>
        )}

        {pagination && pagination.total_pages > 1 && (
          <div className="flex items-center justify-between border-t pt-4">
            <p className="text-sm text-muted-foreground">
              Showing {(page - 1) * 12 + 1} to {Math.min(page * 12, pagination.total)} of {pagination.total} districts
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

      <DistrictSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        district={selectedDistrict}
        onSuccess={fetchDistricts}
      />

      <DeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete District"
        itemName={districtToDelete?.name}
        onConfirm={handleDeleteConfirm}
      />
    </PageLayout>
  );
}
