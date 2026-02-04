'use client';

import { useState, useEffect, useCallback } from 'react';
import { Tags, Plus, Search, RefreshCw, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

import { PageLayout, FilterBar, EmptyState, DeleteDialog, TableSkeleton } from '@/components/crud';
import { Button } from '@/components/ui/button';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { getCategories, deleteCategory } from '@/lib/actions/entities';
import { Category } from '@/types/entities';
import { PaginationMeta } from '@/types/common';

import { CategorySheet } from './category-sheet';

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  // Sheet state
  const [sheetOpen, setSheetOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

  // Delete dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);

  const fetchCategories = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await getCategories({ search, page, limit: 10 });
      setCategories(response.data);
      setPagination(response.pagination);
    } catch (error) {
      toast.error('Failed to load categories');
    } finally {
      setIsLoading(false);
    }
  }, [search, page]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCategories();
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchCategories]);

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
      fetchCategories();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete category');
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
        <FilterBar>
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
          <Button variant="outline" onClick={fetchCategories} disabled={isLoading} className="gap-2">
            <RefreshCw className={isLoading ? 'animate-spin' : ''} />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
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
                  <TableHead>Name</TableHead>
                  <TableHead>Created At</TableHead>
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
