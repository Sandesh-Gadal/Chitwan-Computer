import React, { useMemo, useState } from 'react';
import HeroCarousel from '../components/store/HeroCarousel';
import { AskTile, DealTile, RepairTile } from '../components/store/HeroTiles';
import { ProductRail } from '../components/store/Rail';
import { AboutStore, BrandStrip, CategoryRail, HelpBand, PromoBanners, ShopByBudget, TrustBar } from '../components/store/Sections';
import Seo from '../components/Seo';
import { priceInfo, useCatalogOverview, useProductPage } from '../api/products';
import { readRecentlyViewed } from '../hooks/useRecentlyViewed';
import { useFestival } from '../components/festival/registry';
import { defaultSeo, SITE_URL } from '../data/seo';

const RAIL_SIZE = 10;
// Categories shown as their own product rows below the fold
const CATEGORY_ROWS = 3;

// The store itself is described in index.html on every page; this adds the site search for Google
const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Chitwan Computer',
  url: SITE_URL,
  potentialAction: {
    '@type': 'SearchAction',
    target: `${SITE_URL}/products?q={search_term_string}`,
    'query-input': 'required name=search_term_string',
  },
};

const Store: React.FC = () => {
  const festive = useFestival();
  const { data: sections = [], isLoading: sectionsLoading } = useCatalogOverview(RAIL_SIZE);
  const { data: newest, isLoading: newestLoading } = useProductPage({ perPage: RAIL_SIZE });
  // A wider in-stock pool to find discounts in; the API has no "on sale" filter
  const { data: pool, isLoading: poolLoading } = useProductPage({ perPage: 40, inStock: true });

  const deals = useMemo(
    () =>
      (pool?.data ?? [])
        .filter((p) => (priceInfo(p)?.percentOff ?? 0) > 0)
        .sort((a, b) => priceInfo(b)!.percentOff - priceInfo(a)!.percentOff),
    [pool]
  );

  const [recentIds] = useState(readRecentlyViewed);
  const { data: recent } = useProductPage({ ids: recentIds, perPage: recentIds.length || 1 }, recentIds.length > 0);
  const recentProducts = useMemo(
    () => recentIds.map((id) => recent?.data.find((p) => p.id === id)).filter((p) => !!p),
    [recent, recentIds]
  );

  // Skip a category whose row would just repeat "New in the store"
  const newestIds = new Set(newest?.data.map((p) => p.id));
  const categoryRows = sections
    .filter((s) => s.products.length >= 4 && s.products.filter((p) => newestIds.has(p.id)).length < 3)
    .slice(0, CATEGORY_ROWS);

  return (
    <div className="bg-paper pb-16">
      <Seo title={defaultSeo.title} description={defaultSeo.description} path="/" schema={websiteSchema} />
      <h1 className="sr-only">Chitwan Computer: computer, laptop and CCTV shop in Narayanghat, Chitwan</h1>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="pt-4 sm:pt-6">
          <HeroCarousel />
        </div>

        <div className="grid gap-4 pt-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
          <DealTile product={deals[0]} loading={poolLoading} />
          <RepairTile />
          <AskTile />
        </div>

        <div className="mt-8 lg:mt-10">
          <TrustBar />
        </div>

        <CategoryRail sections={sections} loading={sectionsLoading} />

        {deals.length >= 3 && (
          <ProductRail
            id="deals"
            title={festive?.festival.dealsTitle ?? 'Price drops'}
            subtitle="Marked down from MRP, while stock lasts."
            products={deals.slice(0, RAIL_SIZE)}
            festive={!!festive}
          />
        )}

        <ProductRail
          title="New in the store"
          subtitle="The latest stock to reach our shelves."
          products={newest?.data}
          loading={newestLoading}
          viewAll={{ to: '/products?view=all' }}
        />

        <ShopByBudget />

        <PromoBanners sections={sections} />

        {categoryRows.map(({ category, total, products }) => (
          <ProductRail
            key={category.slug}
            title={category.name}
            products={products}
            viewAll={{ to: `/products?category=${encodeURIComponent(category.slug)}`, label: `View all ${total}` }}
          />
        ))}

        <HelpBand />

        {recentProducts.length > 0 && <ProductRail title="Recently viewed" products={recentProducts} />}

        <BrandStrip />

        <AboutStore sections={sections} />
      </div>
    </div>
  );
};

export default Store;
