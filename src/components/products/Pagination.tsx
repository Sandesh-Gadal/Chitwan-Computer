import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  current: number;
  last: number;
  from: number | null;
  to: number | null;
  total: number;
}

// 1 … 4 5 6 … 12 — always the first, last and two either side of the current page
const pageList = (current: number, last: number): (number | 'gap')[] => {
  const pages = new Set([1, last, current - 1, current, current + 1].filter((p) => p >= 1 && p <= last));
  const sorted = [...pages].sort((a, b) => a - b);
  const out: (number | 'gap')[] = [];
  sorted.forEach((page, i) => {
    if (i > 0 && page - sorted[i - 1] > 1) out.push(page - sorted[i - 1] === 2 ? page - 1 : 'gap');
    out.push(page);
  });
  return out;
};

const Pagination: React.FC<PaginationProps> = ({ current, last, from, to, total }) => {
  const location = useLocation();

  // Real links, so pages can be opened in a new tab or shared
  const hrefFor = (page: number) => {
    const params = new URLSearchParams(location.search);
    if (page <= 1) params.delete('page');
    else params.set('page', String(page));
    const qs = params.toString();
    return `${location.pathname}${qs ? `?${qs}` : ''}`;
  };

  const base = 'inline-flex h-9 min-w-9 items-center justify-center rounded-md px-2 text-sm font-medium transition-colors sm:h-10 sm:min-w-10 sm:px-3';

  return (
    <nav aria-label="Pagination" className="mt-14 flex flex-col items-center gap-4">
      {last > 1 && (
        <div className="flex flex-wrap items-center justify-center gap-1 sm:gap-1.5">
          {current > 1 ? (
            <Link to={hrefFor(current - 1)} className={`${base} border border-slate-300 bg-white text-ink hover:border-ink`} aria-label="Previous page">
              <ChevronLeft size={18} />
              <span className="ml-1 hidden sm:inline">Previous</span>
            </Link>
          ) : (
            <span className={`${base} border border-slate-200 bg-white text-slate-300`} aria-hidden="true">
              <ChevronLeft size={18} />
              <span className="ml-1 hidden sm:inline">Previous</span>
            </span>
          )}

          {pageList(current, last).map((page, i) =>
            page === 'gap' ? (
              <span key={`gap-${i}`} className="px-1 text-slate-400">
                …
              </span>
            ) : page === current ? (
              <span key={page} aria-current="page" className={`${base} bg-ink text-white`}>
                {page}
              </span>
            ) : (
              <Link key={page} to={hrefFor(page)} className={`${base} border border-slate-300 bg-white text-ink hover:border-ink`} aria-label={`Page ${page}`}>
                {page}
              </Link>
            )
          )}

          {current < last ? (
            <Link to={hrefFor(current + 1)} className={`${base} border border-slate-300 bg-white text-ink hover:border-ink`} aria-label="Next page">
              <span className="mr-1 hidden sm:inline">Next</span>
              <ChevronRight size={18} />
            </Link>
          ) : (
            <span className={`${base} border border-slate-200 bg-white text-slate-300`} aria-hidden="true">
              <span className="mr-1 hidden sm:inline">Next</span>
              <ChevronRight size={18} />
            </span>
          )}
        </div>
      )}
      {from !== null && to !== null && (
        <p className="text-sm text-slate-600">
          Showing <span className="font-semibold text-ink">{from}</span>–<span className="font-semibold text-ink">{to}</span> of{' '}
          <span className="font-semibold text-ink">{total}</span> products
        </p>
      )}
    </nav>
  );
};

export default Pagination;
