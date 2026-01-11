import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Edit2, Trash2, Plus, Loader2, FileText, ArrowUpRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import BlogEditor from '../blog/BlogEditor';

interface BlogPost {
    id: string;
    title: string;
    content: string;
    image_url: string;
    created_at: string;
    author_id: string;
}

const MyJournal = ({ userId }: { userId: string }) => {
    const [blogs, setBlogs] = useState<BlogPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [selectedBlog, setSelectedBlog] = useState<BlogPost | undefined>(undefined);
    const navigate = useNavigate();

    const fetchMyBlogs = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('blogs')
            .select('*')
            .eq('author_id', userId)
            .order('created_at', { ascending: false });

        if (!error && data) {
            setBlogs(data as any);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchMyBlogs();
    }, [userId]);

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this entry?')) return;

        const { error } = await supabase.from('blogs').delete().eq('id', id);
        if (!error) {
            setBlogs(blogs.filter(b => b.id !== id));
        } else {
            alert('Error deleting entry: ' + error.message);
        }
    };

    const handleEditSuccess = () => {
        setIsEditing(false);
        setSelectedBlog(undefined);
        fetchMyBlogs();
    };

    if (isEditing) {
        return (
            <div className="fixed inset-0 z-[150] bg-[#050505] overflow-auto">
                <BlogEditor
                    initialData={selectedBlog}
                    isEmbedded={true}
                    onSuccess={handleEditSuccess}
                    onCancel={() => setIsEditing(false)}
                />
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-700">

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-white/5 pb-8">
                <div>
                    <h2 className="text-3xl font-serif text-white mb-2 uppercase tracking-tighter">My Journal History</h2>
                    <p className="text-[10px] text-zinc-500 uppercase tracking-[0.3em]">Total Contributions: {blogs.length.toString().padStart(2, '0')}</p>
                </div>
                <button
                    onClick={() => navigate('/blog/new')}
                    className="px-8 py-3 bg-red-600 text-white text-xs font-bold uppercase tracking-widest hover:bg-red-700 transition-colors flex items-center gap-2"
                >
                    <Plus size={16} /> New Entry
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center py-12">
                    <Loader2 className="animate-spin text-red-600" />
                </div>
            ) : blogs.length === 0 ? (
                <div className="py-20 border border-dashed border-white/10 rounded-sm flex flex-col items-center justify-center text-center">
                    <FileText size={32} className="text-zinc-800 mb-4" />
                    <p className="text-zinc-500 italic font-serif text-lg">Your journal is currently empty.</p>
                    <button onClick={() => navigate('/blog/new')} className="mt-4 text-xs text-red-500 uppercase tracking-widest hover:underline">Start writing</button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {blogs.map((blog) => (
                        <div key={blog.id} className="group relative bg-zinc-900/20 border border-white/5 p-6 hover:border-red-600/30 transition-all duration-500">
                            <div className="flex gap-6">
                                <div className="w-24 h-24 bg-zinc-800 flex-shrink-0 overflow-hidden border border-white/5">
                                    {blog.image_url ? (
                                        <img src={blog.image_url} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" alt="Thumb" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-zinc-700"><FileText size={24} /></div>
                                    )}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="text-[8px] font-mono text-zinc-600 uppercase tracking-widest">{new Date(blog.created_at).toLocaleDateString()}</span>
                                        <div className="flex gap-2">
                                            <button onClick={() => { setSelectedBlog(blog); setIsEditing(true); }} className="text-zinc-600 hover:text-white transition-colors"><Edit2 size={12} /></button>
                                            <button onClick={() => handleDelete(blog.id)} className="text-zinc-600 hover:text-red-500 transition-colors"><Trash2 size={12} /></button>
                                        </div>
                                    </div>
                                    <h4 className="text-lg font-serif text-white truncate group-hover:text-red-500 transition-colors mb-2">{blog.title}</h4>
                                    <Link to={`/blog/${blog.id}`} className="inline-flex items-center gap-2 text-[10px] text-zinc-500 hover:text-white uppercase tracking-widest transition-colors group/link">
                                        View full entry <ArrowUpRight size={10} className="group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform" />
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyJournal;
