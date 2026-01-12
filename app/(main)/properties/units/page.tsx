import { House } from 'lucide-react';

export default function UnitsPage() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <div>
        <div className="flex items-center gap-2">
          <House />
          <h1 className="text-2xl font-bold mb-0">Units</h1>
        </div>
        <p className="text-muted-foreground">Manage units</p>
      </div>
      <div className="bg-white dark:bg-muted/50 aspect-video rounded-xl shadow-sm border border-gray-200 dark:border-0" />
    </div>
  );
}
