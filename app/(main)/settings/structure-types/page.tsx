'use client';

import { Building2 } from 'lucide-react';
import { useState } from 'react';

import { PageLayout } from '@/components/crud';

import { StructureTypesTable } from './structure-types-table';

export default function StructureTypesPage() {
  const [sheetOpen, setSheetOpen] = useState(false);

  return (
    <PageLayout
      title="Structure Types"
      description="Manage structure types for properties"
      icon={Building2}
      onAdd={() => setSheetOpen(true)}
      addLabel="Add Structure Type"
    >
      <StructureTypesTable sheetOpen={sheetOpen} onSheetOpenChange={setSheetOpen} />
    </PageLayout>
  );
}
