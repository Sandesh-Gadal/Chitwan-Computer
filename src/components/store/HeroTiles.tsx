import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import WhatsAppIcon from '../ui/WhatsAppIcon';
import { FestivalMark, useFestival } from '../festival/registry';
import { whatsappLink } from '../../data/business';
import { Product, formatPrice, priceInfo, productImage } from '../../api/products';

/** Best current discount, or a store visit card when nothing is on offer */
export const DealTile: React.FC<{ product: Product | undefined; loading: boolean }> = ({ product, loading }) => {
  const active = useFestival();
  if (loading) return <div className="h-full min-h-[200px] animate-pulse rounded-lg bg-slate-200" />;

  const info = product ? priceInfo(product) : null;

  if (!product || !info?.mrp) {
    return (
      <Link
        to="/products?view=all"
        className="group flex h-full min-h-[200px] flex-col justify-between rounded-lg border border-slate-200 bg-white p-6"
      >
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Full catalogue</p>
        <div>
          <p className="font-display text-2xl font-semibold leading-tight text-ink">Every product, with its price listed.</p>
          <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-ink group-hover:text-primary-600">
            Browse all <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
          </span>
        </div>
      </Link>
    );
  }

  return (
    <Link
      to={`/products/${product.id}`}
      className="group relative grid h-full min-h-[200px] grid-cols-[1fr_40%] overflow-hidden rounded-lg border border-slate-200 bg-white"
    >
      <div className="flex flex-col justify-between p-6 pr-2">
        <p className="flex items-center gap-1.5 whitespace-nowrap text-[11px] font-semibold uppercase tracking-[0.12em] text-orange-600">
          {active && <FestivalMark className="h-4 w-3" />}
          {active?.festival.dealLabel ?? 'Deal'} · {info.percentOff}% off
        </p>
        <div>
          <h3 className="line-clamp-2 font-display text-lg font-semibold leading-snug text-ink">{product.name}</h3>
          <p className="mt-2 flex flex-wrap items-baseline gap-x-2">
            <span className="text-base font-semibold text-ink">{formatPrice(info.price)}</span>
            <s className="text-sm text-slate-500 decoration-slate-400">{formatPrice(info.mrp)}</s>
          </p>
          <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-ink group-hover:text-primary-600">
            View deal <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
          </span>
        </div>
      </div>
      <div className="relative">
        <img
          src={productImage(product)}
          alt=""
          className="absolute inset-0 h-full w-full object-contain p-5 transition-transform duration-500 group-hover:scale-105"
        />
      </div>
    </Link>
  );
};

export const RepairTile: React.FC = () => (
  <Link
    to="/about#services"
    className="group flex h-full min-h-[200px] flex-col justify-between rounded-lg bg-primary-500 p-6 text-white"
  >
    <div className="flex items-start justify-between">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary-100">Repair & service</p>
      <ArrowUpRight size={18} className="text-primary-100 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
    </div>
    <div>
      <p className="font-display text-[2.6rem] font-semibold leading-none tracking-tight">24–48 hrs</p>
      <p className="mt-3 max-w-[16rem] text-[15px] leading-snug text-primary-50">
        Most laptops, desktops and printers are diagnosed and fixed in our own workshop.
      </p>
    </div>
  </Link>
);

export const AskTile: React.FC = () => (
  <a
    href={whatsappLink('Hi, can you tell me the price of ')}
    target="_blank"
    rel="noreferrer"
    className="group flex h-full min-h-[200px] flex-col justify-between rounded-lg border border-slate-200 bg-white p-6 sm:col-span-2 lg:col-span-1"
  >
    <div className="flex items-start justify-between">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Quick price check</p>
      <WhatsAppIcon size={20} className="text-[#25D366]" />
    </div>
    <div>
      <p className="font-display text-2xl font-semibold leading-tight text-ink">Send a model name or photo. We reply with the price.</p>
      <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-ink group-hover:text-primary-600">
        Chat on WhatsApp <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
      </span>
    </div>
  </a>
);
