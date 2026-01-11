import React, { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useStore } from '../../store/useStore';
import { Ticket, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import Modal from '../ui/Modal';

const CouponApply = () => {
    const { user } = useStore();
    const [code, setCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [modalState, setModalState] = useState<{ open: boolean; type: 'success' | 'error'; message: string; discount?: number }>({
        open: false, type: 'success', message: ''
    });

    const handleApply = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!code) return;

        setLoading(true);
        const sanitizedCode = code.toUpperCase().trim();

        try {
            // 1. Fetch coupon
            const { data: coupons, error } = await supabase
                .from('coupons')
                .select('*')
                .eq('code', sanitizedCode)
                .limit(1);

            if (error) throw error;

            const coupon = coupons?.[0];

            // 2. Validation Logic
            if (!coupon) {
                throw new Error("Invalid coupon code.");
            }

            const now = new Date();
            if (coupon.expiry_date && new Date(coupon.expiry_date) < now) {
                throw new Error("This coupon has expired.");
            }

            if (coupon.used_count >= coupon.usage_limit) {
                throw new Error("This coupon has reached its usage limit.");
            }

            // 3. User Restriction Logic
            if (!coupon.is_public) {
                if (!user) {
                    throw new Error("You must be logged in to use this coupon.");
                }
                if (coupon.specific_user_id !== user.id) {
                    throw new Error("This coupon is not valid for your account.");
                }
            }

            // 4. Success State
            setModalState({
                open: true,
                type: 'success',
                message: `Coupon Applied! You get ${coupon.discount_amount}% OFF.`,
                discount: coupon.discount_amount
            });

            // Optional: Logic to apply discount to actual checkout state would go here.

        } catch (err: any) {
            setModalState({
                open: true,
                type: 'error',
                message: err.message || "Failed to apply coupon."
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-sm">
            {/* Feedback Modal */}
            <Modal
                isOpen={modalState.open}
                onClose={() => setModalState({ ...modalState, open: false })}
                title={modalState.type === 'success' ? 'Code Validated' : 'Validation Error'}
            >
                <div className="flex flex-col items-center gap-4 text-center py-4">
                    {modalState.type === 'success' ? (
                        <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center text-green-500 mb-2">
                            <CheckCircle size={32} />
                        </div>
                    ) : (
                        <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 mb-2">
                            <AlertCircle size={32} />
                        </div>
                    )}

                    <p className="text-xl font-serif text-white">
                        {modalState.message}
                    </p>

                    {modalState.type === 'success' && (
                        <p className="text-gray-400 text-sm">The discount has been applied to your cart.</p>
                    )}

                    <button
                        onClick={() => setModalState({ ...modalState, open: false })}
                        className="mt-4 px-8 py-3 bg-white text-black uppercase text-xs font-bold tracking-widest hover:bg-zinc-200"
                    >
                        Continue
                    </button>
                </div>
            </Modal>

            {/* Input Field */}
            <form onSubmit={handleApply} className="relative">
                <label className="text-[10px] uppercase tracking-widest text-gray-500 mb-2 block">Promo Code</label>
                <div className="flex items-center">
                    <div className="relative flex-1">
                        <Ticket className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" size={16} />
                        <input
                            type="text"
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            className="w-full bg-black border border-white/10 py-3 pl-10 pr-4 text-white font-mono uppercase focus:border-white transition-colors outline-none placeholder:text-zinc-800"
                            placeholder="ENTER CODE"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading || !code}
                        className="px-6 py-3 bg-white border border-white text-black font-bold text-xs uppercase tracking-widest hover:bg-zinc-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? <Loader2 className="animate-spin" size={16} /> : 'Apply'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CouponApply;