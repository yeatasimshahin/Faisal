import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import { ArrowUpRight, Loader2, Plus, PenTool } from 'lucide-react';
import { useStore } from '../store/useStore';

interface BlogPost {
  id: string;
  title: string;
  content: string;
  image_url: string;
  created_at: string;
  author_id: string;
  profiles: {
    full_name: string;
  };
  projects?: {
    title: string;
  };
}

const BlogList = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, isAdmin } = useStore();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const { data, error } = await supabase
          .from('blogs')
          .select('*, profiles(full_name), projects(title)')
          .order('created_at', { ascending: false });

        if (error) {
          console.error('[BlogList] Error fetching posts:', error);
        } else if (data) {
          setPosts(data as any);
        }
      } catch (err) {
        console.error('[BlogList] Unexpected error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  return (
    <Layout>
      <div className="min-h-screen bg-[#0a0a0a] pt-32 pb-24 px-6 md:px-12 relative">

        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-24 border-b border-white/10 pb-8">
          <div className="space-y-4">
            <h1 className="text-6xl md:text-9xl font-serif text-white uppercase tracking-tighter leading-[0.8]">
              The <br /><span className="text-transparent stroke-text" style={{ WebkitTextStroke: '1px white' }}>Journal</span>
            </h1>
            <p className="text-gray-400 text-xs md:text-sm uppercase tracking-[0.2em] max-w-md pt-4">
              Curated thoughts on architecture, design, and the spaces we inhabit.
            </p>
          </div>

        </div>

        {/* Blog Grid */}
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-white/20" size={32} />
          </div>
        ) : posts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 border border-dashed border-white/10">
            <PenTool className="text-gray-700 mb-4" size={48} />
            <p className="text-gray-500 italic font-serif text-xl">The pages are currently empty.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-20">
            {posts.map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                viewport={{ once: true }}
                className="group cursor-pointer flex flex-col h-full"
              >
                <Link to={`/blog/${post.id}`} className="block flex-1 flex flex-col">
                  {/* Image Container */}
                  <div className="relative aspect-[4/3] overflow-hidden mb-8 bg-zinc-900 border border-white/5">
                    <motion.img
                      src={post.image_url || 'https://via.placeholder.com/800x600'}
                      alt={post.title}
                      className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105 grayscale group-hover:grayscale-0 opacity-80 group-hover:opacity-100"
                    />

                    {/* Hover Badge */}
                    <div className="absolute top-4 right-4 bg-white text-black p-3 rounded-full opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                      <ArrowUpRight size={20} />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="space-y-4 flex-1 flex flex-col">
                    <div className="flex justify-between items-center text-[10px] uppercase tracking-widest text-gray-500 border-b border-white/5 pb-3">
                      <span className="text-red-500">{new Date(post.created_at).toLocaleDateString()}</span>
                      <div className="flex items-center gap-2">
                        {post.projects?.title && <span className="bg-white/5 px-2 py-0.5 text-zinc-400">@{post.projects.title}</span>}
                        <span>{post.profiles?.full_name || 'Editorial'}</span>
                      </div>
                    </div>

                    <h2 className="text-3xl font-serif text-white group-hover:text-red-500 transition-colors leading-none uppercase">
                      {post.title}
                    </h2>

                    <p className="text-gray-400 text-sm font-light line-clamp-3 leading-relaxed mt-auto">
                      {post.content.replace(/[#*`]/g, '')}
                    </p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default BlogList;