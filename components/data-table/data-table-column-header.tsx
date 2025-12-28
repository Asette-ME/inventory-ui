"use client";

import { Column } from "@tanstack/react-table";
import { ArrowDown, ArrowUp, ChevronsUpDown } from "lucide-react";

import { Button } from "@/components/ui/button";

interface DataTableColumnHeaderProps<TData, TValue> {
  column: Column<TData, TValue>;
  title: string;
  sortKey?: string;
  currentSortBy?: string;
  currentSortOrder?: "asc" | "desc";
  onSort?: (sortBy: string, sortOrder: "asc" | "desc") => void;
}

export function DataTableColumnHeader<TData, TValue>({
  title,
  sortKey,
  currentSortBy,
  currentSortOrder,
  onSort,
}: DataTableColumnHeaderProps<TData, TValue>) {
  if (!sortKey || !onSort) {
    return <span>{title}</span>;
  }

  const isSorted = currentSortBy === sortKey;
  const isAsc = isSorted && currentSortOrder === "asc";
  const isDesc = isSorted && currentSortOrder === "desc";

  const handleSort = () => {
    if (!isSorted || isDesc) {
      onSort(sortKey, "asc");
    } else {
      onSort(sortKey, "desc");
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      className="-ml-3 h-8"
      onClick={handleSort}
    >
      {title}
      {isAsc ? (
        <ArrowUp className="ml-1 size-4" />
      ) : isDesc ? (
        <ArrowDown className="ml-1 size-4" />
      ) : (
        <ChevronsUpDown className="ml-1 size-4" />
      )}
    </Button>
  );
}
