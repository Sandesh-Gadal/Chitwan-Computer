import React from 'react';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import SectionHeading from './ui/SectionHeading';
import Reveal from './ui/Reveal';
import ProductCard, { ProductCardSkeleton } from './products/ProductCard';
import { useCategories, useProductPage } from '../api/products';

const FEATURED_COUNT = 4;

const FeaturedProducts: React.FC = () => {
  // Newest products that are in stock
  const { data: page, isLoading, isError } = useProductPage({ perPage: FEATURED_COUNT, inStock: true });
  const featured = page?.data ?? [];

  // Categories that have products, in the store's display order
  const { data: allCategories = [] } = useCategories();
  const categories = allCategories
    .filter((c) => (c.products_count ?? 0) > 0)
    .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
    .map((c) => ({ ...c, count: c.products_count ?? 0 }));

  return (
    <section id="products" className="border-t border-slate-200 bg-white py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          title="New in the store."
          intro="Our latest stock, with prices. Tap any product for details or to ask us about it on WhatsApp."
          aside={
            <Link
              to="/products"
              className="group mt-6 inline-flex items-center gap-2 border-b-2 border-ink pb-1 text-[15px] font-semibold text-ink transition-colors hover:border-primary-500 hover:text-primary-500"
            >
              View all products
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
            </Link>
          }
        />

        {/* Shop by category */}
        {categories.length > 0 && (
          <Reveal className="mb-12 flex flex-wrap gap-2">
            {categories.map((category) => (
              <Link
                key={category.slug}
                to={`/products?category=${encodeURIComponent(category.slug)}`}
                className="group inline-flex items-center gap-2 rounded-md border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-ink transition-colors hover:border-ink hover:bg-ink hover:text-white"
              >
                {category.name}
                <span className="text-xs text-slate-500 transition-colors group-hover:text-slate-300">{category.count}</span>
                <ArrowUpRight size={14} className="text-slate-400 transition-colors group-hover:text-white" />
              </Link>
            ))}
          </Reveal>
        )}

        {isError ? (
          <div className="rounded-lg border border-dashed border-slate-300 px-6 py-12 text-center">
            <p className="text-slate-600">We couldn't load products right now.</p>
            <Link to="/products" className="mt-3 inline-block font-semibold text-primary-600 hover:underline">
              Try the full catalogue
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 lg:grid-cols-4">
            {isLoading
              ? Array.from({ length: FEATURED_COUNT }, (_, i) => <ProductCardSkeleton key={i} />)
              : featured.map((product, i) => (
                  <Reveal key={product.id} delay={0.06 * i}>
                    <ProductCard product={product} />
                  </Reveal>
                ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturedProducts;
