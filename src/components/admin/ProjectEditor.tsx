import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Save, X, Upload, Loader2, Image as ImageIcon, AlignLeft, Tag, MapPin, Calendar, Layers, Trash2, Plus, AlertTriangle, User, CheckCircle, AlertCircle } from 'lucide-react';
import Modal from '../ui/Modal';

interface Project {
    id?: string;
    title: string;
    slug: string;
    description: string;
    image_url: string;
    narrative_image_url?: string;
    gallery_images: string[]; // JSONB Column in 'projects' table
    tags: string[];
    location?: string;
    year?: string;
    client?: string;
    status?: string;
}

interface ProjectEditorProps {
    project?: Project;
    onSave: () => void;
    onCancel: () => void;
}

const ProjectEditor: React.FC<ProjectEditorProps> = ({ project, onSave, onCancel }) => {
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [galleryUploading, setGalleryUploading] = useState(false);

    // Feedback State
    const [feedback, setFeedback] = useState<{ open: boolean; type: 'success' | 'error'; message: string }>({
        open: false, type: 'success', message: ''
    });

    // Form State
    const [formData, setFormData] = useState<Project>({
        title: '',
        slug: '',
        description: '',
        image_url: '',
        tags: [],
        year: new Date().getFullYear().toString(),
        status: 'In Progress',
        ...project,
        // Ensure arrays and strings are never null/undefined
        gallery_images: project?.gallery_images || [],
        narrative_image_url: project?.narrative_image_url || '',
        location: project?.location || '',
        client: project?.client || ''
    });

    const [tagsInput, setTagsInput] = useState(project?.tags?.join(', ') || '');

    // Auto-generate slug from title if creating new
    useEffect(() => {
        if (!project && formData.title) {
            const slug = formData.title
                .toLowerCase()
                .trim()
                .replace(/[^\w\s-]/g, '')
                .replace(/[\s_-]+/g, '-')
                .replace(/^-+|-+$/g, '');
            setFormData(prev => ({ ...prev, slug }));
        }
    }, [formData.title, project]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // Generic Image Uploader (Cover & Narrative)
    const handleSingleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'image_url' | 'narrative_image_url') => {
        if (!e.target.files || !e.target.files[0]) return;

        setUploading(true);
        const file = e.target.files[0];

        try {
            const fileExt = file.name.split('.').pop();
            const cleanName = file.name.replace(/[^a-zA-Z0-9]/g, '-');
            const fileName = `${Date.now()}-${cleanName}.${fileExt}`;
            const filePath = `covers/${fileName}`;

            console.log(`Uploading ${field} to bucket 'projects' at path: ${filePath}`);

            const { error: uploadError } = await supabase.storage
                .from('projects')
                .upload(filePath, file, {
                    upsert: false
                });

            if (uploadError) throw uploadError;

            const { data } = supabase.storage
                .from('projects')
                .getPublicUrl(filePath);

            setFormData(prev => ({ ...prev, [field]: data.publicUrl }));
        } catch (err: any) {
            console.error('Upload error:', err);
            setFeedback({ open: true, type: 'error', message: `Upload failed: ${err.message}` });
        } finally {
            setUploading(false);
        }
    };

    // Gallery Multi-Uploader
    const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;

        setGalleryUploading(true);
        const files = Array.from(e.target.files);

        try {
            const uploadPromises = files.map(async (file) => {
                const fileExt = file.name.split('.').pop();
                const cleanName = file.name.replace(/[^a-zA-Z0-9]/g, '-');
                const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}-${cleanName}.${fileExt}`;
                const filePath = `gallery/${fileName}`;

                const { error: uploadError } = await supabase.storage
                    .from('projects')
                    .upload(filePath, file);

                if (uploadError) throw new Error(`Upload failed for ${file.name}: ${uploadError.message}`);

                const { data } = supabase.storage
                    .from('projects')
                    .getPublicUrl(filePath);

                return data.publicUrl;
            });

            const newUrls = await Promise.all(uploadPromises);

            setFormData(prev => ({
                ...prev,
                gallery_images: [...(prev.gallery_images || []), ...newUrls]
            }));

        } catch (err: any) {
            console.error('Gallery upload error:', err);
            setFeedback({ open: true, type: 'error', message: err.message || 'Gallery upload failed.' });
        } finally {
            setGalleryUploading(false);
        }
    };

    const removeGalleryImage = (indexToRemove: number) => {
        setFormData(prev => ({
            ...prev,
            gallery_images: prev.gallery_images.filter((_, index) => index !== indexToRemove)
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Parse tags
            const tagsArray = tagsInput.split(',').map(t => t.trim()).filter(t => t.length > 0);

            // Clean Payload - Explicitly mapping fields
            // NOTE: updated_at is deliberately excluded to let DB trigger handle it
            const payload: any = {
                title: formData.title || '',
                slug: formData.slug || '',
                description: formData.description || '',
                image_url: formData.image_url || '',
                narrative_image_url: formData.narrative_image_url || null,
                tags: tagsArray,
                location: formData.location || '',
                year: formData.year || new Date().getFullYear().toString(),
                client: formData.client || '',
                status: formData.status || 'In Progress',
                gallery_images: formData.gallery_images || []
            };

            if (formData.id) {
                payload.id = formData.id;
            }

            console.log('Submitting Payload:', payload);

            const { data, error: upsertError } = await supabase
                .from('projects')
                .upsert(payload)
                .select('*') // Select all columns to ensure we get a complete record back
                .single();

            if (upsertError) throw upsertError;

            // If new project, update local ID so subsequent saves are updates
            if (data && !formData.id) {
                setFormData(prev => ({ ...prev, id: data.id }));
            }

            setFeedback({ open: true, type: 'success', message: 'Project Saved Successfully' });
            // We do NOT call onSave() immediately so the editor stays open

        } catch (err: any) {
            console.error('Save error:', err);
            setFeedback({ open: true, type: 'error', message: err.message || 'Database Error' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-[#0a0a0a] min-h-screen w-full flex flex-col animate-in slide-in-from-bottom-10 duration-300">

            {/* Feedback Modal */}
            <Modal
                isOpen={feedback.open}
                onClose={() => setFeedback({ ...feedback, open: false })}
                title={feedback.type === 'success' ? 'Success' : 'Error'}
            >
                <div className="flex flex-col items-center gap-4 text-center">
                    {feedback.type === 'success' ? <CheckCircle className="text-green-500" size={40} /> : <AlertCircle className="text-red-500" size={40} />}
                    <p className="text-white text-lg">{feedback.message}</p>
                    {feedback.type === 'success' && (
                        <button
                            onClick={() => { setFeedback({ ...feedback, open: false }); onSave(); }} // Option to close editor
                            className="mt-2 text-xs text-gray-500 hover:text-white underline"
                        >
                            Close Editor
                        </button>
                    )}
                </div>
            </Modal>

            {/* Header Toolbar */}
            <div className="sticky top-0 z-50 bg-[#0a0a0a]/90 backdrop-blur-md border-b border-white/10 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button
                        onClick={onCancel}
                        className="p-2 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white"
                    >
                        <X size={20} />
                    </button>
                    <div>
                        <h2 className="text-white font-serif text-xl">
                            {formData.id ? 'Edit Project' : 'New Project'}
                        </h2>
                        <p className="text-[10px] text-gray-500 uppercase tracking-widest">
                            {formData.id ? `ID: ${formData.id}` : 'Draft Mode'}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <button
                        onClick={handleSubmit}
                        disabled={loading || uploading || galleryUploading}
                        className="flex items-center gap-2 px-6 py-2 bg-white text-black text-xs font-bold uppercase tracking-widest hover:bg-gray-200 transition-colors disabled:opacity-50"
                    >
                        {loading ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                        <span>Save Project</span>
                    </button>
                </div>
            </div>

            {/* Main Form Content */}
            <div className="flex-1 overflow-y-auto p-6 md:p-12">
                <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12">

                    {/* Left Column: Media & Visuals (4 Cols) */}
                    <div className="lg:col-span-4 space-y-8">

                        {/* Cover Image */}
                        <div className="space-y-2">
                            <label className="block text-[10px] uppercase tracking-widest text-gray-500">Cover Image *</label>
                            <div className="relative aspect-[3/4] bg-zinc-900 border border-white/10 overflow-hidden group flex flex-col items-center justify-center">
                                {formData.image_url ? (
                                    <>
                                        <img src={formData.image_url} alt="Cover" className="w-full h-full object-cover opacity-80" />
                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </>
                                ) : (
                                    <div className="text-gray-600 flex flex-col items-center">
                                        <ImageIcon size={48} className="mb-2" />
                                        <span className="text-[10px] uppercase">No Cover</span>
                                    </div>
                                )}

                                <label className="absolute inset-0 flex items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                    <div className="bg-white text-black px-4 py-2 flex items-center gap-2 text-xs uppercase tracking-widest font-bold hover:bg-gray-200">
                                        {uploading ? <Loader2 className="animate-spin" size={14} /> : <Upload size={14} />}
                                        <span>Upload</span>
                                    </div>
                                    <input type="file" className="hidden" accept="image/*" onChange={(e) => handleSingleImageUpload(e, 'image_url')} disabled={uploading} />
                                </label>
                            </div>
                        </div>

                        {/* Narrative Image */}
                        <div className="space-y-2">
                            <label className="block text-[10px] uppercase tracking-widest text-gray-500">Narrative Image (Detail)</label>
                            <div className="relative aspect-video bg-zinc-900 border border-white/10 overflow-hidden group flex flex-col items-center justify-center">
                                {formData.narrative_image_url ? (
                                    <>
                                        <img src={formData.narrative_image_url} alt="Narrative" className="w-full h-full object-cover opacity-80" />
                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </>
                                ) : (
                                    <div className="text-gray-600 flex flex-col items-center">
                                        <ImageIcon size={32} className="mb-2" />
                                        <span className="text-[10px] uppercase">No Narrative Image</span>
                                    </div>
                                )}

                                <label className="absolute inset-0 flex items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                    <div className="bg-white text-black px-3 py-1.5 flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold hover:bg-gray-200">
                                        <Upload size={12} /> Change
                                    </div>
                                    <input type="file" className="hidden" accept="image/*" onChange={(e) => handleSingleImageUpload(e, 'narrative_image_url')} disabled={uploading} />
                                </label>
                            </div>
                        </div>

                    </div>

                    {/* Right Column: Details & Gallery (8 Cols) */}
                    <div className="lg:col-span-8 space-y-12">

                        {/* Section 1: Core Details */}
                        <section className="space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2 col-span-2">
                                    <label className="text-[10px] uppercase tracking-widest text-gray-500 flex items-center gap-2">
                                        <AlignLeft size={12} /> Title *
                                    </label>
                                    <input
                                        type="text"
                                        name="title"
                                        required
                                        value={formData.title}
                                        onChange={handleInputChange}
                                        className="w-full bg-transparent border-b border-white/20 py-3 text-4xl font-serif text-white focus:border-red-500 outline-none transition-colors placeholder:text-zinc-800"
                                        placeholder="Project Name"
                                    />
                                </div>

                                <div className="space-y-2 col-span-2">
                                    <label className="text-[10px] uppercase tracking-widest text-gray-500">Slug (URL)</label>
                                    <input
                                        type="text"
                                        name="slug"
                                        value={formData.slug}
                                        onChange={handleInputChange}
                                        className="w-full bg-zinc-900/50 border border-white/5 p-3 text-sm font-mono text-gray-400 focus:border-white/20 outline-none"
                                    />
                                </div>

                                <div className="space-y-2 col-span-2">
                                    <label className="text-[10px] uppercase tracking-widest text-gray-500">Narrative Description</label>
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleInputChange}
                                        rows={8}
                                        className="w-full bg-zinc-900/30 border border-white/10 p-4 text-sm text-gray-300 focus:border-white/30 outline-none resize-none leading-relaxed"
                                        placeholder="Describe the architectural narrative..."
                                    />
                                </div>

                                {/* Metadata Grid */}
                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase tracking-widest text-gray-500 flex items-center gap-2"><Tag size={12} /> Tags</label>
                                    <input type="text" value={tagsInput} onChange={(e) => setTagsInput(e.target.value)} className="w-full bg-transparent border-b border-white/20 py-2 text-sm text-white focus:border-red-500 outline-none" placeholder="Modern, Residential..." />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase tracking-widest text-gray-500 flex items-center gap-2"><MapPin size={12} /> Location</label>
                                    <input type="text" name="location" value={formData.location} onChange={handleInputChange} className="w-full bg-transparent border-b border-white/20 py-2 text-sm text-white focus:border-red-500 outline-none" placeholder="New York, NY" />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase tracking-widest text-gray-500 flex items-center gap-2"><User size={12} /> Client</label>
                                    <input type="text" name="client" value={formData.client} onChange={handleInputChange} className="w-full bg-transparent border-b border-white/20 py-2 text-sm text-white focus:border-red-500 outline-none" placeholder="Private Commission" />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase tracking-widest text-gray-500 flex items-center gap-2"><Calendar size={12} /> Year</label>
                                    <input type="text" name="year" value={formData.year} onChange={handleInputChange} className="w-full bg-transparent border-b border-white/20 py-2 text-sm text-white focus:border-red-500 outline-none" />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase tracking-widest text-gray-500 flex items-center gap-2"><Layers size={12} /> Status</label>
                                    <select
                                        name="status"
                                        value={formData.status}
                                        onChange={handleInputChange}
                                        className="w-full bg-zinc-900 border border-white/20 py-2 px-2 text-sm text-white focus:border-red-500 outline-none"
                                    >
                                        <option value="In Progress">In Progress</option>
                                        <option value="Completed">Completed</option>
                                        <option value="Conceptual">Conceptual</option>
                                    </select>
                                </div>
                            </div>
                        </section>

                        {/* Section 2: Visual Documentation (Gallery) */}
                        <section className="border-t border-white/10 pt-12">
                            <div className="flex justify-between items-end mb-6">
                                <div>
                                    <h3 className="text-xl font-serif text-white">Visual Documentation</h3>
                                    <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">
                                        Drag & Drop or Select Multiple Images ({formData.gallery_images?.length || 0})
                                    </p>
                                </div>
                                <label className="cursor-pointer bg-white text-black px-4 py-2 flex items-center gap-2 text-xs uppercase tracking-widest font-bold hover:bg-gray-200">
                                    {galleryUploading ? <Loader2 className="animate-spin" size={14} /> : <Plus size={14} />}
                                    <span>Add Images</span>
                                    <input
                                        type="file"
                                        multiple
                                        className="hidden"
                                        accept="image/*"
                                        onChange={handleGalleryUpload}
                                        disabled={galleryUploading}
                                    />
                                </label>
                            </div>

                            {/* Gallery Grid */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-zinc-900/20 p-4 border border-white/5 min-h-[200px]">
                                {formData.gallery_images && formData.gallery_images.length > 0 ? (
                                    formData.gallery_images.map((img, idx) => (
                                        <div key={idx} className="relative group aspect-square bg-zinc-900 border border-white/5 overflow-hidden">
                                            <img src={img} alt={`Gallery ${idx}`} className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity" />
                                            <button
                                                onClick={() => removeGalleryImage(idx)}
                                                className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all hover:bg-red-700"
                                                title="Remove Image"
                                            >
                                                <Trash2 size={12} />
                                            </button>
                                            <span className="absolute bottom-2 left-2 text-[10px] text-white bg-black/50 px-2 py-0.5 rounded opacity-0 group-hover:opacity-100">
                                                {idx + 1}
                                            </span>
                                        </div>
                                    ))
                                ) : (
                                    <div className="col-span-full flex flex-col items-center justify-center text-gray-600 py-12 border-2 border-dashed border-white/10">
                                        <ImageIcon size={32} className="mb-2 opacity-50" />
                                        <span className="text-xs uppercase tracking-widest opacity-50">Gallery Empty</span>
                                    </div>
                                )}
                            </div>
                        </section>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProjectEditor;