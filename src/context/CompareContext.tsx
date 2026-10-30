import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Product, productImages } from '../api/products';

export const COMPARE_LIMIT = 4;

export interface CompareItem {
  id: number;
  name: string;
  image: string | null;
}

interface CompareContextValue {
  items: CompareItem[];
  ids: number[];
  count: number;
  isFull: boolean;
  add: (product: Product) => void;
  remove: (id: number) => void;
  toggle: (product: Product) => void;
  clear: () => void;
  has: (id: number) => boolean;
}

const STORAGE_KEY = 'cc-compare-list';
const CompareContext = createContext<CompareContextValue | null>(null);

// Storage can be blocked (private mode, disabled site data); the list then lives for the visit only
const load = (): CompareItem[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as CompareItem[]).slice(0, COMPARE_LIMIT) : [];
  } catch {
    return [];
  }
};

export const CompareProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CompareItem[]>(load);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      /* ignore */
    }
  }, [items]);

  const add = useCallback((product: Product) => {
    setItems((prev) =>
      prev.some((i) => i.id === product.id) || prev.length >= COMPARE_LIMIT
        ? prev
        : [...prev, { id: product.id, name: product.name, image: productImages(product)[0] ?? null }]
    );
  }, []);

  const remove = useCallback((id: number) => setItems((prev) => prev.filter((i) => i.id !== id)), []);

  const toggle = useCallback(
    (product: Product) =>
      setItems((prev) =>
        prev.some((i) => i.id === product.id)
          ? prev.filter((i) => i.id !== product.id)
          : prev.length >= COMPARE_LIMIT
            ? prev
            : [...prev, { id: product.id, name: product.name, image: productImages(product)[0] ?? null }]
      ),
    []
  );

  const value = useMemo<CompareContextValue>(
    () => ({
      items,
      ids: items.map((i) => i.id),
      count: items.length,
      isFull: items.length >= COMPARE_LIMIT,
      add,
      remove,
      toggle,
      clear: () => setItems([]),
      has: (id) => items.some((i) => i.id === id),
    }),
    [items, add, remove, toggle]
  );

  return <CompareContext.Provider value={value}>{children}</CompareContext.Provider>;
};

export const useCompare = () => {
  const ctx = useContext(CompareContext);
  if (!ctx) throw new Error('useCompare must be used inside CompareProvider');
  return ctx;
};
