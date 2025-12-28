'use client';

import { ColumnOrderState, VisibilityState } from '@tanstack/react-table';
import { useCallback, useEffect, useState } from 'react';

interface TableState {
  columnVisibility: VisibilityState;
  columnOrder: ColumnOrderState;
}

interface UseTableStateOptions {
  key: string;
  defaultVisibility: VisibilityState;
  defaultOrder?: ColumnOrderState;
}

export function useTableState({ key, defaultVisibility, defaultOrder = [] }: UseTableStateOptions) {
  const storageKey = `table-state-${key}`;

  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(defaultVisibility);
  const [columnOrder, setColumnOrder] = useState<ColumnOrderState>(defaultOrder);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsed: TableState = JSON.parse(stored);
        if (parsed.columnVisibility) setColumnVisibility(parsed.columnVisibility);
        if (parsed.columnOrder) setColumnOrder(parsed.columnOrder);
      }
    } catch (e) {
      console.error('Failed to load table state:', e);
    }
    setIsLoaded(true);
  }, [storageKey]);

  // Save to localStorage when state changes
  useEffect(() => {
    if (!isLoaded) return;

    try {
      const state: TableState = { columnVisibility, columnOrder };
      localStorage.setItem(storageKey, JSON.stringify(state));
    } catch (e) {
      console.error('Failed to save table state:', e);
    }
  }, [storageKey, columnVisibility, columnOrder, isLoaded]);

  const handleVisibilityChange = useCallback(
    (updater: VisibilityState | ((old: VisibilityState) => VisibilityState)) => {
      setColumnVisibility((prev) => (typeof updater === 'function' ? updater(prev) : updater));
    },
    [],
  );

  const handleOrderChange = useCallback((updater: ColumnOrderState | ((old: ColumnOrderState) => ColumnOrderState)) => {
    setColumnOrder((prev) => (typeof updater === 'function' ? updater(prev) : updater));
  }, []);

  return {
    columnVisibility,
    columnOrder,
    onColumnVisibilityChange: handleVisibilityChange,
    onColumnOrderChange: handleOrderChange,
    isLoaded,
  };
}
