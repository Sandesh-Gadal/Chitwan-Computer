import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { MotionConfig } from 'framer-motion';
import { HelmetProvider, Helmet } from 'react-helmet-async';
import { BrowserRouter } from 'react-router-dom';
import { defaultSeo } from './data/seo';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <HelmetProvider>
      {/* Fallbacks; each page sets its own title, description and structured data through <Seo> */}
      <Helmet defaultTitle={defaultSeo.title}>
        <html lang="en" />
        <meta name="description" content={defaultSeo.description} />
      </Helmet>
      <BrowserRouter>
        <MotionConfig reducedMotion="user">
          <App />
        </MotionConfig>
      </BrowserRouter>
    </HelmetProvider>
  </React.StrictMode>
);
