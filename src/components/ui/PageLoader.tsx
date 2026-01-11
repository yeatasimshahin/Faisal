import React from 'react';
import { motion } from 'framer-motion';

const PageLoader = () => {
  return (
    <div className="fixed inset-0 z-[9999] bg-[#0a0a0a] flex flex-col items-center justify-center">
      <div className="relative w-24 h-24 mb-8">
        {/* Outer rotating ring */}
        <motion.div 
          className="absolute inset-0 border border-white/10 rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 8, ease: "linear", repeat: Infinity }}
        />
        
        {/* Inner pulsing ring */}
        <motion.div 
          className="absolute inset-4 border border-red-600/50 rounded-full"
          animate={{ scale: [0.9, 1.1, 0.9], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, ease: "easeInOut", repeat: Infinity }}
        />

        {/* Center geometric element */}
        <div className="absolute inset-0 flex items-center justify-center">
           <motion.div 
             className="w-2 h-2 bg-white"
             animate={{ rotate: 45 }}
           />
        </div>
      </div>

      <motion.h2 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse", repeatDelay: 0.5 }}
        className="text-[10px] font-bold uppercase tracking-[0.3em] text-white"
      >
        Precission
      </motion.h2>
    </div>
  );
};

export default PageLoader;