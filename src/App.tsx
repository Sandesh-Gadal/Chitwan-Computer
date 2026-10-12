import React, { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';

import Navbar from './components/Navbar';
import CctvCamera from './components/CctvCamera';
import EnquiryDrawer from './components/products/EnquiryDrawer';
import { EnquiryProvider } from './context/EnquiryContext';
import Footer from './components/Footer';
import Home from './pages/Home';
import Products from './components/ProductPage';
import ProductDetail from './pages/ProductDetail';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

// Configure QueryClient with custom defaults
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes (data stays fresh for 5 minutes)
      gcTime: 10 * 60 * 1000, // 10 minutes (cache persists for 10 minutes)
      refetchOnWindowFocus: false, // Don't refetch when window regains focus
      refetchOnMount: true, // Refetch when component mounts (good for product pages)
      refetchOnReconnect: true, // Refetch when internet reconnects
      retry: 2, // Retry failed requests twice
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
    },
  },
});

function App() {
  useEffect(() => {
    document.title = "Chitwan Computer - Your Trusted Tech Partner";
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <EnquiryProvider>
      <div className="font-sans">
        <Navbar />
        <CctvCamera />

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/products/:id" element={<ProductDetail />} />
        </Routes>

        <Footer />
        <EnquiryDrawer />
        
        {/* Add React Query Devtools for development */}
        {process.env.NODE_ENV === 'development' && (
          <ReactQueryDevtools initialIsOpen={false} />
        )}
      </div>
      </EnquiryProvider>
    </QueryClientProvider>
  );
}

export default App;
