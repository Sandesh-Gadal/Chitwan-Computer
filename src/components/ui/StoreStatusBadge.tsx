import React from 'react';
import { useStoreStatus } from '../../hooks/useStoreStatus';

/** "Open now · Closes 6 PM" with a pulsing dot, or when the store next opens */
const StoreStatusBadge: React.FC<{ tone?: 'dark' | 'light'; className?: string }> = ({ tone = 'dark', className = '' }) => {
  const { open, detail } = useStoreStatus();
  const muted = tone === 'dark' ? 'text-slate-400' : 'text-slate-500';
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <span className="relative flex h-2 w-2">
        {open && <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60 motion-reduce:animate-none" />}
        <span className={`relative inline-flex h-2 w-2 rounded-full ${open ? 'bg-emerald-400' : 'bg-red-400'}`} />
      </span>
      <span className={`font-semibold ${open ? (tone === 'dark' ? 'text-emerald-300' : 'text-emerald-700') : tone === 'dark' ? 'text-red-300' : 'text-red-600'}`}>
        {open ? 'Open now' : 'Closed'}
      </span>
      <span className={muted}>· {detail}</span>
    </span>
  );
};

export default StoreStatusBadge;
