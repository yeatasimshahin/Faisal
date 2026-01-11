import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Download, Search, Mail } from 'lucide-react';
import { format } from 'date-fns';

interface Subscriber {
    id: string;
    email: string;
    created_at: string;
}

const SubscriberList = () => {
    const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        fetchSubscribers();
    }, []);

    const fetchSubscribers = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('subscribers')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) console.error('Error fetching subscribers:', error);
        else setSubscribers(data || []);
        setLoading(false);
    };

    const handleExportCSV = () => {
        const headers = ['ID', 'Email', 'Joined At'];
        const rows = subscribers.map(s => [s.id, s.email, s.created_at]);

        const csvContent = [
            headers.join(','),
            ...rows.map(r => r.join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `subscribers_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    const filteredSubscribers = subscribers.filter(s =>
        s.email.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="bg-[#111] p-6 rounded-xl border border-white/10 text-white">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h2 className="text-2xl font-serif flex items-center gap-3">
                        <Mail className="text-red-500" size={24} />
                        Subscribers
                    </h2>
                    <p className="text-gray-400 text-sm mt-1">Manage your newsletter audience.</p>
                </div>

                <div className="flex items-center gap-4 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                        <input
                            type="text"
                            placeholder="Search emails..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full bg-black border border-white/10 pl-10 p-2 text-sm focus:border-white/30 outline-none text-white rounded text-white"
                        />
                    </div>
                    <button
                        onClick={handleExportCSV}
                        className="flex items-center gap-2 bg-white text-black px-4 py-2 text-sm font-bold uppercase tracking-wider hover:bg-gray-200 transition-colors rounded"
                    >
                        <Download size={16} /> Export
                    </button>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-white/10 text-[10px] uppercase tracking-widest text-gray-500">
                            <th className="py-4 px-4 font-normal">Email Address</th>
                            <th className="py-4 px-4 font-normal text-right">Joined Date</th>
                        </tr>
                    </thead>
                    <tbody className="text-sm">
                        {loading ? (
                            <tr>
                                <td colSpan={2} className="py-8 text-center text-gray-500 italic">Loading...</td>
                            </tr>
                        ) : filteredSubscribers.length === 0 ? (
                            <tr>
                                <td colSpan={2} className="py-8 text-center text-gray-500 italic">No subscribers found.</td>
                            </tr>
                        ) : (
                            filteredSubscribers.map((sub, i) => (
                                <tr key={sub.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                    <td className="py-4 px-4 text-white font-light">{sub.email}</td>
                                    <td className="py-4 px-4 text-gray-400 text-right tabular-nums">
                                        {format(new Date(sub.created_at), 'MMM d, yyyy • h:mm a')}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <div className="mt-4 text-xs text-gray-600 text-right uppercase tracking-widest">
                Total Subscribers: {subscribers.length}
            </div>
        </div>
    );
};

export default SubscriberList;
