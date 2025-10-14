import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import FBXModel from './FBXModel';
import { motion } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import heropc from '../assets/heroPc.png';
import herobg from '../assets/heroBg.png';

const Hero: React.FC = () => {
  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
<section id="home" className="relative w-full h-[70%] bg-gradient-to-r from-blue-900 to-blue-700">


 <div className="w-full h-screen margin-auto relative flex items-center justify-center">
        <div
        className="absolute inset-0 z-0 opacity-20"
        style={{
          backgroundImage: `url(${herobg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      ></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
        <div className="lg:flex lg:justify-between items-center">
          <motion.div
            className="text-center lg:text-left lg:max-w-xl"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.3 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-12 md:mb-6">
              Your Trusted Tech Partner in Chitwan
            </h1>
            <p className="text-xl text-gray-200 mb-8 max-w-lg mx-auto lg:mx-0">
              Premium computers, expert repairs, and custom builds from Nepal's most trusted technology provider.
            </p>

            <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-4">
              <motion.button
                onClick={() => scrollToSection('products')}
                className="bg-orange-500 hover:bg-orange-600 text-white py-3 px-8 rounded-lg font-medium text-lg flex items-center justify-center transition duration-300"
                whileHover={{ scale: 1.05 }}
              >
                Visit Our Store <ArrowRight size={20} className="ml-2" />
              </motion.button>

              <motion.button
                onClick={() => scrollToSection('contact')}
                className="bg-transparent hover:bg-white/10 text-white border-2 border-white py-3 px-8 rounded-lg font-medium text-lg transition duration-300"
                whileHover={{ scale: 1.05 }}
              >
                Get a Free Quote
              </motion.button>
            </div>
          </motion.div>

          <motion.div
            className="hidden lg:block lg:w-2/5"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 1 }}
          >
            <div className="relative mt-12 lg:mt-0">
              <motion.div
                className="bg-white/10 backdrop-blur-sm p-2 rounded-xl shadow-xl"
                whileHover={{ scale: 1.05 }}
              >
                <img src={heropc} alt="Modern Computer Setup" className="rounded-lg shadow-lg" />
                <motion.div
                  className="bg-white backdrop-blur p-4 rounded-lg shadow-lg absolute -bottom-6 -right-6 max-w-xs"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6, duration: 0.5 }}
                >
                  <p className="text-gray-800 font-bold">Custom Gaming PC Builds</p>
                  <p className="text-gray-600 text-md">Choose Your own Specs</p>
                </motion.div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
      </div>
 
</section>


  );
};

export default Hero;




 