'use client';

import { Sparkles } from 'lucide-react';
import { useState } from 'react';

import { PageLayout } from '@/components/crud';

import { FeatureTypesTable } from './feature-types-table';

export default function FeatureTypesPage() {
  const [sheetOpen, setSheetOpen] = useState(false);

  return (
    <PageLayout
      title="Feature Types"
      description="Manage feature types for your properties"
      icon={Sparkles}
      onAdd={() => setSheetOpen(true)}
      addLabel="Add Feature Type"
    >
      <FeatureTypesTable sheetOpen={sheetOpen} onSheetOpenChange={setSheetOpen} />
    </PageLayout>
  );
}
