import React, { useEffect, useState } from 'react';
import { Link, NavLink, useLocation, useSearchParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { ChevronRight, ClipboardList, Clock, MapPin, Menu, Phone, X } from 'lucide-react';
import { useEnquiry } from '../context/EnquiryContext';
import { useCategories } from '../api/products';
import logo from '../assets/logo.png';
import { business, whatsappLink } from '../data/business';
import WhatsAppIcon from './ui/WhatsAppIcon';
import SearchBox from './SearchBox';
import CategoryBar from './CategoryBar';
import StoreStatusBadge from './ui/StoreStatusBadge';
import FestivalBar from './festival/FestivalBar';

// Company pages live on /about; each opens the matching section there
const pages = [
  { hash: 'about', label: 'About' },
  { hash: 'services', label: 'Services' },
  { hash: 'testimonials', label: 'Reviews' },
  { hash: 'contact', label: 'Contact' },
];

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const [params] = useSearchParams();
  const enquiry = useEnquiry();
  const { data: allCategories = [] } = useCategories();

  const categories = allCategories
    .filter((c) => (c.products_count ?? 0) > 0)
    .sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
  const activeCategory = location.pathname === '/products' ? params.get('category') : null;

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 8);
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close the mobile menu on any navigation
  useEffect(() => setIsOpen(false), [location.pathname, location.search, location.hash]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <>
      <FestivalBar />

      {/* Store info strip */}
      <div className="hidden bg-ink text-slate-300 md:block">
        <div className="mx-auto flex h-9 max-w-7xl items-center justify-between px-4 text-xs sm:px-6 lg:px-8">
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-2" title={`${business.hours.days}, ${business.hours.time}`}>
              <Clock size={13} className="text-slate-400" />
              <StoreStatusBadge />
            </span>
            <a href={business.mapsUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 transition-colors hover:text-white">
              <MapPin size={13} className="text-slate-400" />
              {business.address.line1}, Chitwan
            </a>
          </div>
          <div className="flex items-center gap-6">
            <a href={whatsappLink()} target="_blank" rel="noreferrer" className="flex items-center gap-2 transition-colors hover:text-white">
              <WhatsAppIcon size={13} className="text-slate-400" />
              WhatsApp
            </a>
            <span className="flex items-center gap-2">
              <Phone size={13} className="text-slate-400" />
              {business.phones.map((phone, i) => (
                <React.Fragment key={phone.href}>
                  {i > 0 && <span className="text-slate-600">/</span>}
                  <a href={phone.href} className="transition-colors hover:text-white">
                    {phone.label}
                  </a>
                </React.Fragment>
              ))}
            </span>
          </div>
        </div>
      </div>

      <header
        className={`sticky top-0 z-50 border-b bg-white transition-shadow duration-300 ${
          isScrolled ? 'border-slate-200 shadow-[0_1px_12px_rgba(15,23,42,0.06)]' : 'border-slate-200'
        }`}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center gap-4 lg:h-[72px] lg:gap-10">
            <button
              onClick={() => setIsOpen(true)}
              aria-expanded={isOpen}
              aria-label="Open menu"
              className="-ml-2 inline-flex h-10 w-10 items-center justify-center rounded-md text-ink transition-colors hover:bg-slate-100 lg:hidden"
            >
              <Menu size={22} />
            </button>

            <Link to="/" className="flex flex-shrink-0 items-center gap-3" aria-label="Chitwan Computer, shop home">
              <img src={logo} alt="" className="h-9 w-9 rounded-md object-contain lg:h-10 lg:w-10" />
              <span className="flex flex-col items-start leading-none">
                <span className="font-display text-base font-semibold tracking-tight text-ink sm:text-lg">Chitwan Computer</span>
                <span className="mt-1 hidden text-[11px] font-medium uppercase tracking-[0.16em] text-slate-600 sm:block">
                  Since {business.since}
                </span>
              </span>
            </Link>

            <SearchBox className="hidden max-w-2xl flex-1 md:block" />

            <div className="ml-auto flex items-center gap-1 sm:gap-2">
              <div className="hidden items-center gap-2.5 px-3 py-1 text-ink xl:flex">
                <Phone size={19} strokeWidth={1.8} />
                <span className="flex flex-col leading-tight">
                  <a href={business.phones[0].href} className="text-sm font-semibold hover:text-primary-600">
                    {business.phones[0].label}
                  </a>
                  <a href={business.phones[1].href} className="text-[12px] text-slate-500 hover:text-primary-600">
                    {business.phones[1].kind} {business.phones[1].label}
                  </a>
                </span>
              </div>
              <button
                onClick={enquiry.open}
                aria-label={`Enquiry list, ${enquiry.count} ${enquiry.count === 1 ? 'item' : 'items'}`}
                className="relative inline-flex h-10 items-center gap-2 rounded-md px-2.5 text-ink transition-colors hover:bg-slate-100"
              >
                <span className="relative">
                  <ClipboardList size={21} strokeWidth={1.8} />
                  {enquiry.count > 0 && (
                    <span className="absolute -right-2 -top-2 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-orange-500 px-1 text-[10px] font-bold text-white">
                      {enquiry.count}
                    </span>
                  )}
                </span>
                <span className="hidden text-sm font-semibold lg:inline">Enquiry list</span>
              </button>
            </div>
          </div>

          {/* Phone search sits on its own row so it's always one tap away */}
          <SearchBox className="pb-3 md:hidden" />
        </div>

        <CategoryBar categories={categories} />
      </header>

      {/* Mobile menu drawer */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[90] lg:hidden" role="dialog" aria-modal="true" aria-label="Menu">
            <motion.div
              className="absolute inset-0 bg-ink/50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              className="absolute inset-y-0 left-0 flex w-[86%] max-w-sm flex-col bg-white shadow-2xl"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="flex h-16 items-center justify-between border-b border-slate-200 px-5">
                <span className="font-display text-lg font-semibold text-ink">Menu</span>
                <button onClick={() => setIsOpen(false)} aria-label="Close menu" className="-mr-2 rounded-md p-2 hover:bg-slate-100">
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-5 py-4">
                <p className="pb-2 pt-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Shop</p>
                <ul>
                  <li>
                    <NavLink to="/" end className="flex items-center justify-between border-b border-slate-100 py-3 font-medium text-ink">
                      Store home <ChevronRight size={16} className="text-slate-400" />
                    </NavLink>
                  </li>
                  <li>
                    <Link to="/build-pc" className="flex items-center justify-between border-b border-slate-100 py-3 font-semibold text-primary-600">
                      Build your PC in 3D <ChevronRight size={16} />
                    </Link>
                  </li>
                  <li>
                    <Link to="/products?view=all" className="flex items-center justify-between border-b border-slate-100 py-3 font-medium text-ink">
                      All products <ChevronRight size={16} className="text-slate-400" />
                    </Link>
                  </li>
                  {categories.map((c) => (
                    <li key={c.slug}>
                      <Link
                        to={`/products?category=${encodeURIComponent(c.slug)}`}
                        className={`flex items-center justify-between border-b border-slate-100 py-3 ${
                          activeCategory === c.slug ? 'font-semibold text-primary-600' : 'text-ink'
                        }`}
                      >
                        {c.name}
                        <span className="text-xs text-slate-500">{c.products_count}</span>
                      </Link>
                    </li>
                  ))}
                </ul>

                <p className="pb-2 pt-8 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Chitwan Computer</p>
                <ul>
                  {pages.map((p) => (
                    <li key={p.hash}>
                      <Link to={`/about#${p.hash}`} className="flex items-center justify-between border-b border-slate-100 py-3 text-ink">
                        {p.label} <ChevronRight size={16} className="text-slate-400" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="grid grid-cols-2 gap-3 border-t border-slate-200 p-4">
                <p className="col-span-2 text-center text-xs">
                  <StoreStatusBadge tone="light" />
                </p>
                {business.phones.map((phone) => (
                  <a
                    key={phone.href}
                    href={phone.href}
                    className="flex flex-col items-center justify-center rounded-md border border-slate-300 py-2.5 text-ink"
                  >
                    <span className="flex items-center gap-1.5 text-sm font-semibold">
                      <Phone size={14} /> {phone.label}
                    </span>
                    <span className="text-[11px] text-slate-500">{phone.kind}</span>
                  </a>
                ))}
                <a
                  href={whatsappLink()}
                  target="_blank"
                  rel="noreferrer"
                  className="col-span-2 flex items-center justify-center gap-2 rounded-md bg-ink py-3 text-sm font-semibold text-white"
                >
                  <WhatsAppIcon size={16} /> WhatsApp
                </a>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
