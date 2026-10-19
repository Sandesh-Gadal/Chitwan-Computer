import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { ContactShadows, Environment, Lightformer, OrbitControls, RoundedBox } from '@react-three/drei';
import * as THREE from 'three';
import type { CaseColor, CaseStyle, CoolerId } from '../../data/pcBuilder';

// The PC is modelled from primitives rather than a downloaded model: it loads
// instantly, and every part can animate in on its own. Proportions follow a real
// ATX mid tower (1 unit ≈ 170 mm): 120 mm fans, a standard board layout with the
// RAM in front of the socket and the rear I/O at the back, a horizontally mounted
// graphics card, a PSU under the shroud and sleeved power cables.
//
// Axes: x runs front (−) to back (+), y is up, z points out through the glass.

export interface SceneParts {
  cpu: boolean;
  cooler: CoolerId | null;
  ram: boolean;
  gpu: { fans: 2 | 3 } | null;
  storage: 'm2' | 'hdd' | null;
  psu: boolean;
  caseStyle: CaseStyle;
  color: CaseColor;
  rgb: string;
}

interface PcSceneProps {
  parts: SceneParts;
  reduceMotion: boolean;
  /** Receives the WebGL canvas, for saving a picture of the build */
  onCanvas?: (canvas: HTMLCanvasElement) => void;
}

type V3 = [number, number, number];

const W = 2.4; // front to back
const H = 2.8;
const D = 1.2; // side to side
const T = 0.05; // panel thickness
const TRAY_Z = -D / 2 + T / 2; // inner face of the motherboard tray
const BOARD_Z = -0.5;
const ON_BOARD = BOARD_Z + 0.015; // front face of the motherboard
const SHROUD_TOP = -0.825;
const FLOOR = -H / 2 + T / 2;
const REAR = W / 2 - T / 2; // inner face of the rear wall

// ATX board: 244 × 305 mm, rear edge against the I/O cut-out
const BX = 0.36;
const BY = 0.26;
const BW = 1.43;
const BH = 1.78;
/** Board-local (x, y) to cabinet coordinates */
const b = (x: number, y: number, z: number): V3 => [BX + x, BY + y, z];
const SOCKET: [number, number] = [BX + 0.12, BY + 0.4];
const PCIE_Y = BY - 0.08;
const zOn = (h: number) => ON_BOARD + h / 2;

const MotionContext = React.createContext(false);

/* ------------------------------------------------------------------------- */
/* Textures, drawn once on a canvas                                           */
/* ------------------------------------------------------------------------- */

const textures = new Map<string, THREE.CanvasTexture>();

const canvasTexture = (
  key: string,
  w: number,
  h: number,
  draw: (g: CanvasRenderingContext2D, w: number, h: number) => void,
  opts: { repeat?: [number, number]; linear?: boolean } = {}
) => {
  let t = textures.get(key);
  if (!t) {
    const c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    draw(c.getContext('2d')!, w, h);
    t = new THREE.CanvasTexture(c);
    t.colorSpace = opts.linear ? THREE.NoColorSpace : THREE.SRGBColorSpace;
    t.anisotropy = 4;
    if (opts.repeat) {
      t.wrapS = t.wrapT = THREE.RepeatWrapping;
      t.repeat.set(...opts.repeat);
    }
    textures.set(key, t);
  }
  return t;
};

const seeded = (seed: number) => () => (seed = (seed * 16807) % 2147483647) / 2147483647;

const pcbTexture = () =>
  canvasTexture('pcb', 512, 640, (g, w, h) => {
    const rnd = seeded(7);
    g.fillStyle = '#15181d';
    g.fillRect(0, 0, w, h);
    // Copper traces under the solder mask
    g.strokeStyle = 'rgba(92,104,120,0.28)';
    for (let i = 0; i < 260; i++) {
      const x = rnd() * w;
      const y = rnd() * h;
      const run = 20 + rnd() * 90;
      const diag = (rnd() - 0.5) * 30;
      g.lineWidth = rnd() < 0.8 ? 1 : 2;
      g.beginPath();
      g.moveTo(x, y);
      g.lineTo(x + run, y);
      g.lineTo(x + run + Math.abs(diag), y + diag);
      g.stroke();
    }
    // Silkscreen outlines and part numbers
    g.strokeStyle = 'rgba(215,220,230,0.32)';
    g.fillStyle = 'rgba(215,220,230,0.32)';
    g.font = '9px sans-serif';
    for (let i = 0; i < 40; i++) {
      const x = rnd() * w;
      const y = rnd() * h;
      g.strokeRect(x, y, 6 + rnd() * 14, 4 + rnd() * 8);
      if (i % 3 === 0) g.fillText(`${'CRLQU'[i % 5]}${Math.floor(rnd() * 900 + 100)}`, x, y - 2);
    }
  });

/** White sheet with round holes, for alpha maps and grille faces */
const perforation = (key: string, repeat: [number, number], hole = '#000', sheet = '#fff') =>
  canvasTexture(
    key,
    64,
    64,
    (g) => {
      g.fillStyle = sheet;
      g.fillRect(0, 0, 64, 64);
      g.fillStyle = hole;
      for (let row = 0; row < 4; row++)
        for (let col = 0; col < 4; col++)
          for (const ox of [-64, 0, 64])
            for (const oy of [-64, 0, 64]) {
              g.beginPath();
              g.arc(col * 16 + (row % 2) * 8 + ox, row * 16 + oy + 8, 5, 0, Math.PI * 2);
              g.fill();
            }
    },
    { repeat, linear: hole === '#000' }
  );

const stripes = (key: string, light: string, dark: string, repeat: [number, number], vertical = true) =>
  canvasTexture(
    key,
    16,
    16,
    (g) => {
      g.fillStyle = dark;
      g.fillRect(0, 0, 16, 16);
      g.fillStyle = light;
      if (vertical) g.fillRect(0, 0, 9, 16);
      else g.fillRect(0, 0, 16, 9);
    },
    { repeat }
  );

const labelTexture = (key: string, w: number, h: number, draw: (g: CanvasRenderingContext2D, w: number, h: number) => void) =>
  canvasTexture(key, w, h, draw);

const ihsTexture = () =>
  labelTexture('ihs', 256, 210, (g, w, h) => {
    const grad = g.createLinearGradient(0, 0, w, h);
    grad.addColorStop(0, '#d5dae0');
    grad.addColorStop(1, '#a9b0b9');
    g.fillStyle = grad;
    g.fillRect(0, 0, w, h);
    g.fillStyle = 'rgba(60,66,76,0.55)';
    g.font = 'bold 26px sans-serif';
    g.fillText('PROCESSOR', 24, 70);
    g.font = '16px monospace';
    g.fillText('X-SERIES  3.6 GHZ', 24, 104);
    g.fillText('L3 36MB  8C/16T', 24, 130);
    g.fillText('SRK2X  V42L', 24, 156);
    g.beginPath();
    g.moveTo(10, h - 10);
    g.lineTo(34, h - 10);
    g.lineTo(10, h - 34);
    g.fill();
  });

const ramTexture = (white: boolean) =>
  labelTexture(`ram-${white}`, 512, 96, (g, w, h) => {
    g.fillStyle = white ? '#e3e7eb' : '#1a1d22';
    g.fillRect(0, 0, w, h);
    g.strokeStyle = white ? 'rgba(120,128,140,0.5)' : 'rgba(140,150,165,0.35)';
    g.lineWidth = 3;
    for (let x = -60; x < w; x += 46) {
      g.beginPath();
      g.moveTo(x, h);
      g.lineTo(x + 40, 0);
      g.stroke();
    }
    g.fillStyle = white ? '#2a2f36' : '#e8ecf1';
    g.font = 'italic bold 30px sans-serif';
    g.fillText('DDR5', 30, 60);
    g.font = '16px sans-serif';
    g.fillText('6000 MT/s', 130, 58);
  });

