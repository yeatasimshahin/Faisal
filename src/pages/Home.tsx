import { useEffect, useState } from 'react';
import { useStore } from '../store/useStore';
import Layout from '../components/layout/Layout';
import Hero from '../components/home/Hero';
import Marquee from '../components/home/Marquee';
import ProjectShowcase from '../components/home/ProjectShowcase';
import Stats from '../components/home/Stats';
import Services from '../components/home/Services';
import ReviewSection from '../components/home/ReviewSection';
import TestimonialSlider from '../components/home/TestimonialSlider';
import ModelsSection from '../components/home/ModelsSection';
import GlobalPresence from '../components/home/GlobalPresence';
import Newsletter from '../components/contact/Newsletter';
import { motion } from 'framer-motion';
import { MapPin, Globe } from 'lucide-react';

const Home = () => {
    const { settings } = useStore();
    const [locations, setLocations] = useState<{ city: string; country: string }[]>([]);

    useEffect(() => {
        if (settings?.global_locations_json) {
            setLocations(settings.global_locations_json);
        } else {
            // Default locations if none set in DB (or valid JSON fallback)
            setLocations([
                { city: "New York", country: "United States" },
                { city: "Tokyo", country: "Japan" },
                { city: "London", country: "United Kingdom" },
                { city: "Paris", country: "France" }
            ]);
        }
    }, [settings]);

    return (
        <Layout>
            <Hero />
            <Marquee />

            {/* Stats Section */}
            <Stats />

            {/* Services Section */}
            <Services />

            {/* Dynamic Projects from DB */}
            <ProjectShowcase />

            {/* Models Section */}
            <ModelsSection />



            {/* Dynamic Reviews from DB */}
            <ReviewSection />

            {/* Testimonials Slider */}
            <section className="bg-[#050505] border-t border-white/5 relative z-10 overflow-hidden">
                <div className="container mx-auto px-6 md:px-12 pt-16">
                    <h3 className="text-3xl md:text-5xl font-serif text-white mb-2">Voices from the Field</h3>
                    <div className="h-[1px] w-24 bg-red-600 mb-8" />
                </div>
                <TestimonialSlider />
            </section>

            {/* Global Locations Section */}
            <section id="locations" className="min-h-[60vh] bg-black flex flex-col items-center justify-center border-t border-white/5 relative z-10 py-32 overflow-hidden">

                {/* Background Globe Effect */}
                <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
                    <Globe size={600} strokeWidth={0.5} className="text-white animate-[spin_60s_linear_infinite]" />
                </div>

                <div className="text-center px-4 relative z-10 mb-20">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-4xl md:text-7xl font-serif text-white mb-6"
                    >
                        Global Presence
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-gray-400 font-light max-w-xl mx-auto uppercase tracking-widest text-xs md:text-sm"
                    >
                        From New York to Tokyo, our footprint is expanding across major metropolises.
                    </motion.p>
                </div>

                {/* Locations Grid */}
                <div className="max-w-7xl mx-auto px-6 relative z-10 w-full">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-16">
                        {locations.length > 0 ? (
                            locations.map((loc, index) => (
                                <motion.div
                                    key={`${loc.city}-${index}`}
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.1 }}
                                    className="group relative"
                                >
                                    <div className="border-l border-white/20 pl-6 py-2 group-hover:border-red-600 transition-colors duration-500">
                                        <h3 className="text-2xl md:text-3xl font-light text-white mb-1 group-hover:text-red-500 transition-colors">{loc.city}</h3>
                                        <p className="text-[10px] uppercase tracking-[0.2em] text-gray-500">{loc.country}</p>
                                    </div>
                                </motion.div>
                            ))
                        ) : (
                            <p className="text-white text-center col-span-4">Locations loading...</p>
                        )}
                    </div>
                </div>

            </section>

            <Newsletter />

            {/* Contact Form Removed from Home page as it's now on /contact */}

        </Layout>
    );
};

export default Home;
