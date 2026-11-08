import React from 'react';
import { Festival } from '../../data/festival';

// Laxmi Puja night in Chitwan: Aunsi (new moon), so no moon, only stars. A house lit for
// Laxmi with serial lights on the roof, sayapatri malas along the beam, rows of diyos and a
// rangoli at the open door; a garlanded dog for Kukur Tihar and a child with a sparkler.
// Coordinates are in a 1200×300 band anchored bottom-right, so phones keep the house in view.

const INK = '#0E040C';
const WALL = '#2E1226';
const HOUSE = '#3A1631';
const ROOF = '#1C0818';
const FRAME = '#160510';
const WINDOW = '#FFC65C';
const DOOR = '#FFD98A';
const GOLD = '#FFD25E';
const ORANGE = '#FF9A1F';
const MAGENTA = '#C2397A';
const CREAM = '#FFEBC9';
const RED = '#D7263D';
const LIGHTS = [GOLD, MAGENTA, '#5BC0EB', '#7ED957', '#FF6B4A'];

/** Point t (0–1) along the quadratic curve from a to b through control c */
const along = (a: [number, number], c: [number, number], b: [number, number], t: number): [number, number] => [
  (1 - t) ** 2 * a[0] + 2 * (1 - t) * t * c[0] + t ** 2 * b[0],
  (1 - t) ** 2 * a[1] + 2 * (1 - t) * t * c[1] + t ** 2 * b[1],
];

/** Clay diyo with a flickering flame; base centre at (x, y) */
const Diyo: React.FC<{ x: number; y: number; scale?: number }> = ({ x, y, scale = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${scale})`}>
    <circle cx="0" cy="-16" r="15" fill="url(#tihar-glow)" />
    <path d="M0 -8 Q-5 -15 0 -26 Q5 -15 0 -8 Z" fill={GOLD} className="diyo-flame" />
    <path d="M-16 -8 Q0 8 16 -8 Q0 -3 -16 -8 Z" fill="#B85A1E" />
  </g>
);

/** Sayapatri mala sagging between two points */
const Mala: React.FC<{ from: [number, number]; to: [number, number]; sag: number; count: number }> = ({
  from,
  to,
  sag,
  count,
}) => {
  const ctrl: [number, number] = [(from[0] + to[0]) / 2, (from[1] + to[1]) / 2 + sag * 2];
  return (
    <g>
      {Array.from({ length: count }, (_, i) => {
        const [cx, cy] = along(from, ctrl, to, i / (count - 1));
        return <circle key={i} cx={cx} cy={cy} r="2.8" fill={i % 2 ? GOLD : ORANGE} />;
      })}
    </g>
  );
};

/** Serial lights along a straight run of roof edge */
const SerialLights: React.FC<{ from: [number, number]; to: [number, number]; count: number; offset?: number }> = ({
  from,
  to,
  count,
  offset = 0,
}) => (
  <g>
    <path d={`M${from[0]} ${from[1]} L${to[0]} ${to[1]}`} stroke={INK} strokeWidth="0.8" />
    {Array.from({ length: count }, (_, i) => {
      const t = i / (count - 1);
      const n = i + offset;
      return (
        <circle
          key={i}
          cx={from[0] + (to[0] - from[0]) * t}
          cy={from[1] + (to[1] - from[1]) * t + 2}
          r="2"
          fill={LIGHTS[n % LIGHTS.length]}
          className={`tihar-twinkle tw-${'abc'[n % 3]}`}
        />
      );
    })}
  </g>
);

/** Lit window with its frame and a soft glow, top-left at (x, y) */
const Window: React.FC<{ x: number; y: number; w?: number; h?: number }> = ({ x, y, w = 20, h = 20 }) => (
  <g>
    <ellipse cx={x + w / 2} cy={y + h / 2} rx={w * 1.3} ry={h * 1.3} fill="url(#tihar-glow)" />
    <rect x={x} y={y} width={w} height={h} fill={WINDOW} stroke={FRAME} strokeWidth="2.5" />
    <path d={`M${x + w / 2} ${y} V${y + h} M${x} ${y + h / 2} H${x + w}`} stroke={FRAME} strokeWidth="1.6" />
  </g>
);

/** Round tree in silhouette, trunk foot at (x, y) */
const Tree: React.FC<{ x: number; y: number; scale?: number }> = ({ x, y, scale = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${scale})`} fill="#1E0A1C">
    <rect x="-2" y="-12" width="4" height="12" />
    <circle cx="0" cy="-22" r="12" />
    <circle cx="-8" cy="-15" r="8" />
    <circle cx="8" cy="-15" r="8" />
  </g>
);

