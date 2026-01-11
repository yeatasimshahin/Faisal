import React, { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { ArrowRight, Loader2, Check } from 'lucide-react';

const Newsletter = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [msg, setMsg] = useState('');

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus('loading');

    try {
      const { error } = await supabase
        .from('subscribers')
        .insert([{ email }]);

      if (error) {
        if (error.code === '23505') { // Unique violation code
          throw new Error('You are already subscribed.');
        }
        throw error;
      }

      setStatus('success');
      setEmail('');
      setMsg('Thank you for subscribing.');

      // Reset after a few seconds
      setTimeout(() => {
        setStatus('idle');
        setMsg('');
      }, 3000);

    } catch (err: any) {
      setStatus('error');
      setMsg(err.message || 'Subscription failed.');
    }
  };

  return (
    <section className="bg-white text-black py-24 relative overflow-hidden">
      <div className="container mx-auto px-6 md:px-12 flex flex-col md:flex-row items-center justify-between gap-12">

        <div className="max-w-2xl z-10">
          <span className="text-red-600 font-bold uppercase tracking-widest text-xs mb-4 block">Newsletter</span>
          <h2 className="text-4xl md:text-6xl font-serif leading-tight">
            Stay updated on our <br />latest spaces.
          </h2>
        </div>

        <div className="w-full max-w-md z-10">
          <form onSubmit={handleSubscribe} className="relative">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email Address"
              className="w-full bg-transparent border-b border-black py-4 pr-12 text-lg placeholder:text-zinc-500 focus:outline-none focus:border-red-600 transition-colors"
            />

            <button
              type="submit"
              disabled={status === 'loading' || status === 'success'}
              className="absolute right-0 top-4 text-black hover:text-red-600 transition-colors disabled:opacity-50"
            >
              {status === 'loading' ? (
                <Loader2 className="animate-spin" />
              ) : status === 'success' ? (
                <Check className="text-green-600" />
              ) : (
                <ArrowRight />
              )}
            </button>
          </form>

          {msg && (
            <p className={`text-xs uppercase tracking-wider mt-4 ${status === 'error' ? 'text-red-600' : 'text-green-600'} animate-in fade-in`}>
              {msg}
            </p>
          )}
        </div>

      </div>

      {/* Decorative */}
      <div className="absolute top-1/2 right-12 -translate-y-1/2 text-[20vw] font-serif text-black opacity-[0.02] select-none pointer-events-none">
        NEWS
      </div>
    </section>
  );
};

export default Newsletter;