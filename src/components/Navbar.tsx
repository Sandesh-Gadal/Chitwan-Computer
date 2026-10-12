import React, { useState, useEffect } from 'react';
import { Menu, X, Phone, Clock, MapPin, ClipboardList } from 'lucide-react';
import { useEnquiry } from '../context/EnquiryContext';
import { motion, AnimatePresence, useScroll, useSpring } from 'motion/react';
import logo from '../assets/logo.png';
import { useNavigate, useLocation } from 'react-router-dom';
import { business } from '../data/business';

const navItems = [
  { id: 'home', label: 'Home' },
  { id: 'about', label: 'About' },
  { id: 'services', label: 'Services' },
  { id: 'products', label: 'Products' },
  { id: 'testimonials', label: 'Reviews' },
  { id: 'contact', label: 'Contact' },
];

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeId, setActiveId] = useState('home');
  const navigate = useNavigate();
  const location = useLocation();
  const isHome = location.pathname === '/';
  const enquiry = useEnquiry();
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 200, damping: 30, restDelta: 0.001 });

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 40);
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Track which section is in view
  useEffect(() => {
    if (!isHome) {
      setActiveId(location.pathname.startsWith('/products') ? 'products' : '');
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveId(entry.target.id);
        });
      },
      { rootMargin: '-40% 0px -55% 0px' }
    );
    navItems.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [isHome, location.pathname]);

  const goToProducts = () => {
    navigate('/products');
    window.scrollTo({ top: 0 });
    setIsOpen(false);
  };

  const scrollToSection = (id: string) => {
    if (!isHome) {
      navigate('/');
      setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
      }, 300);
    } else {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    }
    setIsOpen(false);
  };

  const handleClick = (id: string) => (id === 'products' ? goToProducts() : scrollToSection(id));

  return (
    <>
      {/* Store info strip */}
      <div className="hidden bg-ink text-slate-300 md:block">
        <div className="mx-auto flex h-9 max-w-7xl items-center justify-between px-4 text-xs sm:px-6 lg:px-8">
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-2">
              <Clock size={13} className="text-slate-400" />
              {business.hours.days}, {business.hours.time}
            </span>
            <a
              href={business.mapsUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 transition-colors hover:text-white"
            >
              <MapPin size={13} className="text-slate-400" />
              {business.address.line1}, Chitwan
            </a>
          </div>
          <a href={business.phones[0].href} className="flex items-center gap-2 transition-colors hover:text-white">
            <Phone size={13} className="text-slate-400" />
            {business.phones[0].label}
          </a>
        </div>
      </div>

      <nav
        className={`sticky top-0 z-50 border-b bg-white/90 backdrop-blur-md transition-shadow duration-300 ${
          isScrolled || isOpen ? 'border-slate-200 shadow-[0_1px_12px_rgba(15,23,42,0.06)]' : 'border-transparent'
        }`}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-[72px] items-center justify-between">
            <button onClick={() => scrollToSection('home')} className="flex items-center gap-3" aria-label="Chitwan Computer home">
              <img src={logo} alt="" className="h-10 w-10 rounded-md object-contain" />
              <span className="flex flex-col items-start leading-none">
                <span className="font-display text-lg font-semibold tracking-tight text-ink">Chitwan Computer</span>
                <span className="mt-1 text-[11px] font-medium uppercase tracking-[0.16em] text-slate-600">
                  Since {business.since}
                </span>
              </span>
            </button>

            <div className="hidden items-center gap-8 lg:flex">
              {navItems.map((item) => {
                const active = activeId === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleClick(item.id)}
                    className={`relative py-2 text-[15px] font-medium transition-colors duration-200 ${
                      active ? 'text-ink' : 'text-slate-600 hover:text-ink'
                    }`}
                  >
                    {item.label}
                    {active && (
                      <motion.span
                        layoutId="nav-underline"
                        className="absolute -bottom-0.5 left-0 right-0 h-[2px] rounded-full bg-primary-500"
                        transition={{ type: 'spring', stiffness: 420, damping: 36 }}
                      />
                    )}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={enquiry.open}
                aria-label={`Enquiry list, ${enquiry.count} ${enquiry.count === 1 ? 'item' : 'items'}`}
                title="Enquiry list"
                className="relative inline-flex h-10 w-10 items-center justify-center rounded-md text-ink transition-colors hover:bg-slate-100"
              >
                <ClipboardList size={21} />
                {enquiry.count > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-orange-500 px-1 text-[11px] font-bold text-white">
                    {enquiry.count}
                  </span>
                )}
              </button>
              <button
                onClick={() => scrollToSection('contact')}
                className="hidden rounded-md bg-ink px-5 py-2.5 text-sm font-semibold text-white transition-colors duration-200 hover:bg-primary-500 lg:inline-flex"
              >
                Get a Quote
              </button>

              <button
                onClick={() => setIsOpen((o) => !o)}
                aria-expanded={isOpen}
                className="inline-flex h-10 w-10 items-center justify-center rounded-md text-ink transition-colors hover:bg-slate-100 lg:hidden"
              >
                <span className="sr-only">{isOpen ? 'Close menu' : 'Open main menu'}</span>
                {isOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>
        </div>

        {/* Scroll progress */}
        <motion.div
          aria-hidden="true"
          style={{ scaleX: progress }}
          className="absolute inset-x-0 -bottom-px h-[2px] origin-left bg-primary-500"
        />

        {/* Mobile menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="overflow-hidden border-t border-slate-200 bg-white lg:hidden"
            >
              <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6">
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleClick(item.id)}
                    className={`flex w-full items-center justify-between border-b border-slate-100 py-3.5 text-left text-base font-medium last:border-0 ${
                      activeId === item.id ? 'text-primary-500' : 'text-ink'
                    }`}
                  >
                    {item.label}
                    {activeId === item.id && <span className="h-1.5 w-1.5 rounded-full bg-primary-500" />}
                  </button>
                ))}
                <div className="mt-3 grid grid-cols-2 gap-2 pb-2">
                  <a
                    href={business.phones[0].href}
                    className="flex items-center justify-center gap-2 rounded-md border border-slate-300 py-3 text-sm font-semibold text-ink"
                  >
                    <Phone size={16} /> Call us
                  </a>
                  <button
                    onClick={() => scrollToSection('contact')}
                    className="rounded-md bg-ink py-3 text-sm font-semibold text-white"
                  >
                    Get a Quote
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </>
  );
};

export default Navbar;
