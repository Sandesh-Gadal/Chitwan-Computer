import React from 'react';
import { Festival } from '../../data/festival';

// Dusk over the Chitwan hills: a bamboo ping (swing) with someone on it, a child flying a
// kite and a few people watching. Drawn as silhouettes against the slide's glow.
// Coordinates are in a 1200×300 band anchored bottom-right, so phones keep the ping in view.

const INK = '#1A0405';
const RED = '#E0483A';
const CREAM = '#FBE7C2';
const WHITE = '#FFF8EE';
const GREEN_MID = '#2C5A3A';
const GREEN_NEAR = '#1C3A25';
const LEAF = '#4F8F5B';
const JAMARA = '#B5DE6E';

/** Soft cloud centred on (x, y) */
const Cloud: React.FC<{ x: number; y: number; scale?: number }> = ({ x, y, scale = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${scale})`} fill={WHITE} fillOpacity="0.8">
    <ellipse cx="0" cy="6" rx="46" ry="9" />
    <circle cx="-16" cy="0" r="12" />
    <circle cx="6" cy="-6" r="16" />
    <circle cx="26" cy="2" r="10" />
  </g>
);

/** Round hill tree, trunk foot at (x, y) */
const Tree: React.FC<{ x: number; y: number; scale?: number }> = ({ x, y, scale = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${scale})`}>
    <rect x="-1.5" y="-10" width="3" height="10" fill={GREEN_NEAR} />
    <circle cx="0" cy="-17" r="10" fill={LEAF} />
    <circle cx="-6" cy="-12" r="7" fill={LEAF} />
    <circle cx="6" cy="-12" r="7" fill={GREEN_MID} />
  </g>
);

