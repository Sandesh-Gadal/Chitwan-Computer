import React from 'react';
import { activeFestival, Festival } from '../../data/festival';
import { DiyoIcon, DiyoMarkIcon, IconProps, KiteIcon, LanternIcon, MarigoldIcon, TikaIcon } from './icons';
import DashainScene from './DashainScene';
import TiharScene from './TiharScene';

type Icon = React.FC<IconProps>;

/** An icon placed somewhere: x/y in % of its area, size in px */
export interface Sprinkle {
  Icon: Icon;
  colors?: [string, string];
  x: number;
  y: number;
  size: number;
  rotate?: number;
  /** Sway animation variant: a, b or c, or none to keep it still */
  sway?: 'a' | 'b' | 'c';
}

/** Icons for one festival. Add an entry under the festival's id to theme a new one. */
export interface FestivalDecor {
  /** Small icon beside greetings, deal labels, pinned tags and headings */
  Mark: Icon;
  /** Round icon paired with the mark in the greeting bar and footer greeting */
  Accent: Icon;
  /** Scattered over the festival slide */
  slide: Sprinkle[];
  /** Drifting down the left margin on wide screens */
  margin: Sprinkle[];
  /** Jhilimili under the header and diyos atop the footer (see Lights.tsx) */
  lights?: boolean;
  /** Optional drawn landscape along the bottom of the festival slide */
  Scene?: React.FC<{ theme: Festival['theme'] }>;
}

const GOLD = '#F6B451';
const CREAM = '#FBE7C2';
const MAROON = '#5C1416';
const GREEN = '#3E7C59';
const BLUE = '#2F5D8A';
const RED = '#E0483A';
const MAGENTA = '#C2397A';

export const festivalDecor: Record<string, FestivalDecor> = {
  dashain: {
    Mark: KiteIcon,
    Accent: TikaIcon,
    // Kites stay in the sky; the hills and ping below come from DashainScene.
    // Phones show only the first three, so the one nearest the copy goes last.
    slide: [
      { Icon: KiteIcon, colors: [GOLD, CREAM], x: 63, y: 12, size: 64, rotate: -12, sway: 'a' },
      { Icon: KiteIcon, colors: [BLUE, CREAM], x: 91, y: 26, size: 44, rotate: -6, sway: 'c' },
      { Icon: KiteIcon, colors: [GOLD, MAROON], x: 82, y: 28, size: 28, rotate: -18, sway: 'a' },
      { Icon: KiteIcon, colors: [CREAM, GREEN], x: 56, y: 38, size: 34, rotate: 16, sway: 'b' },
    ],
    Scene: DashainScene,
    margin: [
      { Icon: KiteIcon, colors: [GOLD, MAROON], x: 40, y: 6, size: 56, rotate: -10, sway: 'a' },
      { Icon: TikaIcon, x: 30, y: 26, size: 22 },
      { Icon: KiteIcon, colors: [GREEN, CREAM], x: 55, y: 40, size: 44, rotate: 12, sway: 'c' },
      { Icon: KiteIcon, colors: [RED, CREAM], x: 30, y: 66, size: 36, rotate: -16, sway: 'b' },
    ],
  },
  tihar: {
    Mark: DiyoMarkIcon,
    Accent: MarigoldIcon,
    lights: true,
    // Sky lanterns drift above the lit house in TiharScene; marigolds float between them.
    // Phones show only the first three, so the one nearest the copy goes last.
    slide: [
      { Icon: LanternIcon, x: 60, y: 8, size: 46, rotate: -4, sway: 'a' },
      { Icon: LanternIcon, colors: [MAGENTA, GOLD], x: 92, y: 36, size: 30, rotate: 5, sway: 'c' },
      { Icon: MarigoldIcon, x: 80, y: 30, size: 26, rotate: 20, sway: 'b' },
      { Icon: LanternIcon, colors: [GOLD, CREAM], x: 70, y: 44, size: 24, rotate: 8, sway: 'b' },
    ],
    Scene: TiharScene,
    margin: [
      { Icon: LanternIcon, x: 38, y: 4, size: 48, rotate: -6, sway: 'a' },
      { Icon: MarigoldIcon, x: 30, y: 26, size: 26, rotate: 15 },
      { Icon: DiyoIcon, x: 50, y: 42, size: 44 },
      { Icon: LanternIcon, colors: [MAGENTA, GOLD], x: 28, y: 60, size: 34, rotate: 8, sway: 'c' },
      { Icon: MarigoldIcon, colors: ['#FFC93C', '#FFE28A'], x: 55, y: 78, size: 22, rotate: -10 },
    ],
  },
};

/** The festival on today (if any) with its icons */
export const useFestival = (): { festival: Festival; decor: FestivalDecor } | null => {
  const festival = activeFestival();
  const decor = festival && festivalDecor[festival.id];
  return festival && decor ? { festival, decor } : null;
};

/** The current festival's small icon, or nothing outside festivals */
export const FestivalMark: React.FC<{ className?: string }> = ({ className }) => {
  const active = useFestival();
  return active ? <active.decor.Mark className={className} /> : null;
};