const gpuEdgeTexture = () =>
  labelTexture('gpu-edge', 512, 96, (g, w, h) => {
    g.fillStyle = '#23272e';
    g.fillRect(0, 0, w, h);
    g.fillStyle = '#e9edf2';
    g.font = 'italic 900 44px sans-serif';
    g.fillText('GAMING', 24, 64);
    g.fillStyle = '#9aa3ae';
    g.font = 'bold 18px sans-serif';
    g.fillText('OC EDITION', 250, 62);
  });

const backplateTexture = () =>
  labelTexture('backplate', 512, 256, (g, w, h) => {
    g.fillStyle = '#3a3f47';
    g.fillRect(0, 0, w, h);
    g.strokeStyle = 'rgba(20,22,26,0.7)';
    g.lineWidth = 6;
    for (let x = 300; x < w - 20; x += 22) {
      g.beginPath();
      g.moveTo(x, 40);
      g.lineTo(x - 30, h - 40);
      g.stroke();
    }
    g.strokeStyle = 'rgba(200,206,214,0.35)';
    g.lineWidth = 2;
    g.strokeRect(14, 14, w - 28, h - 28);
    g.fillStyle = 'rgba(220,225,232,0.6)';
    g.font = 'italic 900 40px sans-serif';
    g.fillText('GAMING', 40, h / 2 + 14);
  });

const psuTexture = () =>
  labelTexture('psu', 512, 256, (g, w, h) => {
    g.fillStyle = '#1b1e23';
    g.fillRect(0, 0, w, h);
    g.fillStyle = '#e9edf2';
    g.font = '900 64px sans-serif';
    g.fillText('POWER', 40, 120);
    g.fillStyle = '#c9a54a';
    g.fillRect(40, 146, 150, 8);
    g.fillStyle = '#9aa3ae';
    g.font = 'bold 22px sans-serif';
    g.fillText('FULLY MODULAR  ·  GOLD', 40, 196);
  });

const psuBackTexture = () =>
  labelTexture('psu-back', 256, 160, (g, w, h) => {
    g.fillStyle = '#121418';
    g.fillRect(0, 0, w, h);
    g.fillStyle = '#05060a';
    for (let y = 14; y < h - 10; y += 12)
      for (let x = 14 + ((y / 12) % 2) * 6; x < 160; x += 12) {
        g.beginPath();
        g.arc(x, y, 4.5, 0, Math.PI * 2);
        g.fill();
      }
    g.fillStyle = '#2b2f36';
    g.fillRect(180, 40, 54, 40); // mains socket
    g.fillStyle = '#05060a';
    g.fillRect(190, 50, 34, 22);
    g.fillStyle = '#2b2f36';
    g.fillRect(190, 98, 34, 26); // switch
    g.fillStyle = '#8b1d1d';
    g.fillRect(196, 102, 22, 18);
  });

const ioTexture = () =>
  labelTexture('io', 96, 320, (g, w, h) => {
    g.fillStyle = '#b8bec6';
    g.fillRect(0, 0, w, h);
    const port = (x: number, y: number, pw: number, ph: number, c: string) => {
      g.fillStyle = '#1b1d21';
      g.fillRect(x - 2, y - 2, pw + 4, ph + 4);
      g.fillStyle = c;
      g.fillRect(x, y, pw, ph);
    };
    for (let i = 0; i < 4; i++) port(14, 20 + i * 30, 26, 12, i < 2 ? '#2a5bd7' : '#3a3f47');
    for (let i = 0; i < 4; i++) port(54, 20 + i * 30, 26, 12, '#d43a3a');
    port(20, 150, 56, 34, '#3a3f47'); // ethernet
    port(16, 200, 30, 14, '#3a3f47'); // HDMI
    port(54, 200, 26, 14, '#3a3f47'); // DP
    ['#3fb24f', '#e85fa4', '#3a8fd9'].forEach((c, i) => {
      g.fillStyle = c;
      g.beginPath();
      g.arc(24 + i * 24, 270, 8, 0, Math.PI * 2);
      g.fill();
    });
  });

const hddTexture = () =>
  labelTexture('hdd', 320, 220, (g, w, h) => {
    g.fillStyle = '#eef0f2';
    g.fillRect(0, 0, w, h);
    g.fillStyle = '#1f2a44';
    g.fillRect(0, 0, w, 44);
    g.fillStyle = '#fff';
    g.font = 'bold 24px sans-serif';
    g.fillText('4TB  HARD DRIVE', 16, 30);
    g.fillStyle = '#30353d';
    g.font = '14px sans-serif';
    g.fillText('SATA 6Gb/s  ·  7200 RPM  ·  256MB', 16, 74);
    g.fillText('S/N  ZL2K9A41   P/N  4T-7200', 16, 98);
    for (let x = 16; x < 220; x += 3) {
      const bw = (x * 7) % 5 === 0 ? 2 : 1;
      g.fillRect(x, 130, bw, 50);
    }
  });

const m2Texture = () =>
  labelTexture('m2', 320, 88, (g, w, h) => {
    g.fillStyle = '#121418';
    g.fillRect(0, 0, w, h);
    g.fillStyle = '#e9edf2';
    g.font = 'bold 26px sans-serif';
    g.fillText('NVMe SSD', 18, 40);
    g.fillStyle = '#8b95a1';
    g.font = '15px sans-serif';
    g.fillText('PCIe 4.0 x4  ·  1TB', 18, 68);
    g.fillStyle = '#3b82f6';
    g.fillRect(w - 60, 0, 6, h);
  });

/* ------------------------------------------------------------------------- */
/* Building blocks                                                            */
/* ------------------------------------------------------------------------- */

/**
 * Shows its children flying in from `from` (an offset) when `show` turns on, and
 * shrinking away when it turns off.
 */
const Appear: React.FC<{
  show: boolean;
  position?: V3;
  from?: V3;
  children: React.ReactNode;
}> = ({ show, position = [0, 0, 0], from = [0, 1.6, 0], children }) => {
  const reduce = React.useContext(MotionContext);
  const inner = useRef<THREE.Group>(null);
  const [mounted, setMounted] = useState(show);

  useEffect(() => {
    if (show) setMounted(true);
  }, [show]);

  useFrame((_, dt) => {
    const g = inner.current;
    if (!g) return;
    const k = reduce ? 1 : 1 - Math.exp(-dt * 6);
    const target = show ? 0 : 1;
    g.position.x += (from[0] * target - g.position.x) * k;
    g.position.y += (from[1] * target - g.position.y) * k;
    g.position.z += (from[2] * target - g.position.z) * k;
    const s = g.scale.x + ((show ? 1 : 0) - g.scale.x) * k;
    g.scale.setScalar(Math.max(s, 0.0001));
    if (!show && s < 0.02) setMounted(false);
  });

  if (!mounted) return null;
  return (
    <group position={position}>
      <group ref={inner} position={reduce ? [0, 0, 0] : from} scale={reduce ? 1 : 0.0001}>
        {children}
      </group>
    </group>
  );
};

interface BoxProps {
  s: V3;
  p?: V3;
  rot?: V3;
  c: string;
  metal?: number;
  rough?: number;
  /** Corner radius; rounded boxes read as moulded or folded parts */
  round?: number;
  map?: THREE.Texture;
}

