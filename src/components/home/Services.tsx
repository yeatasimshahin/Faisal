import React from 'react';
import { Ruler, PenTool, Leaf, Box, LayoutTemplate, Building2 } from 'lucide-react';

const ServiceCard = ({ icon: Icon, title, desc }: { icon: any, title: string, desc: string }) => (
  <div className="group p-8 border border-white/5 bg-zinc-900/10 hover:bg-zinc-900/40 transition-all duration-500 hover:border-red-500/30">
    <div className="mb-6 text-gray-400 group-hover:text-red-500 transition-colors">
      <Icon size={32} strokeWidth={1} />
    </div>
    <h3 className="text-xl font-serif text-white mb-4">{title}</h3>
    <p className="text-sm text-gray-500 font-light leading-relaxed group-hover:text-gray-300 transition-colors">
      {desc}
    </p>
  </div>
);

const Services = () => {
  const services = [
    {
      icon: Ruler,
      title: "Architectural Design",
      desc: "Comprehensive design services from initial concept sketches to detailed construction documentation."
    },
    {
      icon: LayoutTemplate,
      title: "Interior Planning",
      desc: "Crafting internal spaces that harmonize with the exterior architecture and enhance living experiences."
    },
    {
      icon: Leaf,
      title: "Sustainable Solutions",
      desc: "Eco-conscious design strategies implementing renewable energy and passive cooling systems."
    },
    {
      icon: Building2,
      title: "Urban Development",
      desc: "Large scale master planning for residential communities and commercial districts."
    }
  ];

  return (
    <section className="py-32 bg-[#050505] border-t border-white/5 relative z-10">
      <div className="container mx-auto px-6 md:px-12">
        <div className="flex flex-col md:flex-row justify-between items-end mb-20">
           <div className="max-w-xl">
             <span className="text-red-500 text-xs font-bold uppercase tracking-widest mb-2 block">Our Expertise</span>
             <h2 className="text-4xl md:text-6xl font-serif text-white leading-tight">
               Designing for the future, respecting the past.
             </h2>
           </div>
           <button className="hidden md:block px-8 py-3 border border-white/20 text-white text-xs uppercase tracking-widest hover:bg-white hover:text-black transition-colors">
             View All Services
           </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
           {services.map((s, i) => (
             <ServiceCard key={i} {...s} />
           ))}
        </div>
      </div>
    </section>
  );
};

export default Services;