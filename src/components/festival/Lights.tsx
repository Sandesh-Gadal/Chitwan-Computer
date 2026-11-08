import React from 'react';
import { DiyoIcon } from './icons';
import { useFestival } from './registry';

// Tihar lights for the whole site: jhilimili (serial lights) strung in swags, and a row of
// diyos. Each renders nothing unless the current festival turns it on in registry.tsx.

const BULBS = ['#FFD25E', '#FF4F7B', '#4FC3F7', '#7ED957', '#FF8A2B', '#C77DFF'];
const SWAG = 140; // px per swag, constant at every screen width
const SWAGS = 22; // enough for a 3000px-wide screen
const PER_SWAG = 5;

/** Point t (0–1) along a swag that dips `sag` px in the middle */
const swagPoint = (t: number, sag: number): [number, number] => [t * SWAG, 2 + 4 * sag * t * (1 - t)];

/**
 * Jhilimili: coloured bulbs twinkling on a wire that droops between hooks.
 * Place inside a positioned element; it hangs from that element's bottom edge (or top edge with `at="top"`).
 */
export const Jhilimili: React.FC<{ at?: 'top' | 'bottom'; sag?: number; wire?: string }> = ({
  at = 'bottom',
  sag = 12,
  wire = '#3A2A2A',
}) => {
  const active = useFestival();
  if (!active?.decor.lights) return null;

  const height = sag + 14;
  const width = SWAG * SWAGS;

  return (
    <div
      className={`pointer-events-none absolute inset-x-0 overflow-hidden ${at === 'bottom' ? 'top-full' : 'top-0'}`}
      style={{ height }}
      aria-hidden="true"
    >
      <svg width={width} height={height} className="absolute left-1/2 top-0 -translate-x-1/2">
        {Array.from({ length: SWAGS }, (_, s) => (
          <g key={s} transform={`translate(${s * SWAG} 0)`}>
            <path d={`M0 2 Q${SWAG / 2} ${2 + 2 * sag} ${SWAG} 2`} stroke={wire} strokeOpacity="0.55" strokeWidth="1" fill="none" />
            {Array.from({ length: PER_SWAG }, (_, b) => {
              const [x, y] = swagPoint((b + 0.5) / PER_SWAG, sag);
              const n = s * PER_SWAG + b;
              const color = BULBS[n % BULBS.length];
              return (
                <g key={b} className={`tihar-twinkle tw-${'abc'[n % 3]}`}>
                  <circle cx={x} cy={y + 5} r="6" fill={color} opacity="0.28" />
                  <rect x={x - 1.6} y={y} width="3.2" height="2.6" rx="0.6" fill={wire} />
                  <ellipse cx={x} cy={y + 5.4} rx="2.6" ry="3.4" fill={color} />
                  <ellipse cx={x - 0.8} cy={y + 4.4} rx="0.8" ry="1.2" fill="#fff" opacity="0.7" />
                </g>
              );
            })}
          </g>
        ))}
      </svg>
    </div>
  );
};

/** A ledge of lit diyos, as set along walls and doorsteps on Laxmi Puja */
export const DiyoRow: React.FC<{ className?: string }> = ({ className = '' }) => {
  const active = useFestival();
  if (!active?.decor.lights) return null;

  return (
    <div className={`diyo-row flex items-end justify-around overflow-hidden ${className}`} aria-hidden="true">
      {Array.from({ length: 18 }, (_, i) => (
        <span
          key={i}
          // Phones get every other diyo, so they don't crowd
          className={`relative w-8 flex-shrink-0 sm:w-9 ${i % 2 ? 'hidden sm:block' : ''}`}
        >
          <span className="absolute -inset-3 -top-5 rounded-full bg-[radial-gradient(circle,rgba(255,200,80,0.35),transparent_65%)]" />
          <DiyoIcon className="relative block h-auto w-full" />
        </span>
      ))}
    </div>
  );
};
