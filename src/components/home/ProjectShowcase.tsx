import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { motion } from 'framer-motion';
import { ArrowUpRight, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Project {
  id: string;
  title: string;
  slug: string;
  description: string;
  image_url: string;
  tags: string[];
}

const ProjectShowcase = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (!error && data) setProjects(data);
      setLoading(false);
    };
    fetchProjects();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center bg-[#0a0a0a]">
        <Loader2 className="animate-spin text-white/20" />
      </div>
    );
  }

  return (
    <section id="projects" className="bg-[#0a0a0a] py-24 border-t border-white/5 relative z-10">
      <div className="container mx-auto px-6 md:px-12">
        <div className="mb-16 flex flex-col md:flex-row items-end justify-between gap-8">
          <div>
            <h2 className="text-4xl md:text-7xl font-light uppercase tracking-widest text-white mb-4">
              Selected Works
            </h2>
            <div className="h-[1px] w-24 bg-red-600" />
          </div>
          <p className="text-gray-400 text-xs uppercase tracking-widest max-w-xs text-right hidden md:block">
            Curated selection of residential and commercial architectural achievements.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-24">
          {projects.map((project, index) => (
            <motion.div 
              key={project.id}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, delay: index * 0.1 }}
              className={`group relative ${index % 2 === 1 ? 'md:translate-y-24' : ''}`}
            >
              <Link to={`/project/${project.slug}`} className="block">
                <div className="overflow-hidden mb-6 relative aspect-[4/5] md:aspect-[3/4]">
                  <div className="absolute inset-0 bg-red-600/0 group-hover:bg-red-600/10 transition-colors z-10 duration-500" />
                  <motion.img 
                    src={project.image_url || 'https://via.placeholder.com/800x1000'} 
                    alt={project.title}
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105 grayscale group-hover:grayscale-0"
                  />
                  
                  <div className="absolute top-4 right-4 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="bg-white text-black p-3 rounded-full">
                          <ArrowUpRight size={20} />
                      </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-4 text-[10px] uppercase tracking-widest text-gray-500">
                     {project.tags?.map((tag, i) => (
                       <span key={i} className="border border-white/10 px-2 py-1 rounded-full">{tag}</span>
                     ))}
                  </div>
                  <h3 className="text-2xl font-serif text-white group-hover:text-red-500 transition-colors">
                    {project.title}
                  </h3>
                  <p className="text-gray-400 text-sm font-light max-w-sm line-clamp-2">
                    {project.description}
                  </p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
        
        {/* Spacer for offset grid */}
        <div className="h-24 hidden md:block" />
      </div>
    </section>
  );
};

export default ProjectShowcase;