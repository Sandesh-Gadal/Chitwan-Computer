import React from 'react';
import Reveal from './Reveal';

interface SectionHeadingProps {
  title: React.ReactNode;
  intro?: React.ReactNode;
  aside?: React.ReactNode;
}

const SectionHeading: React.FC<SectionHeadingProps> = ({ title, intro, aside }) => (
  <Reveal className="mb-12 grid gap-6 lg:mb-16 lg:grid-cols-12 lg:items-end lg:gap-12">
    <h2 className="font-display text-3xl font-semibold leading-[1.08] text-ink sm:text-4xl lg:col-span-7 lg:text-[2.75rem]">
      {title}
    </h2>
    {(intro || aside) && (
      <div className="lg:col-span-5">
        {intro && <p className="text-base leading-relaxed text-slate-600 sm:text-lg">{intro}</p>}
        {aside}
      </div>
    )}
  </Reveal>
);

export default SectionHeading;
