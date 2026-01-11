import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import Layout from '../components/layout/Layout';
import { Loader2, ArrowLeft, User, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';

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
}

const BlogDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      if (!id) return;
      const { data, error } = await supabase
        .from('blogs')
        .select('*, profiles(full_name)')
        .eq('id', id)
        .single();
      
      if (data) setPost(data as any);
      setLoading(false);
    };
    fetchPost();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <Loader2 className="animate-spin text-white" />
      </div>
    );
  }

  if (!post) {
    return (
      <Layout>
        <div className="min-h-screen flex flex-col items-center justify-center text-white">
          <h1 className="text-4xl font-serif mb-4">Entry Not Found</h1>
          <button onClick={() => navigate('/blog')} className="text-red-500 uppercase tracking-widest text-xs">Return to Journal</button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <article className="min-h-screen bg-[#0a0a0a] pt-32 pb-24">
        {/* Navigation Back */}
        <div className="container mx-auto px-6 md:px-12 mb-12">
           <button 
             onClick={() => navigate('/blog')}
             className="flex items-center gap-2 text-gray-500 hover:text-white transition-colors text-xs uppercase tracking-widest group"
           >
             <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> Back to Journal
           </button>
        </div>

        {/* Hero Image */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="w-full h-[50vh] md:h-[70vh] relative mb-16 overflow-hidden"
        >
           <img src={post.image_url} alt={post.title} className="w-full h-full object-cover opacity-80" />
           <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent" />
        </motion.div>

        {/* Content Container */}
        <div className="container mx-auto px-6 md:px-12 max-w-4xl relative z-10 -mt-32">
           
           {/* Meta Data Card */}
           <div className="bg-[#0a0a0a]/80 backdrop-blur-md border border-white/5 p-8 mb-12 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <h1 className="text-4xl md:text-6xl font-serif text-white leading-none">
                {post.title}
              </h1>
              
              <div className="flex flex-col gap-2 min-w-[200px] border-l border-white/10 pl-6">
                 <div className="flex items-center gap-2 text-gray-400 text-xs uppercase tracking-widest">
                    <User size={12} className="text-red-500" />
                    {post.profiles?.full_name || 'Unknown Author'}
                 </div>
                 <div className="flex items-center gap-2 text-gray-400 text-xs uppercase tracking-widest">
                    <Calendar size={12} />
                    {new Date(post.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                 </div>
              </div>
           </div>

           {/* Text Body */}
           <div className="prose prose-invert prose-lg max-w-none text-gray-300 font-light leading-relaxed">
             {post.content.split('\n').map((paragraph, idx) => (
                paragraph.trim() !== '' && <p key={idx} className="mb-6">{paragraph}</p>
             ))}
           </div>
           
           {/* Footer */}
           <div className="mt-24 pt-12 border-t border-white/10 flex justify-center">
              <div className="text-center">
                 <div className="w-12 h-[1px] bg-red-500 mx-auto mb-4" />
                 <span className="text-[10px] uppercase tracking-[0.3em] text-gray-500">End of Entry</span>
              </div>
           </div>
        </div>
      </article>
    </Layout>
  );
};

export default BlogDetails;