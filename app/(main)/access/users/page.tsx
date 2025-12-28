import { Users } from 'lucide-react';
import { Suspense } from 'react';

import { Skeleton } from '@/components/ui/skeleton';

import { UsersTable } from './users-table';

export default function UsersPage() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <div>
        <div className="flex items-center gap-2">
          <Users />
          <h1 className="text-2xl font-bold mb-0">Users</h1>
        </div>
        <p className="text-muted-foreground">Manage users and their roles</p>
      </div>
      <Suspense fallback={<TableSkeleton />}>
        <UsersTable />
      </Suspense>
    </div>
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
