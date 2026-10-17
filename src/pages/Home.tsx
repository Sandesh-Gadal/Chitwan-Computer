import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";
import Seo, { breadcrumbSchema } from "../components/Seo";
import { business } from "../data/business";

import Hero from "../components/Hero";
import Brands from "../components/Brands";
import About from "../components/About";
import Services from "../components/Services";
import FeaturedProducts from "../components/FeaturedProducts";
import ShopByBrand from "../components/ShopByBrand";
import WhyChooseUs from "../components/WhyChooseUs";
import Testimonials from "../components/Testimonials";
import Contact from "../components/Contact";

const Home = () => {
  const { hash } = useLocation();

  // Links like /about#services land on that section once it has rendered
  useEffect(() => {
    const id = hash.slice(1);
    if (!id) {
      window.scrollTo(0, 0);
      return;
    }
    const timer = setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }), 60);
    return () => clearTimeout(timer);
  }, [hash]);

  return (
    <div className="font-sans">
      <Seo
        title="About Chitwan Computer | Computer Sales, Repair & CCTV Installation in Chitwan"
        description={`In Narayanghat since ${business.since}: laptop and desktop sales, custom gaming PC builds, laptop and printer repair in 24–48 hours, and CCTV installation across Chitwan.`}
        path="/about"
        schema={breadcrumbSchema([
          { name: 'Home', path: '/' },
          { name: 'About', path: '/about' },
        ])}
      />
      <Hero />
      <Brands />
      <About />
      <Services />
      <FeaturedProducts />
      <ShopByBrand />
      <WhyChooseUs />
      <Testimonials />
      <Contact />
    </div>
  );
};

export default Home;
