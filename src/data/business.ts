// Single source for store details used across the site
export const business = {
  name: 'Chitwan Computer',
  since: 2010,
  phones: [
    { label: '+977 9847238888', href: 'tel:+9779847238888' },
    { label: '056-590714', href: 'tel:056590714' },
  ],
  whatsapp: '9779847238888',
  emails: ['chitwancomputer@gmail.com', 'ccsservices40@gmail.com'],
  address: { line1: 'Lionschowk, Narayanghat', line2: 'Chitwan, Nepal' },
  mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Chitwan+Computer+Lionschowk+Narayanghat',
  hours: { days: 'Sunday – Friday', time: '10:00 AM – 6:00 PM' },
  socials: {
    facebook: 'https://www.facebook.com/chitwancomputer',
    instagram: 'https://www.instagram.com/chitwancomputer',
    youtube: 'https://youtube.com/@ccsithub1282?si=arIL10zZ0Czv92n1',
  },
};

// Opens WhatsApp chat with the store, optionally with a message typed in
export const whatsappLink = (message?: string) =>
  `https://wa.me/${business.whatsapp}${message ? `?text=${encodeURIComponent(message)}` : ''}`;
