// Writes dist/sitemap.xml after the build: the fixed pages plus every category,
// brand and product from the live API. If the API can't be reached the fixed
// pages are still written, so a build never fails because of the sitemap.
import { readFileSync, writeFileSync } from 'node:fs';

const SITE = 'https://www.chitwancomputer.com.np';
const env = Object.fromEntries(
  readFileSync(new URL('../.env.production', import.meta.url), 'utf8')
    .split('\n')
    .map((line) => line.match(/^\s*([A-Z_]+)\s*=\s*"?([^"]*)"?\s*$/))
    .filter(Boolean)
    .map((m) => [m[1], m[2]])
);
const API = process.env.VITE_API_URL || env.VITE_API_URL;

const today = new Date().toISOString().slice(0, 10);
const urls = [
  { loc: '/', priority: '1.0', changefreq: 'daily' },
  { loc: '/products', priority: '0.9', changefreq: 'daily' },
  { loc: '/about', priority: '0.6', changefreq: 'monthly' },
];

const get = async (path) => {
  const res = await fetch(`${API}${path}`, { signal: AbortSignal.timeout(15000), headers: { Accept: 'application/json' } });
  if (!res.ok) throw new Error(`${path}: HTTP ${res.status}`);
  return res.json();
};

try {
  const [categories, brands] = await Promise.all([get('/categories'), get('/brands')]);
  for (const c of categories) if (c.products_count > 0) urls.push({ loc: `/products?category=${c.slug}`, priority: '0.8', changefreq: 'daily' });
  for (const b of brands) if (b.products_count > 0) urls.push({ loc: `/products?brand=${b.slug}`, priority: '0.6', changefreq: 'weekly' });

  for (let page = 1, last = 1; page <= last; page++) {
    const data = await get(`/products?per_page=100&page=${page}`);
    last = data.last_page;
    for (const p of data.data) {
      urls.push({ loc: `/products/${p.id}`, priority: '0.7', changefreq: 'weekly', lastmod: (p.updated_at ?? '').slice(0, 10) || today });
    }
  }
} catch (err) {
  console.warn(`sitemap: catalogue not added (${err.message}); writing fixed pages only`);
}

const escape = (s) => s.replace(/&/g, '&amp;');
const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) =>
      `  <url><loc>${escape(SITE + u.loc)}</loc><lastmod>${u.lastmod ?? today}</lastmod><changefreq>${u.changefreq}</changefreq><priority>${u.priority}</priority></url>`
  )
  .join('\n')}
</urlset>
`;

writeFileSync(new URL('../dist/sitemap.xml', import.meta.url), xml);
console.log(`sitemap: ${urls.length} URLs written to dist/sitemap.xml`);
