import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { motion } from 'framer-motion';
import { Quote } from 'lucide-react';

interface Review {
  id: number;
  user_name: string;
  comment: string;
  rating: number;
}

const Testimonials = () => {
  const [reviews, setReviews] = useState<Review[]>([]);

  useEffect(() => {
    const fetchReviews = async () => {
      const { data } = await supabase
        .from('reviews')
        .select('*')
        .eq('status', 'approved')
        .order('created_at', { ascending: false });
      
      if (data) setReviews(data);
    };
    fetchReviews();
  }, []);

  if (reviews.length === 0) return null;

  return (
    <section className="bg-[#050505] py-32 border-t border-white/5 relative z-10 overflow-hidden">
      <div className="container mx-auto px-6 md:px-12 relative">
        <div className="absolute top-0 left-12 text-[20rem] font-serif text-white/5 leading-none select-none pointer-events-none -translate-y-1/2">
          "
        </div>
        
        <div className="mb-12">
            <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-red-500 mb-2">Client Perspectives</h2>
            <h3 className="text-3xl font-serif text-white">Feedback from our partners.</h3>
        </div>

        <div className="flex overflow-x-auto gap-8 pb-12 snap-x hide-scrollbar">
          {reviews.map((review, i) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="flex-shrink-0 w-full md:w-[400px] bg-zinc-900/30 border border-white/5 p-8 md:p-12 snap-center backdrop-blur-sm relative group hover:border-white/20 transition-colors"
            >
              <div className="mb-6 text-red-500 opacity-50">
                 <Quote size={24} />
              </div>
              <p className="text-lg md:text-xl font-serif italic text-gray-300 mb-8 leading-relaxed">
                "{review.comment}"
              </p>
              
              <div className="flex items-center gap-4">
                 <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold uppercase">
                    {review.user_name.charAt(0)}
                 </div>
                 <div>
                    <h4 className="text-sm font-bold text-white uppercase tracking-wider">{review.user_name}</h4>
                    <div className="flex gap-1 mt-1">
                      {[...Array(5)].map((_, starIndex) => (
                        <div key={starIndex} className={`w-1 h-1 rounded-full ${starIndex < review.rating ? 'bg-red-500' : 'bg-gray-700'}`} />
                      ))}
                    </div>
                 </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;