/** Small far-off house with one lit window, standing at (x, y) */
const FarHouse: React.FC<{ x: number; y: number; scale?: number }> = ({ x, y, scale = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${scale})`}>
    <path d="M-12 -12 L0 -21 L12 -12 Z" fill={ROOF} />
    <rect x="-10" y="-12" width="20" height="12" fill="#24091F" />
    <rect x="-3" y="-9" width="6" height="5" fill={WINDOW} className="tihar-twinkle tw-c" />
  </g>
);

/** Standing figure, feet at (x, y). arm: where the raised hand goes, relative to the shoulder */
const Person: React.FC<{ x: number; y: number; scale?: number; arm?: [number, number] }> = ({ x, y, scale = 1, arm }) => (
  <g transform={`translate(${x} ${y}) scale(${scale})`} stroke={INK} strokeLinecap="round" fill="none">
    <path d="M-1 -16 L-5 0 M1 -16 L5 0" strokeWidth="3.6" />
    <path d="M0 -17 V-29" strokeWidth="7.5" />
    <path d={`M0 -27 L-6 -18 M0 -27 L${arm ? `${arm[0]} ${-27 + arm[1]}` : '6 -18'}`} strokeWidth="3" />
    <circle cx="0" cy="-35" r="5" fill={INK} stroke="none" />
  </g>
);

/** Phuljhadi: a sparkler fizzing at (x, y) */
const Sparkler: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <g transform={`translate(${x} ${y})`}>
    <circle r="12" fill="url(#tihar-glow)" />
    <g className="sparkle" stroke={GOLD} strokeWidth="1.2" strokeLinecap="round">
      {Array.from({ length: 10 }, (_, i) => {
        const a = (i * Math.PI) / 5;
        const r = i % 2 ? 6 : 9;
        return <path key={i} d={`M${Math.cos(a) * 2.5} ${Math.sin(a) * 2.5} L${Math.cos(a) * r} ${Math.sin(a) * r}`} />;
      })}
    </g>
    <circle r="1.8" fill="#FFF8EE" />
  </g>
);

/** Kukur Tihar: a dog with a sayapatri mala and a red tika, facing right, feet at (x, y) */
const Dog: React.FC<{ x: number; y: number; scale?: number }> = ({ x, y, scale = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${scale})`}>
    <path d="M-14 -16 Q-24 -22 -21 -31" stroke={INK} strokeWidth="3" strokeLinecap="round" fill="none" />
    <path d="M-10 -10 V0 M-4 -10 V0 M7 -10 V0 M12 -10 V0" stroke={INK} strokeWidth="3.2" strokeLinecap="round" />
    <ellipse cx="0" cy="-14" rx="15" ry="7" fill={INK} />
    <path d="M10 -16 L14 -26 L19 -18 Z" fill={INK} />
    <circle cx="17" cy="-25" r="6" fill={INK} />
    <ellipse cx="23" cy="-23" rx="4.5" ry="2.8" fill={INK} />
    <path d="M13 -29 L11 -21 L16 -25 Z" fill={INK} />
    {[
      [11, -26],
      [10, -22],
      [11, -18],
      [14, -15.5],
      [18, -16],
      [20.5, -19],
    ].map(([cx, cy], i) => (
      <circle key={i} cx={cx} cy={cy} r="2.3" fill={i % 2 ? GOLD : ORANGE} />
    ))}
    <circle cx="18.5" cy="-29" r="1.3" fill={RED} />
  </g>
);

/** Rangoli at the doorstep, flattened into the ground, centred on (x, y) */
const Rangoli: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <g transform={`translate(${x} ${y}) scale(1 0.3)`}>
    {Array.from({ length: 8 }, (_, i) => (
      <ellipse key={i} cx="0" cy="-26" rx="7" ry="11" fill={i % 2 ? MAGENTA : ORANGE} transform={`rotate(${i * 45})`} />
    ))}
    <circle r="20" fill={CREAM} />
    <circle r="14" fill={MAGENTA} />
    <circle r="8" fill={GOLD} />
    <circle r="3" fill={RED} />
  </g>
);

const STARS: [number, number, number][] = [
  [560, 30, 1.2], [610, 74, 1], [655, 22, 1.6], [720, 54, 1.1], [770, 18, 1.3], [820, 80, 1],
  [870, 40, 1.7], [920, 16, 1.1], [960, 66, 1.2], [1010, 30, 1], [1065, 52, 1.5], [1110, 20, 1.2],
  [1160, 72, 1], [1185, 36, 1.4], [690, 104, 0.9], [890, 110, 0.9], [1130, 104, 1],
];

