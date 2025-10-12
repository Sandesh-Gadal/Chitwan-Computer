import React from 'react';
import { Shield, Award, Clock } from 'lucide-react';
import { motion } from 'motion/react';
import ccspic from '../assets/Chitwancomputer.png';

const About: React.FC = () => {
  return (
    <section id="about" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false , amount: 0.3 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">About Chitwan Computer</h2>
          <div className="w-20 h-1 bg-blue-600 mx-auto mb-6"></div>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Established in 2010, Chitwan Computer has been the region's leading technology provider, 
            offering high-quality computer hardware, expert repair services, and custom solutions.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[{
            icon: <Shield size={32} className="text-blue-600" />,
            title: 'Quality Assurance',
            desc: 'We stand behind every product and service with our comprehensive warranty and support program.'
          },
          {
            icon: <Award size={32} className="text-blue-600" />,
            title: 'Certified Experts',
            desc: 'Our team of technicians holds certifications from major manufacturers including HP, Dell, and Lenovo.'
          },
          {
            icon: <Clock size={32} className="text-blue-600" />,
            title: 'Rapid Service',
            desc: 'We understand the importance of your technology. Most repairs are completed within 24-48 hours.'
          }].map((item, idx) => (
            <motion.div
              key={idx}
              className="bg-white p-8 rounded-xl shadow-md transform hover:shadow-lg transition duration-300"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false , amount: 0.3 }}
              transition={{ delay: 0.1 * idx, duration: 0.5 }}
            >
              <div className="flex justify-center mb-4">
                <div className="bg-blue-100 p-3 rounded-full">
                  {item.icon}
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 text-center mb-3">{item.title}</h3>
              <p className="text-gray-600 text-center">{item.desc}</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          className="mt-16 bg-white rounded-xl shadow-md overflow-hidden"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false , amount: 0.3 }}
          transition={{ duration: 0.7 }}
        >
          <div className="md:flex">
            <div className="md:w-1/2">
              <img 
                src={ccspic}
                alt="Chitwan Computer Team" 
                className="h-full w-full object-cover object-center"
                loading="lazy"
                style={{ maxWidth: '100%', height: 'auto' }}
              />
            </div>
            <div className="p-8 md:w-1/2 flex items-center">
              <div>
                <h3 className="text-4xl font-bold text-gray-800 mb-4">Our Mission</h3>
                <p className="text-gray-600 mb-6 text-xl text-justify">
                  At Chitwan Computer, our mission is to provide the highest quality technology solutions to individuals and businesses 
                  throughout Chitwan and beyond. We believe in honest advice, fair pricing, and exceptional customer service.
                </p>
                <p className="text-gray-600 text-xl text-justify">
                  Whether you're looking for a simple repair or a complete technology overhaul, 
                  our team is committed to finding the perfect solution for your needs and budget.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default About;
