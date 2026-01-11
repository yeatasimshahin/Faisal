import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Testimonial } from '../../store/useStore';
import { motion } from 'framer-motion';
import { Quote, User } from 'lucide-react';

const TestimonialSlider = () => {
    const [testimonials, setTestimonials] = useState<Testimonial[]>([]);

    useEffect(() => {
        const fetchTestimonials = async () => {
            const { data } = await supabase
                .from('testimonials')
                .select('*')
                .order('created_at', { ascending: false });

            if (data && data.length > 0) {
                // Duplicate data to ensure seamless loop
                setTestimonials([...data, ...data, ...data]);
            }
        };
        fetchTestimonials();
    }, []);

    if (testimonials.length === 0) return null;

    return (
        <div className="w-full relative overflow-hidden py-16 bg-[#050505]">
            {/* Gradient Masks */}
            <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-[#050505] to-transparent z-10 pointer-events-none" />
            <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-[#050505] to-transparent z-10 pointer-events-none" />

            <div className="flex w-full overflow-hidden">
                <motion.div
                    initial={{ x: 0 }}
                    animate={{ x: "-50%" }}
                    transition={{
                        repeat: Infinity,
                        ease: "linear",
                        duration: Math.max(30, testimonials.length * 8)
                    }}
                    className="flex gap-8 flex-nowrap pl-8"
                >
                    {testimonials.map((t, i) => (
                        <div
                            key={`${t.id}-${i}`}
                            className="w-[450px] flex-shrink-0 bg-zinc-900/40 border border-white/5 p-8 rounded-sm hover:border-white/20 transition-colors relative"
                        >
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-12 h-12 rounded-full overflow-hidden border border-white/10 bg-white/5 flex-shrink-0 flex items-center justify-center">
                                    {t.image_url ? (
                                        <img src={t.image_url} alt={t.author_name} className="w-full h-full object-cover" />
                                    ) : (
                                        <User className="text-gray-500" size={24} />
                                    )}
                                </div>
                                <div>
                                    <h4 className="text-white font-serif text-lg leading-none mb-1">{t.author_name}</h4>
                                    <p className="text-xs text-red-500 uppercase tracking-wider">{t.role}</p>
                                </div>
                                <Quote className="ml-auto text-white/10" size={24} />
                            </div>

                            <p className="text-gray-400 font-light italic leading-relaxed text-sm">
                                "{t.content}"
                            </p>
                        </div>
                    ))}
                </motion.div>
            </div>
        </div>
    );
};

export default TestimonialSlider;
