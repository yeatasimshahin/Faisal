import React, { useEffect } from 'react';
import Layout from '../components/layout/Layout';
import { motion } from 'framer-motion';
import { Award, Users, Target, MoveRight } from 'lucide-react';
import { useStore } from '../store/useStore';
import SEO from '../components/shared/SEO';

const About = () => {
    const { settings, fetchSettings } = useStore();

    useEffect(() => {
        fetchSettings();
    }, [fetchSettings]);

    // Defaults
    const heroTitle = settings?.about_hero_title || "Our Philosophy";
    const heroDesc = settings?.about_hero_description || "Architecture is not just about building structures; it's about crafting experiences, shaping light, and defining the future of living.";
    const approachTitle = settings?.about_approach_title || "The Approach";
    const approachHeadline = settings?.about_approach_headline || "Precision in every detail, Verify in every design.";
    const approachText1 = settings?.about_approach_text_1 || "At PRECISSION, we believe that great architecture stems from a deep understanding of context, culture, and functionality. Our process is rigorous, data-driven, yet deeply artistic.";
    const approachText2 = settings?.about_approach_text_2 || "We don't just design spaces; we orchestrate environments that resonate with the human spirit. Every line drawn serves a purpose, and every material chosen tells a story.";
    const aboutImage = settings?.about_image_url;

    return (
        <Layout>
            <SEO
                title="Our Philosophy | PRECISSION"
                description={heroDesc}
            />
            {/* Hero Section */}
            <section className="relative min-h-[60vh] flex items-center justify-center bg-black overflow-hidden pt-20">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-zinc-900 via-black to-black opacity-50" />

                <div className="container mx-auto px-6 relative z-10 text-center">
                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-5xl md:text-8xl font-serif text-white mb-8 tracking-tight"
                    >
                        {heroTitle}
                    </motion.h1>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="max-w-3xl mx-auto"
                    >
                        <p className="text-xl md:text-2xl text-gray-300 font-light leading-relaxed">
                            {heroDesc}
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* The Approach */}
            <section className="py-24 bg-[#0a0a0a] border-t border-white/5">
                <div className="container mx-auto px-6 md:px-12">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
                        <div>
                            <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-red-500 mb-6">{approachTitle}</h2>
                            <h3 className="text-3xl md:text-5xl font-serif text-white mb-8 leading-tight">
                                {approachHeadline}
                            </h3>
                            <div className="space-y-6 text-gray-400 font-light leading-relaxed">
                                <p>{approachText1}</p>
                                <p>{approachText2}</p>
                            </div>
                        </div>
                        <div className="relative">
                            <div className="aspect-square bg-zinc-900 border border-white/5 p-8 relative overflow-hidden group">
                                <div className="absolute inset-0 bg-gradient-to-br from-zinc-800/20 to-transparent pointer-events-none z-10" />

                                {aboutImage ? (
                                    <img src={aboutImage} alt="About Us" className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-700" />
                                ) : (
                                    <div className="w-full h-full border border-white/10 flex items-center justify-center">
                                        <span className="text-white/20 font-serif text-6xl italic">Est. 2024</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Core Values */}
            <section className="py-32 bg-black border-t border-white/5">
                <div className="container mx-auto px-6 md:px-12">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                        {[
                            {
                                icon: Target,
                                title: "Visionary Design",
                                desc: "Pushing boundaries to create structures that are ahead of their time."
                            },
                            {
                                icon: Users,
                                title: "Human Centric",
                                desc: "Spaces designed around the people who inhabit them, ensuring comfort and flow."
                            },
                            {
                                icon: Award,
                                title: "Excellence",
                                desc: "Uncompromising quality in materials, execution, and final delivery."
                            }
                        ].map((item, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className="bg-zinc-900/30 p-8 border border-white/5 group hover:border-red-500/30 transition-colors"
                            >
                                <item.icon className="text-red-500 mb-6" size={32} />
                                <h4 className="text-xl font-serif text-white mb-4">{item.title}</h4>
                                <p className="text-gray-400 text-sm leading-relaxed">
                                    {item.desc}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Call to Action */}
            <section className="py-24 bg-[#0a0a0a] border-t border-white/5 text-center">
                <div className="container mx-auto px-6">
                    <h2 className="text-4xl md:text-6xl font-light text-white mb-8">Ready to build the future?</h2>
                    <a href="/contact" className="inline-flex items-center gap-2 text-white border-b border-white pb-1 hover:text-red-500 hover:border-red-500 transition-colors uppercase tracking-widest text-sm">
                        Start a Project <MoveRight size={16} />
                    </a>
                </div>
            </section>
        </Layout>
    );
};

export default About;
