import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { ContactShadows, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import type { CaseColor, CaseStyle, CoolerId } from '../../data/pcBuilder';

// The PC is built from simple shapes rather than a downloaded model: it loads
// instantly, and every part can animate in on its own.
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

const W = 2.4; // front to back
const H = 2.8;
const D = 1.2; // side to side
const BOARD_Z = -D / 2 + 0.08;
const ON_BOARD = BOARD_Z + 0.045;

const MotionContext = React.createContext(false);

/* ------------------------------------------------------------------------- */
/* Building blocks                                                            */
/* ------------------------------------------------------------------------- */

/**
 * Shows its children flying in from `from` (an offset) when `show` turns on, and
 * shrinking away when it turns off.
 */
const Appear: React.FC<{
  show: boolean;
  position?: [number, number, number];
  from?: [number, number, number];
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

/** Case or component fan facing +z: glowing ring, spinning blades */
const Fan: React.FC<{ radius: number; rgb: string; speed?: number } & JSX.IntrinsicElements['group']> = ({
  radius,
  rgb,
  speed = 5,
  ...props
}) => {
  const reduce = React.useContext(MotionContext);
  const blades = useRef<THREE.Group>(null);
  useFrame((_, dt) => {
    if (blades.current && !reduce) blades.current.rotation.z -= dt * speed;
  });

  return (
    <group {...props}>
      <mesh>
        <boxGeometry args={[radius * 2.15, radius * 2.15, 0.05]} />
        <meshStandardMaterial color="#15181d" roughness={0.6} transparent opacity={0.35} />
      </mesh>
      <mesh position={[0, 0, 0.03]}>
        <torusGeometry args={[radius * 0.98, radius * 0.07, 12, 48]} />
        <meshStandardMaterial color={rgb} emissive={rgb} emissiveIntensity={2.2} toneMapped={false} />
      </mesh>
      <group ref={blades} position={[0, 0, 0.035]}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[radius * 0.28, radius * 0.28, 0.04, 24]} />
          <meshStandardMaterial color="#20242b" roughness={0.4} />
        </mesh>
        {Array.from({ length: 7 }, (_, i) => {
          const a = (i / 7) * Math.PI * 2;
          return (
            <mesh
              key={i}
              position={[Math.cos(a) * radius * 0.58, Math.sin(a) * radius * 0.58, 0]}
              rotation={[0.35, 0, a + 0.35]}
            >
              <boxGeometry args={[radius * 0.62, radius * 0.24, 0.008]} />
              <meshStandardMaterial color="#2a2f37" transparent opacity={0.85} />
            </mesh>
          );
        })}
      </group>
    </group>
  );
};

const Glow: React.FC<{ rgb: string; size: [number, number, number] } & Omit<JSX.IntrinsicElements['mesh'], 'args'>> = ({
  rgb,
  size,
  ...props
}) => (
  <mesh {...props}>
    <boxGeometry args={size} />
    <meshStandardMaterial color={rgb} emissive={rgb} emissiveIntensity={2} toneMapped={false} />
  </mesh>
);

/* ------------------------------------------------------------------------- */
/* Parts                                                                      */
/* ------------------------------------------------------------------------- */

const Cabinet: React.FC<{ style: CaseStyle; color: CaseColor; rgb: string }> = ({ style, color, rgb }) => {
  const shell = color === 'white' ? '#E6E9ED' : '#121418';
  const inner = color === 'white' ? '#D5DAE0' : '#0B0D10';
  const t = 0.05;
  const front = style === 'airflow' ? (color === 'white' ? '#C9CED6' : '#262A31') : shell;

  return (
    <group>
      {/* Back panel the motherboard is mounted to */}
      <mesh position={[0, 0, -D / 2]}>
        <boxGeometry args={[W, H, t]} />
        <meshStandardMaterial color={inner} roughness={0.85} />
      </mesh>
      {[
        { p: [0, H / 2, 0], s: [W + t, t, D + t] },
        { p: [0, -H / 2, 0], s: [W + t, t, D + t] },
        { p: [W / 2, 0, 0], s: [t, H, D] },
      ].map((panel, i) => (
        <mesh key={i} position={panel.p as [number, number, number]}>
          <boxGeometry args={panel.s as [number, number, number]} />
          <meshStandardMaterial color={shell} roughness={0.5} metalness={0.3} />
        </mesh>
      ))}
      {/* Front panel: solid, or mesh with a visible grille on the airflow case */}
      <mesh position={[-W / 2, 0, 0]}>
        <boxGeometry args={[t, H, D]} />
        <meshStandardMaterial color={front} roughness={style === 'airflow' ? 0.95 : 0.45} metalness={0.25} />
      </mesh>
      {style === 'airflow' &&
        Array.from({ length: 12 }, (_, i) => (
          <mesh key={i} position={[-W / 2 - 0.028, -H / 2 + 0.25 + i * 0.2, 0]}>
            <boxGeometry args={[0.008, 0.06, D - 0.2]} />
            <meshStandardMaterial color={color === 'white' ? '#AEB4BD' : '#0B0D10'} />
          </mesh>
        ))}
      {/* Front light strip */}
      <Glow rgb={rgb} size={[0.012, H - 0.4, 0.03]} position={[-W / 2 - 0.03, 0, D / 2 - 0.08]} />
      {/* Power supply shroud */}
      <mesh position={[0, -H / 2 + 0.3, -0.05]}>
        <boxGeometry args={[W - t, 0.55, D - 0.12]} />
        <meshStandardMaterial color={shell} roughness={0.6} metalness={0.2} />
      </mesh>
      {/* Tempered glass side */}
      <mesh position={[0, 0, D / 2]}>
        <boxGeometry args={[W, H, 0.02]} />
        <meshPhysicalMaterial color="#9fb3c8" transparent opacity={0.1} roughness={0.05} metalness={0.1} />
      </mesh>
      {/* Glass frame edges */}
      {[
        { p: [0, H / 2 - 0.02, D / 2], s: [W, 0.04, 0.03] },
        { p: [0, -H / 2 + 0.02, D / 2], s: [W, 0.04, 0.03] },
        { p: [W / 2 - 0.02, 0, D / 2], s: [0.04, H, 0.03] },
        { p: [-W / 2 + 0.02, 0, D / 2], s: [0.04, H, 0.03] },
      ].map((edge, i) => (
        <mesh key={i} position={edge.p as [number, number, number]}>
          <boxGeometry args={edge.s as [number, number, number]} />
          <meshStandardMaterial color={shell} metalness={0.4} roughness={0.4} />
        </mesh>
      ))}
      {/* Feet */}
      {[-0.9, 0.9].map((x) => (
        <mesh key={x} position={[x, -H / 2 - 0.07, 0]}>
          <boxGeometry args={[0.3, 0.08, D - 0.1]} />
          <meshStandardMaterial color="#0a0b0d" />
        </mesh>
      ))}
      {/* Intake fans behind the front panel, exhaust at the back */}
      {[0.85, 0.2, -0.45].map((y) => (
        <Fan key={y} radius={0.27} rgb={rgb} position={[-W / 2 + 0.1, y + 0.15, 0]} rotation={[0, Math.PI / 2, 0]} />
      ))}
      <Fan radius={0.24} rgb={rgb} position={[W / 2 - 0.1, 0.85, -0.05]} rotation={[0, -Math.PI / 2, 0]} />
    </group>
  );
};

const Motherboard: React.FC<{ rgb: string }> = ({ rgb }) => (
  <group position={[0.25, 0.3, BOARD_Z]}>
    <mesh>
      <boxGeometry args={[1.55, 1.85, 0.05]} />
      <meshStandardMaterial color="#1a1e24" roughness={0.7} />
    </mesh>
    {/* Power delivery heatsinks around the socket */}
    <mesh position={[-0.05, 0.78, 0.05]}>
      <boxGeometry args={[0.7, 0.16, 0.08]} />
      <meshStandardMaterial color="#5b626c" metalness={0.7} roughness={0.35} />
    </mesh>
    <mesh position={[-0.52, 0.45, 0.05]}>
      <boxGeometry args={[0.16, 0.55, 0.08]} />
      <meshStandardMaterial color="#5b626c" metalness={0.7} roughness={0.35} />
    </mesh>
    {/* CPU socket */}
    <mesh position={[0.1, 0.55, 0.03]}>
      <boxGeometry args={[0.36, 0.36, 0.02]} />
      <meshStandardMaterial color="#2c3138" />
    </mesh>
    {/* RAM slots */}
    {[0.55, 0.62, 0.69, 0.76].map((x) => (
      <mesh key={x} position={[x, 0.55, 0.035]}>
        <boxGeometry args={[0.03, 0.66, 0.03]} />
        <meshStandardMaterial color="#0e1013" />
      </mesh>
    ))}
    {/* Graphics card slot and chipset */}
    <mesh position={[-0.05, -0.38, 0.035]}>
      <boxGeometry args={[1.1, 0.04, 0.03]} />
      <meshStandardMaterial color="#0e1013" />
    </mesh>
    <mesh position={[0.45, -0.6, 0.05]}>
      <boxGeometry args={[0.32, 0.32, 0.06]} />
      <meshStandardMaterial color="#5b626c" metalness={0.7} roughness={0.35} />
    </mesh>
    <Glow rgb={rgb} size={[0.5, 0.025, 0.02]} position={[0.45, -0.42, 0.085]} />
  </group>
);

// Socket position in cabinet coordinates
const SOCKET: [number, number] = [0.35, 0.85];

const Cooler: React.FC<{ type: CoolerId; rgb: string }> = ({ type, rgb }) => {
  if (type === 'stock') {
    return (
      <group position={[SOCKET[0], SOCKET[1], ON_BOARD + 0.06]}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.2, 0.22, 0.1, 32]} />
          <meshStandardMaterial color="#2a2e35" metalness={0.5} roughness={0.4} />
        </mesh>
        <Fan radius={0.17} rgb={rgb} speed={7} position={[0, 0, 0.06]} />
      </group>
    );
  }

  if (type === 'air') {
    return (
      <group position={[SOCKET[0], SOCKET[1], ON_BOARD + 0.26]}>
        {Array.from({ length: 14 }, (_, i) => (
          <mesh key={i} position={[-0.17 + i * 0.026, 0, 0]}>
            <boxGeometry args={[0.012, 0.52, 0.46]} />
            <meshStandardMaterial color="#c7ccd3" metalness={0.85} roughness={0.25} />
          </mesh>
        ))}
        <Glow rgb={rgb} size={[0.38, 0.03, 0.46]} position={[0.003, 0.27, 0]} />
        <Fan radius={0.24} rgb={rgb} speed={6} position={[-0.21, 0, 0]} rotation={[0, -Math.PI / 2, 0]} />
      </group>
    );
  }

  // Liquid cooler: pump on the CPU, radiator and fans along the top, two tubes between
  const fans = type === 'aio360' ? 3 : 2;
  const radLength = fans * 0.52;
  const radX = W / 2 - 0.2 - radLength / 2;
  const radY = H / 2 - 0.14;
  return (
    <group>
      <group position={[SOCKET[0], SOCKET[1], ON_BOARD + 0.07]}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.18, 0.18, 0.12, 40]} />
          <meshStandardMaterial color="#16191e" metalness={0.4} roughness={0.3} />
        </mesh>
        <mesh position={[0, 0, 0.065]}>
          <torusGeometry args={[0.14, 0.018, 12, 48]} />
          <meshStandardMaterial color={rgb} emissive={rgb} emissiveIntensity={2.4} toneMapped={false} />
        </mesh>
      </group>
      <mesh position={[radX, radY, -0.05]}>
        <boxGeometry args={[radLength, 0.08, 0.5]} />
        <meshStandardMaterial color="#1b1e23" metalness={0.5} roughness={0.5} />
      </mesh>
      {Array.from({ length: fans }, (_, i) => (
        <Fan
          key={i}
          radius={0.22}
          rgb={rgb}
          position={[radX - radLength / 2 + 0.26 + i * 0.52, radY - 0.07, -0.05]}
          rotation={[Math.PI / 2, 0, 0]}
        />
      ))}
      {[-0.06, 0.06].map((dz) => (
        <Tube
          key={dz}
          points={[
            [SOCKET[0] + 0.1, SOCKET[1] + 0.12, ON_BOARD + 0.1 + dz],
            [SOCKET[0] + 0.4, SOCKET[1] + 0.35, 0.05 + dz],
            [radX + radLength / 2 - 0.1, radY - 0.05, -0.05 + dz],
          ]}
        />
      ))}
    </group>
  );
};