const Box: React.FC<BoxProps> = ({ s, p, rot, c, metal = 0.2, rough = 0.6, round, map }) => {
  const material = <meshStandardMaterial color={c} metalness={metal} roughness={rough} map={map} />;
  const radius = round ? Math.min(round, Math.min(...s) / 2 - 0.0005) : 0;
  if (radius > 0.002) {
    return (
      <RoundedBox args={s} radius={radius} smoothness={3} position={p} rotation={rot}>
        {material}
      </RoundedBox>
    );
  }
  return (
    <mesh position={p} rotation={rot}>
      <boxGeometry args={s} />
      {material}
    </mesh>
  );
};

/** A flat printed surface (label, sticker, grille), facing +z unless rotated */
const Decal: React.FC<{ map: THREE.Texture; size: [number, number]; p: V3; rot?: V3; metal?: number; rough?: number }> = ({
  map,
  size,
  p,
  rot,
  metal = 0.1,
  rough = 0.55,
}) => (
  <mesh position={p} rotation={rot}>
    <planeGeometry args={size} />
    <meshStandardMaterial map={map} metalness={metal} roughness={rough} polygonOffset polygonOffsetFactor={-2} />
  </mesh>
);

const Glow: React.FC<{ rgb: string; size: V3; intensity?: number } & Omit<JSX.IntrinsicElements['mesh'], 'args'>> = ({
  rgb,
  size,
  intensity = 2,
  ...props
}) => (
  <mesh {...props}>
    <boxGeometry args={size} />
    <meshStandardMaterial color={rgb} emissive={rgb} emissiveIntensity={intensity} toneMapped={false} />
  </mesh>
);

/** Sleeved cable: several strands side by side along `spread`, following `points` */
const Cable: React.FC<{ points: V3[]; strands: number; spread: V3; gap?: number; color: string }> = ({
  points,
  strands,
  spread,
  gap = 0.026,
  color,
}) => {
  const geometries = useMemo(
    () =>
      Array.from({ length: strands }, (_, i) => {
        const o = (i - (strands - 1) / 2) * gap;
        const curve = new THREE.CatmullRomCurve3(
          points.map((p) => new THREE.Vector3(p[0] + spread[0] * o, p[1] + spread[1] * o, p[2] + spread[2] * o))
        );
        return new THREE.TubeGeometry(curve, 32, gap * 0.48, 8);
      }),
    // Points are derived from constants, so they only change with the part
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [JSON.stringify(points), strands, gap, JSON.stringify(spread)]
  );
  return (
    <group>
      {geometries.map((g, i) => (
        <mesh key={i} geometry={g}>
          <meshStandardMaterial color={color} roughness={0.85} />
        </mesh>
      ))}
    </group>
  );
};

/* ------------------------------------------------------------------------- */
/* Fans                                                                       */
/* ------------------------------------------------------------------------- */

const fanGeometries = new Map<string, { frame: THREE.BufferGeometry; blade: THREE.BufferGeometry; depth: number }>();

/** Frame with a round throat and screw holes, and one swept, pitched blade */
const fanGeometry = (r: number, round: boolean, depth: number) => {
  const key = `${r}-${round}-${depth}`;
  let g = fanGeometries.get(key);
  if (g) return g;

  const outline = new THREE.Shape();
  if (round) {
    outline.absarc(0, 0, r, 0, Math.PI * 2, false);
  } else {
    const c = r * 0.16;
    outline.moveTo(-r + c, -r);
    outline.lineTo(r - c, -r);
    outline.quadraticCurveTo(r, -r, r, -r + c);
    outline.lineTo(r, r - c);
    outline.quadraticCurveTo(r, r, r - c, r);
    outline.lineTo(-r + c, r);
    outline.quadraticCurveTo(-r, r, -r, r - c);
    outline.lineTo(-r, -r + c);
    outline.quadraticCurveTo(-r, -r, -r + c, -r);
    for (const [sx, sy] of [[1, 1], [-1, 1], [1, -1], [-1, -1]]) {
      const hole = new THREE.Path();
      hole.absarc(sx * r * 0.83, sy * r * 0.83, r * 0.05, 0, Math.PI * 2, true);
      outline.holes.push(hole);
    }
  }
  const throat = new THREE.Path();
  throat.absarc(0, 0, r * (round ? 0.9 : 0.95), 0, Math.PI * 2, true);
  outline.holes.push(throat);
  const frame = new THREE.ExtrudeGeometry(outline, { depth, bevelEnabled: false, curveSegments: 32 });
  frame.translate(0, 0, -depth / 2);

  // Blade outline in polar terms: swept forward from hub to tip
  const rh = r * 0.3;
  const rt = r * (round ? 0.86 : 0.91);
  const pts: THREE.Vector2[] = [];
  const polar = (rad: number, a: number) => new THREE.Vector2(rad * Math.cos(a), rad * Math.sin(a));
  for (let i = 0; i <= 8; i++) pts.push(polar(rh + (rt - rh) * (i / 8), 0.28 * (i / 8) ** 1.5));
  for (let i = 0; i <= 6; i++) pts.push(polar(rt, 0.28 + (0.6 * i) / 6));
  for (let i = 0; i <= 8; i++) pts.push(polar(rt - (rt - rh) * (i / 8), 0.42 + 0.46 * (1 - i / 8) ** 1.4));
  for (let i = 0; i <= 4; i++) pts.push(polar(rh, 0.42 * (1 - i / 4)));
  const blade = new THREE.ExtrudeGeometry(new THREE.Shape(pts), { depth: r * 0.025, bevelEnabled: false });
  blade.rotateZ(-0.45);
  blade.rotateX(0.42);
  blade.rotateZ(0.45);

  g = { frame, blade, depth };
  fanGeometries.set(key, g);
  return g;
};

/** Fan facing +z. `r` is half the frame size (60 mm ≈ 0.35). */
const Fan: React.FC<
  {
    r: number;
    rgb: string;
    speed?: number;
    frame?: string;
    /** ARGB fan: lit ring and translucent blades */
    lit?: boolean;
    round?: boolean;
    depth?: number;
  } & JSX.IntrinsicElements['group']
> = ({ r, rgb, speed = 5, frame = '#141619', lit = true, round = false, depth, ...props }) => {
  const reduce = React.useContext(MotionContext);
  const blades = useRef<THREE.Group>(null);
  const geo = fanGeometry(r, round, depth ?? r * 0.42);
  const d = geo.depth;
  useFrame((_, dt) => {
    if (blades.current && !reduce) blades.current.rotation.z -= dt * speed;
  });

  return (
    <group {...props}>
      <mesh geometry={geo.frame}>
        <meshStandardMaterial color={frame} roughness={0.55} metalness={0.1} />
      </mesh>
      {lit &&
        [d / 2 + 0.002, -d / 2 - 0.002].map((z) => (
          <mesh key={z} position={[0, 0, z]}>
            <torusGeometry args={[r * 0.95, r * 0.03, 8, 64]} />
            <meshStandardMaterial color={rgb} emissive={rgb} emissiveIntensity={2.2} toneMapped={false} />
          </mesh>
        ))}
      {/* Motor hub and its four support arms at the back */}
      <mesh position={[0, 0, -d / 2 + d * 0.15]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[r * 0.3, r * 0.3, d * 0.3, 28]} />
        <meshStandardMaterial color={frame} roughness={0.6} />
      </mesh>
      {[0, 1, 2, 3].map((i) => (
        <mesh key={i} position={[0, 0, -d / 2 + d * 0.08]} rotation={[0, 0, Math.PI / 4 + (i * Math.PI) / 2]}>
          <boxGeometry args={[r * (round ? 1.75 : 2.3), r * 0.05, d * 0.16]} />
          <meshStandardMaterial color={frame} roughness={0.6} />
        </mesh>
      ))}
      <group ref={blades}>
        <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, d * 0.05]}>
          <cylinderGeometry args={[r * 0.29, r * 0.29, d * 0.55, 32]} />
          <meshStandardMaterial
            color={lit ? '#e7eaee' : '#1c1f24'}
            emissive={lit ? rgb : '#000'}
            emissiveIntensity={lit ? 0.5 : 0}
            roughness={0.4}
          />
        </mesh>
        {Array.from({ length: 9 }, (_, i) => (
          <mesh key={i} geometry={geo.blade} rotation={[0, 0, (i / 9) * Math.PI * 2]}>
            {lit ? (
              <meshStandardMaterial
                color="#e7eaee"
                emissive={rgb}
                emissiveIntensity={0.55}
                transparent
                opacity={0.6}
                roughness={0.35}
              />
            ) : (
              <meshStandardMaterial color="#1c1f24" roughness={0.5} />
            )}
          </mesh>
        ))}
      </group>
    </group>
  );
};

