'use client';

import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Pagination } from '@/types/pagination';

interface DataTablePaginationProps {
  pagination: Pagination | null;
  limit: number;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
}

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

export function DataTablePagination({ pagination, limit, onPageChange, onLimitChange }: DataTablePaginationProps) {
  if (!pagination) return null;

  const { page, total_pages, total, filtered, has_previous, has_next } = pagination;

  const from = (page - 1) * limit + 1;
  const to = Math.min(page * limit, filtered);
  const isFiltered = filtered !== total;

  return (
    <div className="flex flex-col sm:flex-row items-center gap-4 px-2 py-4">
      {/* Left - Results info */}
      <div className="flex flex-col items-center sm:items-start text-sm text-muted-foreground sm:flex-1">
        <span>
          Showing {from} to {to} of {filtered.toLocaleString()} result{filtered !== 1 ? 's' : ''}
        </span>
        <span>{isFiltered && ` (filtered from ${total.toLocaleString()})`}</span>
      </div>

      {/* Center - Page info and navigation */}
      <div className="flex flex-col items-center gap-2">
        <div className="text-sm whitespace-nowrap">
          Page {page} of {total_pages || 1}
        </div>
        <div className="flex items-center gap-1">
          <Button variant="outline" size="icon-sm" onClick={() => onPageChange(1)} disabled={!has_previous}>
            <ChevronsLeft />
          </Button>
          <Button variant="outline" size="icon-sm" onClick={() => onPageChange(page - 1)} disabled={!has_previous}>
            <ChevronLeft />
          </Button>
          <Button variant="outline" size="icon-sm" onClick={() => onPageChange(page + 1)} disabled={!has_next}>
            <ChevronRight />
          </Button>
          <Button variant="outline" size="icon-sm" onClick={() => onPageChange(total_pages)} disabled={!has_next}>
            <ChevronsRight />
          </Button>
        </div>
      </div>

      {/* Right - Rows per page */}
      <div className="flex sm:flex-col items-center gap-2 sm:flex-1 sm:justify-end sm:items-end">
        <span className="text-sm whitespace-nowrap">Rows per page</span>
        <Select value={String(limit)} onValueChange={(value) => onLimitChange(Number(value))}>
          <SelectTrigger className="w-[70px] bg-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PAGE_SIZE_OPTIONS.map((size) => (
              <SelectItem key={size} value={String(size)}>
                {size}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
