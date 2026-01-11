import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { ContactMessage } from '../../store/useStore';
import { Trash2, Mail, Calendar, Search, Loader2, AlertCircle, CheckCircle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';

const MessageInbox = () => {
    const [messages, setMessages] = useState<ContactMessage[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [deletingId, setDeletingId] = useState<string | null>(null);

    // Modal States
    const [itemToDelete, setItemToDelete] = useState<string | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    useEffect(() => {
        fetchMessages();
    }, []);

    const fetchMessages = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('contact_inquiries')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching messages:', error);
            setErrorMsg('Failed to load messages.');
        } else {
            setMessages(data || []);
        }
        setLoading(false);
    };

    const confirmDelete = (id: string) => {
        setItemToDelete(id);
    };

    const handleDelete = async () => {
        if (!itemToDelete) return;

        setDeletingId(itemToDelete);
        const { error } = await supabase
            .from('contact_inquiries')
            .delete()
            .eq('id', itemToDelete);

        if (error) {
            console.error('Error deleting message:', error);
            setErrorMsg('Failed to delete message. Please try again.');
        } else {
            setMessages(messages.filter(msg => msg.id !== itemToDelete));
        }
        setDeletingId(null);
        setItemToDelete(null);
    };

    const filteredMessages = messages.filter(msg =>
        msg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        msg.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        msg.subject.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6 animate-in fade-in duration-500 relative">

            {/* Delete Confirmation Modal */}
            <AnimatePresence>
                {itemToDelete && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-zinc-900 border border-white/10 p-8 rounded-xl max-w-sm w-full text-center shadow-2xl"
                        >
                            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6 text-red-500">
                                <Trash2 size={32} />
                            </div>
                            <h3 className="text-xl font-serif text-white mb-2">Delete Message?</h3>
                            <p className="text-gray-400 text-sm mb-8">This action cannot be undone. Are you sure you want to permanently remove this message?</p>

                            <div className="flex gap-4">
                                <button
                                    onClick={() => setItemToDelete(null)}
                                    className="flex-1 py-3 bg-zinc-800 text-white text-xs font-bold uppercase tracking-widest hover:bg-zinc-700 transition-colors rounded"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDelete}
                                    disabled={deletingId !== null}
                                    className="flex-1 py-3 bg-red-600 text-white text-xs font-bold uppercase tracking-widest hover:bg-red-700 transition-colors rounded flex items-center justify-center gap-2"
                                >
                                    {deletingId ? <Loader2 className="animate-spin" size={14} /> : 'Delete'}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Error Modal */}
            <AnimatePresence>
                {errorMsg && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-zinc-900 border border-white/10 p-8 rounded-xl max-w-sm w-full text-center shadow-2xl"
                        >
                            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6 text-red-500">
                                <AlertCircle size={32} />
                            </div>
                            <h3 className="text-xl font-serif text-white mb-2">Error</h3>
                            <p className="text-gray-400 text-sm mb-8">{errorMsg}</p>

                            <button
                                onClick={() => setErrorMsg(null)}
                                className="w-full py-3 bg-white text-black text-xs font-bold uppercase tracking-widest hover:bg-gray-200 transition-colors rounded"
                            >
                                Close
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Header & Search */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/10 pb-6">
                <div>
                    <h2 className="text-2xl font-serif text-white">Inbox</h2>
                    <p className="text-gray-500 text-xs uppercase tracking-widest mt-1">
                        {messages.length} Total Messages
                    </p>
                </div>

                <div className="relative w-full md:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                    <input
                        type="text"
                        placeholder="Search messages..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-zinc-900 border border-white/10 rounded-full py-2 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-red-500 transition-colors"
                    />
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="animate-spin text-red-500" size={32} />
                </div>
            ) : filteredMessages.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-gray-500 opacity-50">
                    <Mail size={48} className="mb-4" />
                    <p className="text-sm uppercase tracking-widest">No messages found</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    <AnimatePresence>
                        {filteredMessages.map((msg) => (
                            <motion.div
                                key={msg.id}
                                layout
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="bg-zinc-900/50 border border-white/5 rounded-lg p-6 hover:border-white/10 transition-colors group relative overflow-hidden"
                            >
                                <div className="absolute top-0 left-0 w-1 h-full bg-red-500/0 group-hover:bg-red-500 transition-colors duration-300" />

                                <div className="flex flex-col md:flex-row gap-6 justify-between">
                                    <div className="flex-1 space-y-4">
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className="bg-white/5 text-gray-300 text-[10px] uppercase tracking-widest px-2 py-1 rounded">
                                                {msg.subject}
                                            </span>
                                            <span className="flex items-center gap-1 text-gray-500 text-xs">
                                                <Calendar size={12} />
                                                {format(new Date(msg.created_at), 'MMM dd, yyyy • h:mm a')}
                                            </span>
                                        </div>

                                        <div>
                                            <h3 className="text-lg text-white font-medium mb-1 flex items-center gap-2">
                                                {msg.name}
                                                <span className="text-gray-600 text-sm font-normal">&lt;{msg.email}&gt;</span>
                                            </h3>
                                            <p className="text-gray-400 leading-relaxed font-light text-sm bg-black/20 p-4 rounded border border-white/5 mt-3">
                                                {msg.message}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex flex-col justify-between items-end gap-4 min-w-[100px]">
                                        <a
                                            href={`mailto:${msg.email}?subject=Re: ${msg.subject}`}
                                            className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white text-xs uppercase tracking-widest rounded flex items-center gap-2 transition-colors w-full justify-center"
                                        >
                                            <Mail size={14} /> Reply
                                        </a>

                                        <button
                                            onClick={() => confirmDelete(msg.id)} // Open modal instead
                                            className="px-4 py-2 text-red-500 hover:bg-red-950/20 rounded text-xs uppercase tracking-widest flex items-center gap-2 transition-colors w-full justify-center"
                                        >
                                            <Trash2 size={14} />
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}
        </div>
    );
};

export default MessageInbox;
