'use client';

import { useState, useEffect, useCallback } from 'react';
import { Bus, Plus, Search, RefreshCw, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
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
import { getTransports, deleteTransport } from '@/lib/actions/entities';
import { Transport } from '@/types/entities';
import { PaginationMeta } from '@/types/common';

import { TransportSheet } from './transport-sheet';

export default function TransportsPage() {
  const [transports, setTransports] = useState<Transport[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  // Sheet state
  const [sheetOpen, setSheetOpen] = useState(false);
  const [selectedTransport, setSelectedTransport] = useState<Transport | null>(null);

  // Delete dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [transportToDelete, setTransportToDelete] = useState<Transport | null>(null);

  const fetchTransports = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await getTransports({ search, page, limit: 10 });
      setTransports(response.data);
      setPagination(response.pagination);
    } catch (error) {
      toast.error('Failed to load transports');
    } finally {
      setIsLoading(false);
    }
  }, [search, page]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchTransports();
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchTransports]);

  function handleCreate() {
    setSelectedTransport(null);
    setSheetOpen(true);
  }

  function handleEdit(transport: Transport) {
    setSelectedTransport(transport);
    setSheetOpen(true);
  }

  function handleDeleteClick(transport: Transport) {
    setTransportToDelete(transport);
    setDeleteDialogOpen(true);
  }

  async function handleDeleteConfirm() {
    if (!transportToDelete) return;
    try {
      await deleteTransport(transportToDelete.id);
      toast.success(`Transport "${transportToDelete.name}" deleted successfully`);
      fetchTransports();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete transport');
    }
  }

  return (
    <PageLayout
      title="Transports"
      description="Manage transport types and options"
      icon={Bus}
      onAdd={handleCreate}
      addLabel="Add Transport"
    >
      <div className="space-y-4">
        <FilterBar>
          <InputGroup className="w-full sm:w-64 bg-white dark:bg-muted/50">
            <InputGroupAddon>
              <Search />
            </InputGroupAddon>
            <InputGroupInput
              placeholder="Search transports..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </InputGroup>
          <Button variant="outline" onClick={fetchTransports} disabled={isLoading} className="gap-2">
            <RefreshCw className={isLoading ? 'animate-spin' : ''} />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
        </FilterBar>

        <div className="bg-white dark:bg-muted/50 rounded-xl shadow-sm border overflow-hidden">
          {isLoading && transports.length === 0 ? (
            <div className="p-4">
              <TableSkeleton rows={5} columns={5} />
            </div>
          ) : transports.length === 0 ? (
            <EmptyState
              title="No transports found"
              description={search ? 'Try adjusting your search' : 'Get started by creating your first transport'}
              icon={Bus}
              action={
                !search && (
                  <Button onClick={handleCreate} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add Transport
                  </Button>
                )
              }
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Icon</TableHead>
                  <TableHead>Color</TableHead>
                  <TableHead>Created At</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transports.map((transport) => (
                  <TableRow key={transport.id}>
                    <TableCell className="font-medium">{transport.name}</TableCell>
                    <TableCell>
                      {transport.icon ? (
                        <span className="text-sm text-muted-foreground">{transport.icon}</span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {transport.color ? (
                        <div className="flex items-center gap-2">
                          <div className="h-4 w-4 rounded border" style={{ backgroundColor: transport.color }} />
                          <span className="text-sm text-muted-foreground font-mono">{transport.color}</span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>{new Date(transport.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon-sm">
                            <MoreHorizontal />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEdit(transport)}>
                            <Pencil />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem variant="destructive" onClick={() => handleDeleteClick(transport)}>
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
              Showing {(page - 1) * 10 + 1} to {Math.min(page * 10, pagination.total)} of {pagination.total} transports
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

      <TransportSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        transport={selectedTransport}
        onSuccess={fetchTransports}
      />

      <DeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Transport"
        itemName={transportToDelete?.name}
        onConfirm={handleDeleteConfirm}
      />
    </PageLayout>
  );
}
