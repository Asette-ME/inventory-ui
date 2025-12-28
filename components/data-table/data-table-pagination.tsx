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

const PAGE_SIZE_OPTIONS = [1, 10, 25, 50, 100];

export function DataTablePagination({ pagination, limit, onPageChange, onLimitChange }: DataTablePaginationProps) {
  if (!pagination) return null;

  const { page, total_pages, filtered, has_previous, has_next } = pagination;

  return (
    <div className="flex flex-col sm:flex-row items-center sm:justify-between gap-4 px-2 py-4">
      <div className="text-sm text-muted-foreground">
        {filtered} result{filtered !== 1 ? 's' : ''}
      </div>

      <div className="flex flex-col items-center justify-between sm:justify-end gap-4">
        <div className="text-sm whitespace-nowrap">
          Page {page} of {total_pages || 1}
        </div>
        <div className="flex items-center gap-1">
          <Button variant="outline" size="icon-sm" onClick={() => onPageChange(1)} disabled={!has_previous}>
            <ChevronsLeft className="size-4" />
          </Button>
          <Button variant="outline" size="icon-sm" onClick={() => onPageChange(page - 1)} disabled={!has_previous}>
            <ChevronLeft className="size-4" />
          </Button>
          <Button variant="outline" size="icon-sm" onClick={() => onPageChange(page + 1)} disabled={!has_next}>
            <ChevronRight className="size-4" />
          </Button>
          <Button variant="outline" size="icon-sm" onClick={() => onPageChange(total_pages)} disabled={!has_next}>
            <ChevronsRight className="size-4" />
          </Button>
        </div>
      </div>

      <div className="flex flex-col items-center gap-2">
        <span className="text-sm whitespace-nowrap">Rows per page</span>
        <Select value={String(limit)} onValueChange={(value) => onLimitChange(Number(value))}>
          <SelectTrigger size="sm" className="w-[70px]">
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
