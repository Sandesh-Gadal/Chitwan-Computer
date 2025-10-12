import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const GoogleReviews = () => {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://static.elfsight.com/platform/platform.js';
    script.async = true;
    script.defer = true;
    script.onload = () => setLoaded(true); // Marks as loaded
    document.body.appendChild(script);
  }, []);

return (
  <motion.div
    initial={{ opacity: 0, x: 100 }}
    whileInView={{ opacity: 1, x: 0 }}
    viewport={{ once: true, amount: 0.2 }}
    transition={{ duration: 0.8 }}
    className="w-full my-10 overflow-x-hidden px-4" // Added px-4 for safety
  >
    {!loaded && (
      <div className="text-center text-gray-500 animate-pulse mb-6">
        Loading Google Reviews...
      </div>
    )}
    <div className="w-full max-w-7xl mx-auto overflow-hidden">
      <div
        className="elfsight-app-dd5e296b-6822-4644-b53a-c49a1975bab7"
        data-elfsight-app-lazy
      ></div>
    </div>
  </motion.div>
);
}

export default GoogleReviews;
