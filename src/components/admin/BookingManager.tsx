import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Calendar, CheckCircle, Trash2, Clock, Mail, Phone, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import Modal from '../ui/Modal';

interface Booking {
    id: string;
    user_id: string;
    full_name: string;
    email: string;
    phone: string;
    preferred_date: string;
    project_type: string;
    message: string;
    status: 'pending' | 'confirmed' | 'completed';
    created_at: string;
}

const BookingManager = () => {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    // Feedback
    const [feedback, setFeedback] = useState<{ open: boolean; type: 'success' | 'error'; message: string }>({
        open: false, type: 'success', message: ''
    });

    const fetchBookings = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('bookings')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setBookings(data as Booking[]);
        } catch (error: any) {
            console.error('Error fetching bookings:', error);
            setFeedback({ open: true, type: 'error', message: 'Failed to load bookings' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBookings();
    }, []);

    const updateStatus = async (id: string, status: 'confirmed' | 'completed') => {
        try {
            const { error } = await supabase
                .from('bookings')
                .update({ status })
                .eq('id', id);

            if (error) throw error;

            // Update local state
            setBookings(prev => prev.map(b => b.id === id ? { ...b, status } : b));
            setFeedback({ open: true, type: 'success', message: `Booking marked as ${status}` });
        } catch (error: any) {
            setFeedback({ open: true, type: 'error', message: error.message });
        }
    };

    const deleteBooking = async () => {
        if (!deletingId) return;

        try {
            const { error } = await supabase.from('bookings').delete().eq('id', deletingId);
            if (error) throw error;

            setBookings(prev => prev.filter(b => b.id !== deletingId));
            setFeedback({ open: true, type: 'success', message: 'Booking record removed.' });
        } catch (error: any) {
            setFeedback({ open: true, type: 'error', message: error.message });
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">

            {/* Feedback Modal */}
            <Modal isOpen={feedback.open} onClose={() => setFeedback({ ...feedback, open: false })} title={feedback.type === 'success' ? 'Success' : 'Error'}>
                <div className="flex flex-col items-center gap-4 text-center">
                    {feedback.type === 'success' ? <CheckCircle className="text-green-500" size={40} /> : <AlertCircle className="text-red-500" size={40} />}
                    <p className="text-white text-lg">{feedback.message}</p>
                </div>
            </Modal>

            {/* Delete Confirmation */}
            <Modal isOpen={!!deletingId} onClose={() => setDeletingId(null)} title="Confirm Deletion">
                <div className="text-center space-y-6">
                    <p className="text-gray-300">Are you sure you want to delete this booking?</p>
                    <div className="flex gap-4 justify-center">
                        <button onClick={() => setDeletingId(null)} className="px-6 py-2 border border-white/20 text-white uppercase text-xs tracking-widest hover:bg-white/10">Cancel</button>
                        <button onClick={deleteBooking} className="px-6 py-2 bg-red-600 text-white font-bold uppercase text-xs tracking-widest hover:bg-red-700">Delete</button>
                    </div>
                </div>
            </Modal>

            {/* Header */}
            <div className="flex justify-between items-center bg-zinc-900/30 p-6 border border-white/5 backdrop-blur-md">
                <div>
                    <h3 className="text-lg font-serif text-white">Booking Management</h3>
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest">Upcoming Appointments: {bookings.length}</p>
                </div>
                <button onClick={fetchBookings} className="p-2 bg-white/5 hover:bg-white/10 text-white rounded transition-colors" title="Refresh">
                    <RefreshCw size={16} />
                </button>
            </div>

            {/* Table */}
            <div className="overflow-x-auto border border-white/5 bg-black/20">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-white/5 text-[10px] uppercase tracking-widest text-gray-400">
                            <th className="py-4 px-6 font-normal">Client</th>
                            <th className="py-4 px-6 font-normal">Project & Message</th>
                            <th className="py-4 px-6 font-normal">Schedule</th>
                            <th className="py-4 px-6 font-normal">Status</th>
                            <th className="py-4 px-6 font-normal text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-sm">
                        {loading ? (
                            <tr><td colSpan={5} className="py-12 text-center"><Loader2 className="animate-spin mx-auto text-gray-500" /></td></tr>
                        ) : bookings.length === 0 ? (
                            <tr><td colSpan={5} className="py-12 text-center text-gray-500 italic">No bookings found.</td></tr>
                        ) : (
                            bookings.map((b) => (
                                <tr key={b.id} className="hover:bg-white/5 transition-colors group">
                                    <td className="py-4 px-6">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-white">{b.full_name || 'Unknown'}</span>
                                            <span className="text-xs text-gray-500 flex items-center gap-2 mt-1"><Mail size={10} /> {b.email}</span>
                                            <span className="text-xs text-gray-500 flex items-center gap-2 mt-1"><Phone size={10} /> {b.phone}</span>
                                        </div>
                                    </td>
                                    <td className="py-4 px-6">
                                        <div className="max-w-xs">
                                            <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded text-white uppercase tracking-wider">{b.project_type}</span>
                                            <p className="text-gray-400 text-xs mt-2 line-clamp-2 italic">"{b.message}"</p>
                                        </div>
                                    </td>
                                    <td className="py-4 px-6 text-xs text-gray-400">
                                        <div className="flex items-center gap-2">
                                            <Calendar size={14} />
                                            {b.preferred_date ? new Date(b.preferred_date).toLocaleDateString() : 'N/A'}
                                        </div>
                                    </td>
                                    <td className="py-4 px-6">
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] uppercase tracking-widest font-bold
                       ${b.status === 'confirmed' ? 'bg-green-500/10 text-green-500' :
                                                b.status === 'completed' ? 'bg-gray-500/10 text-gray-500' : 'bg-yellow-500/10 text-yellow-500'}
                     `}>
                                            {b.status === 'pending' && <Clock size={10} />}
                                            {b.status === 'confirmed' && <CheckCircle size={10} />}
                                            {b.status}
                                        </span>
                                    </td>
                                    <td className="py-4 px-6 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            {b.status === 'pending' && (
                                                <button
                                                    onClick={() => updateStatus(b.id, 'confirmed')}
                                                    className="p-2 bg-green-500/10 text-green-500 hover:bg-green-500/20 rounded transition-colors"
                                                    title="Confirm Appointment"
                                                >
                                                    <CheckCircle size={14} />
                                                </button>
                                            )}
                                            <button
                                                onClick={() => setDeletingId(b.id)}
                                                className="p-2 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded transition-colors"
                                                title="Delete Record"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default BookingManager;