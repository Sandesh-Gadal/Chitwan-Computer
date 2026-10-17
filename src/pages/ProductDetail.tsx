import React, { useEffect, useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ChevronRight, Phone, MapPin, Clock, Share2, ClipboardPlus, ClipboardCheck } from 'lucide-react';
import ProductCard from '../components/products/ProductCard';
import WhatsAppIcon from '../components/ui/WhatsAppIcon';
import ProductGallery from '../components/products/ProductGallery';
import PriceTag from '../components/products/PriceTag';
import {
  Product,
  useProduct,
  useProductPage,
  formatPrice,
  productImage,
  productImages,
  stockLabel,
  stockStatus,
  storageUrl,
  priceInfo,
} from '../api/products';
import { useEnquiry } from '../context/EnquiryContext';
import { useRecentlyViewed } from '../hooks/useRecentlyViewed';
import { business, whatsappLink } from '../data/business';
import Seo, { breadcrumbSchema } from '../components/Seo';
import { PinnedTag } from '../components/festival/FestivalPieces';
import { useFestival } from '../components/festival/registry';
import { SITE_URL } from '../data/seo';

const RELATED_COUNT = 4;

const stockStyles = {
  in: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  low: 'bg-amber-50 text-amber-800 ring-amber-200',
  out: 'bg-red-50 text-red-700 ring-red-200',
};

