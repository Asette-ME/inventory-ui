'use client';

import { Table } from '@tanstack/react-table';
import { GripVertical, Search, Settings2 } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface DataTableViewOptionsProps<TData> {
  table: Table<TData>;
}

export function DataTableViewOptions<TData>({ table }: DataTableViewOptionsProps<TData>) {
  const [search, setSearch] = useState('');
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  // Get columns in their current order
  const orderedColumns = table.getAllLeafColumns().filter((column) => column.getCanHide());

  const filteredColumns = search
    ? orderedColumns.filter((column) => column.id.toLowerCase().replace(/_/g, ' ').includes(search.toLowerCase()))
    : orderedColumns;

  const handleDragStart = (e: React.DragEvent, columnId: string) => {
    setDraggedId(columnId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', columnId);
  };

  const handleDragOver = (e: React.DragEvent, columnId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (draggedId && columnId !== draggedId) {
      setDragOverId(columnId);
    }
  };

  const handleDragLeave = () => {
    setDragOverId(null);
  };

  const handleDrop = (e: React.DragEvent, targetColumnId: string) => {
    e.preventDefault();
    if (!draggedId || draggedId === targetColumnId) {
      setDraggedId(null);
      setDragOverId(null);
      return;
    }

    const currentOrder = table.getAllLeafColumns().map((col) => col.id);
    const draggedIndex = currentOrder.indexOf(draggedId);
    const targetIndex = currentOrder.indexOf(targetColumnId);

    if (draggedIndex === -1 || targetIndex === -1) return;

    const newOrder = [...currentOrder];
    newOrder.splice(draggedIndex, 1);
    newOrder.splice(targetIndex, 0, draggedId);

    table.setColumnOrder(newOrder);
    setDraggedId(null);
    setDragOverId(null);
  };

  const handleDragEnd = () => {
    setDraggedId(null);
    setDragOverId(null);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="max-sm:size-8 max-sm:p-0">
          <Settings2 className="size-4" />
          <span className="max-sm:hidden">View</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-52 p-0">
        <div className="p-2">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search columns..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-8 pl-8"
            />
          </div>
        </div>
        <div className="max-h-64 overflow-y-auto">
          {filteredColumns.length === 0 ? (
            <div className="py-6 text-center text-sm text-muted-foreground">No columns found.</div>
          ) : (
            filteredColumns.map((column) => {
              const isDragging = draggedId === column.id;
              const isDragOver = dragOverId === column.id;

              return (
                <div
                  key={column.id}
                  draggable={!search}
                  onDragStart={(e) => handleDragStart(e, column.id)}
                  onDragOver={(e) => handleDragOver(e, column.id)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, column.id)}
                  onDragEnd={handleDragEnd}
                  className={cn(
                    'flex items-center gap-2 px-2 py-1.5 hover:bg-accent transition-colors',
                    !search && 'cursor-grab active:cursor-grabbing',
                    isDragging && 'opacity-50 bg-accent',
                    isDragOver && 'border-t-2 border-primary',
                  )}
                >
                  <Checkbox
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) => column.toggleVisibility(!!value)}
                  />
                  <span className="flex-1 text-sm capitalize select-none">{column.id.replace(/_/g, ' ')}</span>
                  {!search && <GripVertical className="size-4 text-muted-foreground" />}
                </div>
              );
            })
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
