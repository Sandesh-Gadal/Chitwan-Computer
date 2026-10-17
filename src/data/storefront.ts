import storeShelves from '../assets/store-shelves-1600.jpg';
import customPc from '../assets/slides/custom-pc.jpg';
import deskSetup from '../assets/slides/desk-setup.jpg';
import { activeFestival } from './festival';

// Hand-written storefront content. Edit here to change the homepage slider.

export interface Slide {
  id: string;
  /** Photo; festival slides use their festival's drawn scene instead */
  image?: string;
  /** Set on the festival slide, the id of its festival */
  festival?: string;
  /** Where the subject sits in the photo, so it isn't cropped away on phones */
  focus: string;
  eyebrow: string;
  title: string;
  text: string;
  cta: { label: string; to: string };
}

const photoSlides: Slide[] = [
  {
    id: 'cctv',
    image: storeShelves,
    focus: '70% 40%',
    eyebrow: 'CCTV & security',
    title: 'Cameras, recorders and cabling, on the shelf today.',
    text: 'Dome, bullet and Wi-Fi cameras with NVRs to match. We can install them for you too.',
    cta: { label: 'Shop CCTV cameras', to: '/products?category=cctv-cameras' },
  },
  {
    id: 'custom-pc',
    image: customPc,
    focus: '60% 50%',
    eyebrow: 'Custom builds',
    title: 'Tell us what you play or render. We’ll build around it.',
    text: 'Parts picked for your budget, assembled and stress-tested in our workshop before you collect.',
    cta: { label: 'Browse desktops', to: '/products?category=desktops' },
  },
  {
    id: 'workspace',
    image: deskSetup,
    focus: '55% 45%',
    eyebrow: 'Monitors & desk setups',
    title: 'A better screen changes the whole workday.',
    text: 'Office, design and high-refresh gaming monitors, plus keyboards, mice and speakers.',
    cta: { label: 'Shop monitors', to: '/products?category=monitors' },
  },
];

// While a festival is on, its slide (from festival.ts) leads the slider
export const slides: Slide[] = (() => {
  const festival = activeFestival();
  if (!festival) return photoSlides;
  return [{ id: festival.id, festival: festival.id, focus: '50% 50%', ...festival.slide }, ...photoSlides];
})();

/** Categories featured in the two promo banners, by slug */
export const promoCategories = [
  { slug: 'laptops', line: 'For work, study and everything after.' },
  { slug: 'printers', line: 'Ink tank, laser and all-in-one.' },
];
