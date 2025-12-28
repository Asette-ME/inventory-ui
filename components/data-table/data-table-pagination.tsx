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

  const { page, total_pages, filtered, has_previous, has_next } = pagination;

  return (
    <div className="flex items-center justify-between px-2 py-4">
      <div className="text-sm text-muted-foreground">
        {filtered} result{filtered !== 1 ? 's' : ''}
      </div>
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <p className="text-sm">Rows per page</p>
          <Select value={String(limit)} onValueChange={(value) => onLimitChange(Number(value))}>
            <SelectTrigger size="sm" className="w-[70px] bg-white">
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
        <div className="text-sm">
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
    </div>
  );
}