const Tube: React.FC<{ points: [number, number, number][] }> = ({ points }) => {
  const geometry = useMemo(
    () => new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points.map((p) => new THREE.Vector3(...p))), 24, 0.025, 8),
    // Points are derived from constants, so they only change with the cooler size
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [JSON.stringify(points)]
  );
  return (
    <mesh geometry={geometry}>
      <meshStandardMaterial color="#0f1114" roughness={0.6} />
    </mesh>
  );
};

const Ram: React.FC<{ rgb: string }> = ({ rgb }) => (
  <group>
    {[0.82, 0.96].map((x) => (
      <group key={x} position={[x, SOCKET[1], ON_BOARD + 0.08]}>
        <mesh>
          <boxGeometry args={[0.04, 0.64, 0.14]} />
          <meshStandardMaterial color="#1c2026" metalness={0.6} roughness={0.35} />
        </mesh>
        <Glow rgb={rgb} size={[0.042, 0.62, 0.02]} position={[0, 0, 0.075]} />
      </group>
    ))}
  </group>
);

/** Graphics card on a vertical mount, fans facing the glass */
const Gpu: React.FC<{ fans: 2 | 3; rgb: string }> = ({ fans, rgb }) => {
  const length = fans === 3 ? 1.32 : 1.05;
  return (
    <group position={[0.15, -0.42, 0.12]}>
      <mesh>
        <boxGeometry args={[length, 0.5, 0.12]} />
        <meshStandardMaterial color="#1d2127" metalness={0.55} roughness={0.35} />
      </mesh>
      <mesh position={[0, 0, -0.07]}>
        <boxGeometry args={[length - 0.02, 0.48, 0.02]} />
        <meshStandardMaterial color="#3a4049" metalness={0.8} roughness={0.3} />
      </mesh>
      {Array.from({ length: fans }, (_, i) => (
        <Fan key={i} radius={0.17} rgb={rgb} speed={6} position={[-length / 2 + (length / fans) * (i + 0.5), 0, 0.065]} />
      ))}
      <Glow rgb={rgb} size={[length - 0.1, 0.025, 0.02]} position={[0, 0.25, 0.06]} />
      {/* Riser cable down to the board slot */}
      <mesh position={[length / 2 - 0.15, 0.22, -0.25]}>
        <boxGeometry args={[0.18, 0.02, 0.36]} />
        <meshStandardMaterial color="#0d0f12" />
      </mesh>
    </group>
  );
};

