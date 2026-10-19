import React from 'react';
import { activeFestival, Festival } from '../../data/festival';
import { IconProps, KiteIcon, TikaIcon } from './icons';
import DashainScene from './DashainScene';

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
  /** Scattered over the festival slide */
  slide: Sprinkle[];
  /** Drifting down the left margin on wide screens */
  margin: Sprinkle[];
  /** Optional drawn landscape along the bottom of the festival slide */
  Scene?: React.FC<{ theme: Festival['theme'] }>;
}

const GOLD = '#F6B451';
const CREAM = '#FBE7C2';
const MAROON = '#5C1416';
const GREEN = '#3E7C59';
const BLUE = '#2F5D8A';
const RED = '#E0483A';

export const festivalDecor: Record<string, FestivalDecor> = {
  dashain: {
    Mark: KiteIcon,
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
