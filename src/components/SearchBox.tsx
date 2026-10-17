import React, { useEffect, useId, useRef, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowUpRight, Search } from 'lucide-react';
import { formatPrice, productImage, useCategories, useProductPage } from '../api/products';

const SUGGEST_DELAY = 220;
const MIN_CHARS = 2;
const MAX_PRODUCTS = 6;

type Option =
  | { kind: 'category'; key: string; label: string; to: string; count: number }
  | { kind: 'product'; key: string; label: string; to: string; image: string; meta: string; price: string | null }
  | { kind: 'all'; key: string; label: string; to: string };

/** Header search with live product and category suggestions */
const SearchBox: React.FC<{ className?: string }> = ({ className = '' }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [params] = useSearchParams();
  const onCatalogue = location.pathname === '/products';
  const [text, setText] = useState('');
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const root = useRef<HTMLFormElement>(null);
  const listId = useId();

  // Mirror the catalogue's current search so the box never disagrees with the results
  useEffect(() => setText(onCatalogue ? params.get('q') ?? '' : ''), [onCatalogue, params]);

  // Close on navigation
  useEffect(() => setOpen(false), [location.pathname, location.search]);

  // Ask the server only once typing pauses
  useEffect(() => {
    const timer = setTimeout(() => setQuery(text.trim()), SUGGEST_DELAY);
    return () => clearTimeout(timer);
  }, [text]);

  useEffect(() => {
    const onDown = (e: PointerEvent) => !root.current?.contains(e.target as Node) && setOpen(false);
    document.addEventListener('pointerdown', onDown);
    return () => document.removeEventListener('pointerdown', onDown);
  }, []);

  const enabled = query.length >= MIN_CHARS;
  const { data: results, isFetching } = useProductPage({ q: query, perPage: MAX_PRODUCTS }, enabled);
  const { data: categories = [] } = useCategories();

  const term = query.toLowerCase();
  const options: Option[] = enabled
    ? [
        ...categories
          .filter((c) => (c.products_count ?? 0) > 0 && c.name.toLowerCase().includes(term))
          .slice(0, 3)
          .map((c) => ({
            kind: 'category' as const,
            key: `c-${c.slug}`,
            label: c.name,
            to: `/products?category=${encodeURIComponent(c.slug)}`,
            count: c.products_count ?? 0,
          })),
        ...(results?.data ?? []).map((p) => ({
          kind: 'product' as const,
          key: `p-${p.id}`,
          label: p.name,
          to: `/products/${p.id}`,
          image: productImage(p),
          meta: [p.brand?.name, p.category?.name].filter(Boolean).join(' · '),
          price: formatPrice(p.price),
        })),
        {
          kind: 'all' as const,
          key: 'all',
          label: results && results.total > 0 ? `See all ${results.total} results for “${query}”` : `Search for “${query}”`,
          to: `/products?q=${encodeURIComponent(query)}`,
        },
      ]
    : [];

  useEffect(() => setActive(-1), [query]);

  const go = (to: string) => {
    setOpen(false);
    navigate(to);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (open && active >= 0 && options[active]) return go(options[active].to);
    const q = text.trim();
    go(q ? `/products?q=${encodeURIComponent(q)}` : '/products?view=all');
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (!options.length) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setOpen(true);
      setActive((i) => (i + 1) % options.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((i) => (i <= 0 ? options.length - 1 : i - 1));
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  const showPanel = open && enabled;

  return (
    <form ref={root} role="search" onSubmit={submit} className={`relative ${className}`}>
      <input
        type="search"
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={onKeyDown}
        placeholder="Search laptops, CCTV, printers…"
        aria-label="Search products"
        role="combobox"
        aria-expanded={showPanel}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={active >= 0 ? `${listId}-${active}` : undefined}
        autoComplete="off"
        className="h-11 w-full rounded-md border border-slate-300 bg-paper pl-4 pr-12 text-[15px] text-ink placeholder:text-slate-500 transition-colors focus:border-ink focus:bg-white focus:outline-none [&::-webkit-search-cancel-button]:hidden"
      />
      <button
        type="submit"
        aria-label="Search"
        className="absolute right-1 top-1 flex h-9 w-10 items-center justify-center rounded bg-ink text-white transition-colors hover:bg-primary-500"
      >
        <Search size={17} />
      </button>

      {showPanel && (
        <div className="absolute inset-x-0 top-full z-50 mt-2 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-[0_18px_40px_-12px_rgba(15,23,42,0.25)]">
          <ul id={listId} role="listbox" aria-label="Suggestions" className="max-h-[min(70vh,520px)] overflow-y-auto py-2">
            {options.map((o, i) => (
              <li
                key={o.key}
                id={`${listId}-${i}`}
                role="option"
                aria-selected={i === active}
                onPointerEnter={() => setActive(i)}
                onClick={() => go(o.to)}
                className={`flex cursor-pointer items-center gap-3 px-4 py-2.5 ${i === active ? 'bg-paper' : ''} ${
                  o.kind === 'all' ? 'mt-1 border-t border-slate-100 pt-3 text-sm font-semibold text-primary-600' : ''
                }`}
              >
                {o.kind === 'category' && (
                  <>
                    <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-slate-600">
                      Category
                    </span>
                    <span className="flex-1 text-[15px] font-medium text-ink">{o.label}</span>
                    <span className="text-xs text-slate-500">{o.count}</span>
                  </>
                )}
                {o.kind === 'product' && (
                  <>
                    <img src={o.image} alt="" className="h-11 w-11 flex-shrink-0 rounded border border-slate-200 bg-white object-contain p-1" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[15px] font-medium text-ink">{o.label}</span>
                      <span className="block truncate text-xs text-slate-500">{o.meta}</span>
                    </span>
                    <span className="flex-shrink-0 text-sm font-semibold text-ink">{o.price ?? 'Call'}</span>
                  </>
                )}
                {o.kind === 'all' && (
                  <>
                    <span className="flex-1">{o.label}</span>
                    <ArrowUpRight size={16} />
                  </>
                )}
              </li>
            ))}
          </ul>
          {isFetching && !results && <p className="px-4 pb-3 text-sm text-slate-500">Searching…</p>}
        </div>
      )}
    </form>
  );
};

export default SearchBox;
