'use client';

import { KeyRound } from 'lucide-react';
import { useState } from 'react';

import { PageLayout } from '@/components/crud';

import { RolesTable } from './roles-table';

export default function RolesPage() {
  const [sheetOpen, setSheetOpen] = useState(false);

  return (
    <PageLayout
      title="Roles"
      description="Manage roles and permissions"
      icon={KeyRound}
      onAdd={() => setSheetOpen(true)}
      addLabel="Add Role"
    >
      <RolesTable sheetOpen={sheetOpen} onSheetOpenChange={setSheetOpen} />
    </PageLayout>
  );
}
