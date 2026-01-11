import React, { useEffect, useState } from 'react';
import { useStore } from '../../store/useStore';
import { motion } from 'framer-motion';
import { MapPin, Globe } from 'lucide-react';

const GlobalPresence = () => {
    const { settings } = useStore();
    const [locations, setLocations] = useState<{ city: string; country: string }[]>([]);

    useEffect(() => {
        if (settings?.global_locations_json) {
            setLocations(settings.global_locations_json);
        } else {
            // Fallback defaults if no DB data
            setLocations([
                { city: 'New York', country: 'USA' },
                { city: 'London', country: 'UK' },
                { city: 'Tokyo', country: 'Japan' },
                { city: 'Dubai', country: 'UAE' }
            ]);
        }
    }, [settings]);

    return (
        <section id="locations" className="min-h-[80vh] bg-[#080808] flex items-center justify-center border-t border-white/5 relative z-10 py-32 overflow-hidden">

            {/* Ambient Background */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-zinc-900/50 via-[#080808] to-[#080808]" />

            {/* Abstract Map Dots (Decoration) */}
            <div className="absolute inset-0 opacity-20 pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-[url('https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/World_map_blank_without_borders.svg/2000px-World_map_blank_without_borders.svg.png')] bg-contain bg-no-repeat bg-center mix-blend-overlay filter invert" />
            </div>

            <div className="container mx-auto px-6 relative z-10">
                <div className="text-center mb-24">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 1 }}
                        className="inline-flex items-center gap-2 text-red-600 mb-6 border border-red-900/30 px-4 py-1.5 rounded-full bg-red-950/10"
                    >
                        <Globe size={14} className="animate-pulse" />
                        <span className="text-[10px] uppercase tracking-[0.25em] font-bold">International Reach</span>
                    </motion.div>

                    <motion.h2
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-5xl md:text-8xl font-serif text-white mb-6"
                    >
                        Global Presence
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="text-gray-400 font-light max-w-lg mx-auto uppercase tracking-widest text-sm leading-relaxed"
                    >
                        From New York to Tokyo, our footprint is expanding across major metropolises.
                    </motion.p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {locations.map((loc, index) => (
                        <motion.div
                            key={`${loc.city}-${index}`}
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.15 }}
                            className="group relative h-64 border border-white/5 bg-zinc-900/10 hover:bg-zinc-900/80 transition-all duration-500 overflow-hidden flex flex-col items-center justify-center text-center p-8 cursor-default"
                        >
                            {/* Hover Border Glow */}
                            <div className="absolute inset-0 border border-transparent group-hover:border-white/20 transition-colors duration-500" />

                            <MapPin strokeWidth={1} className="text-gray-600 group-hover:text-red-500 mb-6 transition-colors duration-500 w-8 h-8 group-hover:scale-110 transform" />

                            <h3 className="text-3xl font-serif text-white mb-2 group-hover:tracking-widest transition-all duration-500">
                                {loc.city}
                            </h3>
                            <span className="text-xs font-bold uppercase tracking-[0.2em] text-gray-500 group-hover:text-white transition-colors">
                                {loc.country}
                            </span>

                            {/* Decorative Corner Lines */}
                            <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default GlobalPresence;
