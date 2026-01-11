import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import Layout from '../components/layout/Layout';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { ArrowRight, MapPin, Calendar, User, Layers, Loader2, ArrowLeft, X, ZoomIn } from 'lucide-react';

interface Project {
  id: string;
  title: string;
  slug: string;
  description: string;
  image_url: string;
  narrative_image_url?: string;
  gallery_images?: string[];
  tags: string[];
  location?: string;
  year?: string;
  client?: string;
  status?: string;
}

const ProjectDetails = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [nextProject, setNextProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  // Lightbox State
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], [0, -50]);

  useEffect(() => {
    const fetchProjectData = async () => {
      setLoading(true);

      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('slug', slug)
        .single();

      if (error || !data) {
        setLoading(false);
        return;
      }

      setProject(data as Project);

      const { data: nextData } = await supabase
        .from('projects')
        .select('title, slug, image_url')
        .neq('id', data.id)
        .limit(1)
        .single();

      if (nextData) setNextProject(nextData as any);

      setLoading(false);
    };

    fetchProjectData();
    window.scrollTo(0, 0);
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <Loader2 className="animate-spin text-white opacity-50" size={32} />
      </div>
    );
  }

  if (!project) {
    return (
      <Layout>
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#0a0a0a] text-center px-4">
          <h1 className="text-4xl font-serif text-white mb-4">Project Not Found</h1>
          <button onClick={() => navigate('/')} className="px-8 py-3 bg-white text-black text-xs font-bold uppercase tracking-widest hover:bg-gray-200">
            Return Home
          </button>
        </div>
      </Layout>
    );
  }

  // Ensure gallery exists
  const gallery = project.gallery_images && project.gallery_images.length > 0
    ? project.gallery_images
    : [];

  return (
    <Layout>
      <article className="bg-[#0a0a0a] min-h-screen">

        {/* Lightbox Overlay */}
        <AnimatePresence>
          {lightboxIndex !== null && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setLightboxIndex(null)}
              className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 md:p-12 cursor-zoom-out"
            >
              <button className="absolute top-8 right-8 text-white/50 hover:text-white transition-colors">
                <X size={32} />
              </button>
              <motion.img
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                src={gallery[lightboxIndex]}
                className="max-w-full max-h-full object-contain shadow-2xl"
                onClick={(e) => e.stopPropagation()} // Prevent close on image click
              />
              <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/50 text-xs uppercase tracking-widest">
                Image {lightboxIndex + 1} of {gallery.length}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation Back */}
        <div className="fixed top-24 left-6 md:left-12 z-40 mix-blend-difference">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-white/50 hover:text-white transition-colors text-xs uppercase tracking-widest group"
          >
            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> Back
          </button>
        </div>

        {/* Hero Section */}
        <section className="relative h-screen w-full overflow-hidden">
          <motion.div style={{ y }} className="absolute inset-0">
            <img
              src={project.image_url}
              alt={project.title}
              className="w-full h-full object-cover opacity-60"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/20 to-transparent" />
          </motion.div>

          <div className="absolute bottom-0 left-0 w-full p-6 md:p-12 z-10">
            <div className="max-w-4xl">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="flex items-center gap-4 text-red-500 text-xs font-bold uppercase tracking-[0.2em] mb-4"
              >
                <span>{project.tags?.[0] || 'Architecture'}</span>
                <div className="h-[1px] w-12 bg-red-500" />
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="text-5xl md:text-8xl font-serif text-white uppercase tracking-tighter leading-[0.9] mb-8"
              >
                {project.title}
              </motion.h1>
            </div>
          </div>
        </section>

        {/* Metadata Bar */}
        <section className="border-y border-white/10 bg-[#0a0a0a]">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-white/10">
            {[
              { label: 'Location', value: project.location || 'Unknown', icon: MapPin },
              { label: 'Year', value: project.year || new Date().getFullYear(), icon: Calendar },
              { label: 'Client', value: project.client || 'Private', icon: User },
              { label: 'Status', value: project.status || 'Completed', icon: Layers },
            ].map((item, index) => (
              <div key={index} className="p-8 flex flex-col gap-2 group hover:bg-white/5 transition-colors">
                <div className="flex items-center gap-2 text-red-500 mb-1">
                  <item.icon size={14} />
                  <span className="text-[10px] uppercase tracking-widest">{item.label}</span>
                </div>
                <span className="text-white font-serif text-lg">{item.value}</span>
              </div>
            ))}
          </div>
        </section>

        {/* The Narrative */}
        <section className="py-24 px-6 md:px-12 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-start">
            <div className="space-y-8 sticky top-32">
              <h2 className="text-3xl md:text-4xl font-light uppercase tracking-widest text-white">
                The Narrative
              </h2>
              <div className="w-12 h-[1px] bg-red-600" />
              <p className="text-gray-400 font-light leading-relaxed text-lg whitespace-pre-line">
                {project.description}
              </p>
              <div className="flex flex-wrap gap-2 pt-4">
                {project.tags?.map((tag, i) => (
                  <span key={i} className="px-3 py-1 border border-white/10 rounded-full text-[10px] uppercase tracking-wider text-gray-500">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-4 group">
              {/* Secondary Narrative Image */}
              <div className="aspect-[3/4] overflow-hidden bg-zinc-900 border border-white/5">
                <img
                  src={project.narrative_image_url || project.image_url}
                  alt="Architectural Detail"
                  className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700"
                />
              </div>
              <p className="text-xs uppercase tracking-widest text-gray-500 text-right group-hover:text-red-500 transition-colors">
                Architectural Detail • {project.location || 'Site View'}
              </p>
            </div>
          </div>
        </section>

        {/* Visual Documentation (Masonry Gallery) */}
        {gallery.length > 0 && (
          <section className="py-24 border-t border-white/5 bg-[#080808]">
            <div className="container mx-auto px-6 md:px-12">
              <div className="text-center mb-16">
                <h3 className="text-[10px] uppercase tracking-[0.3em] text-red-500 mb-2">
                  Visual Documentation
                </h3>
                <h2 className="text-4xl font-serif text-white">Project Gallery</h2>
              </div>

              {/* CSS Columns Masonry */}
              <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
                {gallery.map((img, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: idx * 0.05 }}
                    className="break-inside-avoid relative group cursor-zoom-in overflow-hidden bg-zinc-900 border border-white/5"
                    onClick={() => setLightboxIndex(idx)}
                  >
                    <img
                      src={img}
                      alt={`Gallery ${idx}`}
                      className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105 opacity-80 group-hover:opacity-100"
                    />

                    {/* Overlay */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <ZoomIn className="text-white opacity-80" size={32} />
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Next Project Footer */}
        {nextProject && (
          <section className="relative py-32 border-t border-white/10 overflow-hidden group">
            <Link to={`/project/${nextProject.slug}`} className="block relative z-10">
              <div className="container mx-auto px-6 md:px-12 text-center">
                <span className="text-red-500 text-xs font-bold uppercase tracking-widest mb-4 block">Next Project</span>
                <h2 className="text-5xl md:text-9xl font-serif text-white uppercase tracking-tighter group-hover:text-transparent group-hover:stroke-text transition-all duration-500">
                  {nextProject.title}
                </h2>
                <div className="mt-8 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <span className="flex items-center gap-2 text-white text-xs uppercase tracking-widest">
                    View Case Study <ArrowRight size={16} />
                  </span>
                </div>
              </div>
            </Link>

            {/* Background Hover Reveal */}
            <div className="absolute inset-0 -z-10 opacity-0 group-hover:opacity-20 transition-opacity duration-700">
              <img src={nextProject.image_url} className="w-full h-full object-cover" alt="Next" />
            </div>
          </section>
        )}

      </article>
    </Layout>
  );
};

export default ProjectDetails;