import React, { useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import About from './components/About';
import Services from './components/Services';
// import FeaturedProducts from './components/FeaturedProducts';
import WhyChooseUs from './components/WhyChooseUs';
import Testimonials from './components/Testimonials';
import Contact from './components/Contact';
import Footer from './components/Footer';
import TestCanvas from './components/TestCanvas';

function App() {
  useEffect(() => {
    document.title = "Chitwan Computer - Your Trusted Tech Partner";
  }, []);

  return (
    <div className="font-sans">
      <Navbar />
      <Hero />
      {/* <TestCanvas/> */}
      <About />
      <Services />
      {/* <FeaturedProducts /> */}
      <WhyChooseUs />
      <Testimonials />
      <Contact />
      <Footer />
    </div>
  );
}

export default App;