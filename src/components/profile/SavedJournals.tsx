import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowUpRight, Bookmark, Loader2, Share2, Maximize2 } from 'lucide-react';

interface SavedBlog {
    blog_id: string;
    blogs: {
        id: string;
        title: string;
        content: string;
        image_url: string;
        created_at: string;
        projects?: {
            title: string;
        };
    };
}

const SavedJournals = ({ userId }: { userId: string }) => {
    const [savedBlogs, setSavedBlogs] = useState<SavedBlog[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchSavedBlogs = async () => {
            try {
                const { data, error } = await supabase
                    .from('saved_blogs')
                    .select(`
                        blog_id,
                        blogs (
                            id,
                            title,
                            content,
                            image_url,
                            created_at,
                            projects (title)
                        )
                    `)
                    .eq('user_id', userId)
                    .order('created_at', { ascending: false });

                if (error) throw error;
                setSavedBlogs(data as unknown as SavedBlog[]);
            } catch (error) {
                console.error('Error fetching saved blogs:', error);
            } finally {
                setLoading(false);
            }
        };

        if (userId) {
            fetchSavedBlogs();
        }
    }, [userId]);

    const handleShare = async (e: React.MouseEvent, blogId: string) => {
        e.preventDefault();
        e.stopPropagation();
        const url = `${window.location.origin}/blog/${blogId}`;
        await navigator.clipboard.writeText(url);
        alert('Link copied to clipboard');
    };

    const handleUnsave = async (e: React.MouseEvent, blogId: string) => {
        e.preventDefault();
        e.stopPropagation();
        try {
            const { error } = await supabase
                .from('saved_blogs')
                .delete()
                .eq('user_id', userId)
                .eq('blog_id', blogId);

            if (error) throw error;
            setSavedBlogs(prev => prev.filter(item => item.blog_id !== blogId));
        } catch (error) {
            console.error('Error removing saved blog:', error);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center py-12">
                <Loader2 className="animate-spin text-white/20" size={32} />
            </div>
        );
    }

    if (savedBlogs.length === 0) {
        return (
            <div className="text-center py-16 border border-dashed border-white/10 rounded-sm">
                <Bookmark className="mx-auto text-gray-600 mb-4" size={32} />
                <p className="text-gray-500 font-serif italic text-lg">No saved entries yet.</p>
                <Link to="/journal" className="inline-block mt-4 text-[10px] uppercase tracking-widest text-white hover:text-red-500 transition-colors">
                    Explore Journal
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-12">
            <h3 className="text-2xl font-serif text-white mb-8">Saved Reflections</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-px gap-y-px bg-white/5 border border-white/5 overflow-hidden">
                {savedBlogs.map((item, index) => {
                    // Safety check if blog reference still exists
                    if (!item.blogs) return null;
                    const blog = item.blogs;

                    return (
                        <motion.div
                            key={item.blog_id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: index * 0.1 }}
                            className="group bg-[#050505] p-8 border border-transparent hover:border-red-600/30 transition-all duration-500 relative overflow-hidden"
                        >
                            <Link to={`/blog/${blog.id}`} className="flex flex-col h-full">
                                {/* Image */}
                                <div className="relative aspect-[3/4] overflow-hidden mb-8 bg-zinc-900">
                                    <img
                                        src={blog.image_url || 'https://via.placeholder.com/800x1200'}
                                        alt={blog.title}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 grayscale group-hover:grayscale-0 opacity-60 group-hover:opacity-100"
                                    />
                                    {/* Unsave Button (Top Right) */}
                                    <button
                                        onClick={(e) => handleUnsave(e, blog.id)}
                                        className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center text-white hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
                                        title="Remove from saved"
                                    >
                                        <Bookmark size={14} fill="currentColor" />
                                    </button>
                                </div>

                                {/* Content */}
                                <div className="flex-1 flex flex-col">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex flex-col gap-1">
                                            {blog.projects?.title && (
                                                <span className="text-[8px] uppercase tracking-widest text-zinc-500 font-bold">
                                                    {blog.projects.title}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <h4 className="text-xl font-serif text-white mb-4 leading-tight group-hover:text-red-500 transition-colors">
                                        {blog.title}
                                    </h4>

                                    {/* Actions */}
                                    <div className="mt-auto flex items-center justify-between pt-6 border-t border-white/5">
                                        <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-white/50 group-hover:text-white transition-colors">
                                            Read
                                        </span>
                                        <button
                                            onClick={(e) => handleShare(e, blog.id)}
                                            className="text-white/50 hover:text-white transition-colors"
                                        >
                                            <Share2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            </Link>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
};

export default SavedJournals;
