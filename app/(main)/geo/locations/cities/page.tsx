'use client';

import { Building2, ChevronLeft, ChevronRight, Plus, RefreshCw, Search } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

import { LocationCard } from '@/app/(main)/geo/locations/_components/location-card';
import { LocationGroup } from '@/app/(main)/geo/locations/_components/location-group';
import { CardGridSkeleton, DeleteDialog, EmptyState, FilterBar, PageLayout } from '@/components/crud';
import { Button } from '@/components/ui/button';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { deleteCity, getCities, getCountries } from '@/lib/actions/entities';
import { PaginationMeta } from '@/types/common';
import { City, Country } from '@/types/entities';

import { CitySheet } from './city-sheet';

export default function CitiesPage() {
  const [cities, setCities] = useState<City[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [countryFilter, setCountryFilter] = useState<string>('all');
  const [page, setPage] = useState(1);

  // Sheet state
  const [sheetOpen, setSheetOpen] = useState(false);
  const [selectedCity, setSelectedCity] = useState<City | null>(null);

  // Delete dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [cityToDelete, setCityToDelete] = useState<City | null>(null);

  // Fetch countries for the filter dropdown
  useEffect(() => {
    async function fetchCountries() {
      try {
        const response = await getCountries({ limit: 100 });
        setCountries(response.data);
      } catch (err) {
        console.error('Failed to load countries:', err);
      }
    }
    void fetchCountries();
  }, []);

  const fetchCities = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await getCities({
        search,
        page,
        limit: 12,
        country_id: countryFilter !== 'all' ? countryFilter : undefined,
      });
      setCities(response.data);
      setPagination(response.pagination);
    } catch {
      toast.error('Failed to load cities');
    } finally {
      setIsLoading(false);
    }
  }, [search, page, countryFilter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void fetchCities();
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchCities]);

  function handleCreate() {
    setSelectedCity(null);
    setSheetOpen(true);
  }

  function handleEdit(city: City) {
    setSelectedCity(city);
    setSheetOpen(true);
  }

  function handleDeleteClick(city: City) {
    setCityToDelete(city);
    setDeleteDialogOpen(true);
  }

  async function handleDeleteConfirm() {
    if (!cityToDelete) return;
    try {
      await deleteCity(cityToDelete.id);
      toast.success(`City "${cityToDelete.name}" deleted successfully`);
      void fetchCities();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete city');
    }
  }

  // Get country name for display
  function getCountryName(countryId: string): string {
    const country = countries.find((c) => c.id === countryId);
    return country?.name || '';
  }

  return (
    <PageLayout
      title="Cities"
      description="Manage cities and their geographic boundaries"
      icon={Building2}
      onAdd={handleCreate}
      addLabel="Add City"
    >
      <div className="space-y-6">
        <FilterBar
          actions={
            <Button variant="outline" onClick={fetchCities} disabled={isLoading} className="gap-2">
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
              placeholder="Search cities..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </InputGroup>
          <Select
            value={countryFilter}
            onValueChange={(value) => {
              setCountryFilter(value);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-full sm:w-48 bg-white dark:bg-muted/50">
              <SelectValue placeholder="Filter by country" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Countries</SelectItem>
              {countries.map((country) => (
                <SelectItem key={country.id} value={country.id}>
                  {country.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FilterBar>

        {isLoading && cities.length === 0 ? (
          <CardGridSkeleton count={8} />
        ) : cities.length === 0 ? (
          <EmptyState
            title="No cities found"
            description={
              search || countryFilter !== 'all'
                ? 'Try adjusting your filters'
                : 'Get started by creating your first city'
            }
            icon={Building2}
            action={
              !search &&
              countryFilter === 'all' && (
                <Button onClick={handleCreate} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add City
                </Button>
              )
            }
          />
        ) : (
          <LocationGroup>
            {cities.map((city) => (
              <LocationCard
                key={city.id}
                data={
                  {
                    ...city,
                  } as any
                }
                onClick={() => handleEdit(city)}
                onDelete={() => handleDeleteClick(city)}
              />
            ))}
          </LocationGroup>
        )}

        {pagination && pagination.total_pages > 1 && (
          <div className="flex items-center justify-between border-t pt-4">
            <p className="text-sm text-muted-foreground">
              Showing {(page - 1) * 12 + 1} to {Math.min(page * 12, pagination.total)} of {pagination.total} cities
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

      <CitySheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        city={selectedCity}
        countries={countries}
        onSuccess={fetchCities}
      />

      <DeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete City"
        itemName={cityToDelete?.name}
        onConfirm={handleDeleteConfirm}
      />
    </PageLayout>
  );
}
