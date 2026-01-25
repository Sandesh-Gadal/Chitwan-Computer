import React from "react";

import Hero from "../components/Hero";
import About from "../components/About";
import Services from "../components/Services";
import FeaturedProducts from "../components/FeaturedProducts";
import WhyChooseUs from "../components/WhyChooseUs";
import Testimonials from "../components/Testimonials";
import Contact from "../components/Contact";

const Home = () => {
  return (
    <div className="font-sans">
      <Hero />
      <About />
      <Services />
      <FeaturedProducts />
      <WhyChooseUs />
      <Testimonials />
      <Contact />
    </div>
  );
};

export default Home;
