import React, { Suspense, lazy, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useReducedMotion } from 'motion/react';
import {
  Box,
  Check,
  ChevronDown,
  CircuitBoard,
  Cpu,
  Download,
  Fan,
  HardDrive,
  Layers,
  Link2,
  MemoryStick,
  Monitor,
  RotateCcw,
  Zap,
} from 'lucide-react';
import Seo, { breadcrumbSchema } from '../components/Seo';
import WhatsAppIcon from '../components/ui/WhatsAppIcon';
import { Product, formatPrice, priceValue, productImage, stockLabel, stockStatus, useProductPage } from '../api/products';
import { whatsappLink } from '../data/business';
import {
  boardTiers,
  Build,
  buildFromParams,
  buildToParams,
  caseOptions,
  coolerOptions,
  cpuTiers,
  emptyBuild,
  presets,
  psuOptions,
  rgbColors,
  TierOption,
  UseCase,
} from '../data/pcBuilder';
import type { SceneParts } from '../components/pcbuilder/PcScene';

// three.js only downloads when someone opens this page
const PcScene = lazy(() => import('../components/pcbuilder/PcScene'));

// Delay between parts when a preset assembles itself
const ASSEMBLE_STEP_MS = 260;

const hasWebGL = () => {
  try {
    const canvas = document.createElement('canvas');
    return !!(canvas.getContext('webgl2') || canvas.getContext('webgl'));
  } catch {
    return false;
  }
};

const useCatalog = (category: string) => {
  const { data, isLoading } = useProductPage({ category, perPage: 60, sort: 'price-asc' });
  // Only parts with a price can go into a quote total
  const items = useMemo(() => (data?.data ?? []).filter((p) => priceValue(p) !== null), [data]);
  return { items, isLoading };
};

const pickAt = (items: Product[], position: number | null) =>
  position === null || !items.length ? undefined : items[Math.round(position * (items.length - 1))];

const isHdd = (p?: Product) => !!p && /\b(hdd|hard (disk|drive))\b/i.test(p.name);

/* ------------------------------------------------------------------------- */
/* Slot UI                                                                    */
/* ------------------------------------------------------------------------- */