/* ------------------------------------------------------------------------- */
/* Case                                                                       */
/* ------------------------------------------------------------------------- */

const Cabinet: React.FC<{ style: CaseStyle; color: CaseColor; rgb: string }> = ({ style, color, rgb }) => {
  const white = color === 'white';
  const shell = white ? '#E9ECEF' : '#17191D';
  const inner = white ? '#DCE0E5' : '#0F1114';
  const trim = white ? '#C5CBD2' : '#0A0B0D';
  const fanFrame = white ? '#E3E6EA' : '#141619';
  const rubber = '#0b0c0e';
  const shroudLen = REAR + 0.98;
  const shroudX = (REAR - 0.98) / 2;
  const shroudMidY = (SHROUD_TOP + FLOOR) / 2;
  const shroudH = SHROUD_TOP - FLOOR;

  return (
    <group>
      {/* Motherboard tray, top, bottom and rear wall */}
      <Box s={[W, H, T]} p={[0, 0, -D / 2]} c={inner} rough={0.8} />
      <Box s={[W + T, T, D + T]} p={[0, H / 2, 0]} c={shell} metal={0.35} rough={0.45} round={0.02} />
      <Box s={[W + T, T, D + T]} p={[0, -H / 2, 0]} c={shell} metal={0.35} rough={0.45} round={0.02} />
      <Box s={[T, H, D]} p={[W / 2, 0, 0]} c={shell} metal={0.35} rough={0.5} />

      {/* Front panel */}
      {style === 'airflow' ? (
        <group>
          <Box s={[0.06, 0.14, D + T]} p={[-W / 2 - 0.02, H / 2 - 0.07, 0]} c={shell} round={0.02} />
          <Box s={[0.06, 0.14, D + T]} p={[-W / 2 - 0.02, -H / 2 + 0.07, 0]} c={shell} round={0.02} />
          {[-1, 1].map((s) => (
            <Box key={s} s={[0.06, H - 0.2, 0.08]} p={[-W / 2 - 0.02, 0, s * (D / 2 - 0.015)]} c={shell} round={0.02} />
          ))}
          <mesh position={[-W / 2 - 0.035, 0, 0]} rotation={[0, -Math.PI / 2, 0]}>
            <planeGeometry args={[D - 0.12, H - 0.26]} />
            <meshStandardMaterial
              color={trim}
              alphaMap={perforation('perf-front', [D * 11, H * 11])}
              transparent
              alphaTest={0.5}
              side={THREE.DoubleSide}
              metalness={0.4}
              roughness={0.6}
            />
          </mesh>
        </group>
      ) : (
        <group>
          <Box s={[0.07, H + T, D + T]} p={[-W / 2 - 0.025, 0, 0]} c={shell} metal={0.35} rough={0.4} round={0.03} />
          {/* Intake slots down both edges and a light strip */}
          {[-1, 1].map((s) => (
            <Box key={s} s={[0.01, H - 0.3, 0.025]} p={[-W / 2 - 0.058, 0, s * (D / 2 - 0.02)]} c={rubber} />
          ))}
          <Glow rgb={rgb} size={[0.012, H - 0.5, 0.02]} position={[-W / 2 - 0.062, 0, 0.32]} />
        </group>
      )}

      {/* Front I/O on the top edge: power button, USB, audio */}
      <group position={[-W / 2 + 0.16, H / 2 + T / 2, 0]}>
        <mesh position={[0, 0.006, -0.32]}>
          <cylinderGeometry args={[0.045, 0.045, 0.012, 32]} />
          <meshStandardMaterial color={trim} metalness={0.6} roughness={0.3} />
        </mesh>
        <mesh position={[0, 0.013, -0.32]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.047, 0.006, 8, 32]} />
          <meshStandardMaterial color={rgb} emissive={rgb} emissiveIntensity={2} toneMapped={false} />
        </mesh>
        {[-0.16, -0.04].map((z) => (
          <Box key={z} s={[0.04, 0.006, 0.09]} p={[0, 0.002, z]} c={rubber} />
        ))}
        <Box s={[0.022, 0.006, 0.05]} p={[0, 0.002, 0.06]} c={rubber} />
        <mesh position={[0, 0.003, 0.14]}>
          <cylinderGeometry args={[0.016, 0.016, 0.006, 16]} />
          <meshStandardMaterial color={rubber} />
        </mesh>
      </group>
      {/* Magnetic dust filter over the top vents */}
      <mesh position={[0.1, H / 2 + T / 2 + 0.002, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[1.85, 0.9]} />
        <meshStandardMaterial map={perforation(`perf-top-${color}`, [18, 9], white ? '#9aa1aa' : '#050608', shell)} roughness={0.7} />
      </mesh>

      {/* Rear: I/O shield, exhaust grille, expansion slot covers */}
      <Decal map={ioTexture()} size={[0.26, 0.86]} p={[W / 2 + T / 2 + 0.002, 0.71, -0.43]} rot={[0, Math.PI / 2, 0]} metal={0.6} rough={0.35} />
      <mesh position={[W / 2 + T / 2 + 0.002, 0.6, 0.13]} rotation={[0, Math.PI / 2, 0]}>
        <circleGeometry args={[0.33, 48]} />
        <meshStandardMaterial map={perforation(`perf-rear-${color}`, [7, 7], '#050608', shell)} roughness={0.7} />
      </mesh>
      {Array.from({ length: 7 }, (_, i) => (
        <Box key={i} s={[0.01, 0.09, 0.66]} p={[W / 2 + T / 2 + 0.006, PCIE_Y + 0.05 - i * 0.119, -0.12]} c={shell} metal={0.6} rough={0.4} />
      ))}

      {/* Rubber grommets for cables, beside the board and above it */}
      {[0.86, 0.46, -0.2].map((y) => (
        <group key={y} position={[-0.53, y, TRAY_Z + 0.006]}>
          <Box s={[0.075, 0.34, 0.012]} c={rubber} round={0.005} />
          <Box s={[0.012, 0.29, 0.004]} p={[0, 0, 0.007]} c="#000" />
        </group>
      ))}
      <Box s={[0.32, 0.07, 0.012]} p={[BX + 0.25, H / 2 - 0.12, TRAY_Z + 0.006]} c={rubber} round={0.005} />

      {/* PSU shroud with vents, a cable cut-out and a window onto the power supply */}
      <Box s={[shroudLen, 0.02, D - 0.05]} p={[shroudX, SHROUD_TOP, 0]} c={shell} metal={0.3} rough={0.5} />
      <Box s={[0.02, shroudH, D - 0.05]} p={[-0.98, shroudMidY, 0]} c={shell} metal={0.3} rough={0.5} />
      {(() => {
        const z = D / 2 - 0.035;
        const [wx0, wx1, wy0, wy1] = [0.33, 1.08, -1.27, -0.95];
        return (
          <group>
            <Box s={[wx0 + 0.98, shroudH, 0.02]} p={[(wx0 - 0.98) / 2, shroudMidY, z]} c={shell} metal={0.3} rough={0.5} />
            <Box s={[REAR - wx1, shroudH, 0.02]} p={[(REAR + wx1) / 2, shroudMidY, z]} c={shell} metal={0.3} rough={0.5} />
            <Box s={[wx1 - wx0, SHROUD_TOP - wy1, 0.02]} p={[(wx0 + wx1) / 2, (SHROUD_TOP + wy1) / 2, z]} c={shell} metal={0.3} rough={0.5} />
            <Box s={[wx1 - wx0, wy0 - FLOOR, 0.02]} p={[(wx0 + wx1) / 2, (wy0 + FLOOR) / 2, z]} c={shell} metal={0.3} rough={0.5} />
            {Array.from({ length: 6 }, (_, i) => (
              <Box key={i} s={[0.55, 0.018, 0.004]} p={[-0.5, -0.97 - i * 0.055, z + 0.011]} c={trim} />
            ))}
          </group>
        );
      })()}
      <Box s={[0.24, 0.006, 0.09]} p={[0.6, SHROUD_TOP + 0.012, 0.3]} c={rubber} round={0.003} />

      {/* Tempered glass side, with its black printed border and thumbscrews */}
      <mesh position={[0, 0, D / 2]}>
        <boxGeometry args={[W, H, 0.02]} />
        <meshPhysicalMaterial
          color="#c9d6e3"
          transparent
          opacity={0.12}
          roughness={0.03}
          metalness={0}
          clearcoat={1}
          envMapIntensity={2.2}
          depthWrite={false}
        />
      </mesh>
      {[
        { p: [0, H / 2 - 0.04, D / 2 - 0.012], s: [W, 0.08, 0.004] },
        { p: [0, -H / 2 + 0.04, D / 2 - 0.012], s: [W, 0.08, 0.004] },
        { p: [W / 2 - 0.04, 0, D / 2 - 0.012], s: [0.08, H, 0.004] },
        { p: [-W / 2 + 0.04, 0, D / 2 - 0.012], s: [0.08, H, 0.004] },
      ].map((edge, i) => (
        <Box key={i} p={edge.p as V3} s={edge.s as V3} c="#08090b" rough={0.3} />
      ))}
      {[
        [-W / 2 + 0.07, H / 2 - 0.07],
        [W / 2 - 0.07, H / 2 - 0.07],
        [-W / 2 + 0.07, -H / 2 + 0.07],
        [W / 2 - 0.07, -H / 2 + 0.07],
      ].map(([x, y]) => (
        <mesh key={`${x}${y}`} position={[x, y, D / 2 + 0.02]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.03, 0.03, 0.025, 20]} />
          <meshStandardMaterial color={white ? '#d9dde2' : '#1d2025'} metalness={0.7} roughness={0.3} />
        </mesh>
      ))}

      {/* Feet */}
      {[-0.95, 0.95].flatMap((x) =>
        [-0.42, 0.42].map((z) => <Box key={`${x}${z}`} s={[0.24, 0.08, 0.2]} p={[x, -H / 2 - 0.06, z]} c={rubber} round={0.025} />)
      )}

      {/* Three 120 mm intakes behind the front panel, one exhaust at the back */}
      {[0.66, -0.06, -0.78].map((y) => (
        <Fan key={y} r={0.35} rgb={rgb} frame={fanFrame} position={[-W / 2 + 0.11, y, 0]} rotation={[0, Math.PI / 2, 0]} />
      ))}
      <Fan r={0.35} rgb={rgb} frame={fanFrame} position={[REAR - 0.075, 0.6, 0.13]} rotation={[0, Math.PI / 2, 0]} />
    </group>
  );
};

