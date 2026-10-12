import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ChevronLeft, ChevronRight, X, ZoomIn, Expand } from 'lucide-react';

interface ProductGalleryProps {
  images: string[];
  alt: string;
  label?: string | null;
}

const ZOOM = 2.5;
const SWIPE_THRESHOLD = 50;

// Hover zoom only makes sense with a real mouse
const canHoverZoom = () =>
  typeof window !== 'undefined' && window.matchMedia('(hover: hover) and (pointer: fine)').matches;

const ProductGallery: React.FC<ProductGalleryProps> = ({ images, alt, label }) => {
  const [index, setIndex] = useState(0);
  const [zoom, setZoom] = useState<{ x: number; y: number } | null>(null);
  const [lightbox, setLightbox] = useState(false);
  const swipeStart = useRef<number | null>(null);
  const swiped = useRef(false);
  const thumbsRef = useRef<HTMLDivElement>(null);
  const count = images.length;
  const imagesKey = images.join('|');

  // Start from the cover whenever the product changes
  useEffect(() => setIndex(0), [imagesKey]);

  const go = useCallback(
    (next: number) => {
      setZoom(null);
      setIndex(((next % count) + count) % count);
    },
    [count]
  );

  // Keep the active thumbnail in view
  useEffect(() => {
    const thumb = thumbsRef.current?.children[index] as HTMLElement | undefined;
    thumb?.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'smooth' });
  }, [index]);

  const onMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!canHoverZoom()) return;
    const rect = e.currentTarget.getBoundingClientRect();
    setZoom({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    });
  };

  const onPointerDown = (e: React.PointerEvent) => {
    if (e.pointerType !== 'mouse') swipeStart.current = e.clientX;
  };

  const onPointerUp = (e: React.PointerEvent) => {
    if (swipeStart.current === null) return;
    const dx = e.clientX - swipeStart.current;
    swipeStart.current = null;
    if (Math.abs(dx) > SWIPE_THRESHOLD) {
      swiped.current = true;
      go(index + (dx < 0 ? 1 : -1));
    }
  };

  const onViewerClick = () => {
    // The tap that ends a swipe shouldn't also open full screen
    if (swiped.current) {
      swiped.current = false;
      return;
    }
    setLightbox(true);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight') go(index + 1);
    if (e.key === 'ArrowLeft') go(index - 1);
    if (e.key === 'Enter') setLightbox(true);
  };

  if (count === 0) {
    return <div className="aspect-square rounded-xl border border-slate-200 bg-white" />;
  }

  return (
    <div>
      {/* Main viewer */}
      <div
        role="region"
        aria-roledescription="carousel"
        aria-label={`${alt} photos`}
        tabIndex={0}
        onKeyDown={onKeyDown}
        onMouseMove={onMouseMove}
        onMouseLeave={() => setZoom(null)}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onClick={onViewerClick}
        className={`group relative aspect-square touch-pan-y select-none overflow-hidden rounded-xl border border-slate-200 bg-white outline-none focus-visible:ring-2 focus-visible:ring-primary-500 ${
          zoom ? 'cursor-zoom-in' : 'cursor-pointer'
        }`}
      >
        <div
          className="flex h-full transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
          style={{ transform: `translateX(-${index * 100}%)` }}
        >
          {images.map((src, i) => (
            <div key={src} className="relative h-full w-full flex-shrink-0 overflow-hidden" aria-hidden={i !== index}>
              <img
                src={src}
                alt={`${alt} – photo ${i + 1} of ${count}`}
                draggable={false}
                loading={i === 0 ? 'eager' : 'lazy'}
                className="h-full w-full object-contain p-8 transition-transform duration-200 ease-out sm:p-12"
                style={
                  zoom && i === index
                    ? { transform: `scale(${ZOOM})`, transformOrigin: `${zoom.x}% ${zoom.y}%` }
                    : undefined
                }
              />
            </div>
          ))}
        </div>

        {label && (
          <span className="pointer-events-none absolute left-4 top-4 rounded bg-orange-500 px-2.5 py-1 text-xs font-semibold text-white">
            {label}
          </span>
        )}

        {count > 1 && (
          <>
            <button
              type="button"
              aria-label="Previous photo"
              onClick={(e) => {
                e.stopPropagation();
                go(index - 1);
              }}
              className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 text-ink shadow-md transition-opacity hover:bg-white sm:opacity-0 sm:group-hover:opacity-100"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              type="button"
              aria-label="Next photo"
              onClick={(e) => {
                e.stopPropagation();
                go(index + 1);
              }}
              className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 text-ink shadow-md transition-opacity hover:bg-white sm:opacity-0 sm:group-hover:opacity-100"
            >
              <ChevronRight size={20} />
            </button>
            <span className="pointer-events-none absolute bottom-4 right-4 rounded-full bg-ink/80 px-2.5 py-1 text-xs font-semibold text-white">
              {index + 1} / {count}
            </span>
          </>
        )}

        <span
          className={`pointer-events-none absolute bottom-4 left-4 inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1 text-xs font-medium text-slate-700 shadow-sm transition-opacity ${
            zoom ? 'opacity-0' : 'opacity-100'
          }`}
        >
          <ZoomIn size={13} className="hidden sm:block" />
          <Expand size={13} className="sm:hidden" />
          <span className="hidden sm:inline">Hover to zoom · click to expand</span>
          <span className="sm:hidden">Tap to expand</span>
        </span>
      </div>

      {/* Thumbnails */}
      {count > 1 && (
        <div ref={thumbsRef} className="scrollbar-hide mt-4 flex gap-3 overflow-x-auto pb-1">
          {images.map((src, i) => (
            <button
              key={src}
              type="button"
              onClick={() => go(i)}
              onMouseEnter={() => canHoverZoom() && go(i)}
              aria-label={`Show photo ${i + 1}`}
              aria-current={i === index}
              className={`relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg border-2 bg-white transition-colors sm:h-24 sm:w-24 ${
                i === index ? 'border-primary-500' : 'border-slate-200 hover:border-slate-400'
              }`}
            >
              <img src={src} alt="" draggable={false} className="h-full w-full object-contain p-2" />
            </button>
          ))}
        </div>
      )}

      {lightbox && <Lightbox images={images} alt={alt} index={index} onIndex={go} onClose={() => setLightbox(false)} />}
    </div>
  );
};

