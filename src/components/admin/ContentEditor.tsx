import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useStore } from '../../store/useStore';
import { Save, Loader2, Upload, Image as ImageIcon, CheckCircle, LayoutTemplate, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ContentEditor = () => {
  const { settings, fetchSettings } = useStore();
  const [activeTab, setActiveTab] = useState<'home' | 'about'>('home');

  const [formData, setFormData] = useState({
    hero_title: '',
    hero_subtitle: '',
    marquee_text: '',
    hero_image_url: '',
    navbar_text: '',
    // About Page
    about_hero_title: '',
    about_hero_description: '',
    about_approach_title: '',
    about_approach_headline: '',
    about_approach_text_1: '',
    about_approach_text_2: '',
    about_image_url: ''
  });

  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  useEffect(() => {
    if (settings) {
      setFormData({
        hero_title: settings.hero_title || '',
        hero_subtitle: settings.hero_subtitle || '',
        marquee_text: settings.marquee_text || '',
        hero_image_url: settings.hero_image_url || '',
        navbar_text: settings.navbar_text || '',
        about_hero_title: settings.about_hero_title || '',
        about_hero_description: settings.about_hero_description || '',
        about_approach_title: settings.about_approach_title || '',
        about_approach_headline: settings.about_approach_headline || '',
        about_approach_text_1: settings.about_approach_text_1 || '',
        about_approach_text_2: settings.about_approach_text_2 || '',
        about_image_url: settings.about_image_url || ''
      });
    }
  }, [settings]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const idToUpdate = settings?.id || '1';
      const { error } = await supabase
        .from('site_settings')
        .update(formData) // Save all fields
        .eq('id', idToUpdate);

      if (error) throw error;
      await fetchSettings();
      setShowSuccessModal(true);
    } catch (error: any) {
      console.error('Error updating settings:', error);
      alert(`Failed to save changes: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'hero_image_url' | 'about_image_url') => {
    if (!e.target.files || e.target.files.length === 0) return;
    setUploading(true);
    const file = e.target.files[0];
    const fileExt = file.name.split('.').pop();
    const fileName = `${field}-${Date.now()}.${fileExt}`;

    try {
      const { error: uploadError } = await supabase.storage.from('uploads').upload(fileName, file, { cacheControl: '3600', upsert: false });
      if (uploadError) throw uploadError;
      const { data: urlData } = supabase.storage.from('uploads').getPublicUrl(fileName);
      setFormData(prev => ({ ...prev, [field]: urlData.publicUrl }));
    } catch (error: any) {
      console.error('Upload failed:', error);
      alert('Upload failed: ' + (error.message || 'Unknown error'));
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 animate-in fade-in duration-500 relative">
      <AnimatePresence>
        {showSuccessModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-zinc-900 border border-white/10 p-8 rounded-xl max-w-sm w-full text-center shadow-2xl">
              <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6 text-green-500"><CheckCircle size={32} /></div>
              <h3 className="text-xl font-serif text-white mb-2">Changes Saved</h3>
              <p className="text-gray-400 text-sm mb-8">The site content has been successfully updated.</p>
              <button onClick={() => setShowSuccessModal(false)} className="w-full py-3 bg-white text-black text-xs font-bold uppercase tracking-widest hover:bg-gray-200 transition-colors">Continue Editing</button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="space-y-8 bg-zinc-900/30 p-8 border border-white/5 backdrop-blur-md h-fit w-full max-w-2xl mx-auto">
        <div className="flex gap-4 border-b border-white/10 pb-4">
          <button onClick={() => setActiveTab('home')} className={`flex items-center gap-2 pb-2 text-xs uppercase tracking-widest transition-colors ${activeTab === 'home' ? 'text-red-500 border-b border-red-500' : 'text-gray-500 hover:text-white'}`}><LayoutTemplate size={14} /> Home Page</button>
          <button onClick={() => setActiveTab('about')} className={`flex items-center gap-2 pb-2 text-xs uppercase tracking-widest transition-colors ${activeTab === 'about' ? 'text-red-500 border-b border-red-500' : 'text-gray-500 hover:text-white'}`}><Info size={14} /> About Page</button>
        </div>

        {activeTab === 'home' ? (
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-gray-500">Main Title</label>
              <input value={formData.hero_title} onChange={e => setFormData({ ...formData, hero_title: e.target.value })} className="w-full bg-transparent border-b border-white/20 py-2 text-xl font-serif text-white focus:outline-none focus:border-red-500 transition-colors placeholder:text-zinc-800" placeholder="PRECISSION" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-gray-500">Subtitle</label>
              <input value={formData.hero_subtitle} onChange={e => setFormData({ ...formData, hero_subtitle: e.target.value })} className="w-full bg-transparent border-b border-white/20 py-2 text-sm text-gray-300 focus:outline-none focus:border-red-500 transition-colors" placeholder="Architectural Visualization" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-gray-500">Marquee Text</label>
              <textarea value={formData.marquee_text} onChange={e => setFormData({ ...formData, marquee_text: e.target.value })} rows={4} className="w-full bg-black/20 border border-white/10 p-4 text-sm text-gray-300 focus:outline-none focus:border-white/40 transition-colors font-mono resize-none" placeholder="Enter scrolling text..." />
            </div>
            <div className="space-y-4 pt-4 border-t border-white/5">
              <label className="text-[10px] uppercase tracking-widest text-gray-500 block">Hero Background Image</label>
              <label className="flex items-center justify-center gap-2 w-full py-3 bg-white/5 border border-white/10 text-xs uppercase tracking-widest text-gray-400 hover:bg-white/10 cursor-pointer transition-all">
                {uploading ? <Loader2 className="animate-spin" size={16} /> : <Upload size={16} />}
                <span>{uploading ? 'Uploading...' : 'Upload New Image'}</span>
                <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'hero_image_url')} disabled={uploading} />
              </label>
              <input value={formData.hero_image_url} onChange={e => setFormData({ ...formData, hero_image_url: e.target.value })} className="w-full bg-transparent border-b border-white/20 py-2 text-[10px] font-mono text-gray-500 focus:outline-none focus:border-white focus:text-white transition-colors" placeholder="Or paste direct URL..." />
            </div>
            <div className="space-y-4 pt-4 border-t border-white/5">
              <label className="text-[10px] uppercase tracking-widest text-gray-500">Brand Name (Navbar)</label>
              <input value={formData.navbar_text} onChange={e => setFormData({ ...formData, navbar_text: e.target.value })} className="w-full bg-transparent border-b border-white/20 py-2 text-xl font-serif text-white focus:outline-none focus:border-red-500 transition-colors placeholder:text-zinc-800" placeholder="PRECISSION" />
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-gray-500">About Hero Title</label>
              <input value={formData.about_hero_title} onChange={e => setFormData({ ...formData, about_hero_title: e.target.value })} className="w-full bg-transparent border-b border-white/20 py-2 text-xl font-serif text-white focus:outline-none focus:border-red-500 transition-colors" placeholder="Our Philosophy" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-gray-500">About Hero Description</label>
              <textarea value={formData.about_hero_description} onChange={e => setFormData({ ...formData, about_hero_description: e.target.value })} rows={3} className="w-full bg-black/20 border border-white/10 p-4 text-sm text-gray-300 focus:outline-none focus:border-white/40 transition-colors resize-none" placeholder="Description..." />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-gray-500">Approach Title (Small)</label>
              <input value={formData.about_approach_title} onChange={e => setFormData({ ...formData, about_approach_title: e.target.value })} className="w-full bg-transparent border-b border-white/20 py-2 text-sm text-gray-300 focus:outline-none focus:border-red-500 transition-colors" placeholder="The Approach" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-gray-500">Approach Headline (Large)</label>
              <input value={formData.about_approach_headline} onChange={e => setFormData({ ...formData, about_approach_headline: e.target.value })} className="w-full bg-transparent border-b border-white/20 py-2 text-lg text-white focus:outline-none focus:border-red-500 transition-colors" placeholder="Precision in every detail..." />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-gray-500">Approach Text Paragraph 1</label>
              <textarea value={formData.about_approach_text_1} onChange={e => setFormData({ ...formData, about_approach_text_1: e.target.value })} rows={4} className="w-full bg-black/20 border border-white/10 p-4 text-sm text-gray-300 focus:outline-none focus:border-white/40 transition-colors resize-none" placeholder="Paragraph 1..." />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-gray-500">Approach Text Paragraph 2</label>
              <textarea value={formData.about_approach_text_2} onChange={e => setFormData({ ...formData, about_approach_text_2: e.target.value })} rows={4} className="w-full bg-black/20 border border-white/10 p-4 text-sm text-gray-300 focus:outline-none focus:border-white/40 transition-colors resize-none" placeholder="Paragraph 2..." />
            </div>
            <div className="space-y-4 pt-4 border-t border-white/5">
              <label className="text-[10px] uppercase tracking-widest text-gray-500 block">Approach Image</label>
              <label className="flex items-center justify-center gap-2 w-full py-3 bg-white/5 border border-white/10 text-xs uppercase tracking-widest text-gray-400 hover:bg-white/10 cursor-pointer transition-all">
                {uploading ? <Loader2 className="animate-spin" size={16} /> : <Upload size={16} />}
                <span>{uploading ? 'Uploading...' : 'Upload New Image'}</span>
                <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'about_image_url')} disabled={uploading} />
              </label>
              <input value={formData.about_image_url} onChange={e => setFormData({ ...formData, about_image_url: e.target.value })} className="w-full bg-transparent border-b border-white/20 py-2 text-[10px] font-mono text-gray-500 focus:outline-none focus:border-white focus:text-white transition-colors" placeholder="Or paste direct URL..." />
            </div>
          </div>
        )}

        <button onClick={handleSave} disabled={saving} className="w-full py-4 mt-4 bg-white text-black text-xs font-bold uppercase tracking-[0.2em] hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2 disabled:opacity-50">
          {saving ? <Loader2 className="animate-spin" size={16} /> : <><Save size={16} /> Save Changes</>}
        </button>
      </div>

      <div className="space-y-4">
        <h4 className="text-[10px] uppercase tracking-widest text-gray-500 mb-4">Preview ({activeTab === 'home' ? 'Hero' : 'About Hero'})</h4>
        <div className="relative aspect-[9/16] md:aspect-video w-full bg-black border border-white/10 overflow-hidden group">
          {activeTab === 'home' ? (
            <>
              {formData.hero_image_url ? <img src={formData.hero_image_url} className="w-full h-full object-cover opacity-60" alt="Preview" /> : <div className="w-full h-full flex flex-col items-center justify-center text-gray-700"><ImageIcon size={48} /><span className="text-xs">No Image</span></div>}
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                <h1 className="text-3xl font-serif text-white uppercase mix-blend-overlay">{formData.hero_title}</h1>
                <p className="text-xs uppercase text-white mt-2">{formData.hero_subtitle}</p>
              </div>
            </>
          ) : (
            <>
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-zinc-900 via-black to-black opacity-50" />
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center z-10">
                <h1 className="text-3xl font-serif text-white">{formData.about_hero_title}</h1>
                <p className="text-sm text-gray-300 mt-2 max-w-sm line-clamp-3">{formData.about_hero_description}</p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
export default ContentEditor;