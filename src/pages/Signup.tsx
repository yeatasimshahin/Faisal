import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Loader2, UserPlus } from 'lucide-react';
import { useStore } from '../store/useStore';

const Signup = () => {
    const [searchParams] = useSearchParams();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();
    const { signUp } = useStore();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (!fullName.trim()) {
                setError('Please enter your full name');
                setLoading(false);
                return;
            }

            const { error: signUpError } = await signUp(email, password, fullName);
            if (signUpError) throw signUpError;

            // Check for redirect parameter
            const redirect = searchParams.get('redirect');
            navigate(redirect || '/');

        } catch (err: any) {
            console.error('Sign up failed:', err);
            setError(err.message || 'Sign up failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full bg-[#0a0a0a] flex flex-col items-center justify-center px-4 relative overflow-hidden">

            {/* Background Decor */}
            <div className="absolute top-[-20%] right-[-10%] w-[50vw] h-[50vw] bg-white/5 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute bottom-[-20%] left-[-10%] w-[40vw] h-[40vw] bg-red-900/10 rounded-full blur-[120px] pointer-events-none" />

            {/* Back to Home */}
            <button
                onClick={() => navigate('/')}
                className="absolute top-8 left-8 text-white/50 hover:text-white flex items-center gap-2 uppercase tracking-widest text-xs transition-colors"
            >
                <ArrowLeft size={16} /> Back to Site
            </button>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                className="w-full max-w-md bg-zinc-900/50 backdrop-blur-xl border border-white/5 p-10 md:p-12 shadow-2xl relative"
            >
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-white/5 mb-4 border border-white/10">
                        <UserPlus size={20} className="text-white" />
                    </div>
                    <h1 className="text-3xl font-serif text-white mb-2">Create Account</h1>
                    <p className="text-xs uppercase tracking-widest text-white/40">Join Precission</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-[10px] uppercase tracking-widest text-white/60">Full Name</label>
                        <input
                            type="text"
                            required
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            className="w-full bg-transparent border-b border-white/20 py-3 text-white focus:outline-none focus:border-white transition-colors placeholder:text-zinc-800"
                            placeholder="John Doe"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] uppercase tracking-widest text-white/60">Email Address</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-transparent border-b border-white/20 py-3 text-white focus:outline-none focus:border-white transition-colors placeholder:text-zinc-800"
                            placeholder="user@precission.com"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] uppercase tracking-widest text-white/60">Password</label>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-transparent border-b border-white/20 py-3 text-white focus:outline-none focus:border-white transition-colors placeholder:text-zinc-800"
                            placeholder="••••••••"
                            minLength={6}
                        />
                        <p className="text-[10px] text-white/40 mt-1">Minimum 6 characters</p>
                    </div>

                    {error && (
                        <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs text-center uppercase tracking-wider">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 mt-4 bg-white text-black text-xs font-bold uppercase tracking-[0.2em] hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? <Loader2 className="animate-spin" size={16} /> : 'Create Account'}
                    </button>

                    <div className="text-center pt-4 border-t border-white/5">
                        <Link
                            to="/login"
                            className="text-xs text-white/60 hover:text-white transition-colors uppercase tracking-widest"
                        >
                            Already have an account? Sign In
                        </Link>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};

export default Signup;
