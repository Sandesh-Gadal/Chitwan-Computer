import React, { useLayoutEffect, useRef } from 'react';
import { ArrowRight, Phone } from 'lucide-react';
import { gsap, MOTION_OK } from '../lib/gsap';
import { business } from '../data/business';

const points = [
  {
    title: 'Genuine, warrantied hardware',
    text: 'Everything is sourced from authorised distributors and comes with proper manufacturer warranty.',
  },
  {
    title: 'Advice before the sale',
    text: 'We ask what you need it for first, then recommend what fits your work and your budget.',
  },
  {
    title: 'Repairs in 24–48 hours',
    text: 'Most laptops, desktops and printers are diagnosed and fixed in-house within two days.',
  },
  {
    title: 'Support after you buy',
    text: `Same team, same store since ${business.since}. Bring it back any time you need help.`,
  },
];

const statement = "Plenty of shops sell computers. We'd rather be the one you trust to tell you what you actually need.";

const WhyChooseUs: React.FC = () => {
  const root = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const mm = gsap.matchMedia(root);

    mm.add(MOTION_OK, () => {
      // Statement brightens word by word as it scrolls into view
      gsap.fromTo(
        '.why-word',
        { opacity: 0.2 },
        {
          opacity: 1,
          ease: 'none',
          stagger: 0.1,
          scrollTrigger: { trigger: '.why-statement', start: 'top 85%', end: 'top 40%', scrub: true },
        }
      );

      // Each row: divider draws across, then the text settles in
      gsap.utils.toArray<HTMLElement>('.why-row').forEach((row) => {
        const tl = gsap.timeline({ scrollTrigger: { trigger: row, start: 'top 88%' } });
        tl.from(row.querySelector('.why-rule'), { scaleX: 0, duration: 0.9, ease: 'power3.inOut' }).from(
          row.querySelectorAll('.why-text'),
          { y: 20, opacity: 0, duration: 0.6, stagger: 0.08, ease: 'power3.out' },
          '-=0.5'
        );
      });
    });

    return () => mm.revert();
  }, []);

  return (
    <section id="why-us" ref={root} className="bg-ink py-20 lg:py-32">
      <div className="mx-auto grid max-w-7xl gap-14 px-4 sm:px-6 lg:grid-cols-12 lg:gap-16 lg:px-8">
        {/* Statement */}
        <div className="lg:col-span-5">
          <div className="lg:sticky lg:top-32">
            <h2 className="why-statement font-display text-3xl font-semibold leading-[1.15] text-white sm:text-4xl lg:text-[2.6rem]">
              {statement.split(' ').map((word, i) => (
                <React.Fragment key={i}>
                  <span className={`why-word ${word === 'trust' ? 'text-orange-400' : ''}`}>{word}</span>{' '}
                </React.Fragment>
              ))}
            </h2>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center">
              <button
                onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
                className="group inline-flex items-center justify-center gap-2 rounded-md bg-white px-6 py-3 text-[15px] font-semibold text-ink transition-colors hover:bg-orange-400"
              >
                Talk to us
                <ArrowRight size={17} className="transition-transform group-hover:translate-x-1" />
              </button>
              <a
                href={business.phones[0].href}
                className="inline-flex items-center gap-2 text-[15px] text-slate-300 transition-colors hover:text-white"
              >
                <Phone size={16} />
                {business.phones[0].label}
              </a>
            </div>
          </div>
        </div>

        {/* Points */}
        <ul className="lg:col-span-7">
          {points.map(({ title, text }) => (
            <li key={title} className="why-row group relative">
              <span className="why-rule block h-px origin-left bg-white/20" />
              <div className="grid gap-3 py-8 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)] sm:gap-10 lg:py-10">
                <h3 className="why-text font-display text-xl font-semibold text-white sm:text-2xl">
                  <span className="relative inline-block transition-transform duration-300 group-hover:translate-x-3">
                    <span
                      aria-hidden="true"
                      className="absolute -left-3 top-1/2 h-0 w-[3px] -translate-y-1/2 rounded-full bg-orange-400 transition-all duration-300 group-hover:h-6"
                    />
                    {title}
                  </span>
                </h3>
                <p className="why-text leading-relaxed text-slate-300">{text}</p>
              </div>
            </li>
          ))}
          <li aria-hidden="true" className="h-px bg-white/20" />
        </ul>
      </div>
    </section>
  );
};

export default WhyChooseUs;
