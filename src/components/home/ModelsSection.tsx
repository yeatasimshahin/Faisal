import React, { useState } from 'react';
import { Home, Landmark, Compass, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const ModelsSection = () => {
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

    const models = [
        {
            icon: Home,
            title: "The Sanctuary",
            subtitle: "Residential",
            description: "Private residences designed as retreats from the chaos of the modern world. Focusing on privacy, comfort, and integration with nature."
        },
        {
            icon: Landmark,
            title: "The Monument",
            subtitle: "Commercial",
            description: "Iconic structures for businesses that demand presence. Architecture that speaks power, stability, and future-forward vision."
        },
        {
            icon: Compass,
            title: "The Vision",
            subtitle: "Bespoke",
            description: "Experimental conceptual work for clients who dare to dream. Pushing the boundaries of physics, materials, and form."
        }
    ];

    return (
        <section id="models" className="py-32 bg-zinc-950 border-t border-white/5 relative z-10">
            <div className="container mx-auto px-6 md:px-12">
                <div className="mb-24 text-center">
                    <h2 className="text-4xl md:text-7xl font-light uppercase tracking-widest text-white mb-6">Our Models</h2>
                    <p className="text-gray-400 font-light max-w-md mx-auto uppercase tracking-widest text-sm">
                        Experiential architectural designs crafted for modern living.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {models.map((model, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            viewport={{ once: true }}
                            onHoverStart={() => setHoveredIndex(index)}
                            onHoverEnd={() => setHoveredIndex(null)}
                            className={`
                                relative p-12 min-h-[500px] flex flex-col justify-between
                                border border-white/10 transition-all duration-500
                                ${hoveredIndex !== null && hoveredIndex !== index ? 'opacity-40 blur-[1px]' : 'opacity-100'}
                                ${hoveredIndex === index ? 'bg-zinc-900 border-red-900/50' : 'bg-transparent'}
                            `}
                        >
                            {/* Background Gradient on Hover */}
                            <div className={`absolute inset-0 bg-gradient-to-br from-red-600/5 to-transparent transition-opacity duration-500 ${hoveredIndex === index ? 'opacity-100' : 'opacity-0'}`} />

                            <div className="relative z-10">
                                <span className="text-[10px] text-red-500 font-bold uppercase tracking-[0.3em] block mb-6 px-3 py-1 border border-red-900/30 w-fit rounded-full bg-red-950/10">
                                    {model.subtitle}
                                </span>
                                <model.icon strokeWidth={1} className={`w-16 h-16 transition-colors duration-500 ${hoveredIndex === index ? 'text-white' : 'text-gray-600'}`} />
                            </div>

                            <div className="relative z-10">
                                <h3 className="text-3xl font-serif text-white mb-4">
                                    {model.title}
                                </h3>
                                <p className="text-gray-400 font-light leading-relaxed mb-8 text-sm h-20">
                                    {model.description}
                                </p>

                                <button className={`group/btn flex items-center gap-2 text-xs uppercase tracking-widest transition-colors ${hoveredIndex === index ? 'text-white' : 'text-gray-500'}`}>
                                    Explore Model <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default ModelsSection;
