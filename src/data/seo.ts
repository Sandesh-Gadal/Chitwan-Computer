import { business } from './business';

export const SITE_URL = 'https://www.chitwancomputer.com.np';
export const SITE_NAME = 'Chitwan Computer';
export const OG_IMAGE = `${SITE_URL}/og-image.jpg`;

/**
 * Search terms people in Chitwan use, grouped by what they're after. Used for page
 * titles, descriptions and the "Popular searches" links, so the wording on the
 * page matches the wording in Google.
 */
export const keywords = {
  store: [
    'computer shop in Chitwan',
    'computer store Narayanghat',
    'laptop shop Bharatpur',
    'computer shop Lionschowk',
    'IT shop Chitwan',
  ],
  products: [
    'laptop price in Nepal',
    'gaming laptop Chitwan',
    'desktop computer price in Nepal',
    'gaming PC build Chitwan',
    'CCTV camera price in Nepal',
    'CCTV installation Chitwan',
    'UNV CCTV dealer Chitwan',
    'printer price in Nepal',
    'monitor price in Nepal',
    'WiFi router Chitwan',
    'SSD and RAM price in Nepal',
    'graphics card price in Nepal',
  ],
  services: ['laptop repair Narayanghat', 'computer repair Chitwan', 'printer repair Chitwan', 'custom PC builder Chitwan'],
  seasonal: ['Dashain offer laptop', 'Dashain offer 2083'],
};

/** Search-style title and description for each category page */
export const categorySeo: Record<string, { title: string; description: string; search: string }> = {
  laptops: {
    title: 'Laptop Price in Nepal | Laptop Shop in Chitwan',
    description: 'Latest laptop prices in Nepal from ASUS, Acer, Dell, HP, Lenovo and MSI. Student, office and gaming laptops in stock at our Narayanghat, Chitwan store.',
    search: 'Laptop price in Nepal',
  },
  desktops: {
    title: 'Desktop & Gaming PC Price in Nepal | Custom PC Build Chitwan',
    description: 'Office desktops and custom gaming PCs built and tested in Chitwan. Compare desktop computer prices in Nepal and get a build quote for your budget.',
    search: 'Gaming PC build in Chitwan',
  },
  monitors: {
    title: 'Monitor Price in Nepal | Samsung, LG, Dell Monitors Chitwan',
    description: 'Office, IPS and high-refresh gaming monitors with prices. Samsung, LG and Dell monitors available in Narayanghat, Chitwan.',
    search: 'Monitor price in Nepal',
  },
  'cctv-cameras': {
    title: 'CCTV Camera Price in Nepal | CCTV Installation in Chitwan',
    description: 'UNV, Hikvision and Dahua CCTV cameras with prices, plus professional CCTV installation for homes and shops across Chitwan.',
    search: 'CCTV camera price in Nepal',
  },
  'nvr-dvr': {
    title: 'NVR & DVR Price in Nepal | CCTV Recorders Chitwan',
    description: '4, 8 and 16 channel NVR and DVR recorders for CCTV systems. Available with setup at our Chitwan store.',
    search: 'NVR price in Nepal',
  },
  networking: {
    title: 'WiFi Router & Networking Price in Nepal | Chitwan',
    description: 'TP-Link, Tenda and Mercusys WiFi routers, switches and mesh systems with prices, in stock in Narayanghat, Chitwan.',
    search: 'WiFi router in Chitwan',
  },
  'storage-devices': {
    title: 'SSD, Hard Disk & Pen Drive Price in Nepal | Chitwan',
    description: 'NVMe and SATA SSDs, hard disks and portable drives from Kingston, WD, Samsung and Lexar, with prices.',
    search: 'SSD price in Nepal',
  },
  memory: {
    title: 'RAM Price in Nepal | DDR4 & DDR5 Laptop and Desktop RAM',
    description: 'DDR4 and DDR5 RAM for laptops and desktops from Kingston, Crucial and Corsair. Upgrades fitted at our Chitwan store.',
    search: 'RAM price in Nepal',
  },
  'graphics-cards': {
    title: 'Graphics Card Price in Nepal | RTX GPUs in Chitwan',
    description: 'NVIDIA GeForce RTX and AMD Radeon graphics cards from Zotac, MSI, Gigabyte and Sapphire, with prices.',
    search: 'Graphics card price in Nepal',
  },
  printers: {
    title: 'Printer Price in Nepal | Epson, Canon, Brother Printers Chitwan',
    description: 'Ink tank, laser and all-in-one printers from Epson, Canon, Brother and HP. Sales and printer repair in Chitwan.',
    search: 'Printer price in Nepal',
  },
  accessories: {
    title: 'Computer Accessories Price in Nepal | Keyboard, Mouse, UPS',
    description: 'Keyboards, mice, headsets, UPS and other computer accessories from Logitech, Fantech, Redragon and APC.',
    search: 'Computer accessories in Chitwan',
  },
};

export const defaultSeo = {
  title: 'Chitwan Computer | Laptops, Desktops, CCTV & Printers in Narayanghat, Chitwan',
  description: `Computer shop in Narayanghat, Chitwan since ${business.since}. Laptop, desktop, CCTV camera, printer and accessory prices online, plus repairs and CCTV installation. Lionschowk, Bharatpur.`,
};

/** The store as a LocalBusiness, for Google's map pack and knowledge panel */
export const storeSchema = {
  '@context': 'https://schema.org',
  '@type': 'ComputerStore',
  '@id': `${SITE_URL}/#store`,
  name: 'Chitwan Computer',
  alternateName: 'Chitwan Computer Solutions',
  url: SITE_URL,
  logo: `${SITE_URL}/logo.png`,
  image: OG_IMAGE,
  telephone: '+977-9847238888',
  contactPoint: [
    { '@type': 'ContactPoint', telephone: '+977-9847238888', contactType: 'sales', areaServed: 'NP', availableLanguage: ['English', 'Nepali'] },
    { '@type': 'ContactPoint', telephone: '+977-56-590714', contactType: 'customer service', areaServed: 'NP', availableLanguage: ['English', 'Nepali'] },
  ],
  email: business.emails[0],
  foundingDate: String(business.since),
  priceRange: '$$',
  currenciesAccepted: 'NPR',
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Lionschowk, Narayanghat',
    addressLocality: 'Bharatpur',
    addressRegion: 'Chitwan, Bagmati Province',
    postalCode: '44200',
    addressCountry: 'NP',
  },
  areaServed: ['Chitwan', 'Bharatpur', 'Narayanghat'],
  openingHoursSpecification: [
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      opens: '10:00',
      closes: '18:00',
    },
  ],
  sameAs: Object.values(business.socials),
};
