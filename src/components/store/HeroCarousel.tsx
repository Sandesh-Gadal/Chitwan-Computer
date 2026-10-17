import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { slides } from '../../data/storefront';
import { festivalDecor } from '../festival/registry';
import { PinnedTag, Sprinkles } from '../festival/FestivalPieces';
import { festivals } from '../../data/festival';

const INTERVAL_MS = 6500;
const SWIPE_PX = 60;

const HeroCarousel: React.FC = () => {
  const [index, setIndex] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [hidden, setHidden] = useState(false);
  const reduceMotion = useReducedMotion();

  // Autoplay stops while the visitor is reading, using the controls, or on another tab
  const paused = hovered || focused || hidden;
  const autoplay = !reduceMotion && slides.length > 1;

  const go = useCallback((to: number) => setIndex((to + slides.length) % slides.length), []);
  const next = useCallback(() => go(index + 1), [go, index]);
  const prev = useCallback(() => go(index - 1), [go, index]);

  useEffect(() => {
    const onVisibility = () => setHidden(document.hidden);
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, []);

  const slide = slides[index];
  const festival = festivals.find((f) => f.id === slide.festival);
  const decor = slide.festival ? festivalDecor[slide.festival] : undefined;

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Featured"
      className="relative h-[500px] overflow-hidden rounded-lg bg-ink sm:h-[440px] lg:h-[480px]"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setFocused(true)}
      onBlur={(e) => !e.currentTarget.contains(e.relatedTarget) && setFocused(false)}
      onKeyDown={(e) => {
        if (e.key === 'ArrowRight') next();
        if (e.key === 'ArrowLeft') prev();
      }}
    >
      <AnimatePresence initial={false}>
        <motion.div
          key={slide.id}
          className="absolute inset-0 touch-pan-y"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          drag={slides.length > 1 ? 'x' : false}
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.12}
          onDragEnd={(_, info) => {
            if (info.offset.x < -SWIPE_PX) next();
            else if (info.offset.x > SWIPE_PX) prev();
          }}
          role="group"
          aria-roledescription="slide"
          aria-label={`${index + 1} of ${slides.length}`}
        >
          {festival && decor ? (
            <>
              {/* Festival slide: the festival's colours with its icons scattered across the right */}
              <div
                className="absolute inset-0"
                style={{
                  background: `radial-gradient(circle at 78% 70%, ${festival.theme.accent}55, transparent 45%), linear-gradient(120deg, ${festival.theme.deep} 30%, ${festival.theme.base})`,
                }}
              />
              <Sprinkles items={decor.slide} className="hidden sm:block" />
              <Sprinkles items={decor.slide.slice(0, 3).map((s) => ({ ...s, y: s.y - 4, size: s.size * 0.6 }))} className="sm:hidden" />
              <div className="absolute bottom-20 right-6 hidden sm:block lg:bottom-24 lg:right-14">
                <PinnedTag size="md" tilt={5}>
                  {festival.note}
                </PinnedTag>
              </div>
            </>
          ) : (
            <>
              <motion.img
                src={slide.image}
                alt=""
                draggable={false}
                className="absolute inset-0 h-full w-full select-none object-cover"
                style={{ objectPosition: slide.focus }}
                initial={{ scale: 1.06 }}
                animate={{ scale: 1 }}
                transition={{ duration: 7, ease: 'linear' }}
              />
              {/* Legibility scrim: heavier at the bottom on phones, on the left from tablet up */}
              <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/75 to-ink/20 sm:bg-gradient-to-r sm:from-ink/95 sm:via-ink/70 sm:to-ink/10" />
              <div className="absolute inset-0 bg-ink/20" />
              <div className="absolute inset-x-0 bottom-0 hidden h-32 bg-gradient-to-t from-ink/85 to-transparent sm:block" />
            </>
          )}

          <div className="relative flex h-full flex-col justify-end p-6 pb-24 sm:justify-center sm:p-10 sm:pb-20 lg:p-14 lg:pb-20">
            <motion.div
              key={`${slide.id}-copy`}
              className="max-w-xl"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            >
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-300">{slide.eyebrow}</p>
              <h2 className="mt-3 font-display text-[1.9rem] font-semibold leading-[1.08] text-white sm:text-4xl lg:text-[2.75rem]">
                {slide.title}
              </h2>
              <p className="mt-4 max-w-md text-[15px] leading-relaxed text-slate-300 sm:text-base">{slide.text}</p>
              <Link
                to={slide.cta.to}
                className="group mt-7 inline-flex items-center gap-2 rounded-md bg-white px-5 py-3 text-sm font-semibold text-ink transition-colors hover:bg-slate-100"
              >
                {slide.cta.label}
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </AnimatePresence>

      {slides.length > 1 && (
        <div className="absolute inset-x-6 bottom-6 flex items-center justify-between gap-6 sm:inset-x-10 lg:inset-x-14 lg:bottom-8">
          {/* One bar per slide; the active bar fills over the autoplay interval and advances when full */}
          <div className="flex flex-1 items-center gap-2 sm:max-w-xs">
            {slides.map((s, i) => (
              <button
                key={s.id}
                onClick={() => go(i)}
                aria-label={`Show slide ${i + 1}: ${s.eyebrow}`}
                aria-current={i === index}
                className="group flex-1 py-3"
              >
                <span className="block h-[2px] overflow-hidden rounded-full bg-white/25 transition-colors group-hover:bg-white/40">
                  {i < index && <span className="block h-full w-full bg-white" />}
                  {i === index &&
                    (autoplay ? (
                      <span
                        key={`${s.id}-${index}`}
                        className="slide-progress block h-full w-full origin-left bg-white"
                        style={{ animationDuration: `${INTERVAL_MS}ms`, animationPlayState: paused ? 'paused' : 'running' }}
                        onAnimationEnd={next}
                      />
                    ) : (
                      <span className="block h-full w-full bg-white" />
                    ))}
                </span>
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1.5">
            <span className="mr-2 hidden text-xs tabular-nums text-slate-300 sm:inline">
              {String(index + 1).padStart(2, '0')} / {String(slides.length).padStart(2, '0')}
            </span>
            <button
              onClick={prev}
              aria-label="Previous slide"
              className="flex h-9 w-9 items-center justify-center rounded-md border border-white/25 text-white transition-colors hover:border-white hover:bg-white hover:text-ink"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={next}
              aria-label="Next slide"
              className="flex h-9 w-9 items-center justify-center rounded-md border border-white/25 text-white transition-colors hover:border-white hover:bg-white hover:text-ink"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}
    </section>
  );
};

export default HeroCarousel;
