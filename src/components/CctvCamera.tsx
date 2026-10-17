import React, { useEffect, useLayoutEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { gsap, MOTION_OK } from '../lib/gsap';

// Side view of a Uniview-style bullet camera on a wall bracket, lens facing left.
const VIEW_W = 220;
// Ball joint the camera head pivots around (viewBox units)
const PIVOT = { x: 146, y: 72 };
const MIN_ANGLE = -15; // looking slightly up
const MAX_ANGLE = 50; // looking steeply down

const UNV_PATHS = [
  'M14.07,26.54A8.44,8.44,0,0,1,11,27C8.67,27,7.48,26,7.48,23.72V12.1h-5l1.53,1V23.66C4,28,6.43,30,11,30a16,16,0,0,0,6.58-1.24V12.11h-3.5Z',
  'M28.49,11.76A17.49,17.49,0,0,0,21.84,13v16.6h3.5V15.13a9.09,9.09,0,0,1,3.18-.52c2.41,0,3.63,1.26,3.63,3.31V29.59h3.53v-12c0-3.69-2.34-5.83-7.19-5.83',
  'M46.63,23.79c-.39,1.26-.67,2.72-.67,2.72h-.07a24.83,24.83,0,0,0-.7-2.72L41.52,12.11H36.2L38,13.21,43.9,29.59H48l6.29-17.48H50.32Z',
  'M39.15,9.46a14.23,14.23,0,0,0-22.3,0,21.14,21.14,0,0,1,22.3,0',
];

const CctvCamera: React.FC = () => {
  const svgRef = useRef<SVGSVGElement>(null);
  const headRef = useRef<SVGGElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const navigate = useNavigate();

  // Hang just below the header, whose height changes with the greeting bar and as the page scrolls
  useEffect(() => {
    const place = () => {
      const header = document.querySelector('header');
      if (buttonRef.current && header) buttonRef.current.style.top = `${header.getBoundingClientRect().bottom + 12}px`;
    };
    place();
    window.addEventListener('scroll', place, { passive: true });
    window.addEventListener('resize', place);
    const observer = new ResizeObserver(place);
    observer.observe(document.body);
    return () => {
      window.removeEventListener('scroll', place);
      window.removeEventListener('resize', place);
      observer.disconnect();
    };
  }, []);

  useLayoutEffect(() => {
    const svg = svgRef.current;
    const head = headRef.current;
    if (!svg || !head) return;

    const mm = gsap.matchMedia();
    mm.add(MOTION_OK, () => {
      gsap.set(head, { svgOrigin: `${PIVOT.x} ${PIVOT.y}`, rotation: -10 });

      // Slow patrol sweep while nobody is moving the cursor
      const sweep = gsap.to(head, { rotation: -32, duration: 4, ease: 'sine.inOut', yoyo: true, repeat: -1 });
      const turnTo = gsap.quickTo(head, 'rotation', { duration: 0.7, ease: 'power3.out' });
      let idleTimer: number | undefined;

      const onMove = (e: PointerEvent) => {
        sweep.pause();
        const box = svg.getBoundingClientRect();
        const scale = box.width / VIEW_W;
        const jx = box.left + PIVOT.x * scale;
        const jy = box.top + PIVOT.y * scale;
        // Angle below the horizontal, measured toward the left where the lens faces
        const theta = (Math.atan2(e.clientY - jy, jx - e.clientX) * 180) / Math.PI;
        turnTo(-gsap.utils.clamp(MIN_ANGLE, MAX_ANGLE, theta));

        window.clearTimeout(idleTimer);
        idleTimer = window.setTimeout(() => sweep.play(), 3000);
      };

      window.addEventListener('pointermove', onMove, { passive: true });
      return () => {
        window.removeEventListener('pointermove', onMove);
        window.clearTimeout(idleTimer);
      };
    });

    return () => mm.revert();
  }, []);

  return (
    <button
      ref={buttonRef}
      type="button"
      onClick={() => navigate('/products?category=cctv-cameras')}
      title="Need CCTV? We supply and install it."
      aria-label="Shop CCTV cameras"
      className="fixed right-0 top-[164px] z-40 hidden w-[140px] drop-shadow-[0_10px_14px_rgba(15,23,42,0.2)] md:block xl:w-[165px]"
    >
      <svg ref={svgRef} viewBox={`0 0 ${VIEW_W} 110`} className="w-full overflow-visible">
        <defs>
          {/* Cylinder shading on the white housing */}
          <linearGradient id="unv-body" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#FFFFFF" />
            <stop offset="0.45" stopColor="#F8FAFC" />
            <stop offset="1" stopColor="#D5DCE5" />
          </linearGradient>
          <linearGradient id="unv-shield" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#FFFFFF" />
            <stop offset="1" stopColor="#E2E8F0" />
          </linearGradient>
          <linearGradient id="unv-arm" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#FFFFFF" />
            <stop offset="1" stopColor="#CBD5E1" />
          </linearGradient>
          <linearGradient id="unv-glass" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#1E293B" />
            <stop offset="0.5" stopColor="#0B1220" />
            <stop offset="1" stopColor="#020617" />
          </linearGradient>
        </defs>

        {/* Wall mount base */}
        <rect x="204" y="44" width="16" height="56" rx="4" fill="url(#unv-arm)" stroke="#CBD5E1" />
        <rect x="200" y="52" width="6" height="40" rx="2" fill="#E2E8F0" stroke="#CBD5E1" />

        {/* Bracket arm, tapering toward the joint */}
        <path d="M200 64 L156 67 Q150 68 150 72 Q150 76 156 77 L200 80 Z" fill="url(#unv-arm)" stroke="#CBD5E1" />

        {/* Camera head, rotates around the ball joint */}
        <g ref={headRef}>
          {/* Mounting stem under the housing */}
          <path d="M138 52 H154 L151 70 H141 Z" fill="url(#unv-arm)" stroke="#CBD5E1" />

          {/* Main housing */}
          <path
            d="M34 24 H160 C172 24 178 31 178 39 C178 47 172 54 160 54 H34 Z"
            fill="url(#unv-body)"
            stroke="#CBD5E1"
          />
          {/* Rear end cap seam */}
          <path d="M166 25.5 C171 29 172 49 166 52.5" fill="none" stroke="#CBD5E1" />
          {/* Front section seam */}
          <line x1="66" y1="24" x2="66" y2="54" stroke="#D5DCE5" />
          {/* Top highlight */}
          <path d="M40 28 H156" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" opacity="0.9" />

          {/* Black front bezel */}
          <path d="M20 23 H38 V55 H20 Q16 55 16 51 V27 Q16 23 20 23 Z" fill="#111827" />
          {/* Front glass, with a lens glint */}
          <rect x="12" y="25" width="5" height="28" rx="1.5" fill="url(#unv-glass)" />
          <rect x="12.6" y="28" width="1.4" height="10" rx="0.7" fill="#60A5FA" opacity="0.8" />
          {/* Status light */}
          <circle cx="31" cy="49" r="1.8" fill="#EF4444" className="animate-rec" />

          {/* Sunshade hood, overhanging the front */}
          <path
            d="M4 20 Q4 15 10 15 H128 Q134 15 136 19 L138 23 H10 Q4 23 4 20 Z"
            fill="url(#unv-shield)"
            stroke="#CBD5E1"
          />

          {/* unv mark on the side of the housing */}
          <svg x="92" y="32" width="30" height="15" viewBox="2.48 4.071 51.81 25.933">
            {UNV_PATHS.map((d) => (
              <path key={d.slice(0, 12)} d={d} fill="#2682B6" />
            ))}
          </svg>
        </g>

        {/* Ball joint drawn over the stem */}
        <circle cx={PIVOT.x} cy={PIVOT.y} r="7.5" fill="url(#unv-arm)" stroke="#CBD5E1" />
        <circle cx={PIVOT.x - 2} cy={PIVOT.y - 2} r="2" fill="#FFFFFF" />
      </svg>
    </button>
  );
};

export default CctvCamera;
