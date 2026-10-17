import React, { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { Search, X, SlidersHorizontal, ArrowRight, ArrowLeft } from 'lucide-react';
import ProductCard, { ProductCardSkeleton } from './products/ProductCard';
import PriceRangeSlider from './products/PriceRangeSlider';
import Pagination from './products/Pagination';
import {
  FacetOption,
  ProductQuery,
  SortKey,
  storageUrl,
  useCatalogOverview,
  useFacets,
  useProductPage,
} from '../api/products';
import { business, whatsappLink } from '../data/business';
import Seo, { breadcrumbSchema } from './Seo';
import { categorySeo } from '../data/seo';
import { PinnedTag } from './festival/FestivalPieces';
import { useFestival } from './festival/registry';

const PER_PAGE = 12;
const PRICE_STEP = 500;
const BRANDS_COLLAPSED = 8;
const SEARCH_DELAY = 350;

const sortOptions: { value: SortKey; label: string }[] = [
  { value: 'newest', label: 'Newest first' },
  { value: 'price-asc', label: 'Price: low to high' },
  { value: 'price-desc', label: 'Price: high to low' },
  { value: 'name', label: 'Name: A to Z' },
];

// Filter keys that switch the page from "browse by category" to the full list
const LIST_KEYS = ['category', 'brand', 'min', 'max', 'stock', 'q', 'page', 'view'];

const formatRs = (n: number) => `Rs. ${n.toLocaleString('en-IN')}`;

const Products = () => {
  const [params, setParams] = useSearchParams();
  const listMode = LIST_KEYS.some((key) => params.has(key));
  const festive = useFestival();

  // Filters live in the URL so filtered views can be shared, linked to and bookmarked
  const update = (changes: Record<string, string | null>) => {
    const next = new URLSearchParams(params);
    Object.entries(changes).forEach(([key, value]) => (value ? next.set(key, value) : next.delete(key)));
    // Any filter change starts again from the first page
    if (!('page' in changes)) next.delete('page');
    setParams(next, { replace: !('page' in changes) });
  };

  const [searchText, setSearchText] = useState(params.get('q') ?? '');
  const firstRender = useRef(true);

  // Follow the URL when it changes elsewhere (back button, chips)
  useEffect(() => setSearchText(params.get('q') ?? ''), [params]);

  // Query the server once typing pauses, not on every keystroke
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    const current = params.get('q') ?? '';
    if (searchText.trim() === current.trim()) return;
    const timer = setTimeout(() => update({ q: searchText.trim() || null }), SEARCH_DELAY);
    return () => clearTimeout(timer);
  }, [searchText]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <section className="min-h-screen bg-paper pb-28">
      <CatalogueSeo listMode={listMode} />
      {/* Header */}
      <div className="border-b border-slate-200 bg-paper">
        <div className="mx-auto max-w-7xl px-4 pb-10 pt-14 sm:px-6 lg:px-8 lg:pt-16">
          <div className="grid gap-8 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-7">
              {listMode && (
                <Link
                  to="/products"
                  className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-ink"
                >
                  <ArrowLeft size={15} />
                  All categories
                </Link>
              )}
              {festive && (
                <div className="mb-5 pt-2">
                  <PinnedTag size="md" tilt={-3}>
                    {festive.festival.dealsTitle} on selected items
                  </PinnedTag>
                </div>
              )}
              <h1 className="font-display text-4xl font-semibold leading-[1.05] text-ink sm:text-5xl">
                {listMode ? <ListTitle /> : 'Browse our products'}
              </h1>
              <p className="mt-4 max-w-xl text-lg text-slate-700">
                {(listMode && categorySeo[params.get('category') ?? '']?.description) ||
                  'Laptops, desktops, CCTV, networking, storage and accessories, all available at our Lionschowk store.'}
              </p>
            </div>

            <div className="lg:col-span-5">
              <div className="relative">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <input
                  className="w-full rounded-md border border-slate-300 bg-white py-3.5 pl-12 pr-11 text-[15px] text-ink placeholder:text-slate-500 transition-colors focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/15"
                  placeholder="Search by name, brand or category…"
                  onChange={(e) => setSearchText(e.target.value)}
                  value={searchText}
                  aria-label="Search products"
                />
                {searchText && (
                  <button
                    onClick={() => {
                      setSearchText('');
                      update({ q: null });
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-1 text-slate-500 hover:text-ink"
                    aria-label="Clear search"
                  >
                    <X size={18} />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {listMode ? <ProductList update={update} /> : <CategoryOverview />}
    </section>
  );
};

/* ------------------------------------------------------------------------- */
/* Search engine tags                                                         */
/* ------------------------------------------------------------------------- */

// Category and brand pages are indexed on their own; searches and filter combinations point back to them
const CatalogueSeo: React.FC<{ listMode: boolean }> = ({ listMode }) => {
  const query = useListQuery();
  const { data: facets } = useFacets(query, listMode);
  const crumbs = [
    { name: 'Home', path: '/' },
    { name: 'Products', path: '/products' },
  ];

  if (listMode && query.category) {
    const name = facets?.categories.find((c) => c.slug === query.category)?.name ?? query.category;
    const path = `/products?category=${encodeURIComponent(query.category)}`;
    const seo = categorySeo[query.category];
    return (
      <Seo
        title={seo?.title ?? `${name} Price in Nepal | Chitwan Computer`}
        description={seo?.description ?? `${name} with prices, in stock at Chitwan Computer, Narayanghat.`}
        path={path}
        schema={breadcrumbSchema([...crumbs, { name, path }])}
      />
    );
  }

  if (listMode && query.brands?.length === 1) {
    const slug = query.brands[0];
    const name = facets?.brands.find((b) => b.slug === slug)?.name ?? slug;
    const path = `/products?brand=${encodeURIComponent(slug)}`;
    return (
      <Seo
        title={`${name} Price in Nepal | ${name} Dealer in Chitwan`}
        description={`Genuine ${name} products with prices and warranty, available at Chitwan Computer, Lionschowk, Narayanghat.`}
        path={path}
        schema={breadcrumbSchema([...crumbs, { name, path }])}
      />
    );
  }

  return (
    <Seo
      title="All Products: Laptops, CCTV, Printers & PC Parts | Chitwan Computer"
      description="Browse every laptop, desktop, monitor, CCTV camera, printer, router and accessory we stock, with prices. Computer shop in Narayanghat, Chitwan."
      path="/products"
      schema={breadcrumbSchema(crumbs)}
      // Search results and filter combinations shouldn't compete with the real category pages
      noindex={listMode && (!!query.q?.trim() || (query.brands?.length ?? 0) > 1 || query.minPrice != null || query.maxPrice != null)}
    />
  );
};

/* ------------------------------------------------------------------------- */
/* Browse by category                                                         */
/* ------------------------------------------------------------------------- */

const CategoryOverview: React.FC = () => {
  const { data: sections = [], isLoading, isError, refetch } = useCatalogOverview(4);
  const total = sections.reduce((sum, s) => sum + s.total, 0);

  if (isError) return <LoadError onRetry={() => refetch()} />;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      {/* Jump straight to a category */}
      <nav aria-label="Categories" className="scrollbar-hide -mx-4 flex gap-2 overflow-x-auto px-4 py-6 sm:mx-0 sm:flex-wrap sm:px-0">
        {isLoading
          ? Array.from({ length: 8 }, (_, i) => <span key={i} className="h-10 w-28 flex-shrink-0 animate-pulse rounded-md bg-slate-200" />)
          : sections.map(({ category, total: count }) => (
              <Link
                key={category.slug}
                to={`/products?category=${encodeURIComponent(category.slug)}`}
                className="inline-flex flex-shrink-0 items-center gap-2 rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-ink transition-colors hover:border-ink hover:bg-ink hover:text-white"
              >
                {category.name}
                <span className="text-xs opacity-60">{count}</span>
              </Link>
            ))}
      </nav>

      {isLoading
        ? Array.from({ length: 3 }, (_, i) => (
            <div key={i} className="border-t border-slate-200 py-12">
              <div className="mb-8 h-8 w-48 animate-pulse rounded bg-slate-200" />
              <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 lg:grid-cols-4">
                {Array.from({ length: 4 }, (_, j) => (
                  <ProductCardSkeleton key={j} />
                ))}
              </div>
            </div>
          ))
        : sections.map(({ category, total: count, products }) => (
            <section key={category.slug} aria-labelledby={`cat-${category.slug}`} className="border-t border-slate-200 py-12">
              <div className="mb-8 flex items-end justify-between gap-4">
                <div>
                  <h2 id={`cat-${category.slug}`} className="font-display text-2xl font-semibold text-ink sm:text-3xl">
                    {category.name}
                  </h2>
                  <p className="mt-1 text-sm text-slate-600">
                    {count} {count === 1 ? 'product' : 'products'}
                  </p>
                </div>
                <Link
                  to={`/products?category=${encodeURIComponent(category.slug)}`}
                  className="group inline-flex flex-shrink-0 items-center gap-1.5 rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-ink transition-colors hover:border-ink"
                >
                  Show all {count}
                  <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
                </Link>
              </div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 lg:grid-cols-4">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </section>
          ))}

      {!isLoading && total > 0 && (
        <div className="border-t border-slate-200 pt-12 text-center">
          <Link
            to="/products?view=all"
            className="inline-flex items-center gap-2 rounded-md bg-ink px-6 py-3 text-[15px] font-semibold text-white transition-colors hover:bg-primary-500"
          >
            View all {total} products
            <ArrowRight size={17} />
          </Link>
        </div>
      )}
    </div>
  );
};

/* ------------------------------------------------------------------------- */
/* Filtered, paginated list                                                   */
/* ------------------------------------------------------------------------- */

const useListQuery = (): ProductQuery & { page: number } => {
  const [params] = useSearchParams();
  return {
    page: Math.max(1, Number(params.get('page')) || 1),
    perPage: PER_PAGE,
    category: params.get('category'),
    brands: params.get('brand')?.split(',').filter(Boolean) ?? [],
    minPrice: params.get('min') ? Number(params.get('min')) : null,
    maxPrice: params.get('max') ? Number(params.get('max')) : null,
    inStock: params.get('stock') === '1',
    q: params.get('q') ?? '',
    sort: (params.get('sort') as SortKey) || 'newest',
  };
};

const ListTitle: React.FC = () => {
  const query = useListQuery();
  const { data: facets } = useFacets(query);
  const category = facets?.categories.find((c) => c.slug === query.category);
  const brand = query.brands?.length === 1 ? facets?.brands.find((b) => b.slug === query.brands![0]) : undefined;
  if (category) return <>{category.name}</>;
  if (brand) return <>{brand.name}</>;
  if (query.q?.trim()) return <>Results for "{query.q.trim()}"</>;
  return <>All products</>;
};

const ProductList: React.FC<{ update: (changes: Record<string, string | null>) => void }> = ({ update }) => {
  const [params, setParams] = useSearchParams();
  const query = useListQuery();
  const { data, isLoading, isError, isPlaceholderData, refetch } = useProductPage(query);
  const { data: facets } = useFacets(query);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const resultsRef = useRef<HTMLDivElement>(null);
  const previousPage = useRef(query.page);

  // A page beyond the end (e.g. after filtering) falls back to the last page
  useEffect(() => {
    if (data && data.last_page > 0 && query.page > data.last_page) update({ page: String(data.last_page) });
  }, [data, query.page]); // eslint-disable-line react-hooks/exhaustive-deps

  // Bring the top of the results into view when moving between pages
  useEffect(() => {
    if (previousPage.current !== query.page && resultsRef.current) {
      const top = resultsRef.current.getBoundingClientRect().top + window.scrollY - 96;
      window.scrollTo({ top: Math.max(top, 0), behavior: 'smooth' });
    }
    previousPage.current = query.page;
  }, [query.page]);

  const bounds: [number, number] = facets
    ? [Math.floor(facets.price.min / PRICE_STEP) * PRICE_STEP, Math.ceil(facets.price.max / PRICE_STEP) * PRICE_STEP]
    : [0, 0];

  const clearAll = () => {
    const next = new URLSearchParams({ view: 'all' });
    if (params.get('sort')) next.set('sort', params.get('sort')!);
    setParams(next, { replace: true });
  };

  const toggleBrand = (slug: string) => {
    const brands = query.brands ?? [];
    const next = brands.includes(slug) ? brands.filter((b) => b !== slug) : [...brands, slug];
    update({ brand: next.length ? next.join(',') : null });
  };

  const activeCategory = facets?.categories.find((c) => c.slug === query.category);
  const priceActive = query.minPrice != null || query.maxPrice != null;

  const chips: { key: string; label: string; onRemove: () => void }[] = [
    ...(query.category
      ? [{ key: 'cat', label: activeCategory?.name ?? query.category, onRemove: () => update({ category: null }) }]
      : []),
    ...(query.brands ?? []).map((slug) => ({
      key: `brand-${slug}`,
      label: facets?.brands.find((b) => b.slug === slug)?.name ?? slug,
      onRemove: () => toggleBrand(slug),
    })),
    ...(priceActive
      ? [
          {
            key: 'price',
            label: `${formatRs(query.minPrice ?? bounds[0])} – ${formatRs(query.maxPrice ?? bounds[1])}`,
            onRemove: () => update({ min: null, max: null }),
          },
        ]
      : []),
    ...(query.inStock ? [{ key: 'stock', label: 'In stock only', onRemove: () => update({ stock: null }) }] : []),
    ...(query.q?.trim() ? [{ key: 'q', label: `"${query.q.trim()}"`, onRemove: () => update({ q: null }) }] : []),
  ];

  const total = data?.total ?? facets?.total ?? 0;

  const filterPanel = (
    <FilterPanel
      categories={facets?.categories ?? []}
      brands={facets?.brands ?? []}
      query={query}
      bounds={bounds}
      onCategory={(slug) => update({ category: query.category === slug ? null : slug, view: 'all' })}
      onBrand={toggleBrand}
      onPrice={([min, max]) =>
        update({
          min: min > bounds[0] ? String(min) : null,
          max: max < bounds[1] ? String(max) : null,
        })
      }
      onStock={(on) => update({ stock: on ? '1' : null })}
    />
  );

  return (
    <div className="mx-auto grid max-w-7xl gap-10 px-4 pt-8 sm:px-6 lg:grid-cols-[260px_minmax(0,1fr)] lg:px-8">
      {/* Desktop filters */}
      <aside className="hidden lg:block" aria-label="Filters">
        <div className="scrollbar-hide sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto pb-6">{filterPanel}</div>
      </aside>

      <div ref={resultsRef}>
        {/* Toolbar */}
        {!isError && (
          <div className="mb-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-slate-600">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setDrawerOpen(true)}
                  className="inline-flex items-center gap-2 rounded-md border border-slate-300 bg-white px-3.5 py-2 font-medium text-ink hover:border-ink lg:hidden"
                >
                  <SlidersHorizontal size={16} />
                  Filters
                  {chips.length > 0 && (
                    <span className="rounded-full bg-primary-500 px-1.5 text-xs font-semibold text-white">{chips.length}</span>
                  )}
                </button>
                <p aria-live="polite">
                  <span className="font-semibold text-ink">{total}</span> {total === 1 ? 'product' : 'products'}
                </p>
              </div>
              <label className="flex items-center gap-2">
                <span className="hidden sm:inline">Sort</span>
                <select
                  value={query.sort}
                  onChange={(e) => update({ sort: e.target.value === 'newest' ? null : e.target.value })}
                  className="rounded-md border border-slate-300 bg-white py-2 pl-3 pr-8 text-sm font-medium text-ink focus:border-primary-500 focus:outline-none"
                  aria-label="Sort products"
                >
                  {sortOptions.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            {chips.length > 0 && (
              <div className="flex flex-wrap items-center gap-2">
                {chips.map((chip) => (
                  <button
                    key={chip.key}
                    onClick={chip.onRemove}
                    className="inline-flex items-center gap-1.5 rounded-full border border-slate-300 bg-white py-1 pl-3 pr-2 text-sm text-ink hover:border-ink"
                    aria-label={`Remove filter ${chip.label}`}
                  >
                    {chip.label}
                    <X size={14} className="text-slate-500" />
                  </button>
                ))}
                <button onClick={clearAll} className="px-2 text-sm font-medium text-primary-600 hover:underline">
                  Clear all
                </button>
              </div>
            )}
          </div>
        )}

        {isError && <LoadError onRetry={() => refetch()} />}

        {isLoading && (
          <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 md:grid-cols-3">
            {Array.from({ length: 6 }, (_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        )}

        {data && data.total === 0 && (
          <div className="mx-auto max-w-md py-20 text-center">
            <h2 className="font-display text-2xl font-semibold text-ink">No products match</h2>
            <p className="mt-2 text-slate-600">Try removing a filter. We may also have it in store, so just ask.</p>
            <div className="mt-6 flex justify-center gap-3">
              <a
                href={whatsappLink(`Hi, do you have ${query.q?.trim() || activeCategory?.name || 'this'} available?`)}
                target="_blank"
                rel="noreferrer"
                className="rounded-md bg-ink px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-500"
              >
                Ask on WhatsApp
              </a>
              {chips.length > 0 && (
                <button
                  onClick={clearAll}
                  className="rounded-md border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-ink hover:border-ink"
                >
                  Clear filters
                </button>
              )}
            </div>
          </div>
        )}

        {data && data.total > 0 && (
          <>
            <div
              className={`grid grid-cols-2 gap-x-4 gap-y-10 transition-opacity sm:gap-x-6 md:grid-cols-3 ${
                isPlaceholderData ? 'opacity-50' : ''
              }`}
              aria-busy={isPlaceholderData}
            >
              {data.data.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            <Pagination current={data.current_page} last={data.last_page} from={data.from} to={data.to} total={data.total} />

            <p className="mt-8 text-center text-sm text-slate-600">
              Can't find what you need?{' '}
              Call{' '}
              <a href={business.phones[0].href} className="font-semibold text-ink underline-offset-4 hover:underline">
                {business.phones[0].label}
              </a>{' '}
              or{' '}
              <a href={business.phones[1].href} className="font-semibold text-ink underline-offset-4 hover:underline">
                {business.phones[1].label}
              </a>
            </p>
          </>
        )}
      </div>

      {/* Mobile filter drawer */}
      <AnimatePresence>
        {drawerOpen && (
          <div className="fixed inset-0 z-[80] lg:hidden" role="dialog" aria-modal="true" aria-label="Filters">
            <motion.div
              className="absolute inset-0 bg-ink/50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDrawerOpen(false)}
            />
            <motion.div
              className="absolute inset-y-0 left-0 flex w-[88%] max-w-sm flex-col bg-paper shadow-2xl"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
                <h2 className="font-display text-xl font-semibold text-ink">Filters</h2>
                <button onClick={() => setDrawerOpen(false)} aria-label="Close filters" className="rounded-md p-2 hover:bg-slate-200">
                  <X size={20} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto px-5 py-5">{filterPanel}</div>
              <div className="grid grid-cols-2 gap-3 border-t border-slate-200 p-4">
                <button onClick={clearAll} className="rounded-md border border-slate-300 bg-white py-3 text-sm font-semibold text-ink">
                  Clear all
                </button>
                <button onClick={() => setDrawerOpen(false)} className="rounded-md bg-ink py-3 text-sm font-semibold text-white">
                  Show {total} products
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const LoadError: React.FC<{ onRetry: () => void }> = ({ onRetry }) => (
  <div className="mx-auto max-w-md px-4 py-20 text-center">
    <h2 className="font-display text-2xl font-semibold text-ink">Couldn't load products</h2>
    <p className="mt-2 text-slate-600">Check your connection and try again, or give us a call.</p>
    <button
      onClick={onRetry}
      className="mt-6 rounded-md bg-ink px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-500"
    >
      Try again
    </button>
  </div>
);

/* ------------------------------------------------------------------------- */
/* Filter sidebar                                                             */
/* ------------------------------------------------------------------------- */

interface FilterPanelProps {
  categories: FacetOption[];
  brands: FacetOption[];
  query: ProductQuery;
  bounds: [number, number];
  onCategory: (slug: string) => void;
  onBrand: (slug: string) => void;
  onPrice: (range: [number, number]) => void;
  onStock: (on: boolean) => void;
}

const FilterSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="border-b border-slate-200 py-6 first:pt-0 last:border-0">
    <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.12em] text-ink">{title}</h3>
    {children}
  </div>
);

const FilterPanel: React.FC<FilterPanelProps> = ({ categories, brands, query, bounds, onCategory, onBrand, onPrice, onStock }) => {
  const [showAllBrands, setShowAllBrands] = useState(false);
  const [brandQuery, setBrandQuery] = useState('');
  const selectedBrands = query.brands ?? [];

  const brandList = brands.filter((b) => b.name.toLowerCase().includes(brandQuery.trim().toLowerCase()));
  // Selected brands always stay visible even when the list is collapsed
  const shownBrands =
    showAllBrands || brandQuery
      ? brandList
      : brandList.filter((b, i) => i < BRANDS_COLLAPSED || selectedBrands.includes(b.slug));

  return (
    <div>
      <FilterSection title="Category">
        <ul className="space-y-1">
          {categories.map((c) => {
            const active = query.category === c.slug;
            return (
              <li key={c.slug}>
                <button
                  onClick={() => onCategory(c.slug)}
                  aria-pressed={active}
                  className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-[15px] transition-colors ${
                    active ? 'bg-ink font-medium text-white' : 'text-slate-700 hover:bg-white hover:text-ink'
                  } ${c.count === 0 && !active ? 'opacity-50' : ''}`}
                >
                  {c.name}
                  <span className={`text-xs tabular-nums ${active ? 'text-slate-300' : 'text-slate-500'}`}>{c.count}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </FilterSection>

      <FilterSection title="Brand">
        {brands.length > BRANDS_COLLAPSED && (
          <input
            value={brandQuery}
            onChange={(e) => setBrandQuery(e.target.value)}
            placeholder="Find a brand"
            aria-label="Find a brand"
            className="mb-3 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm placeholder:text-slate-500 focus:border-primary-500 focus:outline-none"
          />
        )}
        <ul className="space-y-1">
          {shownBrands.map((b) => {
            const checked = selectedBrands.includes(b.slug);
            return (
              <li key={b.slug}>
                <label
                  className={`flex cursor-pointer items-center gap-3 rounded-md px-2 py-1.5 text-[15px] transition-colors hover:bg-white ${
                    b.count === 0 && !checked ? 'opacity-50' : ''
                  }`}
                >
                  <input type="checkbox" checked={checked} onChange={() => onBrand(b.slug)} className="h-4 w-4 accent-primary-500" />
                  <span className="flex h-6 w-10 flex-shrink-0 items-center justify-center">
                    {b.logo && <img src={storageUrl(b.logo)} alt="" className="max-h-5 max-w-full object-contain" loading="lazy" />}
                  </span>
                  <span className="flex-1 text-slate-700">{b.name}</span>
                  <span className="text-xs tabular-nums text-slate-500">{b.count}</span>
                </label>
              </li>
            );
          })}
        </ul>
        {!brandQuery && brandList.length > BRANDS_COLLAPSED && (
          <button onClick={() => setShowAllBrands((s) => !s)} className="mt-3 text-sm font-medium text-primary-600 hover:underline">
            {showAllBrands ? 'Show fewer' : `Show all ${brandList.length} brands`}
          </button>
        )}
      </FilterSection>

      {bounds[1] > bounds[0] && (
        <FilterSection title="Price">
          <PriceRangeSlider
            min={bounds[0]}
            max={bounds[1]}
            step={PRICE_STEP}
            value={[query.minPrice ?? bounds[0], query.maxPrice ?? bounds[1]]}
            onCommit={onPrice}
          />
        </FilterSection>
      )}

      <FilterSection title="Availability">
        <label className="flex cursor-pointer items-center justify-between gap-3 text-[15px] text-slate-700">
          In stock only
          <span className="relative inline-flex">
            <input type="checkbox" checked={!!query.inStock} onChange={(e) => onStock(e.target.checked)} className="peer sr-only" />
            <span className="h-6 w-11 rounded-full bg-slate-300 transition-colors peer-checked:bg-primary-500 peer-focus-visible:ring-2 peer-focus-visible:ring-primary-500/40" />
            <span className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform peer-checked:translate-x-5" />
          </span>
        </label>
      </FilterSection>
    </div>
  );
};

export default Products;
