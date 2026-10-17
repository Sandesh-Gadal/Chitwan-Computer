import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useFestival } from './registry';
import { TikaIcon } from './icons';

const dismissKey = (id: string) => `cc-festival-dismissed-${id}`;

const wasDismissed = (id: string) => {
  try {
    return localStorage.getItem(dismissKey(id)) === '1';
  } catch {
    return false;
  }
};

/** Festival greeting above the header while a festival is on; visitors can close it */
const FestivalBar: React.FC = () => {
  const active = useFestival();
  const [hidden, setHidden] = useState(() => !active || wasDismissed(active.festival.id));

  if (!active || hidden) return null;
  const { festival, decor } = active;
  const { theme } = festival;

  const dismiss = () => {
    setHidden(true);
    try {
      localStorage.setItem(dismissKey(festival.id), '1');
    } catch {
      /* storage unavailable: it just shows again next visit */
    }
  };

  return (
    <div className="relative" style={{ backgroundColor: theme.base, color: theme.cream }}>
      <div className="mx-auto flex min-h-10 max-w-7xl items-center justify-center gap-3 px-10 py-2 text-center text-[13px] sm:px-6 lg:px-8">
        <decor.Mark className="hidden h-5 w-3.5 flex-shrink-0 -rotate-12 sm:block" />
        <TikaIcon className="hidden h-3.5 w-3.5 flex-shrink-0 sm:block" />
        <p>
          <span lang="ne" className="font-semibold">
            {festival.greeting.ne}
          </span>
          <span className="mx-2 hidden opacity-50 sm:inline">·</span>
          <span className="hidden opacity-80 sm:inline">{festival.note}</span>
        </p>
        <TikaIcon className="hidden h-3.5 w-3.5 flex-shrink-0 sm:block" />
        <decor.Mark className="hidden h-5 w-3.5 flex-shrink-0 rotate-12 sm:block" />
      </div>
      <button
        onClick={dismiss}
        aria-label="Close greeting"
        className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1.5 opacity-70 transition-opacity hover:opacity-100"
      >
        <X size={15} />
      </button>
    </div>
  );
};

export default FestivalBar;
