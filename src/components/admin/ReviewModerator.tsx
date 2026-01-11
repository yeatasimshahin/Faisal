import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { CheckCircle, XCircle, Trash2, MessageSquare, Filter } from 'lucide-react';

interface Review {
  id: number;
  user_name: string;
  comment: string;
  rating: number;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

const ReviewModerator = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending'>('pending');
  const [loading, setLoading] = useState(true);

  const fetchReviews = async () => {
    setLoading(true);
    let query = supabase.from('reviews').select('*').order('created_at', { ascending: false });

    if (filter === 'pending') {
      query = query.eq('status', 'pending');
    }

    const { data } = await query;
    if (data) setReviews(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchReviews();
  }, [filter]);

  const updateStatus = async (id: number, status: 'approved' | 'rejected') => {
    await supabase.from('reviews').update({ status }).eq('id', id);
    setReviews(reviews.map(r => r.id === id ? { ...r, status } : r));
    // If filtering by pending, remove it from list
    if (filter === 'pending') {
      setReviews(prev => prev.filter(r => r.id !== id));
    }
  };

  const deleteReview = async (id: number) => {
    if (!confirm('Permanently delete review?')) return;
    await supabase.from('reviews').delete().eq('id', id);
    setReviews(prev => prev.filter(r => r.id !== id));
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">

      {/* Controls */}
      <div className="flex items-center gap-4 bg-zinc-900/30 p-4 border border-white/5">
        <Filter size={16} className="text-gray-500" />
        <span className="text-xs uppercase tracking-widest text-gray-500">Filter View:</span>
        <button
          onClick={() => setFilter('pending')}
          className={`text-xs uppercase tracking-widest px-3 py-1 rounded-full transition-colors ${filter === 'pending' ? 'bg-yellow-500/20 text-yellow-500' : 'text-gray-400 hover:text-white'}`}
        >
          Pending
        </button>
        <button
          onClick={() => setFilter('all')}
          className={`text-xs uppercase tracking-widest px-3 py-1 rounded-full transition-colors ${filter === 'all' ? 'bg-white/20 text-white' : 'text-gray-400 hover:text-white'}`}
        >
          All Reviews
        </button>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-8 text-gray-600">Loading reviews...</div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-white/10 rounded-sm">
            <MessageSquare className="mx-auto text-gray-700 mb-2" size={32} />
            <p className="text-gray-500 text-sm">No {filter} reviews found.</p>
          </div>
        ) : (
          reviews.map(r => (
            <div key={r.id} className="bg-zinc-900/40 border border-white/5 p-6 flex flex-col md:flex-row gap-6 hover:border-white/10 transition-colors">
              {/* Status Indicator Stripe */}
              <div className={`w-1 flex-shrink-0 self-stretch rounded-full
                 ${r.status === 'pending' ? 'bg-yellow-500' : r.status === 'approved' ? 'bg-green-500' : 'bg-red-500'}
              `} />

              <div className="flex-1 space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-white text-sm">{r.user_name || 'Anonymous User'}</h4>
                    <div className="flex items-center gap-2 text-[10px] text-gray-500 uppercase tracking-wider mt-1">
                      <span>Rating: {r.rating}/5</span>
                      <span>•</span>
                      <span>{new Date(r.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <span className={`text-[10px] uppercase px-2 py-0.5 border rounded
                      ${r.status === 'pending' ? 'text-yellow-500 border-yellow-500/30' :
                      r.status === 'approved' ? 'text-green-500 border-green-500/30' :
                        'text-red-500 border-red-500/30'}
                    `}>
                    {r.status}
                  </span>
                </div>
                <p className="text-gray-300 text-sm italic border-l-2 border-white/10 pl-4 py-1">
                  "{r.comment}"
                </p>
              </div>

              {/* Actions */}
              <div className="flex flex-row md:flex-col gap-2 justify-center border-t md:border-t-0 md:border-l border-white/5 pt-4 md:pt-0 md:pl-4">
                {r.status !== 'approved' && (
                  <button
                    onClick={() => updateStatus(r.id, 'approved')}
                    className="flex items-center gap-2 px-3 py-2 bg-green-500/10 text-green-500 hover:bg-green-500/20 rounded text-xs uppercase tracking-wide transition-colors"
                  >
                    <CheckCircle size={14} /> <span className="md:hidden">Approve</span>
                  </button>
                )}
                {r.status !== 'rejected' && (
                  <button
                    onClick={() => updateStatus(r.id, 'rejected')}
                    className="flex items-center gap-2 px-3 py-2 bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20 rounded text-xs uppercase tracking-wide transition-colors"
                  >
                    <XCircle size={14} /> <span className="md:hidden">Reject</span>
                  </button>
                )}
                <button
                  onClick={() => deleteReview(r.id)}
                  className="flex items-center gap-2 px-3 py-2 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded text-xs uppercase tracking-wide transition-colors"
                >
                  <Trash2 size={14} /> <span className="md:hidden">Delete</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
};

export default ReviewModerator;