'use client';

import { Users } from 'lucide-react';
import { Suspense, useState } from 'react';

import { PageLayout } from '@/components/crud';
import { Skeleton } from '@/components/ui/skeleton';

import { UsersTableContent } from './users-table';

export default function UsersPage() {
  const [sheetOpen, setSheetOpen] = useState(false);

  function handleCreate() {
    setSheetOpen(true);
  }

  return (
    <PageLayout
      title="Users"
      description="Manage users and their roles"
      icon={Users}
      onAdd={handleCreate}
      addLabel="Add User"
    >
      <Suspense fallback={<TableSkeleton />}>
        <UsersTableContent sheetOpen={sheetOpen} onSheetOpenChange={setSheetOpen} />
      </Suspense>
    </PageLayout>
  );
}

function TableSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-9 w-24" />
      </div>
      <div className="rounded-md border">
        <div className="p-4 space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      </div>
    </div>
  );
}
