import React, { useLayoutEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { gsap, ScrollTrigger, MOTION_OK } from '../lib/gsap';
import dell from '../assets/brands/dell.svg';
import hp from '../assets/brands/hp.svg';
import lenovo from '../assets/brands/lenovo.svg';
import asus from '../assets/brands/asus.svg';
import acer from '../assets/brands/acer.svg';
import msi from '../assets/brands/msi.svg';
import intel from '../assets/brands/intel.svg';
import nvidia from '../assets/brands/nvidia.svg';
import unv from '../assets/brands/unv.svg';
import brother from '../assets/brands/brother.svg';

// ratio = width / height of each cropped logo, used to balance their visual size
const brands = [
  { name: 'Dell', src: dell, ratio: 1, to: '/products?brand=dell' },
  { name: 'HP', src: hp, ratio: 1, to: '/products?brand=hp' },
  { name: 'Lenovo', src: lenovo, ratio: 3, to: '/products?brand=lenovo' },
  { name: 'ASUS', src: asus, ratio: 4.84, to: '/products?brand=asus' },
  { name: 'Acer', src: acer, ratio: 4.15, to: '/products?brand=acer' },
  { name: 'MSI', src: msi, ratio: 0.82, to: '/products?brand=msi' },
  { name: 'Intel', src: intel, ratio: 2.58, to: '/products?q=Intel' },
  { name: 'NVIDIA', src: nvidia, ratio: 1.51, to: '/products?q=NVIDIA' },
  { name: 'Uniview (UNV)', src: unv, ratio: 2, to: '/products?brand=unv' },
  { name: 'Brother', src: brother, ratio: 4.55, to: '/products?brand=brother' },
];

// Wide wordmarks get shorter, square emblems taller, so they read at a similar size
const logoHeight = (ratio: number) => Math.round(Math.min(44, 46 / Math.sqrt(ratio)));

const Brands: React.FC = () => {
  const root = useRef<HTMLElement>(null);
  const track = useRef<HTMLUListElement>(null);

  useLayoutEffect(() => {
    const mm = gsap.matchMedia(root);

    mm.add(MOTION_OK, () => {
      // Track holds two copies of the list, so moving it -50% loops seamlessly
      const loop = gsap.to(track.current, { xPercent: -50, ease: 'none', duration: 35, repeat: -1 });
      loop.totalTime(loop.duration() * 50);

      // Follow scroll direction and speed up briefly with scroll velocity
      ScrollTrigger.create({
        onUpdate: (self) => {
          const boost = 1 + Math.min(Math.abs(self.getVelocity()) / 300, 4);
          gsap.to(loop, { timeScale: self.direction * boost, duration: 0.2, overwrite: true });
          gsap.to(loop, { timeScale: self.direction, duration: 1.2, delay: 0.2, ease: 'power2.out' });
        },
      });

      // Ease to a stop while hovered so a logo can be looked at
      const el = root.current!;
      const pause = () => gsap.to(loop, { timeScale: 0, duration: 0.6, overwrite: true });
      const resume = () => gsap.to(loop, { timeScale: 1, duration: 0.6, overwrite: true });
      el.addEventListener('mouseenter', pause);
      el.addEventListener('mouseleave', resume);
      return () => {
        el.removeEventListener('mouseenter', pause);
        el.removeEventListener('mouseleave', resume);
      };
    });

    return () => mm.revert();
  }, []);

  const row = (copy: number) =>
    brands.map((brand) => (
      <li key={`${copy}-${brand.name}`} className="flex flex-shrink-0 items-center px-8 sm:px-12" aria-hidden={copy > 0}>
        <Link to={brand.to} tabIndex={copy > 0 ? -1 : undefined} title={`Shop ${brand.name}`}>
          <img
            src={brand.src}
            alt={copy === 0 ? `Shop ${brand.name}` : ''}
            style={{ height: logoHeight(brand.ratio) }}
            className="w-auto transition-transform duration-300 hover:scale-110"
            loading="lazy"
          />
        </Link>
      </li>
    ));

  return (
    <section ref={root} aria-label="Brands we sell and service" className="border-y border-slate-200 bg-white py-10 sm:py-12">
      <p className="mx-auto max-w-7xl px-4 text-center text-sm font-medium text-slate-600 sm:px-6 lg:px-8">
        Genuine products from the brands you trust
      </p>
      <div
        className="mt-8 overflow-hidden"
        style={{
          maskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)',
          WebkitMaskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)',
        }}
      >
        <ul ref={track} className="flex h-12 w-max items-center">
          {row(0)}
          {row(1)}
        </ul>
      </div>
    </section>
  );
};

export default Brands;
