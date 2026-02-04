'use client';

import { Coffee } from 'lucide-react';
import { useState } from 'react';

import { PageLayout } from '@/components/crud';

import { AmenitiesTable } from './amenities-table';

export default function AmenitiesPage() {
  const [sheetOpen, setSheetOpen] = useState(false);

  return (
    <PageLayout
      title="Amenities"
      description="Manage amenities and their locations"
      icon={Coffee}
      onAdd={() => setSheetOpen(true)}
      addLabel="Add Amenity"
    >
      <AmenitiesTable sheetOpen={sheetOpen} onSheetOpenChange={setSheetOpen} />
    </PageLayout>
  );
}
