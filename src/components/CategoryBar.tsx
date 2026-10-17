import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { ChevronDown, LayoutGrid } from 'lucide-react';
import { Category, useFacets } from '../api/products';

// Shown in the bar (fewer on smaller laptops); the rest are in the "All products" list
const CATEGORY_LINKS = 6;
const CATEGORY_LINKS_LG = 4;
const OPEN_DELAY = 120;
const CLOSE_DELAY = 180;
const ALL = '__all';

const pages = [
  { hash: 'about', label: 'About' },
  { hash: 'services', label: 'Services' },
  { hash: 'testimonials', label: 'Reviews' },
  { hash: 'contact', label: 'Contact' },
];

const catLink = (slug: string, extra?: Record<string, string>) =>
  `/products?${new URLSearchParams({ category: slug, ...extra })}`;

/* ------------------------------------------------------------------------- */

const Dropdown: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: -4 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -4 }}
    transition={{ duration: 0.15, ease: [0.22, 1, 0.36, 1] }}
    className="absolute left-0 top-full z-40 pt-px"
  >
    <ul className="min-w-[230px] rounded-b-md border border-slate-200 bg-white py-2 text-sm shadow-[0_16px_32px_-16px_rgba(15,23,42,0.35)]">
      {children}
    </ul>
  </motion.div>
);

const DropdownItem: React.FC<{ to: string; count?: number; strong?: boolean; children: React.ReactNode }> = ({
  to,
  count,
  strong,
  children,
}) => (
  <li>
    <Link
      to={to}
      className={`flex items-center justify-between gap-6 px-4 py-2 transition-colors hover:bg-paper hover:text-primary-600 ${
        strong ? 'font-semibold text-ink' : 'text-slate-700'
      }`}
    >
      {children}
      {count !== undefined && <span className="text-xs tabular-nums text-slate-400">{count}</span>}
    </Link>
  </li>
);

/** Brands within one category, most stocked first */
const BrandList: React.FC<{ category: Category }> = ({ category }) => {
  const { data: facets, isPlaceholderData } = useFacets({ category: category.slug });
  const brands = (facets?.brands ?? []).filter((b) => b.count > 0).sort((a, b) => b.count - a.count);
  const loading = !facets || isPlaceholderData;

  return (
    <Dropdown>
      <DropdownItem to={catLink(category.slug)} count={category.products_count} strong>
        All {category.name}
      </DropdownItem>
      <li className="my-1.5 border-t border-slate-100" />
      {loading
        ? Array.from({ length: 4 }, (_, i) => (
            <li key={i} className="px-4 py-2">
              <span className="block h-4 w-28 animate-pulse rounded bg-slate-100" />
            </li>
          ))
        : brands.map((b) => (
            <DropdownItem key={b.slug} to={catLink(category.slug, { brand: b.slug })} count={b.count}>
              {b.name}
            </DropdownItem>
          ))}
    </Dropdown>
  );
};

/* ------------------------------------------------------------------------- */

/** Desktop category bar; hovering or focusing a category lists its brands */
const CategoryBar: React.FC<{ categories: Category[] }> = ({ categories }) => {
  const [open, setOpen] = useState<string | null>(null);
  const timer = useRef<number>();
  const location = useLocation();
  const [params] = useSearchParams();
  const activeCategory = location.pathname === '/products' ? params.get('category') : null;

  // Close whenever the visitor goes somewhere
  useEffect(() => setOpen(null), [location.pathname, location.search]);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  // Small delays so sweeping the mouse across the bar doesn't flash every list
  const schedule = (key: string | null) => {
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setOpen(key), key === null ? CLOSE_DELAY : open ? 0 : OPEN_DELAY);
  };

  const trigger = (key: string) => ({
    onFocus: () => {
      window.clearTimeout(timer.current);
      setOpen(key);
    },
    'aria-expanded': open === key,
    'aria-haspopup': true as const,
  });

  return (
    <nav
      aria-label="Shop"
      className="hidden border-t border-slate-200 lg:block"
      onMouseLeave={() => schedule(null)}
      onKeyDown={(e) => e.key === 'Escape' && setOpen(null)}
    >
      <div className="mx-auto flex h-11 max-w-7xl items-center justify-between gap-8 px-4 sm:px-6 lg:px-8">
        <ul className="flex min-w-0 items-center gap-6 whitespace-nowrap text-sm xl:gap-7">
          <li className="relative" onMouseEnter={() => schedule(ALL)}>
            <Link
              to="/products?view=all"
              {...trigger(ALL)}
              className="flex items-center gap-2 py-3 font-semibold text-ink transition-colors hover:text-primary-600"
            >
              <LayoutGrid size={15} />
              All products
              <ChevronDown size={14} className={`transition-transform ${open === ALL ? 'rotate-180' : ''}`} />
            </Link>
            <AnimatePresence>
              {open === ALL && (
                <Dropdown>
                  {categories.map((c) => (
                    <DropdownItem key={c.slug} to={catLink(c.slug)} count={c.products_count}>
                      {c.name}
                    </DropdownItem>
                  ))}
                  <li className="my-1.5 border-t border-slate-100" />
                  <DropdownItem to="/products?view=all" strong>
                    Browse all products
                  </DropdownItem>
                </Dropdown>
              )}
            </AnimatePresence>
          </li>

          {categories.slice(0, CATEGORY_LINKS).map((c, i) => {
            const current = activeCategory === c.slug;
            return (
              <li
                key={c.slug}
                className={`relative flex-shrink-0 ${i >= CATEGORY_LINKS_LG ? 'hidden xl:block' : ''}`}
                onMouseEnter={() => schedule(c.slug)}
              >
                <Link
                  to={catLink(c.slug)}
                  {...trigger(c.slug)}
                  aria-current={current ? 'page' : undefined}
                  className={`relative flex items-center gap-1 py-3 transition-colors ${
                    current || open === c.slug ? 'text-ink' : 'text-slate-600 hover:text-ink'
                  } ${current ? 'font-semibold' : ''}`}
                >
                  {c.name}
                  <ChevronDown size={13} className={`text-slate-400 transition-transform ${open === c.slug ? 'rotate-180' : ''}`} />
                  {(current || open === c.slug) && <span className="absolute inset-x-0 -bottom-px h-[2px] bg-primary-500" />}
                </Link>
                <AnimatePresence>{open === c.slug && <BrandList category={c} />}</AnimatePresence>
              </li>
            );
          })}
        </ul>

        <ul className="flex flex-shrink-0 items-center gap-6 text-sm text-slate-600" onMouseEnter={() => schedule(null)}>
          {pages.map((p) => (
            <li key={p.hash}>
              <Link to={`/about#${p.hash}`} className="transition-colors hover:text-ink">
                {p.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
};

export default CategoryBar;
