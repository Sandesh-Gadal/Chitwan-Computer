import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import SectionHeading from './ui/SectionHeading';
import Reveal from './ui/Reveal';
import { useBrands, storageUrl } from '../api/products';

const COLLAPSED = 12;

const ShopByBrand: React.FC = () => {
  const { data: brands = [], isLoading } = useBrands();
  const [showAll, setShowAll] = useState(false);

  // Brands with stock first, most products first
  const listed = brands.filter((b) => (b.products_count ?? 0) > 0).sort((a, b) => (b.products_count ?? 0) - (a.products_count ?? 0));
  const shown = showAll ? listed : listed.slice(0, COLLAPSED);

  if (!isLoading && listed.length === 0) return null;

  return (
    <section id="brands" className="border-t border-slate-200 bg-paper py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          title="Shop by brand."
          intro="Genuine products from the names you know. Pick a brand to see everything we have from them."
        />

        <Reveal>
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {isLoading
              ? Array.from({ length: COLLAPSED }, (_, i) => (
                  <li key={i} className="h-32 animate-pulse rounded-lg bg-slate-200" />
                ))
              : shown.map((brand) => (
                  <li key={brand.id}>
                    <Link
                      to={`/products?brand=${encodeURIComponent(brand.slug)}`}
                      className="group flex h-32 flex-col items-center justify-center gap-3 rounded-lg border border-slate-200 bg-white p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-primary-500 hover:shadow-[0_12px_28px_-16px_rgba(15,82,186,0.4)]"
                    >
                      <span className="flex h-10 w-full items-center justify-center">
                        {brand.logo ? (
                          <img
                            src={storageUrl(brand.logo)}
                            alt={brand.name}
                            loading="lazy"
                            className="max-h-10 max-w-[75%] object-contain transition-transform duration-300 group-hover:scale-105"
                          />
                        ) : (
                          <span className="font-display text-lg font-semibold text-ink">{brand.name}</span>
                        )}
                      </span>
                      <span className="text-xs text-slate-600">
                        {brand.products_count} {brand.products_count === 1 ? 'product' : 'products'}
                      </span>
                    </Link>
                  </li>
                ))}
          </ul>
        </Reveal>

        {listed.length > COLLAPSED && (
          <div className="mt-8 text-center">
            <button
              onClick={() => setShowAll((s) => !s)}
              className="inline-flex items-center gap-2 rounded-md border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-ink transition-colors hover:border-ink"
            >
              {showAll ? 'Show fewer brands' : `View all ${listed.length} brands`}
              <ChevronDown size={16} className={`transition-transform ${showAll ? 'rotate-180' : ''}`} />
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default ShopByBrand;
