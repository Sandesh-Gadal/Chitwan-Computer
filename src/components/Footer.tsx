import React from 'react';
import { Facebook, Instagram, Youtube, ArrowUp } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import logo from '../assets/logo.png';
import { business } from '../data/business';

const links = [
  { id: 'about', label: 'About us' },
  { id: 'services', label: 'Services' },
  { id: 'products', label: 'Products' },
  { id: 'testimonials', label: 'Reviews' },
  { id: 'contact', label: 'Contact' },
];

const services = ['Laptop & computer sales', 'Custom PC building', 'Printers & CCTV', 'Repair & maintenance', 'IT consultancy'];

const socials = [
  { icon: Facebook, href: business.socials.facebook, label: 'Facebook' },
  { icon: Instagram, href: business.socials.instagram, label: 'Instagram' },
  { icon: Youtube, href: business.socials.youtube, label: 'YouTube' },
];

const Footer: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const goTo = (id: string) => {
    if (id === 'products') {
      navigate('/products');
      window.scrollTo({ top: 0 });
      return;
    }
    if (location.pathname !== '/') {
      navigate('/');
      setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }), 300);
    } else {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer className="bg-ink text-slate-300">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 py-16 md:grid-cols-2 lg:grid-cols-12 lg:py-20">
          <div className="lg:col-span-4">
            <div className="flex items-center gap-3">
              <img src={logo} alt="" className="h-10 w-10 rounded-md object-contain" />
              <span className="font-display text-lg font-semibold text-white">{business.name}</span>
            </div>
            <p className="mt-5 max-w-xs text-[15px] leading-relaxed">
              Quality computers, honest repairs and custom builds in Narayanghat, Chitwan since {business.since}.
            </p>
            <div className="mt-6 flex gap-2">
              {socials.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={label}
                  className="flex h-9 w-9 items-center justify-center rounded-md border border-white/15 transition-colors hover:border-white hover:text-white"
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          <div className="lg:col-span-2">
            <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-white">Explore</h3>
            <ul className="mt-5 space-y-3 text-[15px]">
              {links.map((link) => (
                <li key={link.id}>
                  <button onClick={() => goTo(link.id)} className="transition-colors hover:text-white">
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-3">
            <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-white">Services</h3>
            <ul className="mt-5 space-y-3 text-[15px]">
              {services.map((service) => (
                <li key={service}>{service}</li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-3">
            <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-white">Visit the store</h3>
            <address className="mt-5 space-y-3 text-[15px] not-italic">
              <p>
                {business.address.line1}
                <br />
                {business.address.line2}
              </p>
              <p>
                {business.hours.days}
                <br />
                {business.hours.time}
              </p>
              <p className="space-x-2">
                {business.phones.map((phone, i) => (
                  <React.Fragment key={phone.href}>
                    {i > 0 && <span className="text-slate-500">/</span>}
                    <a href={phone.href} className="text-white transition-colors hover:text-orange-400">
                      {phone.label}
                    </a>
                  </React.Fragment>
                ))}
              </p>
              <a href={`mailto:${business.emails[0]}`} className="block transition-colors hover:text-white">
                {business.emails[0]}
              </a>
            </address>
          </div>
        </div>

        <div className="flex flex-col gap-4 border-t border-white/10 py-6 text-sm sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {business.name}. All rights reserved. Designed by Sandesh Gadal.
          </p>
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="inline-flex items-center gap-2 self-start transition-colors hover:text-white sm:self-auto"
          >
            Back to top <ArrowUp size={15} />
          </button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
