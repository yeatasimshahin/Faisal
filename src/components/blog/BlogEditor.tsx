import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useStore } from '../../store/useStore';
import { useNavigate } from 'react-router-dom';
import Layout from '../layout/Layout';
import Modal from '../ui/Modal';
import { Upload, Save, Loader2, ArrowLeft, Image as ImageIcon, CheckCircle, AlertCircle } from 'lucide-react';

interface BlogEditorProps {
  initialData?: {
    id: string;
    title: string;
    content: string;
    image_url: string;
  };
  onSuccess?: () => void;
  onCancel?: () => void;
  isEmbedded?: boolean; // If true, removes Layout wrapper
}

const BlogEditor: React.FC<BlogEditorProps> = ({ initialData, onSuccess, onCancel, isEmbedded = false }) => {
  const { user, isLoading: authLoading } = useStore();
  const navigate = useNavigate();

  const [title, setTitle] = useState(initialData?.title || '');
  const [content, setContent] = useState(initialData?.content || '');
  const [imageUrl, setImageUrl] = useState(initialData?.image_url || '');

  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Feedback Modal
  const [modalState, setModalState] = useState<{ open: boolean; type: 'success' | 'error'; message: string }>({
    open: false, type: 'success', message: ''
  });

  // Auth Check
  useEffect(() => {
    if (!authLoading && !user) {
      setModalState({ open: true, type: 'error', message: 'You must be logged in to publish.' });
      setTimeout(() => navigate('/login'), 2000);
    }
  }, [user, authLoading, navigate]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    setUploading(true);
    const file = e.target.files[0];
    const fileExt = file.name.split('.').pop();
    const fileName = `blog-${Date.now()}.${fileExt}`;

    try {
      const { error } = await supabase.storage.from('uploads').upload(fileName, file);
      if (error) throw error;

      const { data } = supabase.storage.from('uploads').getPublicUrl(fileName);
      setImageUrl(data.publicUrl);
    } catch (err: any) {
      setModalState({ open: true, type: 'error', message: 'Upload failed: ' + err.message });
    } finally {
      setUploading(false);
    }
  };

  const handlePublish = async () => {
    if (!title || !content) {
      setModalState({ open: true, type: 'error', message: 'Title and content are required.' });
      return;
    }

    setSaving(true);
    try {
      let error;

      if (initialData?.id) {
        // Update existing
        const { error: updateError } = await supabase.from('blogs')
          .update({ title, content, image_url: imageUrl })
          .eq('id', initialData.id);
        error = updateError;
      } else {
        // Create new
        const { error: insertError } = await supabase.from('blogs').insert({
          title,
          content,
          image_url: imageUrl,
          author_id: user?.id
        });
        error = insertError;
      }

      if (error) throw error;

      setModalState({ open: true, type: 'success', message: initialData ? 'Entry updated.' : 'Entry published.' });

      // Handle post-save actions
      setTimeout(() => {
        if (onSuccess) {
          onSuccess();
        } else {
          navigate('/blog');
        }
      }, 1500);

    } catch (err: any) {
      setModalState({ open: true, type: 'error', message: err.message });
    } finally {
      setSaving(false);
    }
  };

  if (authLoading) return <div className="bg-[#0a0a0a] h-full w-full" />;

  const EditorContent = (
    <div className={`w-full ${isEmbedded ? '' : 'min-h-screen bg-[#0a0a0a] pt-32 pb-12 px-6 md:px-12'}`}>

      <Modal
        isOpen={modalState.open}
        onClose={() => setModalState({ ...modalState, open: false })}
        title={modalState.type === 'success' ? 'Success' : 'Error'}
      >
        <div className="flex flex-col items-center gap-4 text-center">
          {modalState.type === 'success' ? <CheckCircle className="text-green-500" size={48} /> : <AlertCircle className="text-red-500" size={48} />}
          <p className="text-white text-lg">{modalState.message}</p>
        </div>
      </Modal>

      <div className="max-w-5xl mx-auto h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 border-b border-white/10 pb-6 flex-shrink-0">
          <div>
            <button
              onClick={onCancel ? onCancel : () => navigate('/blog')}
              className="text-gray-500 hover:text-white flex items-center gap-2 text-xs uppercase tracking-widest mb-4"
            >
              <ArrowLeft size={14} /> {isEmbedded ? 'Discard Changes' : 'Cancel'}
            </button>
            <h1 className="text-2xl md:text-3xl font-serif text-white">
              {initialData ? 'Edit Entry' : 'New Journal Entry'}
            </h1>
          </div>
          <button
            onClick={handlePublish}
            disabled={saving || uploading}
            className="px-8 py-3 bg-red-600 text-white text-xs font-bold uppercase tracking-widest hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
          >
            {saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
            {initialData ? 'Save Changes' : 'Publish'}
          </button>
        </div>

        <div className="grid gap-8 flex-1 overflow-y-auto">
          {/* Image Uploader */}
          <div className="group relative aspect-video w-full bg-zinc-900 border border-white/10 overflow-hidden flex flex-col items-center justify-center cursor-pointer transition-colors hover:border-white/30 shrink-0">
            {imageUrl ? (
              <img src={imageUrl} className="w-full h-full object-cover opacity-80" alt="Preview" />
            ) : (
              <div className="text-gray-600 flex flex-col items-center">
                <ImageIcon size={48} className="mb-4" />
                <span className="text-xs uppercase tracking-widest">Upload Cover Image</span>
              </div>
            )}

            <label className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="flex items-center gap-2 text-white uppercase text-xs tracking-widest border border-white px-4 py-2 hover:bg-white hover:text-black transition-colors">
                {uploading ? <Loader2 className="animate-spin" size={14} /> : <Upload size={14} />}
                <span>{uploading ? 'Uploading...' : 'Select Image'}</span>
              </div>
              <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={uploading} />
            </label>
          </div>

          {/* Title Input */}
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Entry Title..."
            className="w-full bg-transparent border-b border-white/10 py-4 text-4xl md:text-5xl font-serif text-white placeholder:text-zinc-800 focus:outline-none focus:border-white transition-colors"
          />

          {/* Content Textarea */}
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="Start writing..."
            className="w-full min-h-[400px] bg-transparent border-none text-lg text-gray-300 font-light leading-relaxed resize-none focus:outline-none placeholder:text-zinc-800 pb-20"
          />
        </div>
      </div>
    </div>
  );

  // If embedded (in Admin Modal), render without Layout
  if (isEmbedded) {
    return EditorContent;
  }

  // Otherwise render with Layout
  return <Layout>{EditorContent}</Layout>;
};

export default BlogEditor;