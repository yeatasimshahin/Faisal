import React from 'react';
import { motion } from 'framer-motion';
import { useStore } from '../../store/useStore';

const Marquee = () => {
  const { settings } = useStore();
  
  // Default text if settings haven't loaded
  const text = settings?.marquee_text || 'Award Winning Architecture • Modern Design • Sustainable Living';
  
  // Duplicate text to ensure seamless loop
  const marqueeContent = `${text} • ${text} • ${text} • ${text} • `;

  return (
    <div className="w-full bg-[#0a0a0a] border-y border-white/10 overflow-hidden py-6 relative z-10">
      <div className="relative w-full flex overflow-x-hidden">
        <motion.div
          className="flex whitespace-nowrap"
          animate={{ x: "-50%" }}
          transition={{
            repeat: Infinity,
            ease: "linear",
            duration: 20, // Adjust speed here
          }}
        >
          <span className="text-4xl md:text-6xl font-light uppercase tracking-tighter text-transparent stroke-text opacity-70 px-4" 
                style={{ WebkitTextStroke: '1px rgba(255,255,255,0.5)' }}>
            {marqueeContent}
          </span>
          <span className="text-4xl md:text-6xl font-light uppercase tracking-tighter text-transparent stroke-text opacity-70 px-4"
                style={{ WebkitTextStroke: '1px rgba(255,255,255,0.5)' }}>
            {marqueeContent}
          </span>
        </motion.div>
      </div>
      
      {/* Fade edges */}
      <div className="absolute top-0 left-0 w-20 h-full bg-gradient-to-r from-[#0a0a0a] to-transparent z-10" />
      <div className="absolute top-0 right-0 w-20 h-full bg-gradient-to-l from-[#0a0a0a] to-transparent z-10" />
    </div>
  );
};

export default Marquee;
