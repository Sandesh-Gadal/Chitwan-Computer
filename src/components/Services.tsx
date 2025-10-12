import React from 'react';
import { Laptop, Cpu, Printer, Wrench } from 'lucide-react';
import { motion } from 'framer-motion';

interface ServiceProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

const ServiceCard: React.FC<ServiceProps & { variants: any }> = ({ icon, title, description, variants }) => {
  return (
    <motion.div
      variants={variants}
      className="bg-white rounded-xl shadow-md p-8 transform hover:-translate-y-2 transition duration-300"
    >
      <div className="flex justify-center mb-6">
        <div className="bg-blue-600 text-white p-4 rounded-full">
          {icon}
        </div>
      </div>
      <h3 className="text-xl font-semibold text-gray-800 text-center mb-4">{title}</h3>
      <p className="text-gray-600 text-center">{description}</p>
    </motion.div>
  );
};

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.25,
    },
  },
};

const Services: React.FC = () => {
  const services = [
    {
      icon: <Laptop size={24} />,
      title: "Laptop & Computer Sales",
      description: "Wide range of laptops and desktop computers from leading brands at competitive prices."
    },
    {
      icon: <Cpu size={24} />,
      title: "Custom PC Building",
      description: "Custom-built PCs tailored to your specific needs, whether for gaming, design, or office work."
    },
    {
      icon: <Printer size={24} />,
      title: "Printer & Camera Sales",
      description: "Quality printers, cameras, and accessories with expert advice to find the right product."
    },
    {
      icon: <Wrench size={24} />,
      title: "Repair & Maintenance",
      description: "Professional repair services for computers, laptops, printers, and other electronic devices."
    }
  ];

  return (
    <section id="services" className="py-20 bg-gradient-to-b from-white to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Animated Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">Our Services</h2>
          <div className="w-20 h-1 bg-blue-600 mx-auto mb-6"></div>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            We offer a comprehensive range of technology products and services to meet all your computing needs.
          </p>
        </motion.div>

        {/* Staggered Grid Animation */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, amount: 0.3 }}
          variants={containerVariants}
        >
          {services.map((service, index) => (
            <ServiceCard
              key={index}
              icon={service.icon}
              title={service.title}
              description={service.description}
              variants={cardVariants}
            />
          ))}
        </motion.div>

        {/* Animated Button */}
        <motion.div
          className="mt-16 text-center"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: false }}
          transition={{ duration: 0.5, delay: 0.3, type: "spring", stiffness: 100 }}
        >
          <button 
            onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
            className="bg-blue-600 hover:bg-blue-700 text-white py-3 px-8 rounded-lg font-medium text-lg transition duration-300"
          >
            Get a Service Quote
          </button>
        </motion.div>

      </div>
    </section>
  );
};

export default Services;
