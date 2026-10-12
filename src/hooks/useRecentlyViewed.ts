import { useEffect, useState } from 'react';

const STORAGE_KEY = 'cc-recently-viewed';
const LIMIT = 8;

const read = (): number[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as number[]) : [];
  } catch {
    return [];
  }
};

/**
 * Records the current product and returns the ids of the others the visitor
 * looked at before it, most recent first.
 */
export const useRecentlyViewed = (currentId: number | undefined): number[] => {
  const [ids, setIds] = useState<number[]>([]);

  useEffect(() => {
    if (!currentId) return;
    const previous = read().filter((id) => id !== currentId);
    setIds(previous);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([currentId, ...previous].slice(0, LIMIT)));
    } catch {
      /* storage unavailable: list just isn't remembered */
    }
  }, [currentId]);

  return ids;
};
