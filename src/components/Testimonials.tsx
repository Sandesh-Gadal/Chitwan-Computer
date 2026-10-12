import React from 'react';
import GoogleReviews from './GoogleReviews';
import SectionHeading from './ui/SectionHeading';
import Reveal from './ui/Reveal';

const Testimonials: React.FC = () => {
  return (
    <section id="testimonials" className="bg-white py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          title="What our customers say."
          intro="Real reviews from people we've helped, straight from Google."
        />
        <Reveal>
          <GoogleReviews />
        </Reveal>
      </div>
    </section>
  );
};

export default Testimonials;
