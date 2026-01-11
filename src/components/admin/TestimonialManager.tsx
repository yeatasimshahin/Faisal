import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Testimonial } from '../../store/useStore';
import { Plus, Trash, Edit, Save, X, ImageIcon, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const TestimonialManager = () => {
    const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState<Partial<Testimonial>>({
        author_name: '',
        role: '',
        content: '',
        image_url: ''
    });
    const [isFormOpen, setIsFormOpen] = useState(false);

    useEffect(() => {
        fetchTestimonials();
    }, []);

    const fetchTestimonials = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('testimonials')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) console.error('Error fetching testimonials:', error);
        else setTestimonials(data || []);
        setLoading(false);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this testimonial?')) return;

        const { error } = await supabase
            .from('testimonials')
            .delete()
            .eq('id', id);

        if (error) {
            alert('Error deleting testimonial');
            console.error(error);
        } else {
            setTestimonials(prev => prev.filter(t => t.id !== id));
        }
    };

    const handleEdit = (testimonial: Testimonial) => {
        setEditingId(testimonial.id);
        setFormData(testimonial);
        setIsFormOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const testimonialData = {
            ...formData
        };

        let result;
        if (editingId) {
            // Update
            result = await supabase
                .from('testimonials')
                .update(testimonialData)
                .eq('id', editingId)
                .select()
                .single();
        } else {
            // Create
            result = await supabase
                .from('testimonials')
                .insert([testimonialData])
                .select()
                .single();
        }

        const { data, error } = result;

        if (error) {
            console.error('Error saving testimonial:', error);
            alert('Error saving testimonial: ' + error.message);
        } else if (data) {
            setIsFormOpen(false);
            setEditingId(null);
            setFormData({ author_name: '', role: '', content: '', image_url: '' });
            fetchTestimonials();
        }
    };

    const resetForm = () => {
        setIsFormOpen(false);
        setEditingId(null);
        setFormData({ author_name: '', role: '', content: '', image_url: '' });
    };

    return (
        <div className="bg-[#111] p-6 rounded-xl border border-white/10 text-white">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-2xl font-serif">Testimonials</h2>
                    <p className="text-gray-400 text-sm">Manage client feedback shown on the homepage.</p>
                </div>
                <button
                    onClick={() => setIsFormOpen(true)}
                    className="flex items-center gap-2 bg-white text-black px-4 py-2 text-sm font-bold uppercase tracking-wider hover:bg-gray-200 transition-colors"
                >
                    <Plus size={16} /> Add New
                </button>
            </div>

            <AnimatePresence>
                {isFormOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="mb-8 overflow-hidden"
                    >
                        <form onSubmit={handleSubmit} className="bg-zinc-900/50 p-6 rounded-lg border border-white/10 space-y-4">
                            <div className="flex justify-between items-center mb-2">
                                <h3 className="uppercase tracking-widest text-sm font-bold text-gray-300">
                                    {editingId ? 'Edit Testimonial' : 'New Testimonial'}
                                </h3>
                                <button type="button" onClick={resetForm}><X size={16} className="text-gray-500 hover:text-white" /></button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] uppercase tracking-wider text-gray-500 mb-1">Author Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.author_name || ''}
                                        onChange={e => setFormData({ ...formData, author_name: e.target.value })}
                                        className="w-full bg-black border border-white/10 p-3 text-sm focus:border-white/30 outline-none text-white"
                                        placeholder="E.g. Sarah Connor"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] uppercase tracking-wider text-gray-500 mb-1">Title / Role</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.role || ''}
                                        onChange={e => setFormData({ ...formData, role: e.target.value })}
                                        className="w-full bg-black border border-white/10 p-3 text-sm focus:border-white/30 outline-none text-white"
                                        placeholder="E.g. Director of Operations"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] uppercase tracking-wider text-gray-500 mb-1">Author Image URL (Optional)</label>
                                <div className="flex gap-4 items-center">
                                    <div className="flex-1 relative">
                                        <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                                        <input
                                            type="url"
                                            value={formData.image_url || ''}
                                            onChange={e => setFormData({ ...formData, image_url: e.target.value })}
                                            className="w-full bg-black border border-white/10 pl-10 p-3 text-sm focus:border-white/30 outline-none text-white"
                                            placeholder="https://..."
                                        />
                                    </div>
                                    {formData.image_url && (
                                        <img src={formData.image_url} alt="Preview" className="w-10 h-10 rounded-full object-cover border border-white/10" />
                                    )}
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] uppercase tracking-wider text-gray-500 mb-1">Testimonial Text</label>
                                <textarea
                                    required
                                    rows={4}
                                    value={formData.content || ''}
                                    onChange={e => setFormData({ ...formData, content: e.target.value })}
                                    className="w-full bg-black border border-white/10 p-3 text-sm focus:border-white/30 outline-none text-white resize-none"
                                    placeholder="Write the testimonial here..."
                                />
                            </div>

                            <div className="flex justify-end pt-4 border-t border-white/5">
                                <button type="submit" className="flex items-center gap-2 bg-white text-black px-6 py-2 text-sm font-bold uppercase tracking-wider hover:bg-gray-200 transition-colors">
                                    <Save size={16} /> Save
                                </button>
                            </div>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>

            {loading ? (
                <div className="text-center py-12 text-gray-500 animate-pulse">Loading testimonials...</div>
            ) : (
                <div className="grid gap-4">
                    {testimonials.map((t) => (
                        <div key={t.id} className="bg-zinc-900/30 p-4 border border-white/5 flex flex-col md:flex-row justify-between md:items-center gap-4 group hover:border-white/20 transition-all">
                            <div className="flex gap-4 items-start">
                                {t.image_url ? (
                                    <img src={t.image_url} alt={t.author_name} className="w-12 h-12 rounded-full object-cover border border-white/10" />
                                ) : (
                                    <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-gray-500">
                                        <User size={20} />
                                    </div>
                                )}
                                <div>
                                    <h4 className="font-serif text-lg text-white">{t.author_name}</h4>
                                    <p className="text-xs text-red-500 uppercase tracking-wider mb-2">{t.role}</p>
                                    <p className="text-sm text-gray-400 line-clamp-2 italic">"{t.content}"</p>
                                </div>
                            </div>

                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => handleEdit(t)} className="p-2 hover:bg-white/10 rounded-full text-white transition-colors" title="Edit">
                                    <Edit size={14} />
                                </button>
                                <button onClick={() => handleDelete(t.id)} className="p-2 hover:bg-red-900/30 rounded-full text-red-500 transition-colors" title="Delete">
                                    <Trash size={14} />
                                </button>
                            </div>
                        </div>
                    ))}
                    {testimonials.length === 0 && (
                        <div className="text-center py-12 text-gray-500 italic border border-dashed border-white/10">
                            No testimonials found.
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default TestimonialManager;
