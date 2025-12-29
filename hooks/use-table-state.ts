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
  pinnedLeft?: string[];
  pinnedRight?: string[];
}

// Ensures pinned columns stay in their positions
function enforceColumnOrder(
  order: ColumnOrderState,
  pinnedLeft: string[],
  pinnedRight: string[]
): ColumnOrderState {
  if (order.length === 0) return order;

  // Remove pinned columns from the order
  const middleColumns = order.filter(
    (col) => !pinnedLeft.includes(col) && !pinnedRight.includes(col)
  );

  // Reconstruct order with pinned columns at their positions
  return [...pinnedLeft, ...middleColumns, ...pinnedRight];
}

export function useTableState({
  key,
  defaultVisibility,
  defaultOrder = [],
  pinnedLeft = [],
  pinnedRight = [],
}: UseTableStateOptions) {
  const storageKey = `table-state-${key}`;

  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(defaultVisibility);
  const [columnOrder, setColumnOrder] = useState<ColumnOrderState>(defaultOrder);
  const [isLoaded, setIsLoaded] = useState(false);

  // Memoize pinned arrays to prevent infinite loops
  const pinnedLeftKey = pinnedLeft.join(',');
  const pinnedRightKey = pinnedRight.join(',');

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsed: TableState = JSON.parse(stored);
        if (parsed.columnVisibility) setColumnVisibility(parsed.columnVisibility);
        if (parsed.columnOrder) {
          setColumnOrder(enforceColumnOrder(parsed.columnOrder, pinnedLeft, pinnedRight));
        }
      }
    } catch (e) {
      console.error('Failed to load table state:', e);
    }
    setIsLoaded(true);
  }, [storageKey, pinnedLeftKey, pinnedRightKey]);

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
    []
  );

  const handleOrderChange = useCallback(
    (updater: ColumnOrderState | ((old: ColumnOrderState) => ColumnOrderState)) => {
      setColumnOrder((prev) => {
        const newOrder = typeof updater === 'function' ? updater(prev) : updater;
        return enforceColumnOrder(newOrder, pinnedLeft, pinnedRight);
      });
    },
    [pinnedLeftKey, pinnedRightKey]
  );

  return {
    columnVisibility,
    columnOrder,
    onColumnVisibilityChange: handleVisibilityChange,
    onColumnOrderChange: handleOrderChange,
    isLoaded,
  };
}