/* ------------------------------------------------------------------------- */
/* Motherboard                                                                */
/* ------------------------------------------------------------------------- */

const Motherboard: React.FC<{ rgb: string }> = ({ rgb }) => {
  const heatsink = '#3b4149';
  const black = '#0c0d10';
  const silver = '#b9bfc7';
  const grooves = stripes('grooves', '#4a515a', '#2b3037', [1, 7], false);

  return (
    <group>
      <Box s={[BW, BH, 0.03]} p={b(0, 0, BOARD_Z)} c="#ffffff" map={pcbTexture()} rough={0.75} />

      {/* Screws into the standoffs */}
      {[
        [-0.66, 0.83],
        [-0.08, 0.85],
        [-0.62, -0.12],
        [-0.66, -0.84],
        [0.1, -0.84],
        [0.66, -0.84],
      ].map(([x, y]) => (
        <mesh key={`${x}${y}`} position={b(x, y, ON_BOARD + 0.006)} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.022, 0.022, 0.012, 16]} />
          <meshStandardMaterial color={silver} metalness={0.9} roughness={0.3} />
        </mesh>
      ))}

      {/* Socket: pins, steel load plate and retention lever */}
      <Box s={[0.4, 0.4, 0.02]} p={[SOCKET[0], SOCKET[1], zOn(0.02)]} c="#1a1c20" />
      <Box s={[0.27, 0.23, 0.004]} p={[SOCKET[0], SOCKET[1], ON_BOARD + 0.022]} c="#8a6b3a" metal={0.8} rough={0.4} />
      {[
        { p: [0, 0.135], s: [0.33, 0.03] },
        { p: [0, -0.135], s: [0.33, 0.03] },
        { p: [0.15, 0], s: [0.03, 0.3] },
        { p: [-0.15, 0], s: [0.03, 0.3] },
      ].map((f, i) => (
        <Box key={i} s={[f.s[0], f.s[1], 0.008]} p={[SOCKET[0] + f.p[0], SOCKET[1] + f.p[1], ON_BOARD + 0.026]} c={silver} metal={0.9} rough={0.3} />
      ))}
      <Box s={[0.012, 0.38, 0.012]} p={[SOCKET[0] + 0.205, SOCKET[1], ON_BOARD + 0.03]} c={silver} metal={0.9} rough={0.3} />

      {/* Power delivery heatsinks around the socket, and the rear I/O cover */}
      <Box s={[0.6, 0.13, 0.11]} p={b(0.2, 0.74, zOn(0.11))} c="#ffffff" map={grooves} metal={0.7} rough={0.35} round={0.012} />
      <Box s={[0.13, 0.48, 0.11]} p={b(0.44, 0.4, zOn(0.11))} c="#ffffff" map={grooves} metal={0.7} rough={0.35} round={0.012} />
      <Box s={[0.15, 0.68, 0.19]} p={b(0.63, 0.53, zOn(0.19))} c="#262a31" metal={0.6} rough={0.35} round={0.02} />
      <Glow rgb={rgb} size={[0.012, 0.5, 0.006]} position={b(0.575, 0.55, ON_BOARD + 0.192)} />
      <Box s={[0.58, 0.012, 0.004]} p={b(0.2, 0.675, ON_BOARD + 0.112)} c={silver} metal={0.95} rough={0.2} />

      {/* CPU power (EPS) and main 24-pin power connectors */}
      <Box s={[0.11, 0.05, 0.06]} p={b(0.25, 0.85, zOn(0.06))} c={black} />
      <Box s={[0.06, 0.3, 0.06]} p={b(-0.665, 0.2, zOn(0.06))} c={black} />

      {/* Four DIMM slots in front of the socket */}
      {[-0.22, -0.28, -0.34, -0.4].map((x) => (
        <group key={x}>
          <Box s={[0.03, 0.8, 0.04]} p={b(x, 0.4, zOn(0.04))} c={black} />
          {[-0.02, 0.82].map((y) => (
            <Box key={y} s={[0.034, 0.035, 0.05]} p={b(x, y, zOn(0.05))} c="#8f969f" />
          ))}
        </group>
      ))}

      {/* M.2 slot, PCIe slots with steel armour, chipset heatsink */}
      <Box s={[0.03, 0.08, 0.02]} p={b(0.335, 0.07, zOn(0.02))} c={black} />
      {[-0.08, -0.48].map((y) => (
        <Box key={y} s={[0.52, 0.035, 0.035]} p={b(0.29, y, zOn(0.035))} c={silver} metal={0.9} rough={0.25} />
      ))}
      <Box s={[0.15, 0.03, 0.03]} p={b(0.48, -0.28, zOn(0.03))} c={black} />
      <Box s={[0.5, 0.11, 0.025]} p={b(0.05, -0.68, zOn(0.025))} c={heatsink} metal={0.8} rough={0.3} round={0.008} />
      <Box s={[0.34, 0.3, 0.05]} p={b(-0.42, -0.58, zOn(0.05))} c="#262a31" metal={0.6} rough={0.3} round={0.015} />
      <Glow rgb={rgb} size={[0.28, 0.01, 0.004]} position={b(-0.42, -0.5, ON_BOARD + 0.052)} />
      <mesh position={b(-0.12, -0.33, ON_BOARD + 0.006)} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.05, 0.05, 0.012, 24]} />
        <meshStandardMaterial color={silver} metalness={0.95} roughness={0.25} />
      </mesh>

      {/* SATA ports on the front edge, headers along the bottom, audio capacitors */}
      {[-0.36, -0.43, -0.52, -0.59].map((y) => (
        <Box key={y} s={[0.05, 0.035, 0.05]} p={b(-0.68, y, zOn(0.05))} c={black} />
      ))}
      {[-0.3, 0.0, 0.3].map((x) => (
        <Box key={x} s={[0.12, 0.03, 0.04]} p={b(x, -0.86, zOn(0.04))} c={black} />
      ))}
      {[
        [0.5, -0.62],
        [0.58, -0.62],
        [0.5, -0.72],
        [0.58, -0.72],
        [0.66, -0.67],
      ].map(([x, y]) => (
        <mesh key={`${x}${y}`} position={b(x, y, ON_BOARD + 0.022)} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.02, 0.02, 0.044, 16]} />
          <meshStandardMaterial color="#c9a54a" metalness={0.7} roughness={0.35} />
        </mesh>
      ))}
      {[
        [-0.5, 0.86, 0.08],
        [0.05, -0.2, 0.06],
        [-0.15, -0.88, 0.05],
      ].map(([x, y, s]) => (
        <Box key={`${x}${y}`} s={[s, s, 0.006]} p={b(x, y, ON_BOARD + 0.003)} c="#202328" />
      ))}
    </group>
  );
};