interface LightboxProps {
  images: string[];
  alt: string;
  index: number;
  onIndex: (i: number) => void;
  onClose: () => void;
}

const Lightbox: React.FC<LightboxProps> = ({ images, alt, index, onIndex, onClose }) => {
  const swipeStart = useRef<number | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const count = images.length;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') onIndex(index + 1);
      if (e.key === 'ArrowLeft') onIndex(index - 1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [index, onIndex, onClose]);

  // Lock page scroll and move focus into the dialog while it's open
  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();
    return () => {
      document.body.style.overflow = previous;
    };
  }, []);

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${alt} photos`}
      className="fixed inset-0 z-[70] flex flex-col bg-ink/95 backdrop-blur-sm"
      onClick={onClose}
    >
      <div className="flex items-center justify-between px-4 py-4 text-white sm:px-6">
        <span className="text-sm text-slate-300">
          {index + 1} / {count}
        </span>
        <button
          ref={closeRef}
          type="button"
          aria-label="Close"
          onClick={onClose}
          className="rounded-full p-2 text-white transition-colors hover:bg-white/10"
        >
          <X size={24} />
        </button>
      </div>

      <div
        className="relative flex flex-1 touch-pan-y items-center justify-center px-4 sm:px-20"
        onPointerDown={(e) => (swipeStart.current = e.clientX)}
        onPointerUp={(e) => {
          if (swipeStart.current === null) return;
          const dx = e.clientX - swipeStart.current;
          swipeStart.current = null;
          if (Math.abs(dx) > SWIPE_THRESHOLD) onIndex(index + (dx < 0 ? 1 : -1));
        }}
      >
        <img
          key={images[index]}
          src={images[index]}
          alt={`${alt} – photo ${index + 1} of ${count}`}
          draggable={false}
          onClick={(e) => e.stopPropagation()}
          className="max-h-[78vh] max-w-full select-none rounded-lg bg-white object-contain p-6"
        />

        {count > 1 && (
          <>
            <button
              type="button"
              aria-label="Previous photo"
              onClick={(e) => {
                e.stopPropagation();
                onIndex(index - 1);
              }}
              className="absolute left-2 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 sm:left-6"
            >
              <ChevronLeft size={26} />
            </button>
            <button
              type="button"
              aria-label="Next photo"
              onClick={(e) => {
                e.stopPropagation();
                onIndex(index + 1);
              }}
              className="absolute right-2 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 sm:right-6"
            >
              <ChevronRight size={26} />
            </button>
          </>
        )}
      </div>

      {count > 1 && (
        <div className="flex justify-center gap-2 px-4 py-5" onClick={(e) => e.stopPropagation()}>
          {images.map((src, i) => (
            <button
              key={src}
              type="button"
              onClick={() => onIndex(i)}
              aria-label={`Show photo ${i + 1}`}
              className={`h-14 w-14 overflow-hidden rounded-md border-2 bg-white transition-opacity ${
                i === index ? 'border-primary-500 opacity-100' : 'border-transparent opacity-50 hover:opacity-100'
              }`}
            >
              <img src={src} alt="" className="h-full w-full object-contain p-1" />
            </button>
          ))}
        </div>
      )}
    </div>,
    document.body
  );
};

export default ProductGallery;
