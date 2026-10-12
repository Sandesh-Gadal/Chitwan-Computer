import React, { useState } from 'react';
import { Phone, Mail, MapPin, Clock, ArrowRight, Facebook, Instagram, Youtube } from 'lucide-react';
import SectionHeading from './ui/SectionHeading';
import Reveal from './ui/Reveal';
import { business } from '../data/business';

interface FormData {
  name: string;
  email: string;
  phone: string;
  message: string;
}

const emptyForm: FormData = { name: '', email: '', phone: '', message: '' };

const inputBase =
  'w-full rounded-md border bg-white px-4 py-3 text-[15px] text-ink placeholder:text-slate-500 transition-colors focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/15';

const Contact: React.FC = () => {
  const [formData, setFormData] = useState<FormData>(emptyForm);
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [opened, setOpened] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Partial<FormData> = {};
    if (!formData.name.trim()) newErrors.name = 'Please enter your name';
    if (!formData.email.trim()) {
      newErrors.email = 'Please enter your email';
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = 'That email doesn’t look right';
    }
    if (!formData.message.trim()) newErrors.message = 'Please tell us how we can help';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // No backend endpoint for messages yet, so hand off to the visitor's email app
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const subject = `Enquiry from ${formData.name}`;
    const body = [
      formData.message,
      '',
      `Name: ${formData.name}`,
      `Email: ${formData.email}`,
      formData.phone && `Phone: ${formData.phone}`,
    ]
      .filter((line) => line !== '')
      .join('\n');

    window.location.href = `mailto:${business.emails[0]}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setOpened(true);
    setFormData(emptyForm);
  };

  const details = [
    {
      icon: Phone,
      label: 'Call',
      lines: business.phones.map((p) => ({ text: p.label, href: p.href })),
    },
    {
      icon: Mail,
      label: 'Email',
      lines: business.emails.map((email) => ({ text: email, href: `mailto:${email}` })),
    },
    {
      icon: MapPin,
      label: 'Visit',
      lines: [
        { text: business.address.line1, href: business.mapsUrl },
        { text: business.address.line2 },
      ],
    },
    {
      icon: Clock,
      label: 'Hours',
      lines: [{ text: business.hours.days }, { text: business.hours.time }],
    },
  ];

  const socials = [
    { icon: Facebook, href: business.socials.facebook, label: 'Facebook' },
    { icon: Instagram, href: business.socials.instagram, label: 'Instagram' },
    { icon: Youtube, href: business.socials.youtube, label: 'YouTube' },
  ];

  return (
    <section id="contact" className="border-t border-slate-200 bg-paper py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          title="Need a quote or a repair? Let's talk."
          intro="Call, drop by the store, or send a message and we'll get back to you as soon as we can."
        />

        <div className="grid gap-12 lg:grid-cols-12">
          {/* Details */}
          <Reveal className="lg:col-span-5">
            <dl className="border-b border-slate-300">
              {details.map(({ icon: Icon, label, lines }) => (
                <div key={label} className="grid grid-cols-[2.5rem_5rem_1fr] items-start border-t border-slate-300 py-5">
                  <Icon size={18} strokeWidth={1.8} className="mt-0.5 text-primary-500" />
                  <dt className="text-sm font-semibold uppercase tracking-[0.12em] text-slate-600">{label}</dt>
                  <dd className="space-y-1 text-[15px] text-ink">
                    {lines.map((line) =>
                      'href' in line && line.href ? (
                        <a
                          key={line.text}
                          href={line.href}
                          target={line.href.startsWith('http') ? '_blank' : undefined}
                          rel="noreferrer"
                          className="block break-all underline-offset-4 hover:text-primary-500 hover:underline"
                        >
                          {line.text}
                        </a>
                      ) : (
                        <span key={line.text} className="block text-slate-600">
                          {line.text}
                        </span>
                      )
                    )}
                  </dd>
                </div>
              ))}
            </dl>

            <div className="mt-8 flex items-center gap-3">
              <span className="mr-2 text-sm text-slate-600">Follow us</span>
              {socials.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={label}
                  className="flex h-10 w-10 items-center justify-center rounded-md border border-slate-300 text-slate-600 transition-colors hover:border-ink hover:bg-ink hover:text-white"
                >
                  <Icon size={18} />
                </a>
              ))}
            </div>
          </Reveal>

          {/* Form */}
          <Reveal className="lg:col-span-7" delay={0.1}>
            <form
              onSubmit={handleSubmit}
              noValidate
              className="rounded-lg border border-slate-200 bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.04)] sm:p-8"
            >
              <h3 className="font-display text-xl font-semibold text-ink">Send us a message</h3>

              {opened && (
                <p className="mt-4 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                  Your email app should now be open with the message ready. Just hit send. If nothing opened,
                  email us at <a href={`mailto:${business.emails[0]}`} className="font-semibold underline">{business.emails[0]}</a>.
                </p>
              )}

              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="name" className="mb-2 block text-sm font-medium text-ink">Name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={`${inputBase} ${errors.name ? 'border-red-400' : 'border-slate-300'}`}
                    placeholder="Your full name"
                  />
                  {errors.name && <p className="mt-1.5 text-sm text-red-600">{errors.name}</p>}
                </div>

                <div>
                  <label htmlFor="email" className="mb-2 block text-sm font-medium text-ink">Email</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`${inputBase} ${errors.email ? 'border-red-400' : 'border-slate-300'}`}
                    placeholder="you@example.com"
                  />
                  {errors.email && <p className="mt-1.5 text-sm text-red-600">{errors.email}</p>}
                </div>
              </div>

              <div className="mt-5">
                <label htmlFor="phone" className="mb-2 block text-sm font-medium text-ink">
                  Phone <span className="font-normal text-slate-500">(optional)</span>
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className={`${inputBase} border-slate-300`}
                  placeholder="+977 98XXXXXXXX"
                />
              </div>

              <div className="mt-5">
                <label htmlFor="message" className="mb-2 block text-sm font-medium text-ink">Message</label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows={5}
                  className={`${inputBase} resize-y ${errors.message ? 'border-red-400' : 'border-slate-300'}`}
                  placeholder="Tell us what you need: a laptop, a repair, a custom build…"
                />
                {errors.message && <p className="mt-1.5 text-sm text-red-600">{errors.message}</p>}
              </div>

              <button
                type="submit"
                className="group mt-7 inline-flex w-full items-center justify-center gap-2 rounded-md bg-ink px-7 py-3.5 text-[15px] font-semibold text-white transition-colors hover:bg-primary-500 sm:w-auto"
              >
                Send message
                <ArrowRight size={17} className="transition-transform group-hover:translate-x-1" />
              </button>
            </form>
          </Reveal>
        </div>
      </div>
    </section>
  );
};

export default Contact;
