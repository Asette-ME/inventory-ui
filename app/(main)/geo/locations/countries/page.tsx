'use client';

import { Button } from '@/components/ui/button';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group';
import { ItemGroup } from '@/components/ui/item';
import { api } from '@/lib/api';
import { ChevronLeft, ChevronRight, MapPin, SearchIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { LocationCard } from '../_components/location-card';
import { LocationSheet } from '../_components/location-sheet';
import { ApiResponse, GeoLocation, PaginationMeta } from '../_components/types';

export default function CountriesPage() {
  const [data, setData] = useState<GeoLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<GeoLocation | null>(null);
  const [limit] = useState(10);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });
      if (search) params.append('search', search);

      const res = await api.get(`/country/?${params.toString()}`);
      if (res.ok) {
        const json = (await res.json()) as ApiResponse<GeoLocation>;
        if (json.success) {
          setData(json.data);
          setPagination(json.pagination);
        }
      }
    } catch (error) {
      console.error('Failed to fetch countries', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchData();
    }, 500); // Increased debounce slightly
    return () => clearTimeout(timer);
  }, [search, page]);

  const handleEdit = (item: GeoLocation) => {
    console.log('Edit', item);
    // TODO: Implement edit logic
  };

  const handleDelete = (item: GeoLocation) => {
    console.log('Delete', item);
    // TODO: Implement delete logic
  };

  return (
    <div className="flex flex-1 flex-col gap-6 p-6 h-full">
      <div>
        <div className="flex items-center gap-2">
          <MapPin />
          <h1 className="text-2xl font-bold mb-0">Countries</h1>
        </div>
        <p className="text-muted-foreground">Manage countries</p>
      </div>

      <div className="flex items-center gap-4">
        <div className="max-w-sm w-full">
          <InputGroup className="bg-white">
            <InputGroupAddon>
              <SearchIcon />
            </InputGroupAddon>
            <InputGroupInput
              type="search"
              placeholder="Search countries..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </InputGroup>
        </div>
      </div>

      <LocationList
        data={data}
        isLoading={loading}
        setSelectedLocation={setSelectedLocation}
        handleEdit={handleEdit}
        handleDelete={handleDelete}
      />

      {pagination && (
        <div className="flex items-center justify-between border-t pt-4">
          <div className="text-sm text-muted-foreground">
            Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
            {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} entries
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={!pagination.has_previous}
              onClick={() => setPage((p) => p - 1)}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
            <Button variant="outline" size="sm" disabled={!pagination.has_next} onClick={() => setPage((p) => p + 1)}>
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

      <LocationSheet
        data={selectedLocation}
        open={!!selectedLocation}
        onOpenChange={(open) => !open && setSelectedLocation(null)}
      />
    </div>
  );
}

function LocationList({
  data,
  isLoading,
  setSelectedLocation,
  handleEdit,
  handleDelete,
}: {
  data: GeoLocation[];
  isLoading: boolean;
  setSelectedLocation: (location: GeoLocation | null) => void;
  handleEdit: (location: GeoLocation) => void;
  handleDelete: (location: GeoLocation) => void;
}) {
  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="h-64 rounded-lg bg-muted animate-pulse" />
        ))}
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-lg border border-dashed text-muted-foreground">
        No countries found
      </div>
    );
  }

  return (
    <ItemGroup className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {data.map((country) => (
        <LocationCard
          key={country.id}
          data={country}
          onClick={setSelectedLocation}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      ))}
    </ItemGroup>
  );
}
