import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Calendar, Clock, CheckCircle, Loader2, FileText } from 'lucide-react';
import { motion } from 'framer-motion';

interface Booking {
    id: string;
    preferred_date: string;
    project_type: string;
    message: string;
    status: 'pending' | 'confirmed' | 'completed';
    created_at: string;
}

interface MyBookingsProps {
    userId: string;
}

const MyBookings: React.FC<MyBookingsProps> = ({ userId }) => {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchBookings();
    }, [userId]);

    const fetchBookings = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('bookings')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setBookings(data as Booking[]);
        } catch (error) {
            console.error('Error fetching bookings:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'confirmed':
                return 'bg-green-500/10 text-green-500 border-green-500/20';
            case 'completed':
                return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
            default:
                return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'confirmed':
                return <CheckCircle size={12} />;
            case 'completed':
                return <CheckCircle size={12} />;
            default:
                return <Clock size={12} />;
        }
    };

    if (loading) {
        return (
            <div className="bg-zinc-900/30 border border-white/5 p-8 backdrop-blur-md">
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="animate-spin text-gray-500" size={32} />
                </div>
            </div>
        );
    }

    return (
        <div className="bg-zinc-900/30 border border-white/5 backdrop-blur-md">
            {/* Header */}
            <div className="p-8 border-b border-white/5">
                <h2 className="text-2xl font-serif text-white mb-2">My Bookings</h2>
                <p className="text-[10px] text-gray-500 uppercase tracking-widest">
                    {bookings.length} {bookings.length === 1 ? 'Booking' : 'Bookings'}
                </p>
            </div>

            {/* Bookings List */}
            {bookings.length === 0 ? (
                <div className="p-12 text-center">
                    <Calendar size={48} className="mx-auto mb-4 text-gray-700" />
                    <p className="text-gray-500 text-sm uppercase tracking-widest">No bookings yet</p>
                    <p className="text-gray-600 text-xs mt-2">Your consultation requests will appear here</p>
                </div>
            ) : (
                <div className="divide-y divide-white/5">
                    {bookings.map((booking, index) => (
                        <motion.div
                            key={booking.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="p-6 hover:bg-white/5 transition-colors group"
                        >
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

                                {/* Left: Booking Info */}
                                <div className="flex-1 space-y-3">
                                    <div className="flex items-center gap-3">
                                        <span className="text-xs bg-white/10 px-3 py-1 rounded text-white uppercase tracking-wider font-bold">
                                            {booking.project_type}
                                        </span>
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] uppercase tracking-widest font-bold border ${getStatusColor(booking.status)}`}>
                                            {getStatusIcon(booking.status)}
                                            {booking.status}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-2 text-gray-400 text-sm">
                                        <Calendar size={14} />
                                        <span>
                                            {new Date(booking.preferred_date).toLocaleDateString(undefined, {
                                                weekday: 'short',
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric'
                                            })}
                                        </span>
                                    </div>

                                    {booking.message && (
                                        <div className="flex items-start gap-2 text-gray-500 text-xs">
                                            <FileText size={14} className="mt-0.5 flex-shrink-0" />
                                            <p className="line-clamp-2 italic">"{booking.message}"</p>
                                        </div>
                                    )}
                                </div>

                                {/* Right: Date Created */}
                                <div className="text-right">
                                    <p className="text-[10px] text-gray-600 uppercase tracking-widest">Requested</p>
                                    <p className="text-xs text-gray-500 mt-1">
                                        {new Date(booking.created_at).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyBookings;
