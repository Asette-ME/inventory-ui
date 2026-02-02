'use client';

import { createContext, useContext, useState, type ReactNode } from 'react';

interface BulkUploadContextType {
  isOpen: boolean;
  isReady: boolean;
  open: () => void;
  close: () => void;
  setOpen: (open: boolean) => void;
  setReady: (ready: boolean) => void;
}

const BulkUploadContext = createContext<BulkUploadContextType | null>(null);

export function BulkUploadProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isReady, setIsReady] = useState(false);

  return (
    <BulkUploadContext.Provider
      value={{
        isOpen,
        isReady,
        open: () => setIsOpen(true),
        close: () => setIsOpen(false),
        setOpen: setIsOpen,
        setReady: setIsReady,
      }}
    >
      {children}
    </BulkUploadContext.Provider>
  );
}

export function useBulkUpload() {
  const context = useContext(BulkUploadContext);
  if (!context) {
    throw new Error('useBulkUpload must be used within a BulkUploadProvider');
  }
  return context;
}
