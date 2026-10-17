import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, MessagesSquare, Phone, ShieldCheck, Store, Wrench } from 'lucide-react';
import { Rail } from './Rail';
import WhatsAppIcon from '../ui/WhatsAppIcon';
import { CategorySection, formatPrice, productImage, storageUrl, useBrands, useProductPage } from '../../api/products';
import { business, whatsappLink } from '../../data/business';
import { promoCategories } from '../../data/storefront';
import { categorySeo } from '../../data/seo';
import StoreStatusBadge from '../ui/StoreStatusBadge';

/* ------------------------------------------------------------------------- */

const promises = [
  { icon: ShieldCheck, title: 'Genuine, warrantied', text: 'From authorised distributors' },
  { icon: MessagesSquare, title: 'Advice before you buy', text: 'Matched to your work and budget' },
  { icon: Wrench, title: 'In-house repairs', text: 'Laptops, desktops and printers' },
  { icon: Store, title: `In Chitwan since ${business.since}`, text: business.address.line1 },
];

export const TrustBar: React.FC = () => (
  <ul className="grid grid-cols-2 border-y border-slate-200 lg:grid-cols-4">
    {promises.map(({ icon: Icon, title, text }, i) => (
      <li
        key={title}
        className={`flex items-start gap-3 py-5 sm:items-center sm:gap-4 lg:px-6 lg:first:pl-0 ${
          i % 2 === 1 ? 'pl-4 sm:pl-6' : 'pr-4'
        } ${i > 1 ? 'border-t border-slate-200 lg:border-t-0' : ''} ${i > 0 ? 'lg:border-l lg:border-slate-200' : ''} ${
          i % 2 === 1 ? 'border-l border-slate-200' : ''
        }`}
      >
        <Icon size={22} strokeWidth={1.6} className="mt-0.5 flex-shrink-0 text-primary-500 sm:mt-0" />
        <div className="min-w-0">
          <p className="text-sm font-semibold text-ink sm:text-[15px]">{title}</p>
          <p className="mt-0.5 text-xs text-slate-600 sm:text-[13px]">{text}</p>
        </div>
      </li>
    ))}
  </ul>
);

/* ------------------------------------------------------------------------- */

export const CategoryRail: React.FC<{ sections: CategorySection[]; loading: boolean }> = ({ sections, loading }) => (
  <Rail
    title="Shop by category"
    viewAll={{ to: '/products?view=all', label: 'All products' }}
    itemClassName="w-[38%] sm:w-[calc((100%-4.5rem)/4)] lg:w-[calc((100%-7.5rem)/6)]"
  >
    {loading
      ? Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="animate-pulse">
            <div className="aspect-square rounded-lg bg-slate-200" />
            <div className="mx-auto mt-3 h-4 w-20 rounded bg-slate-200" />
          </div>
        ))
      : sections.map(({ category, total, products }) => (
          <Link key={category.slug} to={`/products?category=${encodeURIComponent(category.slug)}`} className="group block text-center">
            <div className="relative aspect-square overflow-hidden rounded-lg border border-slate-200 bg-white transition-colors group-hover:border-ink">
              {products[0] && (
                <img
                  src={productImage(products[0])}
                  alt=""
                  loading="lazy"
                  className="absolute inset-0 h-full w-full object-contain p-6 transition-transform duration-500 group-hover:scale-[1.06]"
                />
              )}
            </div>
            <p className="mt-3 text-[15px] font-semibold text-ink">{category.name}</p>
            <p className="text-xs text-slate-500">{total} items</p>
          </Link>
        ))}
  </Rail>
);

/* ------------------------------------------------------------------------- */

const tones = ['bg-[#E9EEF5]', 'bg-[#EFECE6]'];

const PromoBanner: React.FC<{ section: CategorySection; line: string; tone: string }> = ({ section, line, tone }) => {
  const { category, total, products } = section;
  // Cheapest priced product in the whole category, not just the few loaded here
  const { data: cheapest } = useProductPage({ category: category.slug, sort: 'price-asc', perPage: 1 });
  const from = formatPrice(cheapest?.data[0]?.price);
  const cover = products.find((p) => p.quantity > 0) ?? products[0];

  return (
    <Link
      to={`/products?category=${encodeURIComponent(category.slug)}`}
      className={`group relative grid min-h-[230px] grid-cols-[1fr_42%] overflow-hidden rounded-lg sm:min-h-[260px] ${tone}`}
    >
      <div className="flex flex-col justify-between p-6 sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-600">{total} products</p>
        <div>
          <h3 className="font-display text-3xl font-semibold leading-none text-ink sm:text-4xl">{category.name}</h3>
          <p className="mt-3 max-w-[15rem] text-[15px] leading-snug text-slate-700">{line}</p>
          {from && (
            <p className="mt-4 text-sm text-slate-600">
              From <span className="font-semibold text-ink">{from}</span>
            </p>
          )}
          <span className="mt-5 inline-flex items-center gap-1.5 border-b border-ink pb-0.5 text-sm font-semibold text-ink">
            Shop {category.name.toLowerCase()}
            <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
          </span>
        </div>
      </div>
      <div className="relative">
        {cover && (
          <img
            src={productImage(cover)}
            alt=""
            loading="lazy"
            className="absolute inset-0 h-full w-full object-contain p-4 mix-blend-multiply transition-transform duration-700 group-hover:scale-105 sm:p-6"
          />
        )}
      </div>
    </Link>
  );
};

