import React from 'react';
import { useStore } from '../../store/useStore';
import { motion, Variants } from 'framer-motion';
import { Pencil, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Hero = () => {
  const { settings, isAdmin, isLoading } = useStore();
  const navigate = useNavigate();

  // Data mapping
  const title = settings?.hero_title || 'Precission';
  // Use a stark, high-contrast architectural image
  const bgImage = settings?.hero_image_url || 'https://images.unsplash.com/photo-1486325212027-8081e485255e?q=80&w=2670&auto=format&fit=crop';

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { y: 100, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 50,
        damping: 20,
      },
    },
  };

  if (isLoading && !settings) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-[#0a0a0a]">
        <Loader2 className="animate-spin text-white opacity-20" size={32} />
      </div>
    );
  }

  return (
    <section className="relative w-full h-screen flex flex-col items-center justify-center overflow-hidden bg-[#0a0a0a]">

      {/* Background Image with slight movement */}
      <motion.div
        className="absolute inset-0 z-0"
        initial={{ scale: 1.2, opacity: 0.8 }}
        animate={{ scale: 1, opacity: 0.6 }}
        transition={{ duration: 2.5, ease: "easeOut" }}
      >
        <div className="absolute inset-0 bg-black/50 z-10" /> {/* Darkening Overlay */}
        <img
          src={bgImage}
          alt="Architectural Hero"
          className="w-full h-full object-cover grayscale opacity-80"
        />
      </motion.div>

      {/* Main Content */}
      <div className="relative z-20 w-full px-6 md:px-12 flex flex-col items-center justify-center h-full">

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="relative text-center"
        >
          {/* Admin Edit Button - Positioned relative to title */}
          {isAdmin && (
            <button
              onClick={() => navigate('/admin/content')}
              className="absolute -top-12 -right-12 md:top-0 md:-right-16 p-3 bg-white text-black rounded-full hover:bg-gray-200 transition-all z-50 shadow-lg group"
              title="Edit Hero Title & Image"
            >
              <Pencil size={16} className="group-hover:scale-110 transition-transform" />
            </button>
          )}

          {/* Main Title - Massive Typography */}
          <div className="overflow-hidden">
            <motion.h1
              className="text-[12vw] leading-[0.85] font-bold text-white uppercase tracking-tighter mix-blend-overlay select-none"
            >
              {title.split('').map((char, index) => (
                <motion.span key={index} variants={itemVariants} className="inline-block">
                  {char === ' ' ? '\u00A0' : char}
                </motion.span>
              ))}
            </motion.h1>
          </div>

          {/* Subtitle / Decoration */}
          <motion.div
            variants={itemVariants}
            className="mt-8 flex items-center justify-center gap-4 text-white/70"
          >
            <div className="h-[1px] w-12 bg-white/50" />
            <p className="text-xs md:text-sm uppercase tracking-[0.3em] font-light">
              Architectural Visualisation
            </p>
            <div className="h-[1px] w-12 bg-white/50" />
          </motion.div>

        </motion.div>
      </div>

      {/* Scroll Down Indicator */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2, duration: 1, repeat: Infinity, repeatType: "reverse" }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20"
      >
        <div className="w-[1px] h-16 bg-white/20 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1/2 bg-white animate-movedown" />
        </div>
      </motion.div>

    </section>
  );
};

export default Hero;