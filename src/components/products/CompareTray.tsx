import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { GitCompareArrows, X } from 'lucide-react';
import { COMPARE_LIMIT, useCompare } from '../../context/CompareContext';

/** Products picked for comparison, bottom of the screen, with a link to the comparison */
const CompareTray: React.FC = () => {
  const compare = useCompare();
  const { pathname } = useLocation();
  const show = compare.count > 0 && pathname !== '/compare';

  return (
    // Positioned on the outer box so the animation's transform doesn't undo the centring;
    // clears the phone quick-contact bar and the round chat buttons on the right
    <div className="pointer-events-none fixed bottom-[calc(72px+env(safe-area-inset-bottom))] left-3 right-[72px] z-[56] md:bottom-6 md:left-1/2 md:right-auto md:w-[min(560px,calc(100vw-200px))] md:-translate-x-1/2">
      <AnimatePresence>
        {show && (
          <motion.div
            role="region"
            aria-label="Products to compare"
            initial={{ y: 24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 24, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="pointer-events-auto flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-2.5 shadow-[0_14px_36px_-12px_rgba(15,23,42,0.45)]"
          >
            <ul className="flex min-w-0 flex-1 items-center gap-2.5 pt-1">
              {compare.items.map((item) => (
                <li key={item.id} className="group relative h-11 w-11 flex-shrink-0 rounded-md border border-slate-200 bg-white">
                  {item.image && (
                    <img src={item.image} alt={item.name} title={item.name} className="h-full w-full object-contain p-1" />
                  )}
                  <button
                    onClick={() => compare.remove(item.id)}
                    aria-label={`Remove ${item.name} from comparison`}
                    className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-ink text-white"
                  >
                    <X size={11} />
                  </button>
                </li>
              ))}
              {Array.from({ length: Math.max(0, 2 - compare.count) }, (_, i) => (
                <li
                  key={`empty-${i}`}
                  className="hidden h-11 w-11 flex-shrink-0 rounded-md border border-dashed border-slate-300 sm:block"
                  aria-hidden="true"
                />
              ))}
              <li className="ml-1 hidden text-xs text-slate-500 sm:block">
                {compare.count < 2 ? 'Add one more to compare' : `${compare.count} of ${COMPARE_LIMIT}`}
              </li>
            </ul>

            {compare.count >= 2 ? (
              <Link
                to={`/compare?ids=${compare.ids.join(',')}`}
                className="inline-flex flex-shrink-0 items-center gap-2 rounded-md bg-ink px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-500"
              >
                <GitCompareArrows size={16} />
                Compare
              </Link>
            ) : (
              <span className="flex-shrink-0 rounded-md bg-slate-100 px-3 py-2.5 text-xs font-medium text-slate-600 sm:hidden">
                Add 1 more
              </span>
            )}
            <button
              onClick={compare.clear}
              aria-label="Clear comparison"
              className="hidden flex-shrink-0 rounded-md p-2 text-slate-500 hover:bg-slate-100 hover:text-ink sm:block"
            >
              <X size={18} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CompareTray;
