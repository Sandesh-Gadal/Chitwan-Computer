import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { X, Minus, Plus, Trash2, ClipboardList } from 'lucide-react';
import { useEnquiry } from '../../context/EnquiryContext';
import { formatPrice } from '../../api/products';
import { whatsappLink } from '../../data/business';
import WhatsAppIcon from '../ui/WhatsAppIcon';

const EnquiryDrawer: React.FC = () => {
  const { items, isOpen, close, remove, setQty, clear } = useEnquiry();
  const closeRef = useRef<HTMLButtonElement>(null);

  const priced = items.filter((i) => i.price !== null);
  const total = priced.reduce((sum, i) => sum + (i.price ?? 0) * i.qty, 0);

  const message = [
    "Hi Chitwan Computer, I'd like to ask about these products:",
    '',
    ...items.map(
      (item, n) =>
        `${n + 1}. ${item.name}${item.qty > 1 ? ` × ${item.qty}` : ''} – ${
          item.price !== null ? formatPrice(item.price * item.qty) : 'price on request'
        }`
    ),
    '',
    priced.length ? `Estimated total: ${formatPrice(total)}` : '',
    'Could you confirm availability and the best price?',
  ]
    .filter((line, i, all) => line !== '' || all[i - 1] !== '')
    .join('\n');

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close();
    window.addEventListener('keydown', onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = previous;
    };
  }, [isOpen, close]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[80]" role="dialog" aria-modal="true" aria-label="Enquiry list">
          <motion.div
            className="absolute inset-0 bg-ink/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
          />
          <motion.aside
            className="absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-white shadow-2xl"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            <header className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
              <div>
                <h2 className="font-display text-xl font-semibold text-ink">Enquiry list</h2>
                <p className="text-sm text-slate-600">Ask about several products in one message</p>
              </div>
              <button ref={closeRef} onClick={close} aria-label="Close" className="rounded-md p-2 text-slate-600 hover:bg-slate-100">
                <X size={20} />
              </button>
            </header>

            {items.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
                <ClipboardList size={40} className="text-slate-300" />
                <p className="mt-4 font-display text-lg font-semibold text-ink">Your list is empty</p>
                <p className="mt-1 text-sm text-slate-600">
                  Tap "Add to enquiry" on any product, then send the whole list to us on WhatsApp.
                </p>
                <Link
                  to="/products"
                  onClick={close}
                  className="mt-6 rounded-md bg-ink px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-500"
                >
                  Browse products
                </Link>
              </div>
            ) : (
              <>
                <ul className="flex-1 divide-y divide-slate-100 overflow-y-auto px-5">
                  {items.map((item) => (
                    <li key={item.id} className="flex gap-4 py-4">
                      <Link
                        to={`/products/${item.id}`}
                        onClick={close}
                        className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-white"
                      >
                        {item.image && <img src={item.image} alt="" className="h-full w-full object-contain p-2" />}
                      </Link>
                      <div className="flex min-w-0 flex-1 flex-col">
                        <Link
                          to={`/products/${item.id}`}
                          onClick={close}
                          className="line-clamp-2 text-sm font-semibold text-ink hover:text-primary-600"
                        >
                          {item.name}
                        </Link>
                        <p className="mt-1 text-sm text-slate-700">
                          {item.price !== null ? formatPrice(item.price) : 'Call for price'}
                        </p>
                        <div className="mt-auto flex items-center justify-between pt-2">
                          <div className="flex items-center rounded-md border border-slate-300">
                            <button
                              onClick={() => setQty(item.id, item.qty - 1)}
                              aria-label="Decrease quantity"
                              className="p-1.5 text-slate-600 hover:text-ink disabled:opacity-30"
                              disabled={item.qty <= 1}
                            >
                              <Minus size={14} />
                            </button>
                            <span className="w-8 text-center text-sm font-medium tabular-nums">{item.qty}</span>
                            <button
                              onClick={() => setQty(item.id, item.qty + 1)}
                              aria-label="Increase quantity"
                              className="p-1.5 text-slate-600 hover:text-ink"
                            >
                              <Plus size={14} />
                            </button>
                          </div>
                          <button
                            onClick={() => remove(item.id)}
                            aria-label={`Remove ${item.name}`}
                            className="rounded-md p-1.5 text-slate-500 hover:bg-red-50 hover:text-red-600"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>

                <footer className="border-t border-slate-200 px-5 py-5">
                  {priced.length > 0 && (
                    <div className="mb-4 flex items-baseline justify-between">
                      <span className="text-sm text-slate-600">Estimated total</span>
                      <span className="font-display text-2xl font-semibold text-ink">{formatPrice(total)}</span>
                    </div>
                  )}
                  <a
                    href={whatsappLink(message)}
                    target="_blank"
                    rel="noreferrer"
                    className="flex w-full items-center justify-center gap-2 rounded-md bg-[#1FAF54] px-5 py-3.5 text-[15px] font-semibold text-white transition-colors hover:bg-[#178F44]"
                  >
                    <WhatsAppIcon size={19} />
                    Send enquiry on WhatsApp
                  </a>
                  <button onClick={clear} className="mt-3 w-full text-center text-sm text-slate-600 hover:text-red-600">
                    Clear list
                  </button>
                  <p className="mt-3 text-center text-xs text-slate-500">Prices are confirmed by our team before purchase.</p>
                </footer>
              </>
            )}
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
};

export default EnquiryDrawer;