/** Jamara: barley sprouts grown for Tika, in a clay pot standing at (x, y) */
const Jamara: React.FC<{ x: number; y: number; scale?: number }> = ({ x, y, scale = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${scale})`}>
    <path
      d="M-6 -12 Q-10 -26 -13 -34 M-3 -12 Q-4 -28 -6 -38 M0 -12 V-40 M3 -12 Q4 -28 7 -37 M6 -12 Q10 -24 14 -32"
      stroke={JAMARA}
      strokeWidth="2"
      strokeLinecap="round"
      fill="none"
    />
    <path d="M-9 -13 H9 L7 0 H-7 Z" fill="#A3561C" />
    <rect x="-10" y="-14" width="20" height="3" rx="1" fill="#C26A2A" />
  </g>
);

/** Triangle flags along a sagging string, cycling red, white, green */
const Bunting: React.FC<{ from: [number, number]; to: [number, number]; sag: number; count: number }> = ({
  from,
  to,
  sag,
  count,
}) => {
  const [x1, y1] = from;
  const [x2, y2] = to;
  const cx = (x1 + x2) / 2;
  const cy = (y1 + y2) / 2 + sag;
  const at = (t: number) => [
    (1 - t) ** 2 * x1 + 2 * (1 - t) * t * cx + t ** 2 * x2,
    (1 - t) ** 2 * y1 + 2 * (1 - t) * t * cy + t ** 2 * y2,
  ];
  const colors = [RED, WHITE, LEAF];
  return (
    <g>
      <path d={`M${x1} ${y1} Q${cx} ${cy} ${x2} ${y2}`} stroke={INK} strokeOpacity="0.45" strokeWidth="1" fill="none" />
      {Array.from({ length: count }, (_, i) => {
        const [fx, fy] = at((i + 1) / (count + 1));
        return <path key={i} d={`M${fx - 5} ${fy} H${fx + 5} L${fx} ${fy + 11} Z`} fill={colors[i % 3]} />;
      })}
    </g>
  );
};

/** Lingo ping: four bamboo poles lashed at the top, swing hanging from the apex at (0, 0) */
const Ping: React.FC<{ x: number; y: number; scale?: number; color: string; slow?: boolean; scarf?: string }> = ({
  x,
  y,
  scale = 1,
  color,
  slow,
  scarf,
}) => (
  <g transform={`translate(${x} ${y}) scale(${scale})`}>
    {/* Back pair, then front pair */}
    <path d="M0 0 L-72 158 M0 0 L72 158" stroke={color} strokeOpacity="0.7" strokeWidth="3" strokeLinecap="round" />
    <path d="M0 0 L-90 158 M0 0 L90 158" stroke={color} strokeWidth="4.5" strokeLinecap="round" />
    <path d="M-5 6 L5 2 M-5 11 L5 7" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
    <path d="M0 -2 V-16 L14 -11 L0 -6" fill={scarf ?? RED} stroke={color} strokeWidth="1.5" strokeLinejoin="round" />

    <g className={slow ? 'ping-swing ping-swing-slow' : 'ping-swing'}>
      <path d="M0 0 L-11 120 M0 0 L11 120" stroke={color} strokeWidth="1.6" />
      <rect x="-15" y="118" width="30" height="4" rx="1" fill={color} />
      {/* Rider standing on the seat, hands on the ropes */}
      <g stroke={color} strokeLinecap="round" fill="none">
        <path d="M-4 118 L-1 100 M4 118 L1 100" strokeWidth="3.6" />
        <path d="M0 100 V86" strokeWidth="7.5" />
        <path d="M0 89 L-7 77 M0 89 L7 77" strokeWidth="3" />
      </g>
      <circle cx="0" cy="77" r="5.5" fill={color} />
      {scarf && <path d="M-1 88 Q-12 92 -22 102 Q-10 99 2 92 Z" fill={scarf} />}
    </g>
  </g>
);

/** A standing figure, feet at (x, y). arm: where the raised hand goes, relative to the shoulder */
const Person: React.FC<{ x: number; y: number; scale?: number; arm?: [number, number] }> = ({ x, y, scale = 1, arm }) => (
  <g transform={`translate(${x} ${y}) scale(${scale})`} stroke={INK} strokeLinecap="round" fill="none">
    <path d="M-1 -16 L-5 0 M1 -16 L5 0" strokeWidth="3.6" />
    <path d="M0 -17 V-29" strokeWidth="7.5" />
    <path d={`M0 -27 L-6 -18 M0 -27 L${arm ? `${arm[0]} ${-27 + arm[1]}` : '6 -18'}`} strokeWidth="3" />
    <circle cx="0" cy="-35" r="5" fill={INK} stroke="none" />
  </g>
);

const DashainScene: React.FC<{ theme: Festival['theme'] }> = ({ theme }) => (
  <svg
    viewBox="0 0 1200 300"
    preserveAspectRatio="xMaxYMax slice"
    className="pointer-events-none absolute inset-x-0 bottom-0 h-[26%] w-full sm:h-[62%]"
    aria-hidden="true"
  >
    {/* Far ridge: misty in daylight, catching the glow at dusk */}
    <path
      d="M0 170 C90 140 190 150 290 126 C400 100 480 132 600 112 C720 92 800 118 900 96 C1000 74 1100 92 1200 80 V300 H0 Z"
      fill={theme.sky ? '#8DBFA6' : theme.accent}
      fillOpacity={theme.sky ? 0.7 : 0.13}
    />

    <Cloud x={630} y={62} scale={0.8} />
    <Cloud x={1150} y={46} scale={0.7} />

    {/* Green middle ridge with terraced fields, trees and a distant ping */}
    <Ping x={1150} y={96} scale={0.4} color={GREEN_NEAR} slow />
    <path
      d="M0 230 C120 205 230 215 340 196 C470 174 560 196 680 184 C800 172 880 150 980 152 C1070 154 1120 160 1200 150 V300 H0 Z"
      fill={GREEN_MID}
    />
    <path
      d="M380 214 C460 200 540 206 620 198 M360 232 C450 218 560 224 650 214 M700 196 C780 186 860 170 940 168"
      stroke={JAMARA}
      strokeOpacity="0.22"
      strokeWidth="1.5"
      fill="none"
    />
    <Tree x={470} y={186} scale={0.8} />
    <Tree x={488} y={188} scale={0.6} />
    <Tree x={690} y={186} />
    <Tree x={1060} y={158} scale={0.7} />

    {/* Near hills */}
    <path d="M0 300 V262 C90 246 190 254 280 272 C320 280 350 292 370 300 Z" fill={GREEN_NEAR} />
    <path d="M520 300 C620 252 760 215 900 205 C1020 196 1120 215 1200 230 V300 Z" fill={GREEN_NEAR} />

    {/* The big ping on the near hill, with festive bunting strung from its top */}
    <Bunting from={[988, 58]} to={[1200, 150]} sag={18} count={9} />
    <Ping x={985} y={56} color={INK} scarf={RED} />
    <Jamara x={1150} y={222} />
    <Jamara x={1164} y={224} scale={0.75} />

    {/* Watchers at its foot */}
    <Person x={1112} y={218} arm={[9, -10]} />
    <Person x={1128} y={220} scale={0.72} />

    {/* Child flying a kite, with a smaller one beside them */}
    <Person x={800} y={219} arm={[9, -12]} />
    <Person x={781} y={221} scale={0.7} arm={[7, -11]} />
    <g transform="translate(809 180)">
      <g className="kite-tether">
        <path d="M0 0 Q34 -50 58 -143" stroke={INK} strokeOpacity="0.5" strokeWidth="1" fill="none" />
        <g transform="translate(66 -173) rotate(14) scale(0.7)">
          <path d="M0 -30 L-24 0 L0 32 Z" fill={RED} />
          <path d="M0 -30 L24 0 L0 32 Z" fill={CREAM} />
          <path d="M-24 0 Q0 -8 24 0 M0 -30 V32" fill="none" stroke="#2B0A0A" strokeOpacity="0.3" strokeWidth="1.4" />
          <path d="M0 32 L-7 44 H7 Z" fill={RED} />
        </g>
      </g>
    </g>
  </svg>
);

export default DashainScene;
