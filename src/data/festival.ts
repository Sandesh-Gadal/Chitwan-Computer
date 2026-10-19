// Seasonal theming. Each festival switches itself on and off by date, so nothing
// needs removing by hand once it's over. Dates are Nepal time.
//
// To add another festival (Tihar, Chhath, New Year…):
//   1. Add an entry below with its dates, wording and colours.
//   2. Register its icons under the same id in src/components/festival/registry.tsx
//      (the small mark, the icons scattered on its slide, the ones in the page margin).
//      New icons go in src/components/festival/icons.tsx.
// Everything festive on the site (greeting bar, slide, pinned offer tags, deal
// labels, footer greeting, margin icons) then follows automatically.

export interface Festival {
  id: string;
  name: string;
  /** First day shown (inclusive), YYYY-MM-DD */
  start: string;
  /** Last day shown (inclusive), YYYY-MM-DD */
  end: string;
  greeting: { ne: string; en: string };
  note: string;
  theme: {
    /** Darkest shade, for text panels and scrims */
    deep: string;
    /** Main festival colour, for the greeting bar */
    base: string;
    /** Light text on the festival colour */
    cream: string;
    /** Highlight colour */
    accent: string;
    /** Daytime sky for the festival slide (top, horizon). Without it the slide is deep → base. */
    sky?: { top: string; horizon: string };
  };
  /** First slide in the homepage slider while the festival is on */
  slide: { eyebrow: string; title: string; text: string; cta: { label: string; to: string } };
  /** Replaces "Deal" and "Price drops" while the festival is on */
  dealLabel: string;
  dealsTitle: string;
}

export const festivals: Festival[] = [
  {
    // Dashain 2083: Ghatasthapana 11 Oct, Vijaya Dashami (Tika) 21 Oct, Kojagrat Purnima 25 Oct 2026
    id: 'dashain',
    name: 'Dashain',
    start: '2026-10-11',
    end: '2026-10-25',
    greeting: { ne: 'विजया दशमी २०८३ को हार्दिक मंगलमय शुभकामना', en: 'Happy Vijaya Dashami' },
    note: 'Tika falls on Wednesday, 21 October.',
    theme: {
      deep: '#3A0D0F',
      base: '#5C1416',
      cream: '#FBE7C2',
      accent: '#F6B451',
      sky: { top: '#7DC0EA', horizon: '#E4F3FC' },
    },
    slide: {
      eyebrow: 'Dashain 2083',
      title: 'Going home for Dashain? Leave a camera watching.',
      text: 'Wi-Fi cameras you can check from your phone while the house is empty. We’ll fit them before you leave.',
      cta: { label: 'Shop CCTV cameras', to: '/products?category=cctv-cameras' },
    },
    dealLabel: 'Dashain deal',
    dealsTitle: 'Dashain price drops',
  },
];

// Today's date in Nepal (UTC+5:45), as YYYY-MM-DD, so the switch-over happens at local midnight
const nepalToday = () => new Date(Date.now() + (5 * 60 + 45) * 60_000).toISOString().slice(0, 10);

export const activeFestival = (): Festival | undefined => {
  // ?festival=<id> previews a festival's theme outside its dates
  const preview = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('festival') : null;
  if (preview) return festivals.find((f) => f.id === preview);
  const today = nepalToday();
  return festivals.find((f) => today >= f.start && today <= f.end);
};
