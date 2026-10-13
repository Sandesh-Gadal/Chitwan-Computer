import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Product, priceInfo, productImages } from '../api/products';

export interface EnquiryItem {
  id: number;
  name: string;
  price: number | null;
  /** MRP when it's higher than the price */
  mrp?: number | null;
  image: string | null;
  qty: number;
}

interface EnquiryContextValue {
  items: EnquiryItem[];
  count: number;
  isOpen: boolean;
  open: () => void;
  close: () => void;
  add: (product: Product) => void;
  remove: (id: number) => void;
  setQty: (id: number, qty: number) => void;
  clear: () => void;
  has: (id: number) => boolean;
}

const STORAGE_KEY = 'cc-enquiry-list';
const EnquiryContext = createContext<EnquiryContextValue | null>(null);

// Storage can be blocked (private mode, disabled site data); the list then lives for the visit only
const load = (): EnquiryItem[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as EnquiryItem[]) : [];
  } catch {
    return [];
  }
};

export const EnquiryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<EnquiryItem[]>(load);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      /* ignore */
    }
  }, [items]);

  const add = useCallback((product: Product) => {
    setItems((prev) =>
      prev.some((i) => i.id === product.id)
        ? prev
        : [
            ...prev,
            {
              id: product.id,
              name: product.name,
              price: priceInfo(product)?.price ?? null,
              mrp: priceInfo(product)?.mrp ?? null,
              image: productImages(product)[0] ?? null,
              qty: 1,
            },
          ]
    );
  }, []);

  const remove = useCallback((id: number) => setItems((prev) => prev.filter((i) => i.id !== id)), []);

  const setQty = useCallback(
    (id: number, qty: number) =>
      setItems((prev) => prev.map((i) => (i.id === id ? { ...i, qty: Math.min(Math.max(qty, 1), 99) } : i))),
    []
  );

  const value = useMemo<EnquiryContextValue>(
    () => ({
      items,
      count: items.length,
      isOpen,
      open: () => setIsOpen(true),
      close: () => setIsOpen(false),
      add,
      remove,
      setQty,
      clear: () => setItems([]),
      has: (id) => items.some((i) => i.id === id),
    }),
    [items, isOpen, add, remove, setQty]
  );

  return <EnquiryContext.Provider value={value}>{children}</EnquiryContext.Provider>;
};

export const useEnquiry = () => {
  const ctx = useContext(EnquiryContext);
  if (!ctx) throw new Error('useEnquiry must be used inside EnquiryProvider');
  return ctx;
};
