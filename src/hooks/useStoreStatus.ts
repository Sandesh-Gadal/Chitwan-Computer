import { useEffect, useState } from 'react';
import { business } from '../data/business';

const NEPAL_OFFSET_MIN = 5 * 60 + 45;
const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const hourLabel = (h: number) => `${h % 12 || 12} ${h < 12 ? 'AM' : 'PM'}`;

// The clock and calendar in Nepal, whatever the visitor's own timezone
const nepalNow = () => {
  const d = new Date(Date.now() + NEPAL_OFFSET_MIN * 60_000);
  return { day: d.getUTCDay(), hour: d.getUTCHours() + d.getUTCMinutes() / 60, date: d.toISOString().slice(0, 10), ms: d.getTime() };
};

const isOpenDay = (day: number, date: string) => business.schedule.days.includes(day) && !business.closures.includes(date);

export interface StoreStatus {
  open: boolean;
  /** e.g. "Closes 6 PM" or "Opens 10 AM tomorrow" */
  detail: string;
}

export const storeStatus = (): StoreStatus => {
  const { opens, closes } = business.schedule;
  const now = nepalNow();

  if (isOpenDay(now.day, now.date) && now.hour >= opens && now.hour < closes) {
    return { open: true, detail: `Closes ${hourLabel(closes)}` };
  }

  // Next opening: later today, or the next open day within a fortnight
  if (isOpenDay(now.day, now.date) && now.hour < opens) return { open: false, detail: `Opens ${hourLabel(opens)} today` };
  for (let i = 1; i <= 14; i++) {
    const next = new Date(now.ms + i * 86_400_000);
    const day = next.getUTCDay();
    if (isOpenDay(day, next.toISOString().slice(0, 10))) {
      return { open: false, detail: `Opens ${hourLabel(opens)} ${i === 1 ? 'tomorrow' : DAY_NAMES[day]}` };
    }
  }
  return { open: false, detail: 'Call to check opening times' };
};

/** Live open/closed status, rechecked every minute */
export const useStoreStatus = (): StoreStatus => {
  const [status, setStatus] = useState(storeStatus);
  useEffect(() => {
    const timer = setInterval(() => setStatus(storeStatus()), 60_000);
    return () => clearInterval(timer);
  }, []);
  return status;
};
