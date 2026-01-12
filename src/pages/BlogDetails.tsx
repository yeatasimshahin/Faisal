import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import Layout from '../components/layout/Layout';
import { Loader2, ArrowLeft, User, Calendar, Share2, Bookmark, Box } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import SEO from '../components/shared/SEO';
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
    slug: string;
  };
}

const BlogDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useStore();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    const fetchPost = async () => {
      if (!id) return;

      try {
        const { data, error } = await supabase
          .from('blogs')
          .select('*, profiles(full_name), projects(title, slug)')
          .eq('id', id)
          .single();

        if (error) throw error;

        if (data) {
          setPost(data as any);

          // Check if saved
          if (user) {
            const { data: savedData } = await supabase
              .from('saved_blogs')
              .select('id')
              .eq('user_id', user.id)
              .eq('blog_id', id)
              .single();

            if (savedData) setIsSaved(true);
          }
        }
      } catch (err) {
        console.error('Error fetching blog:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [id, user]);

  const handleShare = async () => {
    const url = window.location.href;
    await navigator.clipboard.writeText(url);
    alert('Link copied to clipboard');
  };

  const handleSave = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (isSaved) {
      // Unsave
      const { error } = await supabase
        .from('saved_blogs')
        .delete()
        .eq('user_id', user.id)
        .eq('blog_id', id);

      if (!error) setIsSaved(false);
    } else {
      // Save
      const { error } = await supabase
        .from('saved_blogs')
        .insert({ user_id: user.id, blog_id: id });

      if (!error) setIsSaved(true);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <Loader2 className="animate-spin text-red-600" size={32} />
      </div>
    );
  }

  if (!post) {
    return (
      <Layout>
        <div className="min-h-screen flex flex-col items-center justify-center text-white bg-[#050505]">
          <h1 className="text-4xl font-serif mb-4">Entry Not Found</h1>
          <button onClick={() => navigate('/journal')} className="text-red-500 uppercase tracking-widest text-xs border border-red-500/20 px-6 py-2 hover:bg-red-500 hover:text-white transition-all">Return to Journal</button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <SEO
        title={`${post.title} | Journal`}
        description={post.content.slice(0, 160)}
      />

      <div className="min-h-screen bg-[#050505] text-white pt-32 pb-24 relative overflow-hidden">

        {/* Background Text Overlay */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden opacity-[0.02] select-none">
          <span className="text-[30vw] font-serif absolute -top-20 -left-20 leading-none whitespace-nowrap uppercase italic">
            {post.title}
          </span>
        </div>

        <div className="container mx-auto px-6 md:px-12 relative z-10">

          {/* Back Button */}
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => navigate('/journal')}
            className="flex items-center gap-2 text-zinc-500 hover:text-red-500 transition-colors text-[10px] uppercase tracking-[0.3em] group mb-16"
          >
            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
            Back to Journal
          </motion.button>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 md:gap-24 relative">

            {/* Left Column: Visuals & Meta */}
            <div className="lg:col-span-5 space-y-12 lg:sticky lg:top-32 lg:self-start">

              {/* Image with architectural frame */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative aspect-[4/5] bg-zinc-900 border border-white/5 overflow-hidden group shadow-2xl"
              >
                <img
                  src={post.image_url}
                  alt={post.title}
                  className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                {/* Image Specs Overlay */}
                <div className="absolute bottom-6 left-6 text-[8px] font-mono text-white/40 uppercase tracking-[0.2em] opacity-0 group-hover:opacity-100 transition-all duration-500">
                  REF_IMG: {post.id.slice(0, 8)} // GRID_L
                </div>
              </motion.div>

              {/* Meta information row (As seen in user image) */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="flex items-center justify-between border-b border-white/5 pb-4"
              >
                <div className="flex items-center gap-3">
                  <span className="text-red-600 text-[10px] font-bold">
                    {new Date(post.created_at).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-zinc-500 text-[9px] uppercase tracking-widest italic">
                  {post.profiles?.full_name || 'Editorial'}
                </div>
              </motion.div>

              {/* Title Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <h1 className="text-5xl md:text-7xl font-serif leading-[0.9] tracking-tighter uppercase mb-8">
                  {post.title}
                </h1>

                {/* Social/Utility row */}
                <div className="flex gap-4">
                  <button
                    onClick={handleShare}
                    className="w-10 h-10 rounded-full border border-white/5 flex items-center justify-center text-zinc-500 hover:text-red-500 hover:border-red-500/50 transition-all"
                  >
                    <Share2 size={16} />
                  </button>
                  <button
                    onClick={handleSave}
                    className={`w-10 h-10 rounded-full border border-white/5 flex items-center justify-center transition-all ${isSaved ? 'bg-white text-black' : 'text-zinc-500 hover:text-red-500 hover:border-red-500/50'
                      }`}
                  >
                    <Bookmark size={16} fill={isSaved ? "currentColor" : "none"} />
                  </button>
                </div>
              </motion.div>
            </div>

            {/* Right Column: Full Description */}
            <div className="lg:col-span-7 pt-4">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5, duration: 0.8 }}
                className="prose prose-invert prose-lg max-w-none"
              >
                <div className="flex items-center gap-4 mb-12">
                  <div className="h-[1px] w-12 bg-red-600" />
                  <span className="text-[10px] uppercase font-bold tracking-[0.4em] text-red-600 space-x-4">
                    <span>Definition / Narrative</span>
                    {post.projects?.title && (
                      <Link
                        to={`/project/${post.projects.slug}`}
                        className="ml-8 text-zinc-500 hover:text-white transition-colors border-l border-white/10 pl-8 inline-flex items-center gap-2"
                      >
                        <Box size={12} />
                        @{post.projects.title}
                      </Link>
                    )}
                  </span>
                </div>

                <div className="space-y-8 text-zinc-400 font-light leading-relaxed text-lg lg:text-xl selection:bg-red-600/30">
                  {post.content.split('\n').map((paragraph, idx) => (
                    paragraph.trim() !== '' && (
                      <motion.p
                        key={idx}
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: idx * 0.1 }}
                      >
                        {paragraph}
                      </motion.p>
                    )
                  ))}
                </div>

                {/* Closing Mark */}
                <div className="mt-24 pt-12 border-t border-white/5 flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-[8px] font-mono text-zinc-600 uppercase tracking-widest">Document Status</span>
                    <span className="text-[10px] font-mono text-red-600 uppercase tracking-widest">VERIFIED // ARCHIVE</span>
                  </div>
                  <div className="w-24 h-24 opacity-10">
                    <svg viewBox="0 0 100 100" className="w-full h-full fill-white">
                      <path d="M10,10 L90,10 L90,90 L10,90 Z M30,30 L70,30 L70,70 L30,70 Z" />
                    </svg>
                  </div>
                </div>
              </motion.div>
            </div>

          </div>
        </div>
      </div>
    </Layout>
  );
};

export default BlogDetails;