const TiharScene: React.FC<{ theme: Festival['theme'] }> = ({ theme }) => (
  <svg
    viewBox="0 0 1200 300"
    preserveAspectRatio="xMaxYMax slice"
    className="pointer-events-none absolute inset-x-0 bottom-0 h-[30%] w-full sm:h-[66%]"
    aria-hidden="true"
  >
    <defs>
      <radialGradient id="tihar-glow">
        <stop offset="0%" stopColor={GOLD} stopOpacity="0.55" />
        <stop offset="100%" stopColor={GOLD} stopOpacity="0" />
      </radialGradient>
    </defs>

    {STARS.map(([cx, cy, r], i) => (
      <circle key={i} cx={cx} cy={cy} r={r} fill={theme.cream} className={`tihar-twinkle tw-${'abc'[i % 3]}`} />
    ))}

    {/* Far ridge catching the glow of a town full of lights */}
    <path
      d="M0 176 C90 150 190 158 290 136 C400 112 480 140 600 122 C720 104 800 128 900 108 C1000 88 1100 104 1200 92 V300 H0 Z"
      fill={theme.accent}
      fillOpacity="0.12"
    />

    {/* Middle ridge with neighbours' houses lit too */}
    <path
      d="M0 228 C140 206 250 214 360 198 C480 182 580 200 690 190 C800 180 880 162 980 162 C1070 162 1120 170 1200 160 V300 H0 Z"
      fill="#2A0F2C"
    />
    <FarHouse x={560} y={200} scale={0.8} />
    <FarHouse x={640} y={196} />
    <FarHouse x={1010} y={164} scale={0.85} />
    <FarHouse x={1150} y={164} scale={0.75} />

    {/* Near ground, with trees on the right under the slider's buttons */}
    <path d="M0 300 V278 C120 268 260 272 380 264 C460 258 500 256 540 256 H1200 V300 Z" fill="#14060F" />
    <Tree x={1040} y={258} scale={1.3} />
    <Tree x={1095} y={258} scale={1.7} />
    <Tree x={1165} y={258} scale={1.4} />

    {/* Boundary wall with diyos along its top */}
    <rect x="552" y="236" width="246" height="21" fill={WALL} />
    <rect x="548" y="232" width="254" height="5" rx="1.5" fill={ROOF} />
    {Array.from({ length: 10 }, (_, i) => (
      <Diyo key={i} x={563 + i * 25} y={232} scale={0.42} />
    ))}

    {/* The house: two storeys with tiered eaves. Drawn at x 944–1136, shifted left so the
        slider's counter and arrows (bottom-right) don't sit over the door */}
    <g transform="translate(-150 0)">
    <rect x="960" y="152" width="160" height="105" fill={HOUSE} />
    <path d="M944 154 L1040 104 L1136 154 Z" fill={ROOF} />
    <path d="M952 200 H1128 L1120 192 H960 Z" fill={ROOF} />
    <Window x={978} y={164} />
    <Window x={1030} y={164} />
    <Window x={1082} y={164} />
    <Window x={978} y={214} />
    <Window x={1082} y={214} />

    {/* Open door: light spills out for Laxmi */}
    <path d="M1027 257 L1012 300 H1068 L1053 257 Z" fill={DOOR} fillOpacity="0.16" />
    <ellipse cx="1040" cy="236" rx="30" ry="34" fill="url(#tihar-glow)" />
    <rect x="1027" y="208" width="26" height="49" fill={DOOR} stroke={FRAME} strokeWidth="3" />
    <path d="M1027 208 L1018 214 V257 L1027 257 Z" fill={FRAME} />

    {/* Serial lights on the roof, sayapatri malas under the eave and over the door */}
    <SerialLights from={[944, 154]} to={[1040, 104]} count={11} />
    <SerialLights from={[1040, 104]} to={[1136, 154]} count={11} offset={10} />
    <SerialLights from={[952, 200]} to={[1128, 200]} count={16} offset={3} />
    <Mala from={[962, 204]} to={[1015, 204]} sag={6} count={9} />
    <Mala from={[1015, 204]} to={[1065, 204]} sag={6} count={9} />
    <Mala from={[1065, 204]} to={[1118, 204]} sag={6} count={9} />

    {/* Diyos lining the doorstep and the rangoli in front */}
    {[968, 986, 1004, 1076, 1094, 1112].map((x) => (
      <Diyo key={x} x={x} y={258} scale={0.4} />
    ))}
    <Rangoli x={1040} y={274} />
    </g>

    {/* Dog garlanded for Kukur Tihar, heading for the door */}
    <Dog x={760} y={270} />

    {/* Family in the yard: a child waving a sparkler */}
    <Person x={652} y={266} scale={1.1} />
    <Person x={680} y={268} scale={0.78} arm={[10, -13]} />
    <path d="M687.8 236.8 L691.5 229" stroke="#6B4B3A" strokeWidth="1" />
    <Sparkler x={691.5} y={228} />
  </svg>
);

export default TiharScene;
