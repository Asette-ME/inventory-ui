'use client';

import { ChevronLeft, ChevronRight, MapPin, Plus, RefreshCw, Search } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

import { LocationCard } from '@/app/(main)/geo/locations/_components/location-card';
import { LocationGroup } from '@/app/(main)/geo/locations/_components/location-group';
import { CardGridSkeleton, DeleteDialog, EmptyState, FilterBar, PageLayout } from '@/components/crud';
import { Button } from '@/components/ui/button';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group';
import { deleteCountry, getCountries } from '@/lib/actions/entities';
import { PaginationMeta } from '@/types/common';
import { Country } from '@/types/entities';

import { CountrySheet } from './country-sheet';

export default function CountriesPage() {
  const [countries, setCountries] = useState<Country[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  // Sheet state
  const [sheetOpen, setSheetOpen] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);

  // Delete dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [countryToDelete, setCountryToDelete] = useState<Country | null>(null);

  const fetchCountries = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await getCountries({ search, page, limit: 12 });
      setCountries(response.data);
      setPagination(response.pagination);
    } catch {
      toast.error('Failed to load countries');
    } finally {
      setIsLoading(false);
    }
  }, [search, page]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void fetchCountries();
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchCountries]);

  function handleCreate() {
    setSelectedCountry(null);
    setSheetOpen(true);
  }

  function handleEdit(country: Country) {
    setSelectedCountry(country);
    setSheetOpen(true);
  }

  function handleDeleteClick(country: Country) {
    setCountryToDelete(country);
    setDeleteDialogOpen(true);
  }

  async function handleDeleteConfirm() {
    if (!countryToDelete) return;
    try {
      await deleteCountry(countryToDelete.id);
      toast.success(`Country "${countryToDelete.name}" deleted successfully`);
      void fetchCountries();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete country');
    }
  }

  return (
    <PageLayout
      title="Countries"
      description="Manage countries and their geographic boundaries"
      icon={MapPin}
      onAdd={handleCreate}
      addLabel="Add Country"
    >
      <div className="space-y-6">
        <FilterBar>
          <InputGroup className="w-full sm:w-64 bg-white dark:bg-muted/50">
            <InputGroupAddon>
              <Search />
            </InputGroupAddon>
            <InputGroupInput
              placeholder="Search countries..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </InputGroup>
          <Button variant="outline" onClick={fetchCountries} disabled={isLoading} className="gap-2">
            <RefreshCw className={isLoading ? 'animate-spin' : ''} />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
        </FilterBar>

        {isLoading && countries.length === 0 ? (
          <CardGridSkeleton count={8} />
        ) : countries.length === 0 ? (
          <EmptyState
            title="No countries found"
            description={search ? 'Try adjusting your search' : 'Get started by creating your first country'}
            icon={MapPin}
            action={
              !search && (
                <Button onClick={handleCreate} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Country
                </Button>
              )
            }
          />
        ) : (
          <LocationGroup>
            {countries.map((country) => (
              <LocationCard key={country.id} data={country as any} onClick={() => handleEdit(country)} />
            ))}
          </LocationGroup>
        )}

        {pagination && pagination.total_pages > 1 && (
          <div className="flex items-center justify-between border-t pt-4">
            <p className="text-sm text-muted-foreground">
              Showing {(page - 1) * 12 + 1} to {Math.min(page * 12, pagination.total)} of {pagination.total} countries
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

      <CountrySheet open={sheetOpen} onOpenChange={setSheetOpen} country={selectedCountry} onSuccess={fetchCountries} />

      <DeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Country"
        itemName={countryToDelete?.name}
        onConfirm={handleDeleteConfirm}
      />
    </PageLayout>
  );
}
