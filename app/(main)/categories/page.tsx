'use client';

import { MoreHorizontal, Pencil, Plus, RefreshCw, Search, Settings2, Tags, Trash2 } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

import { DeleteDialog, EmptyState, FilterBar, PageLayout, TableSkeleton } from '@/components/crud';
import { DataTableColumnHeader } from '@/components/data-table';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { deleteCategory, getCategories } from '@/lib/actions/entities';
import { PaginationMeta } from '@/types/common';
import { Category } from '@/types/entities';

import { CategorySheet } from './category-sheet';

type SortOrder = 'asc' | 'desc';

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState<string>('created_at');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  const [sheetOpen, setSheetOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);

  const fetchCategories = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await getCategories({ search, page, limit: 10, sort_by: sortBy, sort_order: sortOrder });
      setCategories(response.data);
      setPagination(response.pagination);
    } catch {
      toast.error('Failed to load categories');
    } finally {
      setIsLoading(false);
    }
  }, [search, page, sortBy, sortOrder]);

  useEffect(() => {
    const timer = setTimeout(() => void fetchCategories(), 300);
    return () => clearTimeout(timer);
  }, [fetchCategories]);

  function handleSort(key: string, order: SortOrder) {
    setSortBy(key);
    setSortOrder(order);
  }

  function handleCreate() {
    setSelectedCategory(null);
    setSheetOpen(true);
  }

  function handleEdit(category: Category) {
    setSelectedCategory(category);
    setSheetOpen(true);
  }

  function handleDeleteClick(category: Category) {
    setCategoryToDelete(category);
    setDeleteDialogOpen(true);
  }

  async function handleDeleteConfirm() {
    if (!categoryToDelete) return;
    try {
      await deleteCategory(categoryToDelete.id);
      toast.success(`Category "${categoryToDelete.name}" deleted successfully`);
      void fetchCategories();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete category');
    }
  }

  return (
    <PageLayout
      title="Categories"
      description="Manage property categories"
      icon={Tags}
      onAdd={handleCreate}
      addLabel="Add Category"
    >
      <div className="space-y-4">
        <FilterBar
          actions={
            <>
              <Button variant="outline" onClick={fetchCategories} disabled={isLoading} className="gap-2">
                <RefreshCw className={isLoading ? 'animate-spin' : ''} />
                <span className="hidden sm:inline">Refresh</span>
              </Button>
              <ViewOptionsButton />
            </>
          }
        >
          <InputGroup className="w-full sm:w-64 bg-white dark:bg-muted/50">
            <InputGroupAddon>
              <Search />
            </InputGroupAddon>
            <InputGroupInput
              placeholder="Search categories..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </InputGroup>
        </FilterBar>

        <div className="bg-white dark:bg-muted/50 rounded-xl shadow-sm border overflow-hidden">
          {isLoading && categories.length === 0 ? (
            <div className="p-4">
              <TableSkeleton rows={5} columns={3} />
            </div>
          ) : categories.length === 0 ? (
            <EmptyState
              title="No categories found"
              description={search ? 'Try adjusting your search' : 'Get started by creating your first category'}
              icon={Tags}
              action={
                !search && (
                  <Button onClick={handleCreate} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add Category
                  </Button>
                )
              }
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    <DataTableColumnHeader
                      column={{} as never}
                      title="Name"
                      sortKey="name"
                      currentSortBy={sortBy}
                      currentSortOrder={sortOrder}
                      onSort={handleSort}
                    />
                  </TableHead>
                  <TableHead>
                    <DataTableColumnHeader
                      column={{} as never}
                      title="Created At"
                      sortKey="created_at"
                      currentSortBy={sortBy}
                      currentSortOrder={sortOrder}
                      onSort={handleSort}
                    />
                  </TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell className="font-medium">{category.name}</TableCell>
                    <TableCell>{new Date(category.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon-sm">
                            <MoreHorizontal />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEdit(category)}>
                            <Pencil />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem variant="destructive" onClick={() => handleDeleteClick(category)}>
                            <Trash2 />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>

        {pagination && pagination.total_pages > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Showing {(page - 1) * 10 + 1} to {Math.min(page * 10, pagination.total)} of {pagination.total} categories
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={!pagination.has_previous}
                onClick={() => setPage((p) => p - 1)}
              >
                Previous
              </Button>
              <Button variant="outline" size="sm" disabled={!pagination.has_next} onClick={() => setPage((p) => p + 1)}>
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      <CategorySheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        category={selectedCategory}
        onSuccess={fetchCategories}
      />

      <DeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Category"
        itemName={categoryToDelete?.name}
        onConfirm={handleDeleteConfirm}
      />
    </PageLayout>
  );
}

function ViewOptionsButton() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Settings2 />
          <span className="hidden sm:inline">View</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-48">
        <p className="text-sm text-muted-foreground">Column visibility options coming soon.</p>
      </PopoverContent>
    </Popover>
  );
}
