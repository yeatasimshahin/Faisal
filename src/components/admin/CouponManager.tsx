import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Plus, Trash2, Tag, User, Globe, Loader2, Edit2, CheckCircle, AlertCircle, Calendar, Hash } from 'lucide-react';
import Modal from '../ui/Modal';

interface Profile {
  id: string;
  full_name: string | null;
  email: string | null;
}

interface Coupon {
  id: number;
  code: string;
  discount_amount: number;
  is_public: boolean;
  specific_user_id: string | null;
  expiry_date: string | null;
  usage_limit: number;
  used_count: number;
  created_at: string;
}

const CouponManager = () => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [editingId, setEditingId] = useState<number | null>(null);
  const [code, setCode] = useState('');
  const [discount, setDiscount] = useState(10);
  const [isPublic, setIsPublic] = useState(true);
  const [selectedUser, setSelectedUser] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [usageLimit, setUsageLimit] = useState(100);

  const [processing, setProcessing] = useState(false);

  // Modal State
  const [feedback, setFeedback] = useState<{ open: boolean; type: 'success' | 'error'; message: string }>({
    open: false, type: 'success', message: ''
  });

  // Fetch Data
  const fetchData = async () => {
    setLoading(true);

    // Fetch Coupons
    const { data: couponData } = await supabase
      .from('coupons')
      .select('*')
      .order('created_at', { ascending: false });

    // Fetch Users for dropdown
    const { data: userData } = await supabase
      .from('profiles')
      .select('id, full_name, email')
      .order('full_name');

    if (couponData) setCoupons(couponData);
    if (userData) setUsers(userData);

    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleEdit = (coupon: Coupon) => {
    setEditingId(coupon.id);
    setCode(coupon.code);
    setDiscount(coupon.discount_amount);
    setIsPublic(coupon.is_public);
    setSelectedUser(coupon.specific_user_id || '');
    setUsageLimit(coupon.usage_limit || 100);

    // Format date for input (YYYY-MM-DD)
    if (coupon.expiry_date) {
      setExpiryDate(new Date(coupon.expiry_date).toISOString().split('T')[0]);
    } else {
      setExpiryDate('');
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setCode('');
    setDiscount(10);
    setIsPublic(true);
    setSelectedUser('');
    setExpiryDate('');
    setUsageLimit(100);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isPublic && !selectedUser) {
      setFeedback({ open: true, type: 'error', message: 'Please select a user for private coupons.' });
      return;
    }

    setProcessing(true);

    // Set time to end of day for expiry
    const formattedExpiry = expiryDate ? new Date(expiryDate + 'T23:59:59').toISOString() : null;

    const payload = {
      code: code.toUpperCase().trim(),
      discount_amount: discount,
      is_public: isPublic,
      specific_user_id: isPublic ? null : selectedUser,
      expiry_date: formattedExpiry,
      usage_limit: usageLimit
    };

    let error;
    if (editingId) {
      const { error: err } = await supabase
        .from('coupons')
        .update(payload)
        .eq('id', editingId);
      error = err;
    } else {
      const { error: err } = await supabase
        .from('coupons')
        .insert({ ...payload, used_count: 0 });
      error = err;
    }

    if (error) {
      setFeedback({ open: true, type: 'error', message: error.message });
    } else {
      cancelEdit();
      fetchData();
      setFeedback({ open: true, type: 'success', message: editingId ? 'Coupon updated successfully.' : 'Coupon created successfully.' });
    }
    setProcessing(false);
  };

  const deleteCoupon = async (id: number) => {
    if (!confirm('Delete this coupon?')) return;
    await supabase.from('coupons').delete().eq('id', id);
    setCoupons(coupons.filter(c => c.id !== id));
  };

  const getUserName = (id: string | null) => {
    if (!id) return null;
    const u = users.find(user => user.id === id);
    return u ? (u.full_name || u.email) : id.slice(0, 8) + '...';
  };

  const isExpired = (dateString: string | null) => {
    if (!dateString) return false;
    return new Date(dateString) < new Date();
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500">

      {/* Feedback Modal */}
      <Modal
        isOpen={feedback.open}
        onClose={() => setFeedback({ ...feedback, open: false })}
        title={feedback.type === 'success' ? 'Success' : 'Error'}
      >
        <div className="flex flex-col items-center gap-4 text-center">
          {feedback.type === 'success' ? <CheckCircle className="text-green-500" size={40} /> : <AlertCircle className="text-red-500" size={40} />}
          <p className="text-white text-lg">{feedback.message}</p>
        </div>
      </Modal>

      {/* Form */}
      <div className="bg-zinc-900/30 border border-white/5 p-8 relative overflow-hidden transition-all backdrop-blur-md">
        <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
          <Tag size={120} />
        </div>

        <div className="flex justify-between items-center mb-6 relative z-10">
          <h3 className="text-sm font-bold uppercase tracking-widest text-white">
            {editingId ? 'Edit Coupon' : 'Generate Offer'}
          </h3>
          {editingId && (
            <button onClick={cancelEdit} className="text-xs text-red-500 uppercase hover:underline">Cancel Edit</button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-end">

          <div className="col-span-1 md:col-span-2 space-y-2">
            <label className="text-[10px] uppercase text-gray-500">Coupon Code</label>
            <input
              required
              value={code}
              onChange={e => setCode(e.target.value)}
              className="w-full bg-black border border-white/10 p-3 text-white uppercase font-serif tracking-wider focus:border-red-500 outline-none transition-colors placeholder:text-zinc-800"
              placeholder="SUMMER_SALE"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] uppercase text-gray-500">Discount %</label>
            <input
              type="number"
              min="1" max="100"
              required
              value={discount}
              onChange={e => setDiscount(Number(e.target.value))}
              className="w-full bg-black border border-white/10 p-3 text-white font-mono focus:border-red-500 outline-none transition-colors"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] uppercase text-gray-500 flex items-center gap-2">
              <Hash size={10} /> Usage Limit
            </label>
            <input
              type="number"
              min="1"
              value={usageLimit}
              onChange={e => setUsageLimit(Number(e.target.value))}
              className="w-full bg-black border border-white/10 p-3 text-white font-mono focus:border-red-500 outline-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] uppercase text-gray-500 flex items-center gap-2">
              <Calendar size={10} /> Expiry Date
            </label>
            <input
              type="date"
              value={expiryDate}
              onChange={e => setExpiryDate(e.target.value)}
              className="w-full bg-black border border-white/10 p-3 text-white text-xs uppercase focus:border-red-500 outline-none date-picker-dark"
            />
          </div>

          <div className="col-span-1 md:col-span-2 h-[50px] flex items-center bg-black border border-white/10 px-4 gap-4">
            <label className="flex items-center gap-2 cursor-pointer text-xs uppercase tracking-wider text-gray-300 select-none">
              <input
                type="checkbox"
                checked={isPublic}
                onChange={e => setIsPublic(e.target.checked)}
                className="accent-red-500 w-4 h-4"
              />
              Public Access
            </label>

            {!isPublic && (
              <div className="flex-1 animate-in fade-in slide-in-from-left-4 duration-300">
                <select
                  value={selectedUser}
                  onChange={e => setSelectedUser(e.target.value)}
                  className="w-full bg-transparent border-l border-white/10 pl-4 text-white text-xs focus:text-red-500 outline-none appearance-none"
                >
                  <option value="">-- Select Target User --</option>
                  {users.map(u => (
                    <option key={u.id} value={u.id}>
                      {u.full_name || 'Unnamed'} ({u.email})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={processing}
            className="w-full h-[50px] px-8 bg-white text-black uppercase font-bold text-xs tracking-widest hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2"
          >
            {processing ? <Loader2 className="animate-spin" size={16} /> : (editingId ? <Edit2 size={16} /> : <Plus size={16} />)}
            <span>{editingId ? 'Update' : 'Create'}</span>
          </button>
        </form>
      </div>

      {/* Coupons List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full text-center py-12 text-gray-500">Loading coupons...</div>
        ) : coupons.length === 0 ? (
          <div className="col-span-full text-center py-12 text-gray-500 italic">No active coupons. Create one above.</div>
        ) : (
          coupons.map(c => {
            const expired = isExpired(c.expiry_date);
            const soldOut = c.used_count >= c.usage_limit;

            return (
              <div key={c.id} className={`group relative bg-zinc-900/20 border p-6 transition-all hover:-translate-y-1 ${editingId === c.id ? 'border-red-500/50 bg-red-900/10' : 'border-white/5 hover:border-white/20'}`}>

                {/* Decorative cutouts */}
                <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-[#0a0a0a] border-r border-white/10" />
                <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-[#0a0a0a] border-l border-white/10" />

                {/* Status Banner */}
                {(expired || soldOut) && (
                  <div className="absolute top-0 left-0 w-full h-1 bg-red-600 z-20" />
                )}

                <div className="flex justify-between items-start mb-4">
                  <div className="flex flex-col">
                    <span className={`text-2xl font-serif tracking-wide ${expired || soldOut ? 'text-gray-500 line-through' : 'text-white'}`}>
                      {c.code}
                    </span>
                    <div className="flex flex-col gap-1 mt-1">
                      <span className="text-[10px] text-gray-500 uppercase tracking-widest">
                        Expires: {c.expiry_date ? new Date(c.expiry_date).toLocaleDateString() : 'Never'}
                      </span>
                      {expired && <span className="text-[10px] text-red-500 uppercase font-bold">Expired</span>}
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-xl font-bold text-red-500">{c.discount_amount}%</span>
                    <span className="text-[10px] uppercase text-red-500/50">Discount</span>
                  </div>
                </div>

                {/* Usage Bar */}
                <div className="mb-4">
                  <div className="flex justify-between text-[10px] text-gray-400 mb-1 uppercase tracking-wider">
                    <span>Usage</span>
                    <span>{c.used_count} / {c.usage_limit}</span>
                  </div>
                  <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${soldOut ? 'bg-red-500' : 'bg-white'}`}
                      style={{ width: `${Math.min((c.used_count / c.usage_limit) * 100, 100)}%` }}
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-dashed border-white/10 flex items-center gap-2 text-xs text-gray-400">
                  {c.is_public ? (
                    <>
                      <Globe size={14} />
                      <span className="uppercase tracking-widest">Global</span>
                    </>
                  ) : (
                    <>
                      <User size={14} className="text-yellow-500" />
                      <span className="text-yellow-500/80 uppercase tracking-widest truncate max-w-[150px]">
                        {getUserName(c.specific_user_id)}
                      </span>
                    </>
                  )}
                </div>

                <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleEdit(c)}
                    className="p-2 text-zinc-400 hover:text-white transition-all bg-black/50 rounded-full"
                    title="Edit Coupon"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    onClick={() => deleteCoupon(c.id)}
                    className="p-2 text-zinc-400 hover:text-red-500 transition-all bg-black/50 rounded-full"
                    title="Revoke Coupon"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

    </div>
  );
};

export default CouponManager;