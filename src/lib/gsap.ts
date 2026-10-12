import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// Images change page height once loaded, so recalculate trigger positions
if (typeof window !== 'undefined') {
  window.addEventListener('load', () => ScrollTrigger.refresh());
}

// Wrap animations so visitors who prefer reduced motion get static content
export const MOTION_OK = '(prefers-reduced-motion: no-preference)';

export { gsap, ScrollTrigger };
