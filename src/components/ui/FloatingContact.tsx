import React, { useEffect, useState } from 'react';
import { ArrowUp } from 'lucide-react';
import { business, whatsappLink } from '../../data/business';
import WhatsAppIcon from './WhatsAppIcon';

const SHOW_TOP_AFTER = 600;

const FacebookIcon: React.FC<{ size?: number }> = ({ size = 22 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" aria-hidden="true">
    <path d="M13.5 21v-7.5h2.5l.4-3h-2.9V8.6c0-.9.3-1.5 1.5-1.5H16.6V4.4c-.3 0-1.2-.1-2.3-.1-2.3 0-3.8 1.4-3.8 3.9v2.3H8v3h2.5V21h3Z" />
  </svg>
);

interface FabProps {
  label: string;
  href?: string;
  onClick?: () => void;
  className: string;
  children: React.ReactNode;
  hidden?: boolean;
}

// Round button with its label sliding out to the left on hover or focus
const Fab: React.FC<FabProps> = ({ label, href, onClick, className, children, hidden }) => {
  const inner = (
    <>
      <span className="pointer-events-none absolute right-full mr-3 whitespace-nowrap rounded-md bg-ink px-3 py-1.5 text-xs font-semibold text-white opacity-0 shadow-lg transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:opacity-100 sm:translate-x-2">
        {label}
      </span>
      {children}
    </>
  );
  const classes = `group relative flex h-12 w-12 items-center justify-center rounded-full shadow-[0_10px_24px_-8px_rgba(15,23,42,0.45)] transition-all duration-300 hover:-translate-y-0.5 ${className} ${
    hidden ? 'pointer-events-none translate-y-3 scale-90 opacity-0' : 'opacity-100'
  }`;

  return href ? (
    <a href={href} target="_blank" rel="noreferrer" aria-label={label} className={classes} tabIndex={hidden ? -1 : 0}>
      {inner}
    </a>
  ) : (
    <button type="button" onClick={onClick} aria-label={label} className={classes} tabIndex={hidden ? -1 : 0}>
      {inner}
    </button>
  );
};

/**
 * WhatsApp and Messenger chat buttons with back-to-top beneath, bottom right.
 * On phones it sits above the quick-contact bar, which already has WhatsApp.
 */
const FloatingContact: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > SHOW_TOP_AFTER);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="fixed bottom-[calc(76px+env(safe-area-inset-bottom))] right-3 z-[55] flex flex-col items-center gap-3 md:bottom-6 md:right-6">
      <div className="hidden md:block">
        <Fab label="Chat on WhatsApp" href={whatsappLink()} className="bg-[#25D366] text-white">
          <WhatsAppIcon size={24} />
        </Fab>
      </div>
      <Fab label="Message us on Facebook" href={`https://m.me/${business.messenger}`} className="bg-[#1877F2] text-white">
        <FacebookIcon />
      </Fab>
      <Fab
        label="Back to top"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="border border-slate-200 bg-white text-ink"
        hidden={!scrolled}
      >
        <ArrowUp size={19} />
      </Fab>
    </div>
  );
};

export default FloatingContact;
