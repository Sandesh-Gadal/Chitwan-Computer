import React, { useLayoutEffect, useRef } from 'react';
import { ShieldCheck, BadgeCheck, Zap } from 'lucide-react';
import logo from '../assets/logo.png';
import { business } from '../data/business';
import { gsap, MOTION_OK } from '../lib/gsap';

const notes = [
  {
    icon: ShieldCheck,
    title: 'Quality assured',
    text: 'Every product and service is backed by warranty and support.',
    tone: 'bg-primary-50 text-primary-700',
    tilt: '-rotate-3',
  },
  {
    icon: BadgeCheck,
    title: 'Certified technicians',
    text: 'Trained on HP, Dell and Lenovo hardware.',
    tone: 'bg-orange-50 text-orange-700',
    tilt: 'rotate-2',
  },
  {
    icon: Zap,
    title: 'Quick turnaround',
    text: 'Most repairs are done within 24–48 hours.',
    tone: 'bg-emerald-50 text-emerald-700',
    tilt: '-rotate-1',
  },
];

const notePositions = ['lg:left-0 lg:top-4', 'lg:right-0 lg:top-24', 'lg:left-16 lg:top-[300px]'];
const stampText = `HONEST ADVICE • FAIR PRICES • SINCE ${business.since} • `;

const About: React.FC = () => {
  const root = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const mm = gsap.matchMedia(root);
    mm.add(MOTION_OK, () => {
      const trigger = { trigger: root.current, start: 'top 70%' };

      gsap.from('.about-copy', { y: 30, opacity: 0, duration: 0.8, ease: 'power3.out', stagger: 0.1, scrollTrigger: trigger });
      gsap.fromTo('.about-mark', { scaleX: 0 }, { scaleX: 1, duration: 0.8, ease: 'power2.out', delay: 0.5, scrollTrigger: trigger });
      gsap.from('.about-stamp', { scale: 0, rotate: -120, duration: 1, ease: 'back.out(1.6)', delay: 0.4, scrollTrigger: trigger });

      // Notes drop onto the board one by one
      gsap.from('.about-note', {
        y: -80,
        opacity: 0,
        rotate: (i: number) => [-14, 12, -10][i] ?? 0,
        duration: 0.9,
        ease: 'back.out(1.7)',
        stagger: 0.18,
        scrollTrigger: { trigger: '.about-notes', start: 'top 80%' },
      });

      gsap.fromTo(
        '.about-arrow path',
        { strokeDashoffset: 200 },
        { strokeDashoffset: 0, duration: 1, ease: 'power2.inOut', delay: 0.9, scrollTrigger: trigger }
      );
    });
    return () => mm.revert();
  }, []);

  return (
    <section id="about" ref={root} className="overflow-hidden bg-white py-20 lg:py-28">
      <div className="mx-auto grid max-w-7xl items-center gap-16 px-4 sm:px-6 lg:grid-cols-12 lg:gap-10 lg:px-8">
        {/* Story */}
        <div className="relative lg:col-span-6">
          <h2 className="about-copy font-display text-3xl font-semibold leading-[1.1] text-ink sm:text-4xl lg:text-[2.9rem]">
            A local store built on{' '}
            <span className="relative inline-block whitespace-nowrap">
              <span
                aria-hidden="true"
                className="about-mark absolute -inset-x-1 bottom-1 top-[45%] origin-left -rotate-1 rounded-sm bg-orange-200"
              />
              <span className="relative">honest advice</span>
            </span>{' '}
            since {business.since}.
          </h2>

          <p className="about-copy mt-6 max-w-lg text-lg leading-relaxed text-slate-700">
            We help people across Chitwan pick the right technology and keep it running, with fair prices
            and straight answers.
          </p>

          <div className="about-copy mt-10 flex items-center gap-6">
            {/* Rotating stamp */}
            <div className="about-stamp relative h-32 w-32 flex-shrink-0">
              <svg viewBox="0 0 120 120" className="h-full w-full animate-[spin_18s_linear_infinite] motion-reduce:animate-none">
                <defs>
                  <path id="stamp-circle" d="M60,60 m-46,0 a46,46 0 1,1 92,0 a46,46 0 1,1 -92,0" />
                </defs>
                <text className="fill-ink text-[9.5px] font-semibold">
                  <textPath href="#stamp-circle" textLength="286" lengthAdjust="spacing">
                    {stampText}
                  </textPath>
                </text>
              </svg>
              <img
                src={logo}
                alt=""
                className="absolute left-1/2 top-1/2 h-14 w-14 -translate-x-1/2 -translate-y-1/2 rounded-full object-contain"
              />
            </div>
            <p className="font-display text-lg leading-snug text-slate-700">
              Same shop, same people,
              <br />
              <span className="font-semibold text-ink">{new Date().getFullYear() - business.since}+ years</span> later.
            </p>
          </div>

          {/* Hand-drawn arrow toward the notes */}
          <svg
            aria-hidden="true"
            viewBox="0 0 120 80"
            className="about-arrow absolute -right-4 bottom-6 hidden h-20 w-28 text-primary-500 lg:block"
          >
            <path
              d="M6 60 C 30 70, 70 66, 96 30 M84 30 L97 28 L95 42"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="200"
            />
          </svg>
        </div>

        {/* Sticky notes */}
        <ul className="about-notes relative grid gap-8 sm:grid-cols-2 lg:col-span-6 lg:block lg:h-[500px]">
          {notes.map(({ icon: Icon, title, text, tone, tilt }, i) => (
            <li key={title} className={`about-note lg:absolute lg:w-[300px] ${notePositions[i]}`}>
              <div
                className={`relative ${tilt} rounded-lg border border-slate-200 bg-white p-6 shadow-[0_14px_30px_-14px_rgba(15,23,42,0.3)] transition-transform duration-300 hover:-translate-y-1 hover:rotate-0`}
              >
                {/* Tape strip */}
                <span
                  aria-hidden="true"
                  className="absolute -top-3 left-1/2 h-6 w-16 -translate-x-1/2 rotate-2 rounded-sm bg-slate-300/70"
                />
                <span className={`flex h-11 w-11 items-center justify-center rounded-lg ${tone}`}>
                  <Icon size={21} />
                </span>
                <h3 className="mt-4 font-display text-lg font-semibold text-ink">{title}</h3>
                <p className="mt-1.5 text-[15px] leading-relaxed text-slate-600">{text}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};

export default About;