const Storage: React.FC<{ type: 'm2' | 'hdd'; rgb: string }> = ({ type, rgb }) =>
  type === 'm2' ? (
    <group position={[0.2, 0.12, ON_BOARD + 0.02]}>
      <mesh>
        <boxGeometry args={[0.5, 0.1, 0.03]} />
        <meshStandardMaterial color="#5f6670" metalness={0.8} roughness={0.3} />
      </mesh>
      <Glow rgb={rgb} size={[0.46, 0.012, 0.01]} position={[0, 0.045, 0.02]} />
    </group>
  ) : (
    <mesh position={[-0.75, -H / 2 + 0.65, 0.1]}>
      <boxGeometry args={[0.5, 0.14, 0.4]} />
      <meshStandardMaterial color="#8a919b" metalness={0.75} roughness={0.35} />
    </mesh>
  );

const Psu: React.FC<{ rgb: string }> = ({ rgb }) => (
  // Shown as the unit's face on the front of the shroud, so it's visible once fitted
  <group position={[0.65, -H / 2 + 0.3, D / 2 - 0.07]}>
    <mesh>
      <boxGeometry args={[0.85, 0.42, 0.06]} />
      <meshStandardMaterial color="#17191d" metalness={0.5} roughness={0.4} />
    </mesh>
    <Glow rgb={rgb} size={[0.6, 0.02, 0.01]} position={[0, -0.12, 0.035]} />
    <mesh position={[0, 0.06, 0.035]}>
      <boxGeometry args={[0.5, 0.1, 0.01]} />
      <meshStandardMaterial color="#d7dbe0" />
    </mesh>
  </group>
);