/* ------------------------------------------------------------------------- */
/* Parts                                                                      */
/* ------------------------------------------------------------------------- */

const Cpu: React.FC = () => (
  <group>
    <Box s={[0.27, 0.23, 0.012]} p={[0, 0, 0.006]} c="#2e5a3c" rough={0.5} />
    <Box s={[0.24, 0.2, 0.02]} p={[0, 0, 0.022]} c="#c4cad1" metal={0.85} rough={0.3} round={0.006} />
    <Decal map={ihsTexture()} size={[0.23, 0.19]} p={[0, 0, 0.0325]} metal={0.8} rough={0.3} />
  </group>
);

const Cooler: React.FC<{ type: CoolerId; rgb: string; dark: boolean }> = ({ type, rgb, dark }) => {
  const aluminium = '#c3c8ce';
  const copper = '#c47a45';

  if (type === 'stock') {
    // Round aluminium heatsink with a copper core and a plain fan on top
    return (
      <group position={[SOCKET[0], SOCKET[1], ON_BOARD]}>
        <mesh position={[0, 0, 0.08]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.07, 0.07, 0.11, 24]} />
          <meshStandardMaterial color={copper} metalness={0.9} roughness={0.3} />
        </mesh>
        {Array.from({ length: 30 }, (_, i) => {
          const a = (i / 30) * Math.PI * 2;
          return (
            <Box
              key={i}
              s={[0.13, 0.007, 0.1]}
              p={[Math.cos(a) * 0.14, Math.sin(a) * 0.14, 0.08]}
              rot={[0, 0, a + 0.3]}
              c={aluminium}
              metal={0.85}
              rough={0.3}
            />
          );
        })}
        <Fan r={0.22} rgb={rgb} lit={false} round speed={7} depth={0.06} frame="#16181c" position={[0, 0, 0.165]} />
      </group>
    );
  }

  if (type === 'air') {
    // Tower: four copper heatpipes rising into a fin stack, fan on the front face
    const fins = 36;
    return (
      <group position={[SOCKET[0], SOCKET[1], ON_BOARD]}>
        <Box s={[0.2, 0.22, 0.05]} p={[0, 0, 0.055]} c="#cfd4da" metal={0.95} rough={0.2} round={0.008} />
        {[-0.075, -0.025, 0.025, 0.075].map((x) => (
          <Cable
            key={x}
            strands={1}
            gap={0.026}
            spread={[0, 0, 0]}
            color={copper}
            points={[
              [x, -0.3, 0.88],
              [x, -0.3, 0.3],
              [x, -0.2, 0.1],
              [x, 0, 0.06],
              [x, 0.2, 0.1],
              [x, 0.3, 0.3],
              [x, 0.3, 0.88],
            ]}
          />
        ))}
        {Array.from({ length: fins }, (_, i) => (
          <Box key={i} s={[0.3, 0.72, 0.004]} p={[0, 0, 0.27 + i * 0.016]} c={aluminium} metal={0.85} rough={0.28} />
        ))}
        <Box s={[0.32, 0.74, 0.03]} p={[0, 0, 0.865]} c={dark ? '#1b1e23' : '#e4e7eb'} metal={0.6} rough={0.3} round={0.01} />
        {[-0.3, 0.3].map((y) => (
          <Glow key={y} rgb={rgb} size={[0.3, 0.012, 0.004]} position={[0, y, 0.882]} />
        ))}
        <Fan r={0.35} rgb={rgb} speed={6} frame={dark ? '#141619' : '#e3e6ea'} position={[-0.23, 0, 0.55]} rotation={[0, Math.PI / 2, 0]} />
      </group>
    );
  }

  // Liquid cooler: pump block on the CPU, radiator and fans under the roof, two sleeved tubes
  const fans = type === 'aio360' ? 3 : 2;
  const radLength = fans * 0.71 + 0.08;
  const radX = REAR - 0.075 - radLength / 2;
  const radY = H / 2 - T / 2 - 0.09;
  const radZ = 0.15;
  const tubeEndX = radX + radLength / 2 - 0.03;
  return (
    <group>
      <group position={[SOCKET[0], SOCKET[1], ON_BOARD]}>
        <Box s={[0.34, 0.34, 0.12]} p={[0, 0, 0.08]} c="#15171b" metal={0.5} rough={0.35} round={0.05} />
        <mesh position={[0, 0, 0.142]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.135, 0.135, 0.008, 48]} />
          <meshStandardMaterial color="#07080a" metalness={0.3} roughness={0.08} />
        </mesh>
        <mesh position={[0, 0, 0.148]}>
          <torusGeometry args={[0.115, 0.01, 10, 64]} />
          <meshStandardMaterial color={rgb} emissive={rgb} emissiveIntensity={2.4} toneMapped={false} />
        </mesh>
        <mesh position={[0, 0, 0.147]}>
          <torusGeometry args={[0.07, 0.006, 10, 48]} />
          <meshStandardMaterial color={rgb} emissive={rgb} emissiveIntensity={1.2} toneMapped={false} />
        </mesh>
        {[-0.07, 0.07].map((y) => (
          <mesh key={y} position={[0.17, y, 0.1]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.03, 0.03, 0.06, 20]} />
            <meshStandardMaterial color="#2a2e35" metalness={0.8} roughness={0.3} />
          </mesh>
        ))}
      </group>
      {[-1, 1].map((s) => (
        <Cable
          key={s}
          strands={1}
          gap={0.056}
          spread={[0, 0, 0]}
          color="#121418"
          points={[
            [SOCKET[0] + 0.2, SOCKET[1] + 0.07 * s, ON_BOARD + 0.1],
            [SOCKET[0] + 0.38, SOCKET[1] + 0.18 + 0.03 * s, -0.25],
            [tubeEndX - 0.06, radY - 0.32, 0.02 + 0.05 * s],
            [tubeEndX, radY - 0.1, radZ + 0.08 * s],
          ]}
        />
      ))}
      {/* Radiator: fin core between two end tanks */}
      <Box s={[radLength - 0.12, 0.15, 0.7]} p={[radX, radY, radZ]} c="#ffffff" map={stripes(`rad-${fans}`, '#3a3f46', '#15171a', [fans * 40, 1])} metal={0.6} rough={0.5} />
      {[-1, 1].map((s) => (
        <Box key={s} s={[0.06, 0.17, 0.72]} p={[radX + s * (radLength / 2 - 0.03), radY, radZ]} c="#121418" metal={0.4} rough={0.4} round={0.01} />
      ))}
      {Array.from({ length: fans }, (_, i) => (
        <Fan
          key={i}
          r={0.35}
          rgb={rgb}
          frame={dark ? '#141619' : '#e3e6ea'}
          position={[radX - ((fans - 1) * 0.71) / 2 + i * 0.71, radY - 0.075 - 0.074, radZ]}
          rotation={[Math.PI / 2, 0, 0]}
        />
      ))}
    </group>
  );
};

