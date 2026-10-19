import React, { useLayoutEffect, useRef } from 'react';
import { ArrowRight, Phone } from 'lucide-react';
import shelves1600 from '../assets/store-shelves-1600.jpg';
import shelves900 from '../assets/store-shelves-900.jpg';
import { business } from '../data/business';
import { gsap, MOTION_OK } from '../lib/gsap';
import { useFestival } from './festival/registry';
import { PinnedTag } from './festival/FestivalPieces';

const yearsServing = new Date().getFullYear() - business.since;

const facts = [
  { value: yearsServing, suffix: '+ yrs', label: `Serving Chitwan since ${business.since}` },
  { value: null, text: '24–48 hrs', label: 'Typical repair turnaround' },
  { value: null, text: 'Sun – Fri', label: business.hours.time },
  { value: null, text: 'Lionschowk', label: 'Narayanghat, Chitwan' },
];

// Each word sits in a clipping mask so it can slide up into view
const Word: React.FC<{ children: string }> = ({ children }) => (
  <span className="-mb-[0.14em] inline-block overflow-hidden pb-[0.14em] align-bottom">
    <span className="hero-word inline-block">{children}</span>
  </span>
);

const Hero: React.FC = () => {
  const root = useRef<HTMLElement>(null);
  const festive = useFestival();

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  useLayoutEffect(() => {
    const mm = gsap.matchMedia(root);

    mm.add(MOTION_OK, () => {
      // Intro sequence
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
      tl.from('.hero-word', { yPercent: 110, duration: 0.9, stagger: 0.07 })
        .fromTo('.hero-underline path', { strokeDashoffset: 320 }, { strokeDashoffset: 0, duration: 0.9, ease: 'power2.inOut' }, '-=0.4')
        .from('.hero-fade', { opacity: 0, y: 24, duration: 0.7, stagger: 0.1 }, '-=0.6')
        .fromTo(
          '.hero-media',
          { clipPath: 'inset(100% 0% 0% 0%)' },
          { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.2, ease: 'power4.inOut' },
          0.2
        )
        .from('.hero-img', { scale: 1.35, duration: 1.6, ease: 'power3.out' }, 0.2)
        .from('.hero-frame', { opacity: 0, x: -12, y: 12, duration: 0.8 }, 1)
        .from('.hero-tag', { opacity: 0, y: 12, duration: 0.5 }, 1.2)
        .from('.hero-fact', { opacity: 0, y: 30, duration: 0.7, stagger: 0.08 }, 0.9);

      // Count the years up
      const counter = root.current?.querySelector<HTMLElement>('.hero-count');
      if (counter) {
        const state = { val: 0 };
        tl.to(state, {
          val: yearsServing,
          duration: 1.6,
          ease: 'power2.out',
          onUpdate: () => {
            counter.textContent = String(Math.round(state.val));
          },
        }, 1);
      }

      // Parallax on scroll
      const scroll = { trigger: root.current, start: 'top top', end: 'bottom top', scrub: true };
      gsap.to('.hero-img', { yPercent: 14, ease: 'none', scrollTrigger: scroll });
      gsap.to('.hero-media-wrap', { y: -40, ease: 'none', scrollTrigger: scroll });
      gsap.to('.hero-copy', { y: 90, opacity: 0.2, ease: 'none', scrollTrigger: scroll });
    });

    return () => mm.revert();
  }, []);

  return (
    <section id="home" ref={root} className="relative overflow-hidden bg-paper">
      {/* Faint blueprint grid to tie in with the tech theme */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.5]"
        style={{
          backgroundImage:
            'linear-gradient(to right, rgba(15,82,186,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(15,82,186,0.06) 1px, transparent 1px)',
          backgroundSize: '64px 64px',
          maskImage: 'linear-gradient(to bottom, black 40%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, black 40%, transparent 100%)',
        }}
      />

      <div className="relative mx-auto max-w-7xl px-4 pt-14 sm:px-6 lg:px-8 lg:pt-20">
        <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-14">
          {/* Copy */}
          <div className="hero-copy lg:col-span-6">
            <h1 className="font-display text-[2.6rem] font-semibold leading-[1.04] text-ink sm:text-6xl lg:text-[4.5rem]">
              <Word>Your</Word> <Word>trusted</Word> <Word>tech</Word> <Word>partner</Word>{' '}
              <span className="relative inline-block whitespace-nowrap text-primary-500">
                <Word>in</Word> <Word>Chitwan.</Word>
                <svg
                  aria-hidden="true"
                  viewBox="0 0 300 12"
                  preserveAspectRatio="none"
                  className="hero-underline absolute -bottom-1 left-0 h-3 w-full text-orange-500"
                >
                  <path
                    d="M2 9C60 3 180 1 298 6"
                    stroke="currentColor"
                    strokeWidth="3"
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray="320"
                  />
                </svg>
              </span>
            </h1>

            <p className="hero-fade mt-8 max-w-lg text-lg leading-relaxed text-slate-700">
              Laptops, desktops, printers and CCTV from brands you know, plus honest repairs and
              custom PC builds from a team that has served Narayanghat for over a decade.
            </p>

            <div className="hero-fade mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
              <button
                onClick={() => scrollToSection('products')}
                className="group inline-flex items-center justify-center gap-2 rounded-md bg-primary-500 px-7 py-3.5 text-[15px] font-semibold text-white shadow-[0_8px_24px_-8px_rgba(15,82,186,0.6)] transition-colors duration-200 hover:bg-primary-700"
              >
                Visit Our Store
                <ArrowRight size={17} className="transition-transform duration-200 group-hover:translate-x-1" />
              </button>
              <button
                onClick={() => scrollToSection('contact')}
                className="inline-flex items-center justify-center rounded-md border border-slate-300 bg-white px-7 py-3.5 text-[15px] font-semibold text-ink transition-colors duration-200 hover:border-ink"
              >
                Get a Free Quote
              </button>
            </div>

            <a
              href={business.phones[0].href}
              className="hero-fade mt-6 inline-flex items-center gap-2 text-sm text-slate-600 transition-colors hover:text-ink"
            >
              <Phone size={15} />
              Or call us on <span className="font-semibold text-ink">{business.phones[0].label}</span>
            </a>
          </div>

          {/* Store photo */}
          <figure className="hero-media-wrap lg:col-span-6">
            <div className="relative">
              <div className="hero-frame absolute -right-3 -top-3 hidden h-full w-full rounded-lg border-2 border-primary-500/25 sm:block" />
              <div className="hero-media relative overflow-hidden rounded-lg shadow-[0_24px_60px_-24px_rgba(15,23,42,0.45)]">
                <img
                  src={shelves1600}
                  srcSet={`${shelves900} 900w, ${shelves1600} 1600w`}
                  sizes="(min-width: 1024px) 640px, 100vw"
                  width={1600}
                  height={900}
                  // Lowercase attribute: React 18 doesn't know the camelCase prop yet
                  {...{ fetchpriority: 'high' }}
                  alt="Shelves at Chitwan Computer stocked with UNV CCTV cameras, NVRs, UPS units, monitors and PC components"
                  className="hero-img aspect-[3/2] w-full scale-110 object-cover"
                />
              </div>
              {/* Festival-coloured pinned tag while a festival is on, the plain dark tag otherwise */}
              {festive ? (
                <span className="hero-tag absolute bottom-5 left-4">
                  <PinnedTag tilt={-3}>CCTV, NVRs, UPS &amp; PC parts — in stock</PinnedTag>
                </span>
              ) : (
                <span className="hero-tag absolute bottom-4 left-4 rounded bg-ink px-3 py-1.5 text-xs font-semibold text-white shadow-md">
                  CCTV, NVRs, UPS &amp; PC parts — in stock
                </span>
              )}
            </div>
            <figcaption className="mt-4 text-sm text-slate-600">Our showroom at {business.address.line1}.</figcaption>
          </figure>
        </div>

        {/* Key facts */}
        <dl className="mt-16 grid grid-cols-2 border-t border-slate-300 lg:mt-20 lg:grid-cols-4">
          {facts.map((fact, i) => (
            <div
              key={fact.label}
              className={`hero-fact py-7 pr-4 lg:py-9 ${i % 2 === 1 ? 'border-l border-slate-300 pl-4 lg:pl-8' : ''} ${
                i === 2 ? 'lg:border-l lg:border-slate-300 lg:pl-8' : ''
              } ${i >= 2 ? 'border-t border-slate-300 lg:border-t-0' : ''}`}
            >
              <dt className="font-display text-2xl font-semibold text-ink sm:text-[1.7rem]">
                {fact.value !== null ? (
                  <>
                    <span className="hero-count tabular-nums">{fact.value}</span>
                    {fact.suffix}
                  </>
                ) : (
                  fact.text
                )}
              </dt>
              <dd className="mt-1 text-sm text-slate-600">{fact.label}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
};

export default Hero;
