import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Quote } from 'lucide-react';
import GoogleReviews from './GoogleReviews';
import { motion } from 'framer-motion'; 

interface TestimonialProps {
  content: string;
  author: string;
  position: string;
  image: string;
}

const Testimonial: React.FC<TestimonialProps> = ({ content, author, position, image }) => {
  return (
    <div className="bg-white rounded-xl shadow-md p-8 max-w-2xl mx-auto">
      <div className="flex justify-center mb-6">
        <div className="bg-blue-100 p-3 rounded-full">
          <Quote size={24} className="text-blue-600" />
        </div>
      </div>
      <p className="text-gray-700 text-lg text-center italic mb-8">{content}</p>
      <div className="flex items-center justify-center">
        <img 
          src={image} 
          alt={author} 
          className="w-14 h-14 rounded-full object-cover mr-4"
        />
        <div>
          <h4 className="text-lg font-semibold text-gray-800">{author}</h4>
          <p className="text-gray-600">{position}</p>
        </div>
      </div>
    </div>
  );
};

const Testimonials: React.FC = () => {
  const testimonials = [
    {
      content: "Chitwan Computer built a custom gaming PC for me that exceeded all my expectations. Their knowledge and attention to detail was impressive, and the price was very reasonable.",
      author: "Rajesh Sharma",
      position: "Software Engineer",
      image: "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750"
    },
    {
      content: "When my laptop stopped working before an important deadline, the team at Chitwan Computer fixed it within hours. Their service was fast, professional, and affordable.",
      author: "Sita Thapa",
      position: "Graphic Designer",
      image: "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750"
    },
    {
      content: "I've been buying all my tech from Chitwan Computer for the past 5 years. Their products are always genuine, their prices fair, and their after-sales support is excellent.",
      author: "Binod Adhikari",
      position: "Business Owner",
      image: "https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750"
    }
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  const nextTestimonial = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + testimonials.length) % testimonials.length);
  };

  return (
    <section id="testimonials" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-2 sm:px-3 lg:px-8">
             <motion.div
          initial={{ x: -40, opacity: 0 }}
          whileInView={{ x: 0, opacity: 1 }}
          viewport={{ once: false, amount: 0.3 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="text-center mb-16"
        >

  <h2 className="text-2xl md:text-4xl font-bold text-gray-800 mb-4">
    What Our Customers Say
  </h2>
  <div className="w-20 h-1 bg-blue-600 mx-auto mb-6"></div>
  <p className="text-lg text-gray-600 max-w-3xl mx-auto">
    Don't just take our word for it – hear what our satisfied customers have to say about their experiences with Chitwan Computer.
  </p>
</motion.div>

        <div className="relative overflow-hidden">
   <motion.div
          initial={{ x: -50, opacity: 0 }}
          whileInView={{ x: 0, opacity: 1 }}
          viewport={{ once: false, amount: 0.3 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="mt-16"
        >
  <GoogleReviews />
</motion.div> 
         </div>
      </div>
    </section>
  );
};

export default Testimonials;