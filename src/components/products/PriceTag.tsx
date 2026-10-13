import React from 'react';
import { Product, formatPrice, priceInfo } from '../../api/products';

interface PriceTagProps {
  product: Pick<Product, 'price' | 'mrp'>;
  size?: 'card' | 'detail';
}

/** Sale price, with the MRP struck through and the discount when there is one */
const PriceTag: React.FC<PriceTagProps> = ({ product, size = 'card' }) => {
  const info = priceInfo(product);

  if (!info) {
    return (
      <span className={size === 'detail' ? 'font-display text-2xl font-semibold text-slate-600' : 'text-[15px] font-medium text-slate-600'}>
        Call for price
      </span>
    );
  }

  if (size === 'detail') {
    return (
      <div>
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <span className="font-display text-3xl font-semibold text-ink">{formatPrice(info.price)}</span>
          {info.mrp !== null && (
            <>
              <span className="text-lg text-slate-500">
                MRP <s className="decoration-slate-400">{formatPrice(info.mrp)}</s>
              </span>
              <span className="rounded bg-emerald-600 px-2 py-0.5 text-sm font-semibold text-white">{info.percentOff}% off</span>
            </>
          )}
        </div>
        {info.mrp !== null && (
          <p className="mt-1 text-sm font-medium text-emerald-700">You save {formatPrice(info.save)}</p>
        )}
      </div>
    );
  }

  return (
    <span className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
      <span className="text-[15px] font-semibold text-ink">{formatPrice(info.price)}</span>
      {info.mrp !== null && (
        <>
          <s className="text-[13px] text-slate-500 decoration-slate-400" aria-label={`MRP ${formatPrice(info.mrp)}`}>
            {formatPrice(info.mrp)}
          </s>
          <span className="text-[13px] font-semibold text-emerald-700">{info.percentOff}% off</span>
        </>
      )}
    </span>
  );
};

export default PriceTag;
