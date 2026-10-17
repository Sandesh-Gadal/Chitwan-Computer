import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import ProductCard, { ProductCardSkeleton } from '../products/ProductCard';
import { Product } from '../../api/products';
import { FestivalMark } from '../festival/registry';

interface RailProps {
  title: string;
  subtitle?: string;
  viewAll?: { to: string; label?: string };
  /** Tailwind width classes for each item */
  itemClassName?: string;
  /** Adds the current festival's icon beside the title */
  festive?: boolean;
  /** Anchor id, so other parts of the page can link here */
  id?: string;
  children: React.ReactNode;
}

/** Section heading plus a horizontally scrolling, snap-aligned row with arrow controls */
export const Rail: React.FC<RailProps> = ({ title, subtitle, viewAll, itemClassName, festive, id, children }) => {
  const track = useRef<HTMLUListElement>(null);
  const [edges, setEdges] = useState({ start: true, end: true });

  const measure = useCallback(() => {
    const el = track.current;
    if (!el) return;
    setEdges({ start: el.scrollLeft <= 4, end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 4 });
  }, []);

  useEffect(() => {
    measure();
    const el = track.current;
    if (!el) return;
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [measure, children]);

  const scroll = (dir: 1 | -1) => {
    const el = track.current;
    if (el) el.scrollBy({ left: dir * el.clientWidth * 0.9, behavior: 'smooth' });
  };

  const items = React.Children.toArray(children);

  return (
    <section id={id} className="py-10 lg:py-14">
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <h2 className="flex items-center gap-3 font-display text-2xl font-semibold text-ink sm:text-[1.75rem]">
            {festive && <FestivalMark className="h-7 w-5 -rotate-12" />}
            {title}
          </h2>
          {subtitle && <p className="mt-1 text-[15px] text-slate-600">{subtitle}</p>}
        </div>
        <div className="flex flex-shrink-0 items-center gap-2">
          {viewAll && (
            <Link
              to={viewAll.to}
              className="group mr-2 inline-flex items-center gap-1.5 text-sm font-semibold text-ink hover:text-primary-600"
            >
              {viewAll.label ?? 'View all'}
              <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
            </Link>
          )}
          {!(edges.start && edges.end) && (
            <div className="hidden gap-1.5 md:flex">
              <button
                onClick={() => scroll(-1)}
                disabled={edges.start}
                aria-label={`Scroll ${title} back`}
                className="flex h-9 w-9 items-center justify-center rounded-md border border-slate-300 bg-white text-ink transition-colors hover:border-ink disabled:cursor-default disabled:opacity-35 disabled:hover:border-slate-300"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                onClick={() => scroll(1)}
                disabled={edges.end}
                aria-label={`Scroll ${title} forward`}
                className="flex h-9 w-9 items-center justify-center rounded-md border border-slate-300 bg-white text-ink transition-colors hover:border-ink disabled:cursor-default disabled:opacity-35 disabled:hover:border-slate-300"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          )}
        </div>
      </div>

      <ul
        ref={track}
        onScroll={measure}
        className="scrollbar-hide -mx-4 flex snap-x snap-mandatory scroll-px-4 gap-4 overflow-x-auto px-4 sm:-mx-6 sm:scroll-px-6 sm:gap-6 sm:px-6 lg:mx-0 lg:scroll-px-0 lg:px-0"
      >
        {items.map((child, i) => (
          <li key={i} className={`flex-shrink-0 snap-start ${itemClassName ?? ''}`}>
            {child}
          </li>
        ))}
      </ul>
    </section>
  );
};

// Two and a bit cards on phones so the row reads as scrollable, five on wide screens
const PRODUCT_WIDTH =
  'w-[44%] sm:w-[calc((100%-3rem)/3)] lg:w-[calc((100%-4.5rem)/4)] xl:w-[calc((100%-6rem)/5)]';

interface ProductRailProps extends Omit<RailProps, 'children' | 'itemClassName'> {
  products: Product[] | undefined;
  loading?: boolean;
}

export const ProductRail: React.FC<ProductRailProps> = ({ products, loading, ...rail }) => {
  if (!loading && !products?.length) return null;
  return (
    <Rail {...rail} itemClassName={PRODUCT_WIDTH}>
      {loading
        ? Array.from({ length: 5 }, (_, i) => <ProductCardSkeleton key={i} />)
        : products!.map((product) => <ProductCard key={product.id} product={product} />)}
    </Rail>
  );
};
