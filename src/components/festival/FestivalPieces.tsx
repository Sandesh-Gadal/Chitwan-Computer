import React from 'react';
import { PinHead } from './icons';
import { Sprinkle, useFestival } from './registry';

/** Icons scattered across an area, positioned by % so they scale with it */
export const Sprinkles: React.FC<{ items: Sprinkle[]; className?: string }> = ({ items, className = '' }) => (
  <div className={`pointer-events-none absolute inset-0 ${className}`} aria-hidden="true">
    {items.map(({ Icon, colors, x, y, size, rotate = 0, sway }, i) => (
      <span
        key={i}
        className={`absolute ${sway ? `kite-${sway}` : ''}`}
        style={{ left: `${x}%`, top: `${y}%`, width: size }}
      >
        <Icon colors={colors} className="block h-auto w-full" style={{ transform: `rotate(${rotate}deg)` }} />
      </span>
    ))}
  </div>
);

interface PinnedTagProps {
  children: React.ReactNode;
  /** Tilt in degrees; alternate signs so a row of tags doesn't look stamped */
  tilt?: number;
  size?: 'sm' | 'md';
  className?: string;
}

/**
 * A festival-coloured tag held on with a pushpin, for offers and notes.
 * Renders nothing outside festivals.
 */
export const PinnedTag: React.FC<PinnedTagProps> = ({ children, tilt = -4, size = 'sm', className = '' }) => {
  const active = useFestival();
  if (!active) return null;
  const { theme } = active.festival;
  const Mark = active.decor.Mark;

  return (
    <span
      className={`relative inline-flex items-center gap-1.5 whitespace-nowrap rounded-[3px] font-semibold shadow-[0_6px_14px_-6px_rgba(0,0,0,0.45)] ${
        size === 'md' ? 'px-3.5 pb-2 pt-3 text-sm' : 'px-2.5 pb-1.5 pt-2.5 text-[11px] uppercase tracking-wide'
      } ${className}`}
      style={{ backgroundColor: theme.base, color: theme.cream, transform: `rotate(${tilt}deg)` }}
    >
      <PinHead color={theme.accent} className="absolute -top-2 left-1/2 h-4 w-4 -translate-x-1/2" />
      <Mark className={size === 'md' ? 'h-4 w-3' : 'h-3 w-2'} />
      {children}
    </span>
  );
};

/** Icons drifting in the left margin, only where the page has room for them */
export const FestivalFloaters: React.FC = () => {
  const active = useFestival();
  if (!active?.decor.margin.length) return null;
  return (
    <div className="pointer-events-none fixed bottom-0 left-2 top-[210px] z-30 hidden w-[90px] min-[1480px]:block">
      <Sprinkles items={active.decor.margin} />
    </div>
  );
};