const ProductDetail: React.FC = () => {
  const { id } = useParams();
  const productId = Number(id);
  const { data: product, isLoading, isError } = useProduct(productId);
  const enquiryList = useEnquiry();
  const recentIds = useRecentlyViewed(product?.id);
  const festive = useFestival();

  // Small, targeted requests for the rows under the product
  const brandSlug = product?.brand?.slug;
  const categorySlug = product?.category?.slug;
  const { data: brandPage } = useProductPage({ brands: brandSlug ? [brandSlug] : [], perPage: RELATED_COUNT + 1 }, !!brandSlug);
  const { data: categoryPage } = useProductPage({ category: categorySlug, perPage: RELATED_COUNT * 2 + 1 }, !!categorySlug);
  const { data: recentPage } = useProductPage({ ids: recentIds, perPage: recentIds.length || 1 }, recentIds.length > 0);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [productId]);

  // Same brand first, then same category without repeating those
  const { fromBrand, fromCategory, recent } = useMemo(() => {
    if (!product) return { fromBrand: [], fromCategory: [], recent: [] };
    const fromBrand = (brandSlug ? brandPage?.data ?? [] : []).filter((p) => p.id !== product.id).slice(0, RELATED_COUNT);
    const shown = new Set([product.id, ...fromBrand.map((p) => p.id)]);
    const fromCategory = (categoryPage?.data ?? []).filter((p) => !shown.has(p.id)).slice(0, RELATED_COUNT);
    const recent = recentIds
      .map((rid) => recentPage?.data.find((p) => p.id === rid))
      .filter((p): p is Product => Boolean(p))
      .slice(0, RELATED_COUNT);
    return { fromBrand, fromCategory, recent };
  }, [product, brandSlug, brandPage, categoryPage, recentPage, recentIds]);

  if (isLoading && !product) {
    return (
      <section className="min-h-screen bg-paper">
        <div className="mx-auto grid max-w-7xl animate-pulse gap-10 px-4 py-14 sm:px-6 lg:grid-cols-2 lg:px-8">
          <div className="aspect-square rounded-xl bg-slate-200" />
          <div className="space-y-4">
            <div className="h-4 w-24 rounded bg-slate-200" />
            <div className="h-10 w-3/4 rounded bg-slate-200" />
            <div className="h-8 w-40 rounded bg-slate-200" />
            <div className="h-24 rounded bg-slate-200" />
          </div>
        </div>
      </section>
    );
  }

  if (isError || !product) {
    return (
      <section className="flex min-h-[70vh] items-center justify-center bg-paper px-4">
        <div className="max-w-md text-center">
          <h1 className="font-display text-3xl font-semibold text-ink">Product not found</h1>
          <p className="mt-3 text-slate-600">It may have sold out or been removed from the catalogue.</p>
          <Link
            to="/products"
            className="mt-6 inline-block rounded-md bg-ink px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-500"
          >
            Browse all products
          </Link>
        </div>
      </section>
    );
  }

  const price = formatPrice(product.price);
  const pricing = priceInfo(product);
  const status = stockStatus(product.quantity);
  const images = productImages(product);
  const inList = enquiryList.has(product.id);
  const pageUrl = typeof window !== 'undefined' ? window.location.href : '';
  const enquiry = `Hi Chitwan Computer, I'm interested in "${product.name}"${
    price ? ` (${price}${pricing?.mrp ? `, MRP ${formatPrice(pricing.mrp)}` : ''})` : ''
  }. ${
    status === 'out' ? 'When will it be back in stock?' : 'Is it available?'
  }\n${pageUrl}`;

  const share = async () => {
    if (navigator.share) {
      await navigator.share({ title: product.name, url: pageUrl }).catch(() => {});
    } else {
      await navigator.clipboard?.writeText(pageUrl);
    }
  };

  return (
    <section className="min-h-screen bg-paper pb-24">
      <Seo
        title={`${product.name} Price in Nepal | Chitwan Computer`}
        description={`${product.name}${price ? ` for ${price}` : ''} at Chitwan Computer, Narayanghat. ${
          stockLabel[status]
        }. ${(product.description ?? '').replace(/\s+/g, ' ').slice(0, 90)}`}
        path={`/products/${product.id}`}
        image={productImage(product)}
        type="product"
        schema={[
          {
            '@context': 'https://schema.org',
            '@type': 'Product',
            name: product.name,
            image: images,
            description: product.description ?? product.name,
            sku: String(product.id),
            ...(product.brand ? { brand: { '@type': 'Brand', name: product.brand.name } } : {}),
            ...(product.category ? { category: product.category.name } : {}),
            ...(pricing
              ? {
                  offers: {
                    '@type': 'Offer',
                    url: `${SITE_URL}/products/${product.id}`,
                    priceCurrency: 'NPR',
                    price: pricing.price,
                    availability: status === 'out' ? 'https://schema.org/OutOfStock' : 'https://schema.org/InStock',
                    itemCondition: 'https://schema.org/NewCondition',
                    seller: { '@id': `${SITE_URL}/#store` },
                  },
                }
              : {}),
          },
          breadcrumbSchema([
            { name: 'Home', path: '/' },
            { name: 'Products', path: '/products' },
            ...(product.category
              ? [{ name: product.category.name, path: `/products?category=${encodeURIComponent(product.category.slug)}` }]
              : []),
            { name: product.name, path: `/products/${product.id}` },
          ]),
        ]}
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1.5 py-6 text-sm text-slate-600">
          <Link to="/" className="hover:text-ink">
            Home
          </Link>
          <ChevronRight size={14} className="text-slate-400" />
          <Link to="/products" className="hover:text-ink">
            Products
          </Link>
          {product.category && (
            <>
              <ChevronRight size={14} className="text-slate-400" />
              <Link to={`/products?category=${encodeURIComponent(product.category.slug)}`} className="hover:text-ink">
                {product.category.name}
              </Link>
            </>
          )}
          <ChevronRight size={14} className="text-slate-400" />
          <span className="line-clamp-1 text-ink">{product.name}</span>
        </nav>

        <div className="grid gap-10 lg:grid-cols-12 lg:gap-14">
          {/* Photos */}
          <div className="lg:col-span-7">
            <div className="lg:sticky lg:top-24">
              <ProductGallery images={images} alt={product.name} label={product.label} />
            </div>
          </div>

          {/* Details */}
          <div className="lg:col-span-5">
            <div className="flex items-center gap-4">
              {product.brand && (
                <Link
                  to={`/products?brand=${encodeURIComponent(product.brand.slug)}`}
                  title={`More from ${product.brand.name}`}
                  className="flex h-10 items-center rounded-md border border-slate-200 bg-white px-3 transition-colors hover:border-slate-400"
                >
                  {product.brand.logo ? (
                    <img src={storageUrl(product.brand.logo)} alt={product.brand.name} className="h-6 w-auto max-w-[90px] object-contain" />
                  ) : (
                    <span className="text-sm font-semibold text-ink">{product.brand.name}</span>
                  )}
                </Link>
              )}
              {product.category && (
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-600">{product.category.name}</p>
              )}
            </div>
            <h1 className="mt-2 font-display text-3xl font-semibold leading-tight text-ink sm:text-4xl">{product.name}</h1>

            <div className="mt-6 space-y-3">
              {festive && pricing?.mrp && (
                <div className="pb-1 pt-2">
                  <PinnedTag size="md" tilt={-3}>
                    {festive.festival.dealLabel} · save {formatPrice(pricing.save)}
                  </PinnedTag>
                </div>
              )}
              <PriceTag product={product} size="detail" />
              <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset ${stockStyles[status]}`}>
                {stockLabel[status]}
              </span>
            </div>

            {/* Actions */}
            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              <a
                href={whatsappLink(enquiry)}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-md bg-[#1FAF54] px-5 py-3.5 text-[15px] font-semibold text-white transition-colors hover:bg-[#178F44]"
              >
                <WhatsAppIcon size={19} />
                Ask on WhatsApp
              </a>
              <a
                href={business.phones[0].href}
                className="inline-flex items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-5 py-3.5 text-[15px] font-semibold text-ink transition-colors hover:border-ink"
              >
                <Phone size={17} />
                Call {business.phones[0].label}
              </a>
            </div>
            <p className="mt-2 text-sm text-slate-600">
              Or call our landline{' '}
              <a href={business.phones[1].href} className="font-semibold text-ink hover:underline">
                {business.phones[1].label}
              </a>
            </p>
            <button
              onClick={() => (inList ? enquiryList.open() : enquiryList.add(product))}
              className={`mt-3 inline-flex w-full items-center justify-center gap-2 rounded-md border px-5 py-3 text-[15px] font-semibold transition-colors ${
                inList ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-slate-300 bg-white text-ink hover:border-ink'
              }`}
            >
              {inList ? <ClipboardCheck size={17} /> : <ClipboardPlus size={17} />}
              {inList ? 'In your enquiry list · view' : 'Add to enquiry list'}
            </button>
            <button
              onClick={share}
              className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition-colors hover:text-ink"
            >
              <Share2 size={15} />
              Share this product
            </button>

            {product.description && (
              <div className="mt-10 border-t border-slate-200 pt-8">
                <h2 className="font-display text-lg font-semibold text-ink">Details</h2>
                <p className="mt-3 whitespace-pre-line leading-relaxed text-slate-700">{product.description}</p>
              </div>
            )}

            {/* Store info */}
            <div className="mt-10 rounded-lg border border-slate-200 bg-white p-5">
              <p className="font-display font-semibold text-ink">See it in store</p>
              <ul className="mt-3 space-y-2 text-sm text-slate-700">
                <li className="flex items-start gap-2.5">
                  <MapPin size={16} className="mt-0.5 flex-shrink-0 text-primary-600" />
                  <a href={business.mapsUrl} target="_blank" rel="noreferrer" className="hover:text-ink hover:underline">
                    {business.address.line1}, {business.address.line2}
                  </a>
                </li>
                <li className="flex items-start gap-2.5">
                  <Clock size={16} className="mt-0.5 flex-shrink-0 text-primary-600" />
                  {business.hours.days}, {business.hours.time}
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Related */}
        {fromBrand.length > 0 && product.brand && (
          <ProductRow
            title={`More from ${product.brand.name}`}
            products={fromBrand}
            viewAll={`/products?brand=${encodeURIComponent(product.brand.slug)}`}
          />
        )}
        {fromCategory.length > 0 && product.category && (
          <ProductRow
            title={`More in ${product.category.name}`}
            products={fromCategory}
            viewAll={`/products?category=${encodeURIComponent(product.category.slug)}`}
          />
        )}
        {recent.length > 0 && <ProductRow title="Recently viewed" products={recent} />}
      </div>
    </section>
  );
};

const ProductRow: React.FC<{ title: string; products: Product[]; viewAll?: string }> = ({ title, products, viewAll }) => (
  <div className="mt-20 border-t border-slate-200 pt-14">
    <div className="flex items-end justify-between gap-4">
      <h2 className="font-display text-2xl font-semibold text-ink sm:text-3xl">{title}</h2>
      {viewAll && (
        <Link to={viewAll} className="text-sm font-semibold text-primary-600 hover:underline">
          View all
        </Link>
      )}
    </div>
    <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 lg:grid-cols-4">
      {products.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  </div>
);

export default ProductDetail;