export const PromoBanners: React.FC<{ sections: CategorySection[] }> = ({ sections }) => {
  const banners = promoCategories
    .map((promo) => ({ ...promo, section: sections.find((s) => s.category.slug === promo.slug) }))
    .filter((b): b is typeof b & { section: CategorySection } => !!b.section);

  // Fall back to the two largest categories if the featured ones are empty
  const shown =
    banners.length === 2
      ? banners
      : [...sections]
          .sort((a, b) => b.total - a.total)
          .slice(0, 2)
          .map((section) => ({ slug: section.category.slug, line: `${section.total} products to choose from.`, section }));

  if (!shown.length) return null;

  return (
    <div className="grid gap-4 py-6 md:grid-cols-2 lg:gap-6">
      {shown.map((b, i) => (
        <PromoBanner key={b.slug} section={b.section} line={b.line} tone={tones[i % tones.length]} />
      ))}
    </div>
  );
};

/* ------------------------------------------------------------------------- */

export const BrandStrip: React.FC = () => {
  const { data: brands = [] } = useBrands();
  const listed = brands
    .filter((b) => (b.products_count ?? 0) > 0)
    .sort((a, b) => (b.products_count ?? 0) - (a.products_count ?? 0))
    .slice(0, 12);

  if (!listed.length) return null;

  return (
    <section className="py-10 lg:py-14">
      <div className="mb-6 flex items-end justify-between gap-4">
        <h2 className="font-display text-2xl font-semibold text-ink sm:text-[1.75rem]">Brands we carry</h2>
      </div>
      <ul className="grid grid-cols-3 border-l border-t border-slate-200 sm:grid-cols-4 lg:grid-cols-6">
        {listed.map((brand) => (
          <li key={brand.id} className="border-b border-r border-slate-200">
            <Link
              to={`/products?brand=${encodeURIComponent(brand.slug)}`}
              className="group flex h-24 items-center justify-center bg-white px-4 transition-colors hover:bg-paper sm:h-28"
              title={`${brand.name} · ${brand.products_count} products`}
            >
              {brand.logo ? (
                <img
                  src={storageUrl(brand.logo)}
                  alt={brand.name}
                  loading="lazy"
                  className="max-h-8 max-w-[70%] object-contain opacity-80 grayscale transition duration-300 group-hover:opacity-100 group-hover:grayscale-0 sm:max-h-9"
                />
              ) : (
                <span className="font-display text-lg font-semibold text-slate-600 group-hover:text-ink">{brand.name}</span>
              )}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
};

/* ------------------------------------------------------------------------- */

export const HelpBand: React.FC = () => (
  <section className="my-10 grid overflow-hidden rounded-lg bg-ink text-white lg:my-14 lg:grid-cols-12">
    <div className="p-8 sm:p-10 lg:col-span-7 lg:p-12">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Not listed here?</p>
      <h2 className="mt-3 max-w-lg font-display text-3xl font-semibold leading-tight sm:text-4xl">
        Not everything in the store is online yet. Ask us.
      </h2>
      <p className="mt-4 max-w-md text-[15px] leading-relaxed text-slate-300">
        Send the model name or a photo on WhatsApp and we’ll tell you the price and when you can pick it up.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <a
          href={whatsappLink('Hi, I’m looking for ')}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 rounded-md bg-white px-5 py-3 text-sm font-semibold text-ink transition-colors hover:bg-slate-100"
        >
          <WhatsAppIcon className="h-4 w-4" /> Message on WhatsApp
        </a>
        {business.phones.map((phone) => (
          <a
            key={phone.href}
            href={phone.href}
            className="inline-flex items-center gap-2 rounded-md border border-white/25 px-5 py-3 text-sm font-semibold text-white transition-colors hover:border-white"
          >
            <Phone size={16} /> {phone.label}
          </a>
        ))}
      </div>
    </div>
    <dl className="grid grid-cols-2 gap-px border-t border-white/10 bg-white/10 lg:col-span-5 lg:grid-cols-1 lg:border-l lg:border-t-0">
      {[
        { term: 'Visit', detail: `${business.address.line1}, ${business.address.line2}` },
        { term: 'Open', detail: `${business.hours.days}, ${business.hours.time}` },
      ].map(({ term, detail }) => (
        <div key={term} className="bg-ink p-8 sm:p-10 lg:flex lg:flex-col lg:justify-center">
          <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">{term}</dt>
          <dd className="mt-2 text-[15px] leading-relaxed text-white">{detail}</dd>
          {term === 'Open' && (
            <dd className="mt-3 text-sm">
              <StoreStatusBadge />
            </dd>
          )}
        </div>
      ))}
    </dl>
  </section>
);

/* ------------------------------------------------------------------------- */

const serviceSearches = [
  { label: 'CCTV installation in Chitwan', to: '/about#services' },
  { label: 'Laptop repair in Narayanghat', to: '/about#services' },
  { label: 'Custom PC builder in Chitwan', to: '/products?category=desktops' },
];

/** Plain-language store summary and the searches people use to find us, linked to the matching pages */
export const AboutStore: React.FC<{ sections: CategorySection[] }> = ({ sections }) => {
  const searches = sections
    .filter((s) => categorySeo[s.category.slug])
    .map((s) => ({ label: categorySeo[s.category.slug].search, to: `/products?category=${encodeURIComponent(s.category.slug)}` }));

  return (
    <section className="mt-6 grid gap-10 border-t border-slate-200 pt-12 lg:grid-cols-12 lg:gap-16">
      <div className="lg:col-span-7">
        <h2 className="font-display text-xl font-semibold text-ink">Your computer shop in Narayanghat, Chitwan</h2>
        <div className="mt-4 space-y-3 text-[15px] leading-relaxed text-slate-600">
          <p>
            Chitwan Computer has sold and repaired computers at Lionschowk, Narayanghat since {business.since}. We stock laptops
            for students and offices, gaming laptops, desktops and custom-built gaming PCs, monitors, printers, CCTV cameras with
            NVRs, WiFi routers, SSDs, RAM, graphics cards and everyday accessories.
          </p>
          <p>
            Every price on this site is the price in our store. Check what we have online, then visit us in Bharatpur, call, or
            message on WhatsApp to confirm stock. We also install CCTV for homes and shops across Chitwan and repair laptops,
            desktops and printers in our own workshop.
          </p>
        </div>
      </div>
      <nav aria-label="Popular searches" className="lg:col-span-5">
        <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Popular searches</h2>
        <ul className="mt-4 flex flex-wrap gap-2">
          {[...searches, ...serviceSearches].map((s) => (
            <li key={s.label}>
              <Link
                to={s.to}
                className="inline-block rounded-full border border-slate-300 bg-white px-3.5 py-1.5 text-[13px] text-slate-700 transition-colors hover:border-ink hover:text-ink"
              >
                {s.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </section>
  );
};

/* ------------------------------------------------------------------------- */

// Price bands people actually shop laptops by in Nepal
const budgets = [
  { label: 'Under Rs. 60,000', who: 'Students and everyday use', min: null, max: 60000 },
  { label: 'Rs. 60,000 – 1 lakh', who: 'Office work and multitasking', min: 60000, max: 100000 },
  { label: 'Rs. 1 – 1.5 lakh', who: 'Creators and light gaming', min: 100000, max: 150000 },
  { label: 'Above Rs. 1.5 lakh', who: 'Gaming and heavy workloads', min: 150000, max: null },
];

const budgetLink = (min: number | null, max: number | null) => {
  const params = new URLSearchParams({ category: 'laptops' });
  if (min) params.set('min', String(min));
  if (max) params.set('max', String(max));
  return `/products?${params}`;
};

const BudgetCard: React.FC<{ band: (typeof budgets)[number]; index: number }> = ({ band, index }) => {
  // Only the count is needed, so ask for a single product
  const { data } = useProductPage({ category: 'laptops', minPrice: band.min, maxPrice: band.max, perPage: 1 });
  const count = data?.total;
  if (count === 0) return null;

  return (
    <Link
      to={budgetLink(band.min, band.max)}
      className="group flex flex-col justify-between rounded-lg border border-slate-200 bg-white p-5 transition-colors hover:border-ink sm:p-6"
    >
      <span className="text-xs font-semibold tabular-nums text-slate-400">0{index + 1}</span>
      <div className="mt-6">
        <p className="font-display text-xl font-semibold leading-tight text-ink sm:text-2xl">{band.label}</p>
        <p className="mt-1.5 text-sm text-slate-600">{band.who}</p>
        <p className="mt-4 flex items-center justify-between text-sm font-semibold text-ink">
          {count === undefined ? <span className="h-4 w-16 animate-pulse rounded bg-slate-200" /> : `${count} ${count === 1 ? 'laptop' : 'laptops'}`}
          <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
        </p>
      </div>
    </Link>
  );
};

/** Laptops grouped by price, the way most people start looking */
export const ShopByBudget: React.FC = () => (
  <section className="py-10 lg:py-14">
    <div className="mb-6">
      <h2 className="font-display text-2xl font-semibold text-ink sm:text-[1.75rem]">Shop laptops by budget</h2>
      <p className="mt-1 text-[15px] text-slate-600">Pick a price range and see every laptop in it.</p>
    </div>
    <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4 lg:gap-5">
      {budgets.map((band, i) => (
        <BudgetCard key={band.label} band={band} index={i} />
      ))}
    </div>
  </section>
);
