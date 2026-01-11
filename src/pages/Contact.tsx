import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useStore } from '../store/useStore';
import Layout from '../components/layout/Layout';
import { motion } from 'framer-motion';
import { MapPin, Phone, Mail, ArrowRight, Loader2, ArrowUpRight } from 'lucide-react';
import SEO from '../components/shared/SEO';

const Contact = () => {
    const { settings } = useStore();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: 'Project Inquiry',
        message: ''
    });
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<{ type: 'success' | 'error' | null; message: string }>({ type: null, message: '' });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setStatus({ type: null, message: '' });

        try {
            const { error } = await supabase
                .from('contact_inquiries')
                .insert([{
                    name: formData.name,
                    email: formData.email,
                    subject: formData.subject,
                    message: formData.message
                }]);

            if (error) throw error;

            setStatus({ type: 'success', message: 'Message received. We will be in touch.' });
            setFormData({ name: '', email: '', subject: 'Project Inquiry', message: '' });
        } catch (err: any) {
            console.error('Contact error:', err);
            setStatus({ type: 'error', message: 'Transmission failed. Please try again.' });
        } finally {
            setLoading(false);
        }
    };

    const contactInfo = [
        { label: 'Email', value: settings?.admin_email || 'hello@precission.com', icon: Mail, href: `mailto:${settings?.admin_email || 'hello@precission.com'}` },
        { label: 'Phone', value: settings?.admin_phone || '+1 (212) 555-0199', icon: Phone, href: `tel:${settings?.admin_phone || '+1 (212) 555-0199'}` },
        { label: 'Office', value: 'New York, NY', icon: MapPin, href: '#' },
    ];

    return (
        <Layout>
            <SEO
                title="Contact | PRECISSION"
                description="Get in touch with our team to discuss your next architectural project."
            />

            <section className="relative min-h-screen bg-[#050505] pt-32 pb-12 flex flex-col justify-center overflow-hidden">
                {/* Background Typography */}
                <div className="absolute top-20 left-0 w-full overflow-hidden opacity-[0.03] select-none pointer-events-none">
                    <h1 className="text-[20vw] font-serif leading-none whitespace-nowrap text-white">CONTACT</h1>
                </div>

                <div className="container mx-auto px-6 md:px-12 relative z-10">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24">

                        {/* Interactive Left Column */}
                        <div className="lg:col-span-5 space-y-20">
                            <div>
                                <motion.h1
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                                    className="text-6xl md:text-8xl font-serif text-white mb-8 leading-tight"
                                >
                                    Let's build <br />
                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-red-800">Legacy.</span>
                                </motion.h1>
                                <motion.p
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2, duration: 0.8 }}
                                    className="text-gray-400 text-lg font-light max-w-sm leading-relaxed"
                                >
                                    We work with visionaries who refuse to compromise on detail. Tell us about your ambition.
                                </motion.p>
                            </div>

                            <div className="space-y-8">
                                {contactInfo.map((item, i) => (
                                    <motion.a
                                        key={item.label}
                                        href={item.href}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.4 + (i * 0.1) }}
                                        className="group flex items-center gap-6 p-4 -ml-4 rounded-xl hover:bg-white/5 transition-colors"
                                    >
                                        <div className="w-12 h-12 flex items-center justify-center rounded-full bg-white/5 text-white group-hover:bg-red-600 transition-colors">
                                            <item.icon size={20} strokeWidth={1.5} />
                                        </div>
                                        <div>
                                            <p className="text-xs uppercase tracking-widest text-gray-500 mb-1">{item.label}</p>
                                            <p className="text-xl text-white font-light group-hover:text-red-500 transition-colors">{item.value}</p>
                                        </div>
                                        <ArrowUpRight className="ml-auto text-gray-600 group-hover:text-white opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                                    </motion.a>
                                ))}
                            </div>
                        </div>

                        {/* Minimalist Right Form */}
                        <div className="lg:col-span-7">
                            <motion.div
                                initial={{ opacity: 0, y: 40 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3, duration: 0.8 }}
                                className="bg-white/[0.02] border border-white/5 backdrop-blur-sm p-8 md:p-12 rounded-2xl relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/10 blur-[60px] rounded-full pointer-events-none" />

                                <form onSubmit={handleSubmit} className="relative z-10 space-y-12">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                        <div className="group relative">
                                            <label className="text-xs uppercase tracking-widest text-gray-500 mb-2 block group-focus-within:text-red-500 transition-colors">Your Name</label>
                                            <input
                                                required
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                className="w-full bg-transparent border-b border-white/10 py-3 text-white text-lg focus:outline-none focus:border-red-600 transition-colors"
                                                placeholder="John Doe"
                                            />
                                        </div>
                                        <div className="group relative">
                                            <label className="text-xs uppercase tracking-widest text-gray-500 mb-2 block group-focus-within:text-red-500 transition-colors">Email Address</label>
                                            <input
                                                required
                                                type="email"
                                                value={formData.email}
                                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                className="w-full bg-transparent border-b border-white/10 py-3 text-white text-lg focus:outline-none focus:border-red-600 transition-colors"
                                                placeholder="john@example.com"
                                            />
                                        </div>
                                    </div>

                                    <div className="group relative">
                                        <label className="text-xs uppercase tracking-widest text-gray-500 mb-2 block group-focus-within:text-red-500 transition-colors">Subject</label>
                                        <select
                                            value={formData.subject}
                                            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                            className="w-full bg-transparent border-b border-white/10 py-3 text-white text-lg focus:outline-none focus:border-red-600 transition-colors appearance-none cursor-pointer"
                                        >
                                            <option className="bg-zinc-900" value="Project Inquiry">Project Inquiry</option>
                                            <option className="bg-zinc-900" value="Media / Press">Media / Press</option>
                                            <option className="bg-zinc-900" value="Partnership">Partnership</option>
                                            <option className="bg-zinc-900" value="General">General</option>
                                        </select>
                                    </div>

                                    <div className="group relative">
                                        <label className="text-xs uppercase tracking-widest text-gray-500 mb-2 block group-focus-within:text-red-500 transition-colors">Message</label>
                                        <textarea
                                            required
                                            rows={4}
                                            value={formData.message}
                                            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                            className="w-full bg-transparent border-b border-white/10 py-3 text-white text-lg focus:outline-none focus:border-red-600 transition-colors resize-none"
                                            placeholder="Tell us about your vision..."
                                        />
                                    </div>

                                    <div className="flex items-center justify-between pt-4">
                                        {status.message && (
                                            <p className={`text-xs uppercase tracking-widest ${status.type === 'success' ? 'text-green-500' : 'text-red-500'}`}>
                                                {status.message}
                                            </p>
                                        )}

                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="ml-auto px-8 py-4 bg-white text-black text-xs font-bold uppercase tracking-[0.2em] hover:bg-red-600 hover:text-white transition-all disabled:opacity-50 flex items-center gap-3"
                                        >
                                            {loading ? <Loader2 className="animate-spin" size={16} /> : (
                                                <>Send Inquiry <ArrowRight size={16} /></>
                                            )}
                                        </button>
                                    </div>
                                </form>
                            </motion.div>
                        </div>
                    </div>
                </div>

                {/* Map Section */}
                <div className="mt-32 w-full h-[50vh] bg-zinc-900 relative filter grayscale hover:grayscale-0 transition-all duration-1000">
                    {settings?.google_maps_url ? (
                        <iframe
                            src={settings.google_maps_url}
                            width="100%"
                            height="100%"
                            style={{ border: 0 }}
                            allowFullScreen
                            loading="lazy"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center border-t border-white/5">
                            <span className="text-xs uppercase tracking-widest text-gray-600">Map Unavailable</span>
                        </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#050505] to-transparent pointer-events-none h-32 mt-auto" />
                    <div className="absolute inset-0 bg-gradient-to-b from-[#050505] to-transparent pointer-events-none h-32 mb-auto" />
                </div>
            </section>
        </Layout>
    );
};

export default Contact;
