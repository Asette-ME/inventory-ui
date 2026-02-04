'use client';

import { Bus } from 'lucide-react';
import { useState } from 'react';

import { PageLayout } from '@/components/crud';

import { TransportsTable } from './transports-table';

export default function TransportsPage() {
  const [sheetOpen, setSheetOpen] = useState(false);

  return (
    <PageLayout
      title="Transports"
      description="Manage transport types and options"
      icon={Bus}
      onAdd={() => setSheetOpen(true)}
      addLabel="Add Transport"
    >
      <TransportsTable sheetOpen={sheetOpen} onSheetOpenChange={setSheetOpen} />
    </PageLayout>
  );
}
