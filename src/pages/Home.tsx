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
            <GlobalPresence />

            <Newsletter />

            {/* Contact Form Removed from Home page as it's now on /contact */}

        </Layout>
    );
};

export default Home;
