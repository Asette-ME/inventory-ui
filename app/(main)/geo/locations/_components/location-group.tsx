import { ItemGroup } from '@/components/ui/item';

export function LocationGroup({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <ItemGroup className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4">
      {children}
    </ItemGroup>
  );
}
