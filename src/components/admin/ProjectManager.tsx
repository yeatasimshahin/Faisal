import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Plus, Trash2, Edit2, Loader2, Search, Eye } from 'lucide-react';
import ProjectEditor from './ProjectEditor';
import Modal from '../ui/Modal';
import { Link } from 'react-router-dom';

interface Project {
  id: string;
  title: string;
  slug: string;
  description: string;
  image_url: string;
  tags: string[];
  location?: string;
  year?: string;
  client?: string;
  status?: string;
  created_at?: string;
  gallery_images: string[];
  narrative_image_url?: string;
}

const ProjectManager = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Editor State
  const [isEditing, setIsEditing] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | undefined>(undefined);

  // Delete State
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchProjects = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching projects:', error);
    } else if (data) {
      // Sanitize data: ensure gallery_images is always an array
      const formattedData = data.map((p: any) => ({
        ...p,
        gallery_images: Array.isArray(p.gallery_images) ? p.gallery_images : []
      }));
      setProjects(formattedData as Project[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleEdit = (project?: Project) => {
    setSelectedProject(project);
    setIsEditing(true);
  };

  const handleDelete = async () => {
    if (!deletingId) return;

    const { error } = await supabase.from('projects').delete().eq('id', deletingId);

    if (error) {
      alert('Error deleting project');
    } else {
      setProjects(prev => prev.filter(p => p.id !== deletingId));
    }
    setDeletingId(null);
  };

  const handleSaveSuccess = () => {
    setIsEditing(false);
    fetchProjects();
  };

  const filteredProjects = projects.filter(p =>
    p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // If editing, show full screen editor
  if (isEditing) {
    return (
      <div className="fixed inset-0 z-[100] bg-[#0a0a0a] overflow-auto">
        <ProjectEditor
          project={selectedProject}
          onSave={handleSaveSuccess}
          onCancel={() => setIsEditing(false)}
        />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">

      {/* Delete Confirmation */}
      <Modal isOpen={!!deletingId} onClose={() => setDeletingId(null)} title="Confirm Deletion">
        <div className="text-center space-y-4">
          <p className="text-gray-300">
            Are you sure you want to delete this project? <br />
            This action cannot be undone.
          </p>
          <div className="flex gap-4 justify-center mt-4">
            <button onClick={() => setDeletingId(null)} className="px-6 py-2 border border-white/20 text-white uppercase text-xs tracking-widest hover:bg-white/10">Cancel</button>
            <button onClick={handleDelete} className="px-6 py-2 bg-red-600 text-white uppercase text-xs font-bold tracking-widest hover:bg-red-700">Delete</button>
          </div>
        </div>
      </Modal>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-zinc-900/30 p-6 border border-white/5 backdrop-blur-md">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
          <input
            type="text"
            placeholder="Search projects..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-black/50 border border-white/10 pl-10 pr-4 py-3 text-sm text-white focus:border-white/50 outline-none transition-colors"
          />
        </div>

        <button
          onClick={() => handleEdit(undefined)}
          className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-white text-black text-xs font-bold uppercase tracking-widest hover:bg-gray-200 transition-colors"
        >
          <Plus size={16} /> New Project
        </button>
      </div>

      {/* Projects List */}
      <div className="grid grid-cols-1 gap-4">
        {loading ? (
          <div className="py-20 flex justify-center"><Loader2 className="animate-spin text-white/50" /></div>
        ) : filteredProjects.length === 0 ? (
          <div className="py-20 text-center text-gray-500 italic border border-dashed border-white/10">
            No projects found. Create one to get started.
          </div>
        ) : (
          filteredProjects.map((p) => (
            <div key={p.id} className="group bg-zinc-900/20 border border-white/5 p-4 flex flex-col md:flex-row items-center gap-6 hover:border-white/20 transition-all">

              {/* Thumbnail */}
              <div className="w-full md:w-32 h-24 bg-black flex-shrink-0 overflow-hidden relative">
                {p.image_url ? (
                  <img src={p.image_url} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-700 text-xs">No Image</div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0 text-center md:text-left">
                <h3 className="text-white font-serif text-lg truncate">{p.title}</h3>
                <p className="text-xs text-gray-500 font-mono mb-2">/{p.slug}</p>
                <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                  {p.tags?.map((tag, i) => (
                    <span key={i} className="text-[10px] bg-white/5 px-2 py-0.5 rounded text-gray-400 border border-white/5">{tag}</span>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3">
                <Link to={`/project/${p.slug}`} target="_blank" className="p-2 text-gray-500 hover:text-white transition-colors" title="View Live">
                  <Eye size={16} />
                </Link>
                <button onClick={() => handleEdit(p)} className="p-2 text-gray-500 hover:text-white transition-colors" title="Edit">
                  <Edit2 size={16} />
                </button>
                <button onClick={() => setDeletingId(p.id)} className="p-2 text-gray-500 hover:text-red-500 transition-colors" title="Delete">
                  <Trash2 size={16} />
                </button>
              </div>

            </div>
          ))
        )}
      </div>

      <div className="text-center text-[10px] text-gray-600 uppercase tracking-widest pt-8">
        Displaying {filteredProjects.length} of {projects.length} Projects
      </div>

    </div>
  );
};

export default ProjectManager;