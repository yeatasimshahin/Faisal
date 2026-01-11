import React, { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useStore } from '../../store/useStore';
import Modal from '../ui/Modal';
import { Star, Loader2, CheckCircle } from 'lucide-react';

interface AddReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AddReviewModal: React.FC<AddReviewModalProps> = ({ isOpen, onClose }) => {
  const { user } = useStore();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase.from('reviews').insert({
        user_id: user.id,
        user_name: user.full_name || user.email?.split('@')[0] || 'Anonymous',
        rating,
        comment,
        status: 'pending' // Enforce moderation
      });

      if (error) throw error;
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setComment('');
        setRating(5);
        onClose();
      }, 2500);
    } catch (err) {
      console.error('Review submission error:', err);
      alert('Failed to submit review. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Share Your Experience">
      {success ? (
        <div className="flex flex-col items-center justify-center py-8 text-center space-y-4">
           <CheckCircle className="text-green-500 w-16 h-16" />
           <h3 className="text-xl font-serif text-white">Thank You!</h3>
           <p className="text-gray-400 max-w-xs">
             Your review has been submitted and is pending approval by our team.
           </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2 text-center">
             <label className="text-[10px] uppercase tracking-widest text-gray-500 block mb-2">Rating</label>
             <div className="flex justify-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className={`transition-colors duration-200 ${star <= rating ? 'text-red-500' : 'text-gray-700 hover:text-red-500/50'}`}
                  >
                    <Star size={32} fill={star <= rating ? "currentColor" : "none"} />
                  </button>
                ))}
             </div>
          </div>

          <div className="space-y-2">
             <label className="text-[10px] uppercase tracking-widest text-gray-500">Your Feedback</label>
             <textarea 
               required
               value={comment}
               onChange={(e) => setComment(e.target.value)}
               rows={4}
               className="w-full bg-black/50 border border-white/10 p-4 text-white text-sm focus:border-red-500 outline-none resize-none transition-colors"
               placeholder="Tell us about your experience..."
             />
          </div>

          <div className="pt-2">
             <button 
               type="submit" 
               disabled={loading}
               className="w-full py-4 bg-white text-black text-xs font-bold uppercase tracking-[0.2em] hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
             >
               {loading ? <Loader2 className="animate-spin" size={16} /> : 'Submit Review'}
             </button>
          </div>
        </form>
      )}
    </Modal>
  );
};

export default AddReviewModal;