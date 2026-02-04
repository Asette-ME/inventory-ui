'use client';

import { Tags } from 'lucide-react';
import { useState } from 'react';

import { PageLayout } from '@/components/crud';

import { CategoriesTable } from './categories-table';

export default function CategoriesPage() {
  const [sheetOpen, setSheetOpen] = useState(false);

  return (
    <PageLayout
      title="Categories"
      description="Manage property categories"
      icon={Tags}
      onAdd={() => setSheetOpen(true)}
      addLabel="Add Category"
    >
      <CategoriesTable sheetOpen={sheetOpen} onSheetOpenChange={setSheetOpen} />
    </PageLayout>
  );
}