const Ram: React.FC<{ rgb: string; dark: boolean }> = ({ rgb, dark }) => {
  const side = ramTexture(!dark);
  return (
    <group>
      {[-0.28, -0.4].map((x) => (
        <group key={x} position={b(x, 0.4, ON_BOARD + 0.02)}>
          <Box s={[0.03, 0.78, 0.18]} p={[0, 0, 0.1]} c={dark ? '#1b1e23' : '#e3e7eb'} metal={0.5} rough={0.35} round={0.006} />
          {[-1, 1].map((s) => (
            <group key={s} position={[s * 0.0155, 0, 0.1]} rotation={[0, (s * Math.PI) / 2, 0]}>
              <mesh rotation={[0, 0, Math.PI / 2]}>
                <planeGeometry args={[0.76, 0.16]} />
                <meshStandardMaterial map={side} metalness={0.5} roughness={0.4} polygonOffset polygonOffsetFactor={-2} />
              </mesh>
            </group>
          ))}
          {/* Diffused light bar along the top */}
          <mesh position={[0, 0, 0.215]}>
            <boxGeometry args={[0.028, 0.76, 0.05]} />
            <meshStandardMaterial color={rgb} emissive={rgb} emissiveIntensity={0.9} roughness={0.6} />
          </mesh>
        </group>
      ))}
    </group>
  );
};

/** x position of the GPU power connector (towards the bracket end, clear of the logo) */
const gpuPlugX = (fans: 2 | 3) => REAR - 0.03 - 0.35 * (fans === 3 ? 1.75 : 1.4);

/** Graphics card in the top x16 slot: backplate up, fans down, lit edge facing the glass */
const Gpu: React.FC<{ fans: 2 | 3; rgb: string }> = ({ fans, rgb }) => {
  const L = fans === 3 ? 1.75 : 1.4;
  const tk = fans === 3 ? 0.33 : 0.25;
  const cx = REAR - 0.03 - L / 2;
  const depth = 0.73;
  const cz = ON_BOARD + 0.02 + depth / 2;
  const front = cz + depth / 2;
  const r = fans === 3 ? 0.27 : 0.3;

  return (
    <group>
      <Box s={[L, 0.014, depth]} p={[cx, PCIE_Y + 0.016, cz]} c="#3a3f47" metal={0.8} rough={0.35} />
      <Decal map={backplateTexture()} size={[L - 0.02, depth - 0.02]} p={[cx, PCIE_Y + 0.0235, cz]} rot={[-Math.PI / 2, 0, 0]} metal={0.75} rough={0.35} />
      <Box s={[L - 0.04, 0.012, depth - 0.03]} p={[cx, PCIE_Y + 0.003, cz]} c="#16261b" />
      {/* Cooler shroud with an angled accent plate */}
      <Box s={[L, tk - 0.05, depth]} p={[cx, PCIE_Y - (tk - 0.05) / 2 - 0.004, cz]} c="#262a31" metal={0.55} rough={0.4} round={0.02} />
      <Box s={[L * 0.2, 0.03, 0.012]} p={[cx + L * 0.33, PCIE_Y - tk * 0.55, front + 0.004]} rot={[0, 0, -0.12]} c="#8b939d" metal={0.9} rough={0.25} />
      <Decal map={gpuEdgeTexture()} size={[L * 0.42, (L * 0.42 * 96) / 512]} p={[cx - L * 0.2, PCIE_Y - tk * 0.4, front + 0.002]} />
      <Glow rgb={rgb} size={[L - 0.08, 0.012, 0.006]} position={[cx, PCIE_Y - 0.02, front + 0.002]} />
      {/* Fin stack visible at the open front end */}
      <Decal map={stripes('gpu-fins', '#9aa1aa', '#1a1d21', [1, 22], false)} size={[depth - 0.06, tk - 0.08]} p={[cx - L / 2 - 0.001, PCIE_Y - tk / 2, cz]} rot={[0, -Math.PI / 2, 0]} metal={0.7} rough={0.4} />
      {Array.from({ length: fans }, (_, i) => (
        <Fan
          key={i}
          r={r}
          rgb={rgb}
          lit={false}
          round
          depth={0.05}
          speed={6}
          frame="#1a1c20"
          position={[cx - L / 2 + (L / fans) * (i + 0.5), PCIE_Y - tk + 0.02, cz]}
          rotation={[Math.PI / 2, 0, 0]}
        />
      ))}
      {/* Power connector on the top edge, and the steel bracket at the back */}
      <Box s={[0.12, 0.045, 0.03]} p={[gpuPlugX(fans), PCIE_Y - 0.045, front + 0.015]} c="#0c0d10" />
      <Box s={[0.012, tk + 0.04, 0.78]} p={[REAR - 0.012, PCIE_Y - tk / 2 + 0.01, cz - 0.02]} c="#c2c7ce" metal={0.9} rough={0.25} />
    </group>
  );
};


const Storage: React.FC<{ type: 'm2' | 'hdd' }> = ({ type }) =>
  type === 'm2' ? (
    <group position={b(0.08, 0.07, ON_BOARD + 0.008)}>
      <Box s={[0.47, 0.13, 0.008]} c="#141a16" />
      {[-0.15, -0.02, 0.11].map((x) => (
        <Box key={x} s={[0.1, 0.09, 0.008]} p={[x, 0, 0.008]} c="#22262c" />
      ))}
      <Decal map={m2Texture()} size={[0.44, 0.12]} p={[0, 0, 0.0125]} />
    </group>
  ) : (
    // 3.5" drive on a sled on top of the shroud
    <group position={[-0.5, SHROUD_TOP + 0.01, 0.12]}>
      <Box s={[0.92, 0.02, 0.64]} p={[0, 0.01, 0]} c="#0b0c0e" round={0.006} />
      <Box s={[0.86, 0.15, 0.59]} p={[0, 0.095, 0]} c="#9aa1aa" metal={0.75} rough={0.4} round={0.01} />
      <Decal map={hddTexture()} size={[0.62, 0.42]} p={[0.05, 0.171, 0]} rot={[-Math.PI / 2, 0, 0]} rough={0.6} />
    </group>
  );

