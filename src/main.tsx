import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { MotionConfig } from "framer-motion";
import { HelmetProvider, Helmet } from 'react-helmet-async';
import { BrowserRouter } from 'react-router-dom';

// JSON-LD for Local Business SEO
const localBusinessSchema = {
  "@context": "https://schema.org",
  "@type": "ComputerStore",
  "name": "Chitwan Computer Solutions",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Lionschowk",
    "addressLocality": "Bharatpur",
    "postalCode": "44200",
    "addressCountry": "NP"
  },
  "telephone": "+977-056-590714",
  "url": "https://chitwancomputer.com.np/",
  "email": "chitwancomputer@gmail.com",
  "priceRange": "$$"
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <HelmetProvider>
      <Helmet>
        {/* Basic Metadata */}
        <title>Chitwan Computer Solutions | Laptops, Desktops & Printers in Lionschowk</title>
        <meta name="title" content="Chitwan Computer Solutions | Laptops, Desktops & Printers in Lionschowk" />
        <meta name="description" content="Affordable laptops, desktops, printers, and cameras at Chitwan Computer Solutions. Visit us in Lionschowk for the best service and tech deals." />

        {/* Open Graph / Facebook */}
        <meta property="og:type" content="business.business" />
        <meta property="og:url" content="https://chitwancomputer.com.np/" />
        <meta property="og:title" content="Chitwan Computer Solutions - Quality Tech & Service" />
        <meta property="og:description" content="All kinds of Laptops, Desktops, Printers, Cameras & more available at affordable prices. Visit us at Lionschowk, Chitwan." />
        <meta property="og:image" content="https://chitwancomputer.com.np/og-image.jpg" />

        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content="https://chitwancomputer.com.np/" />
        <meta property="twitter:title" content="Chitwan Computer Solutions" />
        <meta property="twitter:description" content="Affordable Laptops, Desktops, and Printers in Chitwan. Best service guaranteed." />

        {/* Structured Data for Google Maps/Search */}
        <script type="application/ld+json">
          {JSON.stringify(localBusinessSchema)}
        </script>
      </Helmet>
      <BrowserRouter>
      <MotionConfig reducedMotion="user">
        <App />
      </MotionConfig>
      </BrowserRouter>
    </HelmetProvider>
  </React.StrictMode>
);