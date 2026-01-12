import React, { useEffect, useState } from 'react';
import Layout from '../components/layout/Layout';
import { supabase } from '../lib/supabaseClient';
import { motion } from 'framer-motion';
import { ArrowUpRight, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import SEO from '../components/shared/SEO';

interface Project {
    id: string;
    title: string;
    slug: string;
    description: string;
    image_url: string;
    tags: string[];
}

const Projects = () => {
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

    return (
        <Layout>
            <SEO
                title="Projects | PRECISSION"
                description="Explore our portfolio of award-winning architectural visualizations."
            />
            <section className="pt-32 pb-16 bg-black min-h-screen">
                <div className="container mx-auto px-6 md:px-12">

                    {/* Header */}
                    <div className="mb-20">
                        <h1 className="text-5xl md:text-8xl font-serif text-white mb-6">Selected Works</h1>
                        <p className="text-gray-400 max-w-xl text-lg font-light">
                            A collection of our most defined architectural statements, ranging from residential sanctuaries to commercial landmarks.
                        </p>
                    </div>

                    {loading ? (
                        <div className="flex items-center justify-center py-24">
                            <Loader2 className="animate-spin text-white/20" size={32} />
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
                            {projects.map((project, index) => (
                                <motion.div
                                    key={project.id}
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="group"
                                >
                                    <Link to={`/project/${project.slug}`} className="block">
                                        <div className="overflow-hidden mb-6 relative aspect-[3/4] bg-zinc-900 border border-white/5">
                                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors z-10 duration-500" />

                                            {project.image_url ? (
                                                <img
                                                    src={project.image_url}
                                                    alt={project.title}
                                                    loading="lazy"
                                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 grayscale group-hover:grayscale-0"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-white/10">No Image</div>
                                            )}

                                            <div className="absolute top-4 right-4 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                                <div className="bg-white text-black p-3 rounded-full">
                                                    <ArrowUpRight size={20} />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <div className="flex flex-wrap gap-2">
                                                {project.tags?.map((tag, i) => (
                                                    <span key={i} className="text-[10px] uppercase tracking-widest text-red-500 border border-red-900/30 px-2 py-0.5 rounded-full bg-red-950/10">
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>
                                            <h3 className="text-2xl font-serif text-white group-hover:underline decoration-red-500 underline-offset-4 decoration-1 transition-all">
                                                {project.title}
                                            </h3>
                                            <p className="text-gray-500 text-sm line-clamp-2">
                                                {project.description}
                                            </p>
                                        </div>
                                    </Link>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </section>
        </Layout>
    );
};

export default Projects;
