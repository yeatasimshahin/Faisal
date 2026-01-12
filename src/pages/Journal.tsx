import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import { ArrowUpRight, Loader2, Maximize2, Plus, Bookmark, Share2 } from 'lucide-react';
import SEO from '../components/shared/SEO';
import { useStore } from '../store/useStore';

interface Model {
    id: string;
    title: string;
    content: string;
    image_url: string;
    created_at: string;
    projects?: {
        title: string;
    };
    isSaved?: boolean;
}

const Journal = () => {
    const [models, setModels] = useState<Model[]>([]);
    const [loading, setLoading] = useState(true);
    const { user, isAdmin } = useStore();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchModels = async () => {
            try {
                const { data: blogsData, error: blogsError } = await supabase
                    .from('blogs')
                    .select('*, projects(title)')
                    .order('created_at', { ascending: false });

                if (blogsError) throw blogsError;

                let mergedData = blogsData as Model[];

                if (user) {
                    const { data: savedData, error: savedError } = await supabase
                        .from('saved_blogs')
                        .select('blog_id')
                        .eq('user_id', user.id);

                    if (!savedError && savedData) {
                        const savedIds = new Set(savedData.map(item => item.blog_id));
                        mergedData = mergedData.map(blog => ({
                            ...blog,
                            isSaved: savedIds.has(blog.id)
                        }));
                    }
                }
                setModels(mergedData);
            } catch (err) {
                console.error('[Journal] Error fetching entries:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchModels();
    }, [user]);

    const handleSave = async (e: React.MouseEvent, blog: Model) => {
        e.preventDefault();
        e.stopPropagation();

        if (!user) {
            navigate('/login');
            return;
        }

        try {
            if (blog.isSaved) {
                const { error } = await supabase
                    .from('saved_blogs')
                    .delete()
                    .eq('user_id', user.id)
                    .eq('blog_id', blog.id);
                if (error) throw error;
            } else {
                const { error } = await supabase
                    .from('saved_blogs')
                    .insert({ user_id: user.id, blog_id: blog.id });
                if (error) throw error;
            }

            setModels(prev => prev.map(m =>
                m.id === blog.id ? { ...m, isSaved: !m.isSaved } : m
            ));
        } catch (error) {
            console.error('Error toggling save:', error);
        }
    };

    const handleShare = async (e: React.MouseEvent, blogId: string) => {
        e.preventDefault();
        e.stopPropagation();
        const url = `${window.location.origin}/blog/${blogId}`;
        await navigator.clipboard.writeText(url);
        alert('Link copied to clipboard');
    };

    return (
        <Layout>
            <SEO
                title="Journal | PRECISSION"
                description="Experiential architectural designs crafted for modern living. Explore our Journal and definitions of space."
            />

            <div className="min-h-screen bg-[#050505] pt-32 pb-24 px-6 md:px-12 relative overflow-hidden">

                {/* Decorative Background Elements */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-red-600/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-zinc-900/40 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/2 pointer-events-none" />

                <div className="container mx-auto relative z-10">
                    {/* Header Section */}
                    <div className="mb-24 flex flex-col md:flex-row md:items-end justify-between gap-12 border-b border-white/5 pb-16">
                        <div className="max-w-3xl">
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="flex items-center gap-3 text-red-600 mb-8"
                            >
                                <span className="h-[1px] w-12 bg-red-600" />
                                <span className="text-[10px] uppercase tracking-[0.4em] font-bold">Curated Thoughts</span>
                            </motion.div>

                            <motion.h1
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-6xl md:text-9xl font-serif text-white uppercase tracking-tighter leading-[0.8] mb-12"
                            >
                                The <br /><span className="text-transparent" style={{ WebkitTextStroke: '1px rgba(255,255,255,0.3)' }}>Journal</span>
                            </motion.h1>

                            <motion.p
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="text-gray-400 text-lg md:text-xl font-light leading-relaxed max-w-xl border-l border-red-600 pl-8"
                            >
                                Experiential architectural designs crafted for modern living. Every structure in our journal is a dialogue between precision and emotion.
                            </motion.p>
                        </div>

                        <div className="flex flex-col items-end text-right gap-8">
                            <div className="flex flex-col items-end">
                                <span className="text-[10px] font-mono text-zinc-500 tracking-[0.3em] uppercase mb-2">Total Journal Entries</span>
                                <span className="text-5xl font-serif text-white">{models.length.toString().padStart(2, '0')}</span>
                            </div>
                        </div>
                    </div>

                    {/* Models Grid */}
                    {loading ? (
                        <div className="flex justify-center py-32">
                            <Loader2 className="animate-spin text-white/20" size={48} />
                        </div>
                    ) : models.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-32 border border-dashed border-white/10 rounded-sm">
                            <p className="text-gray-500 italic font-serif text-2xl">Awaiting the next definition of space.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-px gap-y-px bg-white/5 border border-white/5 overflow-hidden">
                            {models.map((model, index) => (
                                <motion.div
                                    key={model.id}
                                    initial={{ opacity: 0 }}
                                    whileInView={{ opacity: 1 }}
                                    transition={{ delay: index * 0.1, duration: 0.8 }}
                                    viewport={{ once: true }}
                                    className="group bg-[#050505] p-8 md:p-12 border border-transparent hover:border-red-600/30 transition-all duration-700 relative overflow-hidden"
                                >
                                    <Link to={`/blog/${model.id}`} className="flex flex-col h-full">
                                        {/* Image Section */}
                                        <div className="relative aspect-[3/4] overflow-hidden mb-10 bg-zinc-900">
                                            <motion.img
                                                src={model.image_url || 'https://via.placeholder.com/800x1200'}
                                                alt={model.title}
                                                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 grayscale group-hover:grayscale-0 opacity-60 group-hover:opacity-100"
                                            />

                                            {/* Floating Badge */}
                                            <div className="absolute top-6 left-6 z-20">
                                                <span className="text-[8px] font-mono uppercase tracking-[0.4em] text-white/40 bg-black/60 backdrop-blur-md px-3 py-1 border border-white/10">
                                                    {new Date(model.created_at).getFullYear()} Edition
                                                </span>
                                            </div>

                                            {/* Detail Icon */}
                                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-30">
                                                <div className="w-20 h-20 border border-white/20 rounded-full flex items-center justify-center backdrop-blur-sm group-hover:scale-110 transition-transform duration-500">
                                                    <Maximize2 size={24} className="text-white" strokeWidth={1} />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Content Section */}
                                        <div className="flex-1 flex flex-col pt-4">
                                            <div className="flex justify-between items-start mb-6">
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-[10px] font-mono text-red-600 tracking-widest uppercase">ENTRY // 0{index + 1}</span>
                                                    {model.projects?.title && (
                                                        <span className="text-[8px] uppercase tracking-widest text-zinc-500 font-bold">
                                                            Project: {model.projects.title}
                                                        </span>
                                                    )}
                                                </div>
                                                <ArrowUpRight size={20} className="text-zinc-600 group-hover:text-red-600 transition-colors" />
                                            </div>

                                            <h2 className="text-3xl font-serif text-white mb-6 leading-tight group-hover:text-red-500 transition-colors">
                                                {model.title}
                                            </h2>

                                            <p className="text-gray-500 text-sm font-light leading-relaxed line-clamp-3 mb-10 border-l border-white/5 pl-6 group-hover:text-gray-300 transition-colors">
                                                {model.content.replace(/[#*`]/g, '')}
                                            </p>

                                            {/* Call to action */}
                                            <div className="mt-auto flex items-center justify-between">
                                                <div className="inline-flex items-center gap-4 group/btn">
                                                    <span className="text-[10px] uppercase font-bold tracking-[0.4em] text-white">Read Entry</span>
                                                    <div className="w-10 h-[1px] bg-red-600 group-hover/btn:w-16 transition-all duration-500" />
                                                </div>

                                                <div className="flex gap-4">
                                                    <button
                                                        onClick={(e) => handleShare(e, model.id)}
                                                        className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center hover:bg-white hover:text-black transition-colors"
                                                    >
                                                        <Share2 size={14} />
                                                    </button>
                                                    <button
                                                        onClick={(e) => handleSave(e, model)}
                                                        className={`w-8 h-8 rounded-full border border-white/20 flex items-center justify-center transition-colors ${model.isSaved ? 'bg-white text-black' : 'hover:bg-white hover:text-black'
                                                            }`}
                                                    >
                                                        <Bookmark size={14} fill={model.isSaved ? "currentColor" : "none"} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Background Index (Decorative) */}
                                        <span className="absolute -bottom-4 -right-4 text-[120px] font-serif text-white/[0.02] group-hover:text-white/[0.05] transition-all duration-1000 pointer-events-none select-none">
                                            {(index + 1).toString().padStart(2, '0')}
                                        </span>
                                    </Link>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    );
};

export default Journal;
