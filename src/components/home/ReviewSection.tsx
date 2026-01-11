import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { motion } from 'framer-motion';
import { Quote, Plus, Star, User } from 'lucide-react';
import AddReviewModal from '../reviews/AddReviewModal';
import { useStore } from '../../store/useStore';
import { useNavigate } from 'react-router-dom';

interface Review {
  id: number;
  user_name: string;
  comment: string;
  rating: number;
}

const ReviewSection = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { user } = useStore();
  const navigate = useNavigate();

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

  const handleAddReview = () => {
    if (!user) {
      navigate('/login');
    } else {
      setIsModalOpen(true);
    }
  };

  return (
    <section className="bg-[#050505] py-32 border-t border-white/5 relative z-10 overflow-hidden">
      
      <AddReviewModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

      <div className="container mx-auto px-6 md:px-12 relative">
        <div className="absolute top-0 left-12 text-[20rem] font-serif text-white/5 leading-none select-none pointer-events-none -translate-y-1/2">
          "
        </div>
        
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
            <div>
                <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-red-500 mb-2">Client Perspectives</h2>
                <h3 className="text-3xl md:text-5xl font-serif text-white leading-tight">Voices from the field.</h3>
            </div>
            
            <button 
              onClick={handleAddReview}
              className="px-8 py-3 border border-white/20 text-white hover:bg-white hover:text-black transition-colors text-xs uppercase tracking-widest flex items-center gap-2"
            >
              <Plus size={16} /> Share Experience
            </button>
        </div>

        {reviews.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-white/10">
            <p className="text-gray-500 italic">No reviews yet. Be the first to share your thoughts.</p>
          </div>
        ) : (
          <div className="flex overflow-x-auto gap-8 pb-12 snap-x hide-scrollbar mask-image-linear-gradient">
            {reviews.map((review, i) => (
              <motion.div
                key={review.id}
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex-shrink-0 w-[85vw] md:w-[450px] bg-zinc-900/30 border border-white/5 p-8 md:p-12 snap-center backdrop-blur-sm relative group hover:border-white/20 transition-colors flex flex-col justify-between"
              >
                <div>
                    <div className="mb-6 text-red-500 opacity-50 flex justify-between items-start">
                        <Quote size={24} />
                        <div className="flex gap-1">
                            {[...Array(5)].map((_, si) => (
                                <Star key={si} size={12} className={si < review.rating ? "fill-red-500 text-red-500" : "text-gray-700"} />
                            ))}
                        </div>
                    </div>
                    <p className="text-lg md:text-xl font-serif italic text-gray-300 mb-8 leading-relaxed">
                        "{review.comment}"
                    </p>
                </div>
                
                <div className="flex items-center gap-4 pt-6 border-t border-white/5">
                   <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold uppercase text-white">
                      {review.user_name.charAt(0)}
                   </div>
                   <div>
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider">{review.user_name}</h4>
                      <span className="text-[10px] text-gray-500 uppercase tracking-widest">Verified Client</span>
                   </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default ReviewSection;