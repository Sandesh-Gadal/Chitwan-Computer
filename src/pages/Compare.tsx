import React, { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ChevronRight, ClipboardCheck, ClipboardPlus, GitCompareArrows, Plus, X } from 'lucide-react';
import {
  Product,
  formatPrice,
  priceInfo,
  productImages,
  stockLabel,
  stockStatus,
  useProductPage,
} from '../api/products';
import { COMPARE_LIMIT, useCompare } from '../context/CompareContext';
import { useEnquiry } from '../context/EnquiryContext';
import { parseSpecs, specKey } from '../lib/specs';
import { whatsappLink } from '../data/business';
import WhatsAppIcon from '../components/ui/WhatsAppIcon';
import Seo from '../components/Seo';

const stockText = { in: 'text-emerald-700', low: 'text-amber-700', out: 'text-red-600' };

interface Row {
  label: string;
  cells: React.ReactNode[];
  /** Plain values, used to tell whether the products differ on this row */
  raw: string[];
}

const parseIds = (value: string | null) =>
  (value ?? '')
    .split(',')
    .map(Number)
    .filter((n) => Number.isInteger(n) && n > 0)
    .slice(0, COMPARE_LIMIT);

const Compare: React.FC = () => {
  const [params, setParams] = useSearchParams();
  const compare = useCompare();
  const enquiry = useEnquiry();
  const [onlyDifferences, setOnlyDifferences] = useState(false);

  // A shared link decides what's compared; otherwise it's the visitor's own list
  const urlIds = parseIds(params.get('ids'));
  const ids = urlIds.length ? urlIds : compare.ids;

  const { data, isLoading } = useProductPage({ ids, perPage: ids.length || 1 }, ids.length > 0);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const products = useMemo(
    () => ids.map((id) => data?.data.find((p) => p.id === id)).filter((p): p is Product => Boolean(p)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [data, ids.join(',')]
  );

  const remove = (id: number) => {
    compare.remove(id);
    if (urlIds.length) {
      const next = urlIds.filter((i) => i !== id);
      setParams(next.length ? { ids: next.join(',') } : {}, { replace: true });
    }
  };

  const { pricingRows, specRows, overviews } = useMemo(() => {
    const pricing = products.map((p) => priceInfo(p));
    const prices = pricing.map((p) => p?.price ?? null);
    const known = prices.filter((p): p is number => p !== null);
    const lowest = known.length > 1 ? Math.min(...known) : null;

    const pricingRows: Row[] = [
      {
        label: 'Price',
        raw: prices.map(String),
        cells: pricing.map((info) =>
          info ? (
            <div>
              <p className="font-display text-xl font-semibold text-ink">{formatPrice(info.price)}</p>
              {lowest !== null && info.price === lowest && known.some((p) => p !== lowest) && (
                <span className="mt-1 inline-block rounded bg-emerald-600 px-2 py-0.5 text-[11px] font-semibold text-white">
                  Lowest price
                </span>
              )}
              {lowest !== null && info.price > lowest && (
                <p className="mt-0.5 text-xs text-slate-500">{formatPrice(info.price - lowest)} more</p>
              )}
            </div>
          ) : (
            <span className="text-slate-600">Call for price</span>
          )
        ),
      },
      {
        label: 'MRP',
        raw: pricing.map((i) => String(i?.mrp ?? '')),
        cells: pricing.map((i) =>
          i?.mrp ? <s className="text-slate-500 decoration-slate-400">{formatPrice(i.mrp)}</s> : <Empty />
        ),
      },
      {
        label: 'Discount',
        raw: pricing.map((i) => String(i?.percentOff ?? 0)),
        cells: pricing.map((i) =>
          i?.mrp ? (
            <span className="font-semibold text-emerald-700">
              {i.percentOff}% off · save {formatPrice(i.save)}
            </span>
          ) : (
            <Empty />
          )
        ),
      },
      {
        label: 'Availability',
        raw: products.map((p) => stockStatus(p.quantity)),
        cells: products.map((p) => {
          const status = stockStatus(p.quantity);
          return <span className={`font-semibold ${stockText[status]}`}>{stockLabel[status]}</span>;
        }),
      },
      {
        label: 'Brand',
        raw: products.map((p) => p.brand?.name ?? ''),
        cells: products.map((p) => p.brand?.name ?? <Empty />),
      },
      {
        label: 'Category',
        raw: products.map((p) => p.category?.name ?? ''),
        cells: products.map((p) => p.category?.name ?? <Empty />),
      },
    ];

    // Every spec any product lists, in the order they first appear
    const parsed = products.map((p) => parseSpecs(p.description));
    const labels = new Map<string, string>();
    parsed.forEach(({ specs }) => specs.forEach((s) => labels.has(s.key) || labels.set(s.key, s.label)));

    const specRows: Row[] = [...labels].map(([key, label]) => {
      const values = parsed.map(({ specs }) => specs.find((s) => s.key === key)?.value ?? null);
      return {
        label,
        raw: values.map((v) => (v ? specKey(v) : '')),
        cells: values.map((v) => v ?? <Empty />),
      };
    });

    return { pricingRows, specRows, overviews: parsed.map((p) => p.overview) };
  }, [products]);

  const differs = (row: Row) => new Set(row.raw).size > 1;
  const visible = (rows: Row[]) => (onlyDifferences ? rows.filter(differs) : rows);
  const n = products.length;
  const categories = new Set(products.map((p) => p.category?.id ?? null));
  const addMoreLink = products[0]?.category ? `/products?category=${encodeURIComponent(products[0].category.slug)}` : '/products';

  const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}/compare?ids=${products.map((p) => p.id).join(',')}` : '';
  const message = [
    "Hi Chitwan Computer, I'm comparing these products:",
    '',
    ...products.map((p, i) => `${i + 1}. ${p.name} – ${formatPrice(p.price) ?? 'price on request'}`),
    '',
    'Which would you recommend, and are they available?',
    shareUrl,
  ].join('\n');

  // Columns: a label column from sm up, then one per product
  const gridStyle = { '--n': n } as React.CSSProperties;
  const grid =
    'grid grid-cols-[repeat(var(--n),minmax(150px,1fr))] sm:grid-cols-[170px_repeat(var(--n),minmax(170px,1fr))]';

  const section = (title: string, rows: Row[]) =>
    rows.length === 0 ? null : (
      <>
        <div className="sticky left-0 col-span-full bg-paper px-1 pb-2 pt-8">
          <h2 className="font-display text-lg font-semibold text-ink">{title}</h2>
        </div>
        {rows.map((row) => {
          const highlight = n > 1 && differs(row);
          return (
            <div key={row.label} className={`${grid} col-span-full border-t border-slate-200`} style={gridStyle}>
              <div className="sticky left-0 col-span-full bg-paper px-1 pt-3 text-xs font-semibold uppercase tracking-[0.12em] text-slate-600 sm:col-span-1 sm:py-3.5 sm:text-[13px] sm:normal-case sm:tracking-normal">
                {row.label}
              </div>
              {row.cells.map((cell, i) => (
                <div
                  key={i}
                  className={`px-3 py-3 text-sm text-ink sm:py-3.5 ${highlight ? 'bg-amber-50/70' : ''} ${i === 0 ? 'pl-1 sm:pl-3' : ''}`}
                >
                  {cell}
                </div>
              ))}
            </div>
          );
        })}
      </>
    );

  return (
    <section className="min-h-screen bg-paper pb-36">
      <Seo
        title="Compare Products | Chitwan Computer"
        description="Compare prices, availability and specifications side by side at Chitwan Computer, Narayanghat."
        path="/compare"
        noindex
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1.5 py-6 text-sm text-slate-600">
          <Link to="/" className="hover:text-ink">
            Home
          </Link>
          <ChevronRight size={14} className="text-slate-400" />
          <Link to="/products" className="hover:text-ink">
            Products
          </Link>
          <ChevronRight size={14} className="text-slate-400" />
          <span className="text-ink">Compare</span>
        </nav>

        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-semibold text-ink sm:text-4xl">Compare products</h1>
            <p className="mt-2 text-slate-600">Price, availability and specs side by side.</p>
          </div>
          {n > 1 && (
            <label className="inline-flex cursor-pointer items-center gap-2.5 text-sm font-medium text-ink">
              <input
                type="checkbox"
                checked={onlyDifferences}
                onChange={(e) => setOnlyDifferences(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
              />
              Show only differences
            </label>
          )}
        </div>

        {ids.length === 0 ? (
          <div className="mt-12 flex flex-col items-center rounded-lg border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
            <GitCompareArrows size={40} className="text-slate-300" />
            <p className="mt-4 font-display text-lg font-semibold text-ink">Nothing to compare yet</p>
            <p className="mt-1 max-w-sm text-sm text-slate-600">
              Tap the compare button on any product to add it here. You can compare up to {COMPARE_LIMIT} at once.
            </p>
            <Link
              to="/products"
              className="mt-6 rounded-md bg-ink px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-500"
            >
              Browse products
            </Link>
          </div>
        ) : isLoading && n === 0 ? (
          <div className="mt-10 grid animate-pulse grid-cols-2 gap-6 lg:grid-cols-4">
            {ids.map((id) => (
              <div key={id}>
                <div className="aspect-square rounded-lg bg-slate-200" />
                <div className="mt-4 h-4 w-3/4 rounded bg-slate-200" />
                <div className="mt-2 h-6 w-1/2 rounded bg-slate-200" />
              </div>
            ))}
          </div>
        ) : (
          <>
            {categories.size > 1 && (
              <p className="mt-6 rounded-md bg-amber-50 px-4 py-3 text-sm text-amber-800 ring-1 ring-inset ring-amber-200">
                These products are from different categories, so many specs won't line up.
              </p>
            )}

            <div className="-mx-4 mt-8 overflow-x-auto px-4 sm:mx-0 sm:px-0">
              <div className={grid} style={gridStyle}>
                {/* Product headers */}
                <div className="sticky left-0 hidden bg-paper sm:block" />
                {products.map((p) => {
                  const inList = enquiry.has(p.id);
                  return (
                    <div key={p.id} className="flex flex-col px-1.5 pb-2 sm:px-3">
                      <div className="relative aspect-square overflow-hidden rounded-lg border border-slate-200 bg-white">
                        <Link to={`/products/${p.id}`}>
                          <img src={productImages(p)[0]} alt={p.name} className="h-full w-full object-contain p-4" />
                        </Link>
                        <button
                          onClick={() => remove(p.id)}
                          aria-label={`Remove ${p.name} from comparison`}
                          className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-white/95 text-slate-600 shadow hover:bg-red-50 hover:text-red-600"
                        >
                          <X size={16} />
                        </button>
                      </div>
                      <Link
                        to={`/products/${p.id}`}
                        className="mt-3 line-clamp-3 font-display text-[15px] font-semibold leading-snug text-ink hover:text-primary-600"
                      >
                        {p.name}
                      </Link>
                      <button
                        onClick={() => (inList ? enquiry.open() : enquiry.add(p))}
                        className={`mt-3 inline-flex items-center justify-center gap-1.5 rounded-md border px-3 py-2 text-xs font-semibold transition-colors ${
                          inList ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-slate-300 bg-white text-ink hover:border-ink'
                        }`}
                      >
                        {inList ? <ClipboardCheck size={14} /> : <ClipboardPlus size={14} />}
                        {inList ? 'In enquiry list' : 'Add to enquiry'}
                      </button>
                    </div>
                  );
                })}

                {section('Pricing & availability', visible(pricingRows))}
                {section('Specifications', visible(specRows))}

                {overviews.some(Boolean) && !onlyDifferences && (
                  <>
                    <div className="sticky left-0 col-span-full bg-paper px-1 pb-2 pt-8">
                      <h2 className="font-display text-lg font-semibold text-ink">Overview</h2>
                    </div>
                    <div className="sticky left-0 hidden border-t border-slate-200 bg-paper sm:block" />
                    {overviews.map((text, i) => (
                      <p
                        key={i}
                        className="whitespace-pre-line border-t border-slate-200 px-3 py-3.5 text-sm leading-relaxed text-slate-700"
                      >
                        {text || <Empty />}
                      </p>
                    ))}
                  </>
                )}
              </div>
            </div>

            {specRows.length === 0 && (
              <p className="mt-6 text-sm text-slate-600">
                No itemised specs were listed for these products. Ask us on WhatsApp and we'll compare them for you.
              </p>
            )}

            <div className="mt-10 flex flex-wrap gap-3">
              {n < COMPARE_LIMIT && (
                <Link
                  to={addMoreLink}
                  className="inline-flex items-center gap-2 rounded-md border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-ink hover:border-ink"
                >
                  <Plus size={16} />
                  Add another product
                </Link>
              )}
              {n > 0 && (
                <a
                  href={whatsappLink(message)}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-md bg-[#1FAF54] px-5 py-3 text-sm font-semibold text-white hover:bg-[#178F44]"
                >
                  <WhatsAppIcon size={18} />
                  Ask which to buy
                </a>
              )}
            </div>
          </>
        )}
      </div>
    </section>
  );
};

const Empty: React.FC = () => <span className="text-slate-400">—</span>;

export default Compare;
