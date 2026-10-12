import React from "react";

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
  return (
    <div className="font-sans">
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
