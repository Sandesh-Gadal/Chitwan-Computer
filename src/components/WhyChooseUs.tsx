import React from 'react';
import { BadgeCheck, ShieldCheck, Clock, Award } from 'lucide-react';
import { motion } from 'framer-motion';
import whyChooseUs from '../assets/whychooseus.png';

interface FeatureProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const FeatureItem: React.FC<FeatureProps> = ({ icon, title, description }) => {
  return (
    <div className="flex items-start">
      <div className="flex-shrink-0 mt-1">
        <div className="flex items-center justify-center w-12 h-12 rounded-md bg-blue-600 text-white">
          {icon}
        </div>
      </div>
      <div className="ml-4">
        <h3 className="text-xl font-semibold text-gray-800 mb-2">{title}</h3>
        <p className="text-gray-600">{description}</p>
      </div>
    </div>
  );
};

const containerVariants = {
  hiddenLeft: { opacity: 0, x: -40 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.8, ease: "easeOut" } },
};

const imageVariants = {
  hiddenRight: { opacity: 0, x: 40, scale: 0.9 },
  visible: { opacity: 1, x: 0, scale: 1, transition: { duration: 1, ease: "easeOut" } },
};

const WhyChooseUs: React.FC = () => {
  const features = [
    {
      icon: <BadgeCheck size={24} />,
      title: "Quality Products",
      description: "We source our products from authorized distributors, ensuring you get genuine, high-quality technology."
    },
    {
      icon: <ShieldCheck size={24} />,
      title: "Expert Support",
      description: "Our team of certified technicians provides expert advice and support for all your technology needs."
    },
    {
      icon: <Clock size={24} />,
      title: "Fast Repairs",
      description: "We understand the urgency of repairs and strive to fix your devices as quickly as possible."
    },
    {
      icon: <Award size={24} />,
      title: "Local Trust",
      description: "With over a decade of service in Chitwan, we've built a reputation for reliability and excellence."
    }
  ];

  return (
    <section className="py-20 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:flex lg:items-center lg:justify-between">

          {/* Left content - slide from left on every in-view */}
          <motion.div
            className="lg:w-1/2 lg:pr-12"
            initial="hiddenLeft"
            whileInView="visible"
            viewport={{ once: false, amount: 0.3 }} // triggers every time, when 30% visible
            variants={containerVariants}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6">Why Choose Us</h2>
            <div className="w-20 h-1 bg-blue-600 mb-8"></div>
            <p className="text-lg text-gray-600 mb-12">
              Chitwan Computer has established itself as the region's most trusted technology partner. 
              Here's why customers consistently choose us for their technology needs:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {features.map((feature, index) => (
                <FeatureItem
                  key={index}
                  icon={feature.icon}
                  title={feature.title}
                  description={feature.description}
                />
              ))}
            </div>
          </motion.div>

          {/* Right image - slide from right with scale on every in-view */}
          <motion.div
            className="mt-12 lg:mt-0 lg:w-1/2 overflow-hidden"
            initial="hiddenRight"
            whileInView="visible"
            viewport={{ once: false, amount: 0.3 }}
            variants={imageVariants}
          >
            <div className="relative overflow-hidden">
  {/* Background shapes */}
  <div className="absolute -top-4 -left-4 w-72 h-72 bg-blue-600 rounded-lg opacity-50 transform -rotate-6 z-0"></div>
  <div className="absolute -bottom-4 -right-4 w-72 h-72 bg-orange-500 rounded-lg opacity-50 transform rotate-6 z-0"></div>

  {/* Foreground image */}
  <img 
    src={whyChooseUs} 
    alt="Technician repairing computer" 
    className="relative z-10 rounded-lg shadow-xl w-full"
  />
</div>

          </motion.div>

        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;