const Psu: React.FC = () => {
  const cx = REAR - 0.475;
  const cy = FLOOR + 0.26;
  // Pushed up against the shroud's front so its label fills the window
  const cz = D / 2 - 0.1 - 0.44;
  return (
    <group>
      <Box s={[0.93, 0.5, 0.88]} p={[cx, cy, cz]} c="#1a1c20" metal={0.5} rough={0.4} round={0.015} />
      <Decal map={psuTexture()} size={[0.62, 0.28]} p={[cx + 0.02, -1.11, cz + 0.441]} metal={0.4} rough={0.45} />
      <Decal map={psuBackTexture()} size={[0.86, 0.48]} p={[W / 2 + T / 2 + 0.003, cy, cz]} rot={[0, Math.PI / 2, 0]} />
    </group>
  );
};

/* ------------------------------------------------------------------------- */

const Rig: React.FC<{ parts: SceneParts }> = ({ parts }) => {
  const { rgb } = parts;
  const dark = parts.color === 'black';
  const sleeve = dark ? '#121418' : '#e4e7eb';
  // The compact case is drawn at a smaller scale
  const scale = parts.caseStyle === 'compact' ? 0.9 : 1;
  const board = parts.cpu || parts.ram || !!parts.gpu || parts.storage === 'm2' || !!parts.cooler;

  return (
    <group scale={scale} position={[0, 0.1, 0]}>
      <Cabinet style={parts.caseStyle} color={parts.color} rgb={rgb} />
      <Appear show={board} from={[0, 0, 1.8]}>
        <Motherboard rgb={rgb} />
      </Appear>
      <Appear show={parts.cpu} position={[SOCKET[0], SOCKET[1], ON_BOARD + 0.02]} from={[0, 0, 1.4]}>
        <Cpu />
      </Appear>
      {(['stock', 'air', 'aio240', 'aio360'] as CoolerId[]).map((type) => (
        <Appear key={type} show={parts.cooler === type} from={[0, 1.8, 0.6]}>
          <Cooler type={type} rgb={rgb} dark={dark} />
        </Appear>
      ))}
      <Appear show={parts.ram} from={[0, 1.4, 0.4]}>
        <Ram rgb={rgb} dark={dark} />
      </Appear>
      {([2, 3] as const).map((fans) => (
        <Appear key={fans} show={parts.gpu?.fans === fans} from={[0, 0, 1.6]}>
          <Gpu fans={fans} rgb={rgb} />
        </Appear>
      ))}
      <Appear show={parts.storage === 'm2'} from={[0, 0, 1.2]}>
        <Storage type="m2" />
      </Appear>
      <Appear show={parts.storage === 'hdd'} from={[0, 0, 1.4]}>
        <Storage type="hdd" />
      </Appear>
      <Appear show={parts.psu} from={[1.6, 0, 0]}>
        <Psu />
      </Appear>

      {/* Power cables, once both ends are fitted */}
      <Appear show={parts.psu && board} from={[0, 0, 0.8]}>
        <Cable
          strands={8}
          spread={[0, 1, 0]}
          color={sleeve}
          points={[
            [-0.53, 0.46, TRAY_Z - 0.01],
            [-0.52, 0.46, TRAY_Z + 0.05],
            [-0.44, 0.46, ON_BOARD + 0.06],
            [BX - 0.7, 0.46, ON_BOARD + 0.035],
          ]}
        />
      </Appear>
      <Appear show={parts.psu && parts.cpu} from={[0, 0.8, 0]}>
        <Cable
          strands={4}
          spread={[1, 0, 0]}
          color={sleeve}
          points={[
            [BX + 0.25, H / 2 - 0.12, TRAY_Z - 0.01],
            [BX + 0.25, H / 2 - 0.13, TRAY_Z + 0.06],
            [BX + 0.25, BY + 0.94, ON_BOARD + 0.04],
            [BX + 0.25, BY + 0.88, ON_BOARD + 0.035],
          ]}
        />
      </Appear>
      {parts.gpu && (
        <Appear show={parts.psu} from={[0, -0.8, 0]}>
          <Cable
            strands={6}
            spread={[1, 0, 0]}
            color={sleeve}
            points={[
              [0.6, SHROUD_TOP - 0.02, 0.3],
              [0.6, SHROUD_TOP + 0.2, 0.44],
              [gpuPlugX(parts.gpu.fans), PCIE_Y - 0.25, 0.44],
              [gpuPlugX(parts.gpu.fans), PCIE_Y - 0.045, 0.3],
            ]}
          />
        </Appear>
      )}

      {/* The chosen colour washes the inside of the case; a dim white fill keeps a black interior readable */}
      <pointLight position={[0.2, 0.3, 0.2]} color={rgb} intensity={1.2} distance={3.2} />
      <pointLight position={[-0.2, 0.9, 0.45]} color="#ffffff" intensity={dark ? 0.7 : 0.25} distance={3} />
    </group>
  );
};

/** Pulls the camera back on tall, narrow screens so the whole case stays in frame */
const FitCamera: React.FC = () => {
  const { camera, size } = useThree();
  useEffect(() => {
    const aspect = size.width / size.height;
    camera.position.setLength(aspect < 0.9 ? 7.6 : aspect < 1.2 ? 6.6 : 5.9);
  }, [camera, size.width, size.height]);
  return null;
};

/** Interactive 3D preview of the build. Drag to rotate; idles with a slow spin. */
const PcScene: React.FC<PcSceneProps> = ({ parts, reduceMotion, onCanvas }) => (
  <MotionContext.Provider value={reduceMotion}>
    <Canvas
      camera={{ position: [-2.6, 1.3, 5.2], fov: 38 }}
      dpr={[1, 1.75]}
      gl={{ preserveDrawingBuffer: true, antialias: true, alpha: true }}
      onCreated={({ gl }) => onCanvas?.(gl.domElement)}
    >
      <FitCamera />
      {/* Soft studio reflections for the metal, glass and glossy plastics */}
      <Environment resolution={256} frames={1}>
        <Lightformer form="rect" intensity={2.2} position={[0, 5, 2]} rotation={[Math.PI / 2, 0, 0]} scale={[10, 6, 1]} />
        <Lightformer form="rect" intensity={1.2} position={[-6, 1, 2]} rotation={[0, Math.PI / 2, 0]} scale={[8, 3, 1]} />
        <Lightformer form="rect" intensity={0.8} position={[6, 1, -2]} rotation={[0, -Math.PI / 2, 0]} scale={[8, 3, 1]} />
        <Lightformer form="rect" intensity={0.6} position={[0, 1, 7]} scale={[12, 1.5, 1]} />
      </Environment>
      <ambientLight intensity={0.45} />
      <directionalLight position={[-3, 5, 6]} intensity={1.0} />
      <directionalLight position={[4, 2, -4]} intensity={0.35} color="#9fb7ff" />
      <Rig parts={parts} />
      <ContactShadows position={[0, -1.42, 0]} opacity={0.55} scale={7} blur={2.4} far={3} />
      <OrbitControls
        enablePan={false}
        enableZoom
        minDistance={4}
        maxDistance={9}
        minPolarAngle={Math.PI * 0.2}
        maxPolarAngle={Math.PI * 0.55}
        autoRotate={!reduceMotion}
        autoRotateSpeed={0.6}
        target={[0, 0.1, 0]}
      />
    </Canvas>
  </MotionContext.Provider>
);

export default PcScene;
