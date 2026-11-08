import React from 'react';

// Small festival icons, reused by every festival's theme in registry.tsx.

export interface IconProps {
  className?: string;
  style?: React.CSSProperties;
  /** Two fills: [main, second] */
  colors?: [string, string];
}

/** Nepali changa: a two-tone diamond with a cross spar and a small tail */
export const KiteIcon: React.FC<IconProps> = ({ className, style, colors = ['#F6B451', '#FBE7C2'] }) => (
  <svg viewBox="-26 -32 52 80" className={className} style={style} aria-hidden="true">
    <path d="M0 -30 L-24 0 L0 32 Z" fill={colors[0]} />
    <path d="M0 -30 L24 0 L0 32 Z" fill={colors[1]} />
    <path d="M-24 0 Q0 -8 24 0 M0 -30 V32" fill="none" stroke="#2B0A0A" strokeOpacity="0.3" strokeWidth="1.4" />
    <path d="M0 32 L-7 44 H7 Z" fill={colors[0]} />
  </svg>
);

/** Red tika with a few grains of rice */
export const TikaIcon: React.FC<IconProps> = ({ className, style, colors = ['#C8102E', '#FFF8EA'] }) => (
  <svg viewBox="0 0 40 40" className={className} style={style} aria-hidden="true">
    <circle cx="20" cy="20" r="15" fill={colors[0]} />
    {[
      [14, 15, 20],
      [22, 12, -30],
      [26, 20, 50],
      [17, 24, -10],
      [23, 27, 70],
    ].map(([cx, cy, r]) => (
      <ellipse key={`${cx}-${cy}`} cx={cx} cy={cy} rx="2.6" ry="1.3" fill={colors[1]} transform={`rotate(${r} ${cx} ${cy})`} />
    ))}
  </svg>
);

/** Clay oil lamp with a flame */
export const DiyoIcon: React.FC<IconProps> = ({ className, style, colors = ['#A3561C', '#FFD25E'] }) => (
  <svg viewBox="0 0 48 40" className={className} style={style} aria-hidden="true">
    <path d="M24 22 Q18 13 24 2 Q30 13 24 22 Z" fill={colors[1]} className="diyo-flame" />
    <path d="M4 24 Q24 44 44 24 Q24 31 4 24 Z" fill={colors[0]} />
  </svg>
);

/**
 * Diyo drawn tall (about the kite's proportions) so it fits the same small slots
 * as other festival marks: greeting bar, pinned tags, headings.
 */
export const DiyoMarkIcon: React.FC<IconProps> = ({ className, style, colors = ['#C8641E', '#FFD25E'] }) => (
  <svg viewBox="-20 -38 40 60" className={className} style={style} aria-hidden="true">
    <path d="M0 -4 Q-9 -16 0 -36 Q9 -16 0 -4 Z" fill={colors[1]} className="diyo-flame" />
    <path d="M0 -8 Q-4 -14 0 -24 Q4 -14 0 -8 Z" fill="#FFF6D8" />
    <path d="M-19 -2 Q0 26 19 -2 Q0 6 -19 -2 Z" fill={colors[0]} />
    <path d="M-19 -2 Q0 6 19 -2" fill="none" stroke="#2B0A0A" strokeOpacity="0.25" strokeWidth="1.4" />
  </svg>
);

/** Sayapatri (marigold): layered ruffled petals, as strung in Tihar malas */
export const MarigoldIcon: React.FC<IconProps> = ({ className, style, colors = ['#FF9A1F', '#FFC93C'] }) => (
  <svg viewBox="0 0 40 40" className={className} style={style} aria-hidden="true">
    {Array.from({ length: 12 }, (_, i) => (
      <ellipse key={`o${i}`} cx="20" cy="7" rx="4.6" ry="7" fill={colors[0]} transform={`rotate(${i * 30} 20 20)`} />
    ))}
    {Array.from({ length: 10 }, (_, i) => (
      <ellipse key={`i${i}`} cx="20" cy="11" rx="3.6" ry="5.4" fill={colors[1]} transform={`rotate(${i * 36 + 18} 20 20)`} />
    ))}
    <circle cx="20" cy="20" r="4.5" fill={colors[0]} />
    <circle cx="20" cy="20" r="4.5" fill="#7A3200" fillOpacity="0.25" />
  </svg>
);

/** Akash deep: paper sky lantern with a warm glow */
export const LanternIcon: React.FC<IconProps> = ({ className, style, colors = ['#FF7A3D', '#FFD25E'] }) => (
  <svg viewBox="-22 -30 44 64" className={className} style={style} aria-hidden="true">
    <circle cx="0" cy="2" r="20" fill={colors[1]} fillOpacity="0.22" />
    <path d="M-11 -22 H11 L15 16 H-15 Z" fill={colors[0]} />
    <path d="M-4 -22 L-5 16 M4 -22 L5 16" stroke="#2B0A0A" strokeOpacity="0.18" strokeWidth="1.2" />
    <rect x="-12" y="-25" width="24" height="4" rx="1.5" fill="#7A2A12" />
    <rect x="-15" y="15" width="30" height="3.5" rx="1.5" fill="#7A2A12" />
    <path d="M-5 18.5 Q0 30 5 18.5 Z" fill={colors[1]} className="diyo-flame" />
  </svg>
);

/** Round pushpin head, for pinned tags */
export const PinHead: React.FC<{ color: string; className?: string }> = ({ color, className }) => (
  <svg viewBox="0 0 20 20" className={className} aria-hidden="true">
    <circle cx="10" cy="11" r="7" fill="#000" opacity="0.18" />
    <circle cx="10" cy="9" r="7" fill={color} />
    <circle cx="7.6" cy="6.6" r="2.2" fill="#fff" opacity="0.55" />
  </svg>
);
