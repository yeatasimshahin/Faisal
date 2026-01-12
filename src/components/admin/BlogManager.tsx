import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Trash2, Loader2, FileText } from 'lucide-react';
import Modal from '../ui/Modal';

interface BlogPost {
  id: string;
  title: string;
  content: string;
  image_url: string;
  project_id?: string;
  created_at: string;
  author_id: string;
  profiles: {
    full_name: string;
    email: string;
  };
  projects?: {
    title: string;
  };
}

const BlogManager = () => {
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchBlogs = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('blogs')
      .select('*, profiles(full_name, email), projects(title)')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setBlogs(data as any);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  const handleDelete = async () => {
    if (!deletingId) return;

    await supabase.from('blogs').delete().eq('id', deletingId);
    setBlogs(blogs.filter(b => b.id !== deletingId));
    setDeletingId(null);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">

      {/* Delete Confirmation Modal */}
      <Modal isOpen={!!deletingId} onClose={() => setDeletingId(null)} title="Confirm Deletion">
        <div className="text-center space-y-6">
          <p className="text-gray-300">Are you sure you want to delete this journal entry?</p>
          <div className="flex gap-4 justify-center">
            <button onClick={() => setDeletingId(null)} className="px-6 py-2 border border-white/20 text-white uppercase text-xs tracking-widest hover:bg-white/10">Cancel</button>
            <button onClick={handleDelete} className="px-6 py-2 bg-red-600 text-white font-bold uppercase text-xs tracking-widest hover:bg-red-700">Delete</button>
          </div>
        </div>
      </Modal>

      {/* Header */}
      <div className="flex justify-between items-center bg-zinc-900/30 p-6 border border-white/5 backdrop-blur-md">
        <div>
          <h3 className="text-lg font-serif text-white">Journal Management</h3>
          <p className="text-[10px] text-gray-500 uppercase tracking-widest">Total Entries: {blogs.length}</p>
        </div>
      </div>

      {/* Blog Table */}
      <div className="overflow-x-auto border border-white/5 bg-black/20">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-white/5 text-[10px] uppercase tracking-widest text-gray-400">
              <th className="py-4 px-6 font-normal">Entry</th>
              <th className="py-4 px-6 font-normal">Project</th>
              <th className="py-4 px-6 font-normal">Author</th>
              <th className="py-4 px-6 font-normal">Published</th>
              <th className="py-4 px-6 font-normal text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-sm">
            {loading ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-gray-500"><Loader2 className="animate-spin mx-auto" /></td>
              </tr>
            ) : blogs.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-12 text-center text-gray-500 italic">No blog posts found.</td>
              </tr>
            ) : (
              blogs.map((blog) => (
                <tr key={blog.id} className="hover:bg-white/5 transition-colors group">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-zinc-800 overflow-hidden flex-shrink-0">
                        {blog.image_url ? (
                          <img src={blog.image_url} className="w-full h-full object-cover" alt="Thumb" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-600"><FileText size={16} /></div>
                        )}
                      </div>
                      <div>
                        <h4 className="font-serif text-white group-hover:text-red-500 transition-colors">{blog.title}</h4>
                        <span className="text-[10px] text-gray-600 font-mono">ID: {blog.id.slice(0, 6)}...</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    {blog.projects?.title ? (
                      <span className="text-red-500 text-xs uppercase font-bold">@{blog.projects.title}</span>
                    ) : (
                      <span className="text-gray-600 text-[10px] uppercase">Independent</span>
                    )}
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex flex-col">
                      <span className="text-white text-xs">{blog.profiles?.full_name || 'Unknown'}</span>
                      <span className="text-[10px] text-gray-500">{blog.profiles?.email}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-xs text-gray-500">
                    {new Date(blog.created_at).toLocaleDateString()}
                  </td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setDeletingId(blog.id)}
                        className="p-2 text-zinc-400 hover:text-red-500 transition-colors bg-white/5 hover:bg-white/10"
                        title="Delete Post"
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

export default BlogManager;