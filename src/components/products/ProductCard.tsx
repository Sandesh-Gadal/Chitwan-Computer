import React from 'react';
import { Link } from 'react-router-dom';
import { ClipboardCheck, ClipboardPlus } from 'lucide-react';
import { useEnquiry } from '../../context/EnquiryContext';
import { Product, formatPrice, productImages, stockLabel, stockStatus } from '../../api/products';

const dotColor = { in: 'bg-emerald-500', low: 'bg-amber-500', out: 'bg-red-500' };
const textColor = { in: 'text-emerald-700', low: 'text-amber-700', out: 'text-red-600' };

const ProductCard: React.FC<{ product: Product }> = ({ product }) => {
  const status = stockStatus(product.quantity);
  const price = formatPrice(product.price);
  const [cover, alternate] = productImages(product);
  const enquiry = useEnquiry();
  const saved = enquiry.has(product.id);

  const toggleEnquiry = (e: React.MouseEvent) => {
    // The card itself is a link; this button shouldn't navigate
    e.preventDefault();
    e.stopPropagation();
    if (saved) enquiry.remove(product.id);
    else enquiry.add(product);
  };

  return (
    <Link to={`/products/${product.id}`} className="group flex h-full flex-col">
      <div className="relative aspect-square overflow-hidden rounded-lg border border-slate-200 bg-white transition-colors duration-300 group-hover:border-slate-300">
        <img
          src={cover}
          alt={product.name}
          loading="lazy"
          className={`absolute inset-0 h-full w-full object-contain p-6 transition-all duration-500 ease-out group-hover:scale-[1.05] ${
            alternate ? 'group-hover:opacity-0' : ''
          }`}
        />
        {/* Second photo fades in on hover */}
        {alternate && (
          <img
            src={alternate}
            alt=""
            loading="lazy"
            className="absolute inset-0 h-full w-full object-contain p-6 opacity-0 transition-all duration-500 ease-out group-hover:scale-[1.05] group-hover:opacity-100"
          />
        )}
        <span
          className={`absolute left-3 top-3 inline-flex items-center gap-1.5 rounded bg-white/95 px-2 py-1 text-[11px] font-semibold ${textColor[status]}`}
        >
          <span className={`h-1.5 w-1.5 rounded-full ${dotColor[status]}`} />
          {stockLabel[status]}
        </span>
        <button
          type="button"
          onClick={toggleEnquiry}
          aria-pressed={saved}
          aria-label={saved ? `Remove ${product.name} from enquiry list` : `Add ${product.name} to enquiry list`}
          title={saved ? 'In your enquiry list' : 'Add to enquiry list'}
          className={`absolute bottom-3 right-3 flex h-9 w-9 items-center justify-center rounded-full shadow-md transition-all duration-300 ${
            saved
              ? 'bg-primary-500 text-white'
              : 'bg-white text-ink opacity-100 hover:bg-ink hover:text-white sm:translate-y-2 sm:opacity-0 sm:group-hover:translate-y-0 sm:group-hover:opacity-100 sm:focus-visible:opacity-100'
          }`}
        >
          {saved ? <ClipboardCheck size={17} /> : <ClipboardPlus size={17} />}
        </button>
        {product.label && (
          <span className="absolute right-3 top-3 rounded bg-orange-500 px-2 py-1 text-[11px] font-semibold text-white">
            {product.label}
          </span>
        )}
      </div>

      <div className="mt-4 flex flex-1 flex-col">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-600">
          {[product.brand?.name, product.category?.name].filter(Boolean).join(' · ')}
        </p>
        <h3 className="mt-1 line-clamp-2 font-display text-base font-semibold leading-snug text-ink transition-colors group-hover:text-primary-600 sm:text-lg">
          {product.name}
        </h3>
        <p className="mt-auto pt-2 text-[15px] font-semibold text-ink">
          {price ?? <span className="font-medium text-slate-600">Call for price</span>}
        </p>
      </div>
    </Link>
  );
};

export const ProductCardSkeleton: React.FC = () => (
  <div className="animate-pulse">
    <div className="aspect-square rounded-lg bg-slate-200" />
    <div className="mt-4 h-3 w-20 rounded bg-slate-200" />
    <div className="mt-2 h-4 w-3/4 rounded bg-slate-200" />
    <div className="mt-3 h-4 w-24 rounded bg-slate-200" />
  </div>
);

export default ProductCard;
