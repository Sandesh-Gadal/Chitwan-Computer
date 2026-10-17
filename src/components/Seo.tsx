import React from 'react';
import { Helmet } from 'react-helmet-async';
import { OG_IMAGE, SITE_NAME, SITE_URL } from '../data/seo';

interface SeoProps {
  title: string;
  description: string;
  /** Path for the canonical URL, e.g. "/products?category=laptops" */
  path: string;
  image?: string;
  type?: 'website' | 'product';
  /** One or more schema.org objects */
  schema?: object | object[];
  noindex?: boolean;
}

/** Title, description, canonical URL, social previews and structured data for a page */
const Seo: React.FC<SeoProps> = ({ title, description, path, image = OG_IMAGE, type = 'website', schema, noindex }) => {
  const url = `${SITE_URL}${path}`;
  const desc = description.length > 160 ? `${description.slice(0, 157).trimEnd()}…` : description;
  const schemas = schema ? (Array.isArray(schema) ? schema : [schema]) : [];

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={desc} />
      <link rel="canonical" href={url} />
      {noindex && <meta name="robots" content="noindex, follow" />}

      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={desc} />
      <meta property="og:image" content={image} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={desc} />
      <meta name="twitter:image" content={image} />

      {schemas.map((s, i) => (
        <script key={i} type="application/ld+json">
          {JSON.stringify(s)}
        </script>
      ))}
    </Helmet>
  );
};

/** Breadcrumb trail as schema.org markup */
export const breadcrumbSchema = (items: { name: string; path: string }[]) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map((item, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    name: item.name,
    item: `${SITE_URL}${item.path}`,
  })),
});

export default Seo;