interface SlotProps {
  icon: React.ElementType;
  title: string;
  value?: string;
  price?: string;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

const Slot: React.FC<SlotProps> = ({ icon: Icon, title, value, price, open, onToggle, children }) => (
  <div className={`rounded-lg border bg-white transition-colors ${open ? 'border-ink' : 'border-slate-200'}`}>
    <button onClick={onToggle} aria-expanded={open} className="flex w-full items-center gap-4 p-4 text-left">
      <span
        className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-md ${
          value ? 'bg-primary-50 text-primary-600' : 'bg-slate-100 text-slate-500'
        }`}
      >
        <Icon size={20} strokeWidth={1.7} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">{title}</span>
        <span className={`mt-0.5 block truncate text-[15px] ${value ? 'font-semibold text-ink' : 'text-slate-500'}`}>
          {value ?? 'Choose…'}
        </span>
      </span>
      {price && <span className="flex-shrink-0 text-sm font-semibold text-ink">{price}</span>}
      <ChevronDown size={18} className={`flex-shrink-0 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
    </button>
    {open && <div className="border-t border-slate-100 p-2">{children}</div>}
  </div>
);

const TierList: React.FC<{ options: TierOption[]; value?: string; onPick: (id: string) => void }> = ({ options, value, onPick }) => (
  <ul className="space-y-1">
    {options.map((o) => (
      <li key={o.id}>
        <button
          onClick={() => onPick(o.id)}
          className={`flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left transition-colors ${
            value === o.id ? 'bg-primary-50' : 'hover:bg-paper'
          }`}
        >
          <span className="min-w-0 flex-1">
            <span className="block text-[15px] font-medium text-ink">{o.label}</span>
            <span className="block text-xs text-slate-500">{o.note}</span>
          </span>
          {value === o.id && <Check size={18} className="text-primary-600" />}
        </button>
      </li>
    ))}
  </ul>
);

const ProductList: React.FC<{
  items: Product[];
  loading: boolean;
  value?: number | 'none';
  onPick: (id: number | 'none' | undefined) => void;
  /** Extra first choice, e.g. "Built-in graphics" or "No monitor" */
  noneOption?: { label: string; note: string; value: 'none' | undefined };
}> = ({ items, loading, value, onPick, noneOption }) => (
  <ul className="max-h-80 space-y-1 overflow-y-auto">
    {noneOption && (
      <li>
        <button
          onClick={() => onPick(noneOption.value)}
          className={`flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left transition-colors ${
            value === noneOption.value ? 'bg-primary-50' : 'hover:bg-paper'
          }`}
        >
          <span className="flex-1">
            <span className="block text-[15px] font-medium text-ink">{noneOption.label}</span>
            <span className="block text-xs text-slate-500">{noneOption.note}</span>
          </span>
          {value === noneOption.value && <Check size={18} className="text-primary-600" />}
        </button>
      </li>
    )}
    {loading && <li className="px-3 py-4 text-sm text-slate-500">Loading parts in stock…</li>}
    {!loading && !items.length && <li className="px-3 py-4 text-sm text-slate-500">None listed right now. Ask us in your quote.</li>}
    {items.map((p) => {
      const status = stockStatus(p.quantity);
      return (
        <li key={p.id}>
          <button
            onClick={() => onPick(p.id)}
            className={`flex w-full items-center gap-3 rounded-md px-2 py-2 text-left transition-colors ${
              value === p.id ? 'bg-primary-50' : 'hover:bg-paper'
            }`}
          >
            <img src={productImage(p)} alt="" className="h-12 w-12 flex-shrink-0 rounded border border-slate-200 bg-white object-contain p-1" loading="lazy" />
            <span className="min-w-0 flex-1">
              <span className="line-clamp-2 text-sm font-medium leading-snug text-ink">{p.name}</span>
              <span className={`text-xs ${status === 'out' ? 'text-red-600' : 'text-slate-500'}`}>{stockLabel[status]}</span>
            </span>
            <span className="flex-shrink-0 text-sm font-semibold text-ink">{formatPrice(p.price)}</span>
            {value === p.id && <Check size={18} className="flex-shrink-0 text-primary-600" />}
          </button>
        </li>
      );
    })}
  </ul>
);

/* ------------------------------------------------------------------------- */
/* Page                                                                       */
/* ------------------------------------------------------------------------- */

type SlotId = 'cpu' | 'board' | 'cooler' | 'ram' | 'gpu' | 'storage' | 'psu' | 'case' | 'monitor';

const BuildPc: React.FC = () => {
  const [params, setParams] = useSearchParams();
  const [build, setBuild] = useState<Build>(() => buildFromParams(params));
  const [openSlot, setOpenSlot] = useState<SlotId | null>(null);
  const [notice, setNotice] = useState('');
  const reduceMotion = !!useReducedMotion();
  const [webgl] = useState(hasWebGL);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const assembly = useRef<number[]>([]);

  const ram = useCatalog('memory');
  const gpu = useCatalog('graphics-cards');
  const storage = useCatalog('storage-devices');
  const monitor = useCatalog('monitors');

  const find = (list: Product[], id?: number | 'none') => (typeof id === 'number' ? list.find((p) => p.id === id) : undefined);
  const picked = {
    ram: find(ram.items, build.ram),
    gpu: find(gpu.items, build.gpu),
    storage: find(storage.items, build.storage),
    monitor: find(monitor.items, build.monitor),
  };

  // Keep the build in the address bar so it can be shared or bookmarked
  useEffect(() => {
    setParams(buildToParams(build), { replace: true });
  }, [build]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => () => assembly.current.forEach(clearTimeout), []);

  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(() => setNotice(''), 2500);
    return () => clearTimeout(t);
  }, [notice]);

  const update = (changes: Partial<Build>) => {
    assembly.current.forEach(clearTimeout);
    setBuild((b) => ({ ...b, ...changes }));
  };

  const choose = (changes: Partial<Build>) => {
    update(changes);
    setOpenSlot(null);
  };

  // Presets drop in one part at a time, so the PC visibly assembles itself
  const applyPreset = (use: UseCase) => {
    const p = presets[use];
    assembly.current.forEach(clearTimeout);
    const gpuPick = pickAt(gpu.items, p.gpu);
    const steps: Partial<Build>[] = [
      { caseStyle: p.caseStyle },
      { cpu: p.cpu, board: p.board },
      { cooler: p.cooler },
      { ram: pickAt(ram.items, p.ram)?.id },
      { storage: pickAt(storage.items, p.storage)?.id },
      { gpu: gpuPick ? gpuPick.id : 'none' },
      { psu: p.psu },
    ];
    setBuild((b) => ({ ...emptyBuild, color: b.color, rgb: b.rgb }));
    setOpenSlot(null);
    const delay = reduceMotion ? 0 : ASSEMBLE_STEP_MS;
    assembly.current = steps.map((step, i) => window.setTimeout(() => setBuild((b) => ({ ...b, ...step })), delay * (i + 1)));
  };

  const reset = () => {
    assembly.current.forEach(clearTimeout);
    setBuild((b) => ({ ...emptyBuild, color: b.color, rgb: b.rgb }));
    setOpenSlot(null);
  };

  const sceneParts: SceneParts = {
    cpu: !!build.cpu,
    cooler: build.cooler ?? null,
    ram: !!picked.ram,
    gpu: picked.gpu ? { fans: (priceValue(picked.gpu) ?? 0) >= 50000 ? 3 : 2 } : null,
    storage: picked.storage ? (isHdd(picked.storage) ? 'hdd' : 'm2') : null,
    psu: !!build.psu,
    caseStyle: build.caseStyle,
    color: build.color,
    rgb: build.rgb,
  };

  const label = <T extends TierOption>(list: T[], id?: string) => list.find((o) => o.id === id)?.label;
  const caseLabel = label(caseOptions, build.caseStyle)!;
  const rgbName = rgbColors.find((c) => c.hex === build.rgb)?.name ?? 'Custom';

  const pricedParts = [picked.ram, picked.gpu, picked.storage, picked.monitor].filter((p): p is Product => !!p);
  const subtotal = pricedParts.reduce((sum, p) => sum + (priceValue(p) ?? 0), 0);
  const quotedCount = [build.cpu, build.board, build.cooler, build.psu, build.caseStyle].filter(Boolean).length;
  const ready = !!build.cpu;

  // Tips rather than hard rules: the team checks every build before quoting
  const tips: string[] = [];
  const gpuPrice = picked.gpu ? priceValue(picked.gpu) ?? 0 : 0;
  if (gpuPrice >= 60000 && build.psu && Number(build.psu) < 750) tips.push('This graphics card is happiest with a 750W or bigger power supply.');
  if ((build.cpu === 'i7' || build.cpu === 'i9') && build.cooler === 'stock') tips.push('An i7 / i9 class processor runs much cooler with a tower or liquid cooler.');
  if (build.cpu === 'i9' && build.cooler === 'aio240') tips.push('For i9 / Ryzen 9, a 360mm liquid cooler keeps temperatures in check.');

  const lines = [
    ['Processor', label(cpuTiers, build.cpu), 'quote'],
    ['Motherboard', label(boardTiers, build.board), 'quote'],
    ['Cooler', label(coolerOptions, build.cooler), 'quote'],
    ['RAM', picked.ram?.name, formatPrice(picked.ram?.price)],
    ['Graphics', build.gpu === 'none' ? 'Built-in graphics' : picked.gpu?.name, picked.gpu ? formatPrice(picked.gpu.price) : undefined],
    ['Storage', picked.storage?.name, formatPrice(picked.storage?.price)],
    ['Power supply', label(psuOptions, build.psu), 'quote'],
    ['Case', `${caseLabel}, ${build.color}, ${rgbName} lighting`, 'quote'],
    ['Monitor', picked.monitor?.name, formatPrice(picked.monitor?.price)],
  ].filter(([, value]) => value) as [string, string, string | undefined][];

  const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}/build-pc?${buildToParams(build)}` : '';

  const quoteMessage = [
    'Hi Chitwan Computer, please quote me for this PC build:',
    '',
    ...lines.map(([name, value, price]) => `• ${name}: ${value}${price === 'quote' ? ' (please quote)' : price ? ` (${price})` : ''}`),
    '',
    subtotal > 0 ? `Listed parts so far: ${formatPrice(subtotal)}` : '',
    `My build: ${shareUrl}`,
  ]
    .filter((line, i, all) => line !== '' || all[i - 1] !== '')
    .join('\n');

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setNotice('Link copied. Share it with anyone.');
    } catch {
      setNotice('Copy the link from the address bar.');
    }
  };

  // A 1200×630 card: the 3D render beside the parts list, ready for WhatsApp or Facebook
  const saveImage = async () => {
    const scene = canvasRef.current;
    const card = document.createElement('canvas');
    card.width = 1200;
    card.height = 630;
    const ctx = card.getContext('2d');
    if (!ctx) return;
    const bg = ctx.createLinearGradient(0, 0, 1200, 630);
    bg.addColorStop(0, '#0B1020');
    bg.addColorStop(1, '#151B2E');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, 1200, 630);
    if (scene) {
      const ratio = Math.min(620 / scene.width, 630 / scene.height);
      const w = scene.width * ratio;
      const h = scene.height * ratio;
      ctx.drawImage(scene, (640 - w) / 2, (630 - h) / 2, w, h);
    }
    ctx.fillStyle = build.rgb;
    ctx.fillRect(660, 64, 48, 4);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '600 38px "Bricolage Grotesque", system-ui, sans-serif';
    ctx.fillText('My PC build', 660, 118);
    ctx.font = '500 19px "Plus Jakarta Sans", system-ui, sans-serif';
    let y = 170;
    for (const [name, value] of lines.slice(0, 9)) {
      ctx.fillStyle = '#94A3B8';
      ctx.fillText(name, 660, y);
      ctx.fillStyle = '#E2E8F0';
      const text = value.length > 34 ? `${value.slice(0, 33)}…` : value;
      ctx.fillText(text, 820, y);
      y += 38;
    }
    ctx.fillStyle = '#94A3B8';
    ctx.font = '500 17px "Plus Jakarta Sans", system-ui, sans-serif';
    ctx.fillText('Built with Chitwan Computer · chitwancomputer.com.np/build-pc', 660, 592);

    const blob = await new Promise<Blob | null>((resolve) => card.toBlob(resolve, 'image/png'));
    if (!blob) return;
    const file = new File([blob], 'my-pc-build.png', { type: 'image/png' });
    if (navigator.canShare?.({ files: [file] })) {
      await navigator.share({ files: [file], title: 'My PC build', text: shareUrl }).catch(() => {});
      return;
    }
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'my-pc-build.png';
    a.click();
    URL.revokeObjectURL(url);
    setNotice('Image saved.');
  };

  const toggle = (id: SlotId) => setOpenSlot((s) => (s === id ? null : id));

  return (
    <section className="min-h-screen bg-paper pb-24">
      <Seo
        title="Custom PC Builder Nepal | Build Your Gaming PC in 3D | Chitwan Computer"
        description="Build your own gaming or editing PC in 3D. Pick the processor, graphics card, RAM, storage and case, see it come together, and get a quote from Chitwan Computer, Narayanghat."
        path="/build-pc"
        schema={breadcrumbSchema([
          { name: 'Home', path: '/' },
          { name: 'PC builder', path: '/build-pc' },
        ])}
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <header className="grid gap-6 pb-8 pt-10 lg:grid-cols-12 lg:items-end lg:pt-12">
          <div className="lg:col-span-7">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary-600">PC builder</p>
            <h1 className="mt-3 font-display text-4xl font-semibold leading-[1.05] text-ink sm:text-5xl">Build your PC in 3D.</h1>
            <p className="mt-4 max-w-xl text-lg text-slate-700">
              Pick your parts and watch it come together. Send it to us for a quote, and we’ll assemble and test it in our
              Narayanghat workshop.
            </p>
          </div>
          <div className="lg:col-span-5">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Start from</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {(Object.keys(presets) as UseCase[]).map((use) => (
                <button
                  key={use}
                  onClick={() => applyPreset(use)}
                  title={presets[use].note}
                  className="rounded-md border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-ink transition-colors hover:border-ink hover:bg-ink hover:text-white"
                >
                  {presets[use].label}
                </button>
              ))}
              <button
                onClick={reset}
                className="inline-flex items-center gap-1.5 rounded-md px-3 py-2.5 text-sm font-medium text-slate-600 hover:text-ink"
              >
                <RotateCcw size={15} /> Empty case
              </button>
            </div>
          </div>
        </header>

        <div className="grid gap-8 lg:grid-cols-12">
          {/* 3D stage; min-w-0 stops the canvas widening the grid on phones */}
          <div className="min-w-0 lg:col-span-7">
            <div className="lg:sticky lg:top-[136px]">
              <div className="relative h-[380px] overflow-hidden rounded-lg bg-[radial-gradient(ellipse_at_50%_35%,#1E2740_0%,#0B1020_70%)] sm:h-[460px] lg:h-[560px]">
                {webgl ? (
                  <Suspense
                    fallback={<div className="flex h-full items-center justify-center text-sm text-slate-400">Loading 3D preview…</div>}
                  >
                    <PcScene parts={sceneParts} reduceMotion={reduceMotion} onCanvas={(c) => (canvasRef.current = c)} />
                  </Suspense>
                ) : (
                  <div className="flex h-full flex-col items-center justify-center gap-2 px-8 text-center text-slate-300">
                    <Box size={36} strokeWidth={1.4} />
                    <p className="font-semibold text-white">3D preview isn’t available on this device</p>
                    <p className="text-sm">You can still choose every part and get a quote below.</p>
                  </div>
                )}

                {webgl && (
                  <p className="pointer-events-none absolute left-4 top-4 rounded bg-white/10 px-2.5 py-1 text-xs text-slate-300 backdrop-blur">
                    Drag to rotate<span className="hidden sm:inline"> · scroll to zoom</span>
                  </p>
                )}

                {/* Look controls */}
                <div className="absolute inset-x-4 bottom-4 flex flex-wrap items-end justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-3 rounded-md bg-black/40 px-3 py-2 backdrop-blur">
                    <div className="flex items-center gap-1.5" role="radiogroup" aria-label="Case colour">
                      {(['black', 'white'] as const).map((c) => (
                        <button
                          key={c}
                          role="radio"
                          aria-checked={build.color === c}
                          aria-label={`${c} case`}
                          onClick={() => update({ color: c })}
                          className={`h-6 w-6 rounded-full border-2 ${c === 'black' ? 'bg-[#121418]' : 'bg-[#E6E9ED]'} ${
                            build.color === c ? 'border-white' : 'border-white/30'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="h-5 w-px bg-white/20" />
                    <div className="flex items-center gap-1.5" role="radiogroup" aria-label="RGB lighting colour">
                      {rgbColors.map((c) => (
                        <button
                          key={c.hex}
                          role="radio"
                          aria-checked={build.rgb === c.hex}
                          aria-label={`${c.name} lighting`}
                          title={c.name}
                          onClick={() => update({ rgb: c.hex })}
                          className={`h-5 w-5 rounded-full transition-transform ${build.rgb === c.hex ? 'scale-110 ring-2 ring-white ring-offset-2 ring-offset-black/40' : ''}`}
                          style={{ backgroundColor: c.hex, boxShadow: `0 0 10px ${c.hex}` }}
                        />
                      ))}
                    </div>
                  </div>
                  {webgl && (
                    <button
                      onClick={saveImage}
                      className="inline-flex items-center gap-2 rounded-md bg-white px-3.5 py-2 text-sm font-semibold text-ink transition-colors hover:bg-slate-100"
                    >
                      <Download size={16} /> Save image
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Parts */}
          <div className="min-w-0 space-y-3 lg:col-span-5">
            <Slot icon={Cpu} title="Processor" value={label(cpuTiers, build.cpu)} price={build.cpu && 'Quoted'} open={openSlot === 'cpu'} onToggle={() => toggle('cpu')}>
              <TierList options={cpuTiers} value={build.cpu} onPick={(id) => choose({ cpu: id })} />
            </Slot>
            <Slot icon={CircuitBoard} title="Motherboard" value={build.cpu ? label(boardTiers, build.board) : undefined} price={build.cpu && 'Quoted'} open={openSlot === 'board'} onToggle={() => toggle('board')}>
              <TierList options={boardTiers} value={build.board} onPick={(id) => choose({ board: id })} />
            </Slot>
            <Slot icon={Fan} title="CPU cooler" value={label(coolerOptions, build.cooler)} price={build.cooler && 'Quoted'} open={openSlot === 'cooler'} onToggle={() => toggle('cooler')}>
              <TierList options={coolerOptions} value={build.cooler} onPick={(id) => choose({ cooler: id as Build['cooler'] })} />
            </Slot>
            <Slot icon={MemoryStick} title="RAM" value={picked.ram?.name} price={formatPrice(picked.ram?.price) ?? undefined} open={openSlot === 'ram'} onToggle={() => toggle('ram')}>
              <ProductList items={ram.items} loading={ram.isLoading} value={build.ram} onPick={(id) => choose({ ram: id as number })} />
            </Slot>
            <Slot
              icon={Layers}
              title="Graphics card"
              value={build.gpu === 'none' ? 'Built-in graphics' : picked.gpu?.name}
              price={formatPrice(picked.gpu?.price) ?? undefined}
              open={openSlot === 'gpu'}
              onToggle={() => toggle('gpu')}
            >
              <ProductList
                items={gpu.items}
                loading={gpu.isLoading}
                value={build.gpu}
                onPick={(id) => choose({ gpu: id })}
                noneOption={{ label: 'Built-in graphics', note: 'Fine for office, study and light games', value: 'none' }}
              />
            </Slot>
            <Slot icon={HardDrive} title="Storage" value={picked.storage?.name} price={formatPrice(picked.storage?.price) ?? undefined} open={openSlot === 'storage'} onToggle={() => toggle('storage')}>
              <ProductList items={storage.items} loading={storage.isLoading} value={build.storage} onPick={(id) => choose({ storage: id as number })} />
            </Slot>
            <Slot icon={Zap} title="Power supply" value={label(psuOptions, build.psu)} price={build.psu && 'Quoted'} open={openSlot === 'psu'} onToggle={() => toggle('psu')}>
              <TierList options={psuOptions} value={build.psu} onPick={(id) => choose({ psu: id })} />
            </Slot>
            <Slot icon={Box} title="Case" value={caseLabel} price="Quoted" open={openSlot === 'case'} onToggle={() => toggle('case')}>
              <TierList options={caseOptions} value={build.caseStyle} onPick={(id) => choose({ caseStyle: id as Build['caseStyle'] })} />
            </Slot>
            <Slot icon={Monitor} title="Monitor (optional)" value={picked.monitor?.name} price={formatPrice(picked.monitor?.price) ?? undefined} open={openSlot === 'monitor'} onToggle={() => toggle('monitor')}>
              <ProductList
                items={monitor.items}
                loading={monitor.isLoading}
                value={build.monitor}
                onPick={(id) => choose({ monitor: id as number | undefined })}
                noneOption={{ label: 'No monitor', note: 'I already have one', value: undefined }}
              />
            </Slot>

            {tips.length > 0 && (
              <ul className="space-y-2 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                {tips.map((tip) => (
                  <li key={tip}>{tip}</li>
                ))}
              </ul>
            )}

            {/* Summary */}
            <div className="rounded-lg bg-ink p-5 text-white sm:p-6">
              <div className="flex items-baseline justify-between gap-4">
                <p className="text-sm text-slate-300">Listed parts</p>
                <p className="font-display text-2xl font-semibold">{subtotal > 0 ? formatPrice(subtotal) : '—'}</p>
              </div>
              <p className="mt-1 text-sm text-slate-400">
                {quotedCount} {quotedCount === 1 ? 'part' : 'parts'} priced in your quote, with assembly and testing.
              </p>
              <a
                href={ready ? whatsappLink(quoteMessage) : undefined}
                target="_blank"
                rel="noreferrer"
                aria-disabled={!ready}
                onClick={(e) => !ready && (e.preventDefault(), setOpenSlot('cpu'), setNotice('Pick a processor first.'))}
                className={`mt-5 flex items-center justify-center gap-2 rounded-md px-5 py-3.5 text-[15px] font-semibold transition-colors ${
                  ready ? 'bg-[#1FAF54] text-white hover:bg-[#178F44]' : 'cursor-not-allowed bg-white/10 text-slate-400'
                }`}
              >
                <WhatsAppIcon size={18} /> Get my quote on WhatsApp
              </a>
              <button
                onClick={copyLink}
                className="mt-2 flex w-full items-center justify-center gap-2 rounded-md border border-white/20 px-5 py-3 text-sm font-semibold text-white transition-colors hover:border-white"
              >
                <Link2 size={16} /> Copy link to this build
              </button>
              <p aria-live="polite" className="mt-3 min-h-5 text-center text-sm text-emerald-300">
                {notice}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BuildPc;
