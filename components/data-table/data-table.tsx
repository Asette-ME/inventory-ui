'use client';

import { ColumnDef, flexRender, Table as TanstackTable } from '@tanstack/react-table';
import { useEffect, useRef, useState } from 'react';

import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface DataTableProps<TData, TValue> {
  table: TanstackTable<TData>;
  columns: ColumnDef<TData, TValue>[];
  isInitialLoading?: boolean;
  isLoading?: boolean;
}

export function DataTable<TData, TValue>({
  table,
  columns,
  isInitialLoading,
  isLoading,
}: DataTableProps<TData, TValue>) {
  const showSkeleton = isInitialLoading;
  const showLoadingBar = isLoading && !isInitialLoading;
  const headerRef = useRef<HTMLTableSectionElement>(null);
  const [headerHeight, setHeaderHeight] = useState(0);

  useEffect(() => {
    if (headerRef.current) {
      setHeaderHeight(headerRef.current.offsetHeight);
    }
  }, []);

  return (
    <div className="relative">
      {showLoadingBar && headerHeight > 0 && (
        <div className="absolute left-0 right-0 h-[3px] overflow-hidden z-10" style={{ top: headerHeight }}>
          <div className="h-full w-full bg-primary/20" />
          <div className="absolute top-0 h-full w-1/4 bg-primary animate-[loading_1s_ease-in-out_infinite]" />
        </div>
      )}
      <Table>
        <TableHeader ref={headerRef}>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id}>
                  {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {showSkeleton ? (
            Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i}>
                {columns.map((_, j) => (
                  <TableCell key={j}>
                    <Skeleton className="h-6 w-full" />
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
