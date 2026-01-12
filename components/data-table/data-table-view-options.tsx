'use client';

import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Table } from '@tanstack/react-table';
import { GripVertical, Search, Settings2 } from 'lucide-react';
import { useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface DataTableViewOptionsProps<TData> {
  table: Table<TData>;
}

interface SortableColumnProps {
  column: any;
  id: string;
}

function SortableColumn({ column, id }: SortableColumnProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'flex items-center gap-2 px-2 py-1.5 hover:bg-accent transition-colors rounded-sm touch-none',
        isDragging && 'bg-accent',
      )}
      {...attributes}
      {...listeners}
    >
      <Checkbox
        checked={column.getIsVisible()}
        onCheckedChange={(value) => column.toggleVisibility(!!value)}
        // propagate click to avoid drag start interference
        onPointerDown={(e) => e.stopPropagation()}
        className="cursor-pointer"
      />
      <span className="flex-1 text-sm capitalize select-none truncate">{column.id.replace(/_/g, ' ')}</span>
      <GripVertical className="size-4 text-muted-foreground" aria-hidden="true" />
    </div>
  );
}

export function DataTableViewOptions<TData>({ table }: DataTableViewOptionsProps<TData>) {
  const [search, setSearch] = useState('');

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const columns = table.getAllLeafColumns();

  // Filter out columns that cannot be hidden. This ensures the sortable list only contains items the user can interact with in this view.
  // getAllLeafColumns is already sorted by current Display Order.
  const displayColumns = useMemo(() => {
    return columns.filter((column) => column.getCanHide());
  }, [columns]);

  const filteredColumns = search
    ? displayColumns.filter((column) => column.id.toLowerCase().replace(/_/g, ' ').includes(search.toLowerCase()))
    : displayColumns;

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (active && over && active.id !== over.id) {
      table.setColumnOrder((old) => {
        // Use the full list of columns for reordering to preserve non-hideable columns' positions (if any) or relative order.
        // We need to map operation on displayColumns to full list.
        const currentOrder = old.length > 0 ? old : columns.map((c) => c.id);

        const oldIndex = currentOrder.indexOf(active.id as string);
        const newIndex = currentOrder.indexOf(over.id as string);

        return arrayMove(currentOrder, oldIndex, newIndex);
      });
    }
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="max-sm:size-8 max-sm:p-0">
          <Settings2 />
          <span className="max-sm:hidden">View</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-52 p-0">
        <div className="p-2">
          <InputGroup className="h-8">
            <InputGroupAddon>
              <Search />
            </InputGroupAddon>
            <InputGroupInput
              placeholder="Search columns..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </InputGroup>
        </div>
        <div className="max-h-64 overflow-y-auto p-2">
          {filteredColumns.length === 0 ? (
            <div className="py-6 text-center text-sm text-muted-foreground">No columns found.</div>
          ) : (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext
                items={filteredColumns.map((c) => c.id)}
                strategy={verticalListSortingStrategy}
                disabled={!!search}
              >
                {filteredColumns.map((column) => (
                  <SortableColumn key={column.id} column={column} id={column.id} />
                ))}
              </SortableContext>
            </DndContext>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