/* ------------------------------------------------------------------------- */

const Rig: React.FC<{ parts: SceneParts }> = ({ parts }) => {
  const { rgb } = parts;
  // The compact case is drawn at a smaller scale
  const scale = parts.caseStyle === 'compact' ? 0.9 : 1;
  const board = parts.cpu || parts.ram || !!parts.gpu || parts.storage === 'm2' || !!parts.cooler;

  return (
    <group scale={scale} position={[0, 0.1, 0]}>
      <Cabinet style={parts.caseStyle} color={parts.color} rgb={rgb} />
      <Appear show={board} from={[0, 0, 1.8]}>
        <Motherboard rgb={rgb} />
      </Appear>
      <Appear show={parts.cpu} position={[SOCKET[0], SOCKET[1], ON_BOARD]} from={[0, 0, 1.4]}>
        <mesh>
          <boxGeometry args={[0.3, 0.3, 0.04]} />
          <meshStandardMaterial color="#b8bec6" metalness={0.9} roughness={0.2} />
        </mesh>
      </Appear>
      {(['stock', 'air', 'aio240', 'aio360'] as CoolerId[]).map((type) => (
        <Appear key={type} show={parts.cooler === type} from={[0, 1.8, 0.6]}>
          <Cooler type={type} rgb={rgb} />
        </Appear>
      ))}
      <Appear show={parts.ram} from={[0, 1.4, 0.4]}>
        <Ram rgb={rgb} />
      </Appear>
      <Appear show={parts.gpu?.fans === 2} from={[0, 0, 1.6]}>
        <Gpu fans={2} rgb={rgb} />
      </Appear>
      <Appear show={parts.gpu?.fans === 3} from={[0, 0, 1.6]}>
        <Gpu fans={3} rgb={rgb} />
      </Appear>
      <Appear show={parts.storage === 'm2'} from={[0, 0, 1.2]}>
        <Storage type="m2" rgb={rgb} />
      </Appear>
      <Appear show={parts.storage === 'hdd'} from={[-1.4, 0, 0]}>
        <Storage type="hdd" rgb={rgb} />
      </Appear>
      <Appear show={parts.psu} from={[1.6, 0, 0]}>
        <Psu rgb={rgb} />
      </Appear>
      {/* The chosen colour washes the inside of the case */}
      <pointLight position={[0.2, 0.3, 0.2]} color={rgb} intensity={1.4} distance={3.2} />
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
      <ambientLight intensity={0.75} />
      <directionalLight position={[-3, 5, 6]} intensity={1.15} />
      <directionalLight position={[4, 2, -4]} intensity={0.4} color="#9fb7ff" />
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
