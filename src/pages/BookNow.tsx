import React, { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import Layout from '../components/layout/Layout';
import { Calendar, Phone, FileText, Send, Loader2, CheckCircle, ArrowLeft, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const BookNow = () => {
    const { user } = useStore();
    const navigate = useNavigate();

    // Local Form State
    const [formData, setFormData] = useState({
        full_name: '',
        phone: '',
        preferred_date: '',
        project_type: 'Residential',
        message: ''
    });

    useEffect(() => {
        if (user?.full_name) {
            setFormData(prev => ({ ...prev, full_name: user.full_name || '' }));
        }
    }, [user]);

    // UI States
    const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState('');
    const [isCheckingAuth, setIsCheckingAuth] = useState(true);

    // Stable Auth Guard
    useEffect(() => {
        // Give a brief moment for the store to settle, then check auth
        const timer = setTimeout(() => {
            setIsCheckingAuth(false);
            if (!user) {
                navigate('/login');
            }
        }, 100);

        return () => clearTimeout(timer);
    }, [user, navigate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        if (!formData.phone || formData.phone.length < 10) {
            setErrorMessage('Please enter a valid phone number.');
            setStatus('error');
            return;
        }

        setStatus('submitting');
        setErrorMessage('');

        try {
            const { error } = await supabase.from('bookings').insert({
                user_id: user.id,
                full_name: formData.full_name || user.full_name || '',
                email: user.email || '',
                phone: formData.phone,
                preferred_date: formData.preferred_date,
                project_type: formData.project_type,
                message: formData.message,
                status: 'pending'
            });

            if (error) throw error;

            // Show success state in-place
            setStatus('success');

        } catch (err: any) {
            // console.error('Booking error:', err);
            setErrorMessage(err.message || 'Failed to submit booking request.');
            setStatus('error');
        }
    };

    // 1. Loading State (Show spinner while checking auth)
    if (isCheckingAuth) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
                <Loader2 className="animate-spin text-white" size={32} />
            </div>
        );
    }

    // 2. Unauthenticated State (Should have been redirected by useEffect)
    if (!user) {
        return null;
    }

    return (
        <Layout>
            <div className="min-h-screen bg-[#0a0a0a] pt-32 pb-24 px-6 md:px-12 relative flex justify-center">

                <div className="w-full max-w-2xl">

                    {/* Back Button */}
                    {status !== 'success' && (
                        <button
                            onClick={() => navigate('/')}
                            className="mb-8 flex items-center gap-2 text-gray-500 hover:text-white text-xs uppercase tracking-widest transition-colors"
                        >
                            <ArrowLeft size={14} /> Cancel
                        </button>
                    )}

                    {/* 3. Conditional Content Rendering */}
                    {status === 'success' ? (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-zinc-900/30 border border-white/10 p-12 text-center flex flex-col items-center"
                        >
                            <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center text-green-500 mb-6">
                                <CheckCircle size={40} />
                            </div>
                            <h2 className="text-3xl font-serif text-white mb-4">Request Received</h2>
                            <p className="text-gray-400 text-sm leading-relaxed max-w-md mb-8">
                                Thank you, {user.full_name?.split(' ')[0]}. We have received your booking request for a {formData.project_type} consultation. Our team will contact you shortly to confirm the details.
                            </p>
                            <div className="flex gap-4">
                                <button
                                    onClick={() => navigate('/')}
                                    className="px-8 py-3 bg-white text-black text-xs font-bold uppercase tracking-widest hover:bg-gray-200"
                                >
                                    Return Home
                                </button>
                                <button
                                    onClick={() => {
                                        setStatus('idle');
                                        setFormData({ ...formData, message: '', preferred_date: '' });
                                    }}
                                    className="px-8 py-3 border border-white/20 text-white text-xs font-bold uppercase tracking-widest hover:bg-white/5"
                                >
                                    Book Another
                                </button>
                            </div>
                        </motion.div>
                    ) : (
                        <>
                            {/* Form Header */}
                            <div className="mb-12 border-b border-white/10 pb-8">
                                <h1 className="text-4xl md:text-6xl font-serif text-white mb-4">Book a Consultation</h1>
                                <p className="text-gray-400 font-light text-sm leading-relaxed max-w-md">
                                    Secure a dedicated session with our architectural team to discuss your vision.
                                </p>
                            </div>

                            {/* Main Form */}
                            <form onSubmit={handleSubmit} className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

                                {/* Read Only User Info */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-2">
                                        <label className="text-[10px] uppercase tracking-widest text-gray-500">Full Name</label>
                                        <input
                                            type="text"
                                            value={formData.full_name}
                                            onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                            className="w-full bg-zinc-900/50 border-b border-white/10 py-3 text-white focus:border-red-500 outline-none transition-colors"
                                        />
                                    </div>
                                    <div className="space-y-2 opacity-50 cursor-not-allowed">
                                        <label className="text-[10px] uppercase tracking-widest text-gray-500">Email Address</label>
                                        <input type="text" value={user.email || ''} readOnly className="w-full bg-zinc-900/50 border-b border-white/10 py-3 text-gray-400 outline-none" />
                                    </div>
                                </div>

                                {/* Contact Details */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-2">
                                        <label className="text-[10px] uppercase tracking-widest text-gray-500 flex items-center gap-2">
                                            <Phone size={12} /> Phone Number
                                        </label>
                                        <input
                                            type="tel"
                                            required
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            placeholder="+1 (555) 000-0000"
                                            className="w-full bg-transparent border-b border-white/20 py-3 text-white focus:border-red-500 outline-none transition-colors placeholder:text-zinc-800"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] uppercase tracking-widest text-gray-500 flex items-center gap-2">
                                            <Calendar size={12} /> Preferred Date
                                        </label>
                                        <input
                                            type="date"
                                            required
                                            value={formData.preferred_date}
                                            onChange={(e) => setFormData({ ...formData, preferred_date: e.target.value })}
                                            className="w-full bg-transparent border-b border-white/20 py-3 text-white focus:border-red-500 outline-none transition-colors date-picker-dark uppercase text-sm"
                                        />
                                    </div>
                                </div>

                                {/* Project Details */}
                                <div className="space-y-8">
                                    <div className="space-y-2">
                                        <label className="text-[10px] uppercase tracking-widest text-gray-500">Project Type</label>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                            {['Residential', 'Commercial', 'Interior', 'Consultation'].map((type) => (
                                                <button
                                                    key={type}
                                                    type="button"
                                                    onClick={() => setFormData({ ...formData, project_type: type })}
                                                    className={`py-3 text-xs uppercase tracking-widest border transition-all ${formData.project_type === type
                                                        ? 'bg-white text-black border-white'
                                                        : 'border-white/10 text-gray-500 hover:border-white/30 hover:text-white'
                                                        }`}
                                                >
                                                    {type}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] uppercase tracking-widest text-gray-500 flex items-center gap-2">
                                            <FileText size={12} /> Project Overview
                                        </label>
                                        <textarea
                                            rows={4}
                                            required
                                            value={formData.message}
                                            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                            placeholder="Briefly describe your project requirements, location, and timeline..."
                                            className="w-full bg-transparent border border-white/10 p-4 text-white focus:border-red-500 outline-none transition-colors placeholder:text-zinc-800 resize-none"
                                        />
                                    </div>
                                </div>

                                {/* Error Message */}
                                {status === 'error' && (
                                    <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-xs uppercase tracking-wider text-center">
                                        {errorMessage}
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={status === 'submitting'}
                                    className="w-full py-5 bg-red-600 text-white text-xs font-bold uppercase tracking-[0.2em] hover:bg-red-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    {status === 'submitting' ? <Loader2 className="animate-spin" size={16} /> : <Send size={16} />}
                                    <span>Confirm Booking Request</span>
                                </button>

                            </form>
                        </>
                    )}
                </div>
            </div>
        </Layout>
    );
};

export default BookNow;