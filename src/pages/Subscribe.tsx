import React, { useState, useEffect } from 'react';
import Layout from '../components/layout/Layout';
import { supabase } from '../lib/supabaseClient';
import { useStore } from '../store/useStore';
import { motion } from 'framer-motion';
import { ArrowRight, Check, Loader2, Mail } from 'lucide-react';

const Subscribe = () => {
    const { user } = useStore();
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (user?.email) {
            setEmail(user.email);
        }
    }, [user]);

    const handleSubscribe = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;

        setStatus('loading');
        setMessage('');

        try {
            const { error } = await supabase
                .from('subscribers')
                .insert([{ email }]);

            if (error) {
                if (error.code === '23505') { // Unique constraint violation
                    throw new Error("You're already on the list.");
                }
                throw error;
            }

            setStatus('success');
        } catch (err: any) {
            setStatus('error');
            setMessage(err.message || 'Something went wrong. Please try again.');
        }
    };

    return (
        <Layout>
            <div className="min-h-[80vh] flex items-center justify-center bg-zinc-950 relative overflow-hidden">
                {/* Background Atmosphere */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(255,0,0,0.05),transparent_70%)]" />

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-xl w-full px-6 relative z-10 text-center"
                >
                    {status === 'success' ? (
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="bg-zinc-900/50 border border-white/10 p-12 rounded-2xl"
                        >
                            <div className="w-16 h-16 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Check size={32} />
                            </div>
                            <h2 className="text-3xl font-serif text-white mb-4">Welcome to the Inner Circle</h2>
                            <p className="text-gray-400 font-light">
                                You have successfully subscribed. Expect curated architectural insights in your inbox soon.
                            </p>
                        </motion.div>
                    ) : (
                        <>
                            <div className="mb-12">
                                <Mail className="w-12 h-12 text-white/20 mx-auto mb-6" />
                                <h1 className="text-4xl md:text-6xl font-serif text-white mb-6">
                                    Join Our Inner Circle
                                </h1>
                                <p className="text-gray-400 font-light text-lg leading-relaxed">
                                    Receive exclusive updates on our latest projects, architectural philosophy, and design insights.
                                </p>
                            </div>

                            <form onSubmit={handleSubscribe} className="relative max-w-md mx-auto">
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Enter your email address"
                                    className="w-full bg-zinc-900/50 border border-white/20 focus:border-red-500 transition-colors p-5 pr-16 text-white text-center md:text-left outline-none rounded-lg disabled:opacity-50 placeholder:text-zinc-600"
                                    disabled={status === 'loading'}
                                />
                                <button
                                    type="submit"
                                    disabled={status === 'loading'}
                                    className="absolute right-2 top-2 bottom-2 aspect-square bg-white text-black hover:bg-gray-200 transition-colors rounded flex items-center justify-center disabled:opacity-50"
                                    title="Subscribe"
                                >
                                    {status === 'loading' ? <Loader2 className="animate-spin" size={20} /> : <ArrowRight size={20} />}
                                </button>
                            </form>

                            {message && (
                                <motion.p
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="mt-6 text-red-500 text-sm uppercase tracking-widest"
                                >
                                    {message}
                                </motion.p>
                            )}
                        </>
                    )}
                </motion.div>
            </div>
        </Layout>
    );
};

export default Subscribe;
