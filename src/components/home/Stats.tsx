import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

const StatItem = ({ number, label, suffix = '+' }: { number: number, label: string, suffix?: string }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  
  // A simple counter effect could be complex, but for high-end look, 
  // sometimes a simple fade up of the final number is more elegant than a erratic counter.
  // We will simply reveal it elegantly.

  return (
    <div ref={ref} className="text-center group">
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={isInView ? { y: 0, opacity: 1 } : {}}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="text-6xl md:text-8xl font-light text-white mb-2"
      >
        <span className="font-serif">{number}</span>
        <span className="text-red-600 text-4xl align-top ml-1">{suffix}</span>
      </motion.div>
      <div className="h-[1px] w-12 bg-white/20 mx-auto my-4 group-hover:w-24 group-hover:bg-red-500 transition-all duration-500" />
      <p className="text-[10px] uppercase tracking-[0.2em] text-gray-500">
        {label}
      </p>
    </div>
  );
};

const Stats = () => {
  return (
    <section className="py-24 border-t border-white/5 bg-[#0a0a0a] relative z-10">
       <div className="container mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
             <StatItem number={15} label="Years Experience" />
             <StatItem number={240} label="Projects Completed" />
             <StatItem number={18} label="International Awards" />
          </div>
       </div>
    </section>
  );
};

export default Stats;