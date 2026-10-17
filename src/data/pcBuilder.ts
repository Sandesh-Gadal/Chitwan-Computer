// Options for the 3D PC builder (/build-pc).
//
// Parts the store lists online (RAM, graphics cards, storage, monitors) are picked
// from the live catalogue with real prices. Parts that aren't listed yet (CPU,
// motherboard, cooler, power supply, case) are picked by tier and priced in the
// quote. When those categories are added in admin, they can move to the catalogue.

export interface TierOption {
  id: string;
  label: string;
  note: string;
}

export const cpuTiers: TierOption[] = [
  { id: 'i3', label: 'Intel Core i3 / AMD Ryzen 3', note: 'Office, study and browsing' },
  { id: 'i5', label: 'Intel Core i5 / AMD Ryzen 5', note: 'Gaming and everyday work' },
  { id: 'i7', label: 'Intel Core i7 / AMD Ryzen 7', note: 'Editing, streaming, heavy games' },
  { id: 'i9', label: 'Intel Core i9 / AMD Ryzen 9', note: '3D, rendering, no compromises' },
];

export const boardTiers: TierOption[] = [
  { id: 'standard', label: 'Standard', note: 'Matched to your processor' },
  { id: 'wifi', label: 'With Wi-Fi & Bluetooth', note: 'No network cable needed' },
  { id: 'premium', label: 'Premium', note: 'Stronger power delivery, more ports' },
];

export type CoolerId = 'stock' | 'air' | 'aio240' | 'aio360';

export const coolerOptions: (TierOption & { id: CoolerId })[] = [
  { id: 'stock', label: 'Stock cooler', note: 'Comes with the processor' },
  { id: 'air', label: 'Tower air cooler', note: 'Quieter, cooler under load' },
  { id: 'aio240', label: '240mm liquid cooler', note: 'For i7 / Ryzen 7 class' },
  { id: 'aio360', label: '360mm liquid cooler', note: 'For i9 / Ryzen 9 class' },
];

export const psuOptions: TierOption[] = [
  { id: '550', label: '550W', note: 'Office builds, entry graphics' },
  { id: '650', label: '650W', note: 'Most gaming builds' },
  { id: '750', label: '750W', note: 'High-end graphics cards' },
  { id: '850', label: '850W+', note: 'Top-end, room to upgrade' },
];

export type CaseStyle = 'glass' | 'airflow' | 'compact';

export const caseOptions: (TierOption & { id: CaseStyle })[] = [
  { id: 'glass', label: 'Glass mid tower', note: 'Show off the inside' },
  { id: 'airflow', label: 'Airflow mesh tower', note: 'Runs cooler, glass side' },
  { id: 'compact', label: 'Compact tower', note: 'Fits a small desk' },
];

export type CaseColor = 'black' | 'white';

export const rgbColors = [
  { hex: '#3B82F6', name: 'Blue' },
  { hex: '#22D3EE', name: 'Cyan' },
  { hex: '#A855F7', name: 'Purple' },
  { hex: '#F43F5E', name: 'Red' },
  { hex: '#F6B451', name: 'Gold' },
  { hex: '#34D399', name: 'Green' },
  { hex: '#F8FAFC', name: 'White' },
];

export interface Build {
  cpu?: string;
  board: string;
  cooler?: CoolerId;
  ram?: number;
  /** Product id, or 'none' for the processor's built-in graphics */
  gpu?: number | 'none';
  storage?: number;
  psu?: string;
  caseStyle: CaseStyle;
  color: CaseColor;
  rgb: string;
  monitor?: number;
}

export const emptyBuild: Build = { board: 'standard', caseStyle: 'glass', color: 'black', rgb: rgbColors[0].hex };

export type UseCase = 'office' | 'gaming' | 'creator';

/**
 * Starting points. Tiers are fixed; catalogue parts are picked by position in the
 * price-sorted list (0 = cheapest, 1 = most expensive), so presets keep working as
 * stock changes.
 */
export const presets: Record<
  UseCase,
  { label: string; note: string; cpu: string; board: string; cooler: CoolerId; psu: string; caseStyle: CaseStyle; ram: number; gpu: number | null; storage: number }
> = {
  office: { label: 'Office & study', note: 'Quiet, reliable, great value', cpu: 'i3', board: 'standard', cooler: 'stock', psu: '550', caseStyle: 'compact', ram: 0, gpu: null, storage: 0 },
  gaming: { label: 'Gaming', note: 'High frame rates at 1080p', cpu: 'i5', board: 'wifi', cooler: 'air', psu: '650', caseStyle: 'glass', ram: 0.5, gpu: 0.5, storage: 0.5 },
  creator: { label: 'Editing & streaming', note: 'Power for Premiere, OBS and 3D', cpu: 'i7', board: 'premium', cooler: 'aio240', psu: '850', caseStyle: 'airflow', ram: 1, gpu: 1, storage: 1 },
};

/* ------------------------------------------------------------------------- */
/* Shareable link: the whole build lives in the URL                           */
/* ------------------------------------------------------------------------- */

const num = (v: string | null) => (v && /^\d+$/.test(v) ? Number(v) : undefined);
const oneOf = <T extends string>(v: string | null, list: readonly T[]) => (v && (list as readonly string[]).includes(v) ? (v as T) : undefined);

export const buildFromParams = (p: URLSearchParams): Build => ({
  cpu: oneOf(p.get('cpu'), cpuTiers.map((t) => t.id)),
  board: oneOf(p.get('board'), boardTiers.map((t) => t.id)) ?? emptyBuild.board,
  cooler: oneOf(p.get('cooler'), coolerOptions.map((t) => t.id)),
  ram: num(p.get('ram')),
  gpu: p.get('gpu') === 'none' ? 'none' : num(p.get('gpu')),
  storage: num(p.get('storage')),
  psu: oneOf(p.get('psu'), psuOptions.map((t) => t.id)),
  caseStyle: oneOf(p.get('case'), caseOptions.map((t) => t.id)) ?? emptyBuild.caseStyle,
  color: oneOf(p.get('color'), ['black', 'white'] as const) ?? emptyBuild.color,
  rgb: rgbColors.find((c) => c.hex.slice(1).toLowerCase() === p.get('rgb')?.toLowerCase())?.hex ?? emptyBuild.rgb,
  monitor: num(p.get('monitor')),
});

export const buildToParams = (b: Build): URLSearchParams => {
  const p = new URLSearchParams();
  if (b.cpu) p.set('cpu', b.cpu);
  if (b.board !== emptyBuild.board) p.set('board', b.board);
  if (b.cooler) p.set('cooler', b.cooler);
  if (b.ram) p.set('ram', String(b.ram));
  if (b.gpu) p.set('gpu', String(b.gpu));
  if (b.storage) p.set('storage', String(b.storage));
  if (b.psu) p.set('psu', b.psu);
  if (b.caseStyle !== emptyBuild.caseStyle) p.set('case', b.caseStyle);
  if (b.color !== emptyBuild.color) p.set('color', b.color);
  if (b.rgb !== emptyBuild.rgb) p.set('rgb', b.rgb.slice(1));
  if (b.monitor) p.set('monitor', String(b.monitor));
  return p;
};
