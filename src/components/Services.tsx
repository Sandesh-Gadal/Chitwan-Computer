import React, { useLayoutEffect, useRef } from 'react';
import { ArrowUpRight, Wrench, Cpu, Laptop, Cctv } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import SectionHeading from './ui/SectionHeading';
import { gsap, MOTION_OK } from '../lib/gsap';

const Services: React.FC = () => {
  const root = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const scrollToContact = () => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
  const goToProducts = () => {
    navigate('/products');
    window.scrollTo({ top: 0 });
  };

  const services = [
    {
      icon: Wrench,
      title: 'Repair & maintenance',
      text: 'Laptops, desktops and printers fixed in-house.',
      tag: '24–48 hrs',
      onClick: scrollToContact,
    },
    {
      icon: Cpu,
      title: 'Custom PC builds',
      text: 'Built around your work, games and budget.',
      onClick: scrollToContact,
    },
    {
      icon: Laptop,
      title: 'Laptops & desktops',
      text: 'Leading brands, honest advice, fair prices.',
      onClick: goToProducts,
    },
    {
      icon: Cctv,
      title: 'Printers & CCTV',
      text: 'Supplied and installed for homes and shops.',
      onClick: scrollToContact,
    },
  ];

  useLayoutEffect(() => {
    const mm = gsap.matchMedia(root);
    mm.add(MOTION_OK, () => {
      gsap.from('.svc-card', {
        y: 50,
        opacity: 0,
        duration: 0.8,
        ease: 'power3.out',
        stagger: 0.1,
        scrollTrigger: { trigger: root.current, start: 'top 80%' },
      });
    });
    return () => mm.revert();
  }, []);

  return (
    <section id="services" className="bg-paper py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          title="Everything your devices need, under one roof."
          intro="Sales, custom builds and repairs, all handled in-house at our store."
        />

        <div ref={root} className="grid gap-4 sm:grid-cols-2 lg:gap-5">
          {services.map(({ icon: Icon, title, text, tag, onClick }) => (
            <div key={title} className="svc-card">
              <button
                onClick={onClick}
                className="group flex h-full w-full items-center gap-5 rounded-xl border border-slate-200 bg-white p-6 text-left transition-all duration-300 hover:-translate-y-0.5 hover:border-primary-500 hover:shadow-[0_12px_32px_-16px_rgba(15,82,186,0.35)] sm:p-8"
              >
                <span className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-600 transition-colors duration-300 group-hover:bg-primary-500 group-hover:text-white">
                  <Icon size={26} strokeWidth={1.7} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-center gap-2">
                    <span className="font-display text-xl font-semibold text-ink">{title}</span>
                    {tag && (
                      <span className="rounded-full bg-orange-50 px-2.5 py-0.5 text-xs font-semibold text-orange-700">{tag}</span>
                    )}
                  </span>
                  <span className="mt-1.5 block text-[15px] text-slate-600">{text}</span>
                </span>
                <ArrowUpRight
                  size={22}
                  className="flex-shrink-0 text-slate-400 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary-500"
                />
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;
