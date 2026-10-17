import React, { useState } from 'react';
import { ClipboardList, Phone, X } from 'lucide-react';
import { useEnquiry } from '../../context/EnquiryContext';
import { business, whatsappLink } from '../../data/business';
import WhatsAppIcon from './WhatsAppIcon';
import StoreStatusBadge from './StoreStatusBadge';

/** Call, WhatsApp and enquiry list always in thumb reach on phones */
const MobileActionBar: React.FC = () => {
  const enquiry = useEnquiry();
  const [callOpen, setCallOpen] = useState(false);

  return (
    <>
      {callOpen && (
        <div className="fixed inset-0 z-[59] md:hidden" onClick={() => setCallOpen(false)}>
          <div className="absolute inset-0 bg-ink/30" />
          <div
            role="dialog"
            aria-label="Call the store"
            onClick={(e) => e.stopPropagation()}
            className="absolute inset-x-3 bottom-[calc(64px+env(safe-area-inset-bottom))] rounded-lg border border-slate-200 bg-white p-4 shadow-2xl"
          >
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm">
                <StoreStatusBadge tone="light" />
              </p>
              <button onClick={() => setCallOpen(false)} aria-label="Close" className="-mr-1 rounded p-1 text-slate-500">
                <X size={18} />
              </button>
            </div>
            <div className="grid gap-2">
              {business.phones.map((phone) => (
                <a
                  key={phone.href}
                  href={phone.href}
                  className="flex items-center justify-between rounded-md border border-slate-300 px-4 py-3 text-ink active:bg-paper"
                >
                  <span className="flex items-center gap-3 text-[15px] font-semibold">
                    <Phone size={17} /> {phone.label}
                  </span>
                  <span className="text-xs text-slate-500">{phone.kind}</span>
                </a>
              ))}
            </div>
          </div>
        </div>
      )}

      <nav
        aria-label="Quick contact"
        className="fixed inset-x-0 bottom-0 z-[60] grid grid-cols-3 border-t border-slate-200 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden"
      >
        {/* Two numbers, so Call opens a small chooser instead of dialling straight away */}
        <button
          onClick={() => setCallOpen((o) => !o)}
          aria-expanded={callOpen}
          className="flex flex-col items-center gap-1 py-2.5 text-[11px] font-semibold text-ink"
        >
          <Phone size={19} strokeWidth={1.8} />
          Call
        </button>
        <a
          href={whatsappLink()}
          target="_blank"
          rel="noreferrer"
          className="flex flex-col items-center gap-1 py-2.5 text-[11px] font-semibold text-ink"
        >
          <WhatsAppIcon size={19} className="text-[#25D366]" />
          WhatsApp
        </a>
        <button onClick={enquiry.open} className="relative flex flex-col items-center gap-1 py-2.5 text-[11px] font-semibold text-ink">
          <span className="relative">
            <ClipboardList size={19} strokeWidth={1.8} />
            {enquiry.count > 0 && (
              <span className="absolute -right-2.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-orange-500 px-1 text-[10px] font-bold text-white">
                {enquiry.count}
              </span>
            )}
          </span>
          Enquiry list
        </button>
      </nav>

    </>
  );
};

export default MobileActionBar;
