import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useStore } from '../../store/useStore';
import { motion } from 'framer-motion';
import { Save, Plus, Trash2, MapPin, Globe, User, Mail, Phone, Map } from 'lucide-react';

interface Location {
    city: string;
    country: string;
}

const SettingsManager = () => {
    const { settings, fetchSettings } = useStore();
    const [loading, setLoading] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [formData, setFormData] = useState({
        admin_name: '',
        admin_email: '',
        admin_phone: '',
        google_maps_url: '',
    });
    const [locations, setLocations] = useState<Location[]>([]);

    useEffect(() => {
        if (settings) {
            setFormData({
                admin_name: settings.admin_name || '',
                admin_email: settings.admin_email || '',
                admin_phone: settings.admin_phone || '',
                google_maps_url: settings.google_maps_url || '',
            });
            if (settings.global_locations_json) {
                setLocations(settings.global_locations_json);
            }
        }
    }, [settings]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleLocationChange = (index: number, field: keyof Location, value: string) => {
        const newLocations = [...locations];
        newLocations[index][field] = value;
        setLocations(newLocations);
    };

    const addLocation = () => {
        setLocations([...locations, { city: '', country: '' }]);
    };

    const removeLocation = (index: number) => {
        const newLocations = locations.filter((_, i) => i !== index);
        setLocations(newLocations);
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            if (!settings) throw new Error("No settings loaded");

            const { error } = await supabase
                .from('site_settings')
                .update({
                    ...formData,
                    global_locations_json: locations
                })
                .eq('id', settings.id);

            if (error) throw error;

            await fetchSettings(); // Refresh store
            setShowSuccessModal(true);
        } catch (error: any) {
            console.error("Error updating settings:", error);
            alert(`Error: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    if (!settings) return <div>Loading settings...</div>;



    return (
        <div className="bg-zinc-900/30 border border-white/5 p-8 backdrop-blur-md rounded-lg relative">
            {/* Success Modal */}
            {showSuccessModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-zinc-900 border border-white/10 p-8 rounded-xl max-w-sm w-full text-center"
                    >
                        <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6 text-green-500">
                            <Save size={32} />
                        </div>
                        <h3 className="text-xl font-serif text-white mb-2">Settings Saved</h3>
                        <p className="text-gray-400 text-sm mb-8">Your general and contact settings have been successfully updated.</p>
                        <button
                            onClick={() => setShowSuccessModal(false)}
                            className="w-full py-3 bg-white text-black text-xs font-bold uppercase tracking-widest hover:bg-gray-200"
                        >
                            Close
                        </button>
                    </motion.div>
                </div>
            )}

            <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-serif text-white">General & Contact Settings</h2>
                <button
                    onClick={handleSave}
                    disabled={loading}
                    className="px-6 py-3 bg-white text-black text-xs font-bold uppercase tracking-widest hover:bg-gray-200 transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                    <Save size={16} />
                    {loading ? 'Saving...' : 'Save Changes'}
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                <div className="space-y-6">
                    <h3 className="text-xs uppercase tracking-widest text-gray-500 border-b border-white/5 pb-2">Admin Identity</h3>

                    <div className="group space-y-2">
                        <label className="text-[10px] uppercase tracking-widest text-gray-400 flex items-center gap-2 group-focus-within:text-red-400 transition-colors">
                            <div className="p-1.5 bg-white/5 rounded-full group-focus-within:bg-red-500/10 transition-colors">
                                <User size={12} />
                            </div>
                            Admin Name
                        </label>
                        <input
                            type="text"
                            name="admin_name"
                            value={formData.admin_name}
                            onChange={handleChange}
                            className="w-full bg-zinc-900/50 border border-white/10 p-4 text-white text-sm focus:border-red-500/50 focus:ring-1 focus:ring-red-500/20 outline-none transition-all rounded-sm placeholder:text-zinc-700"
                            placeholder="e.g. Faisal Mahmud"
                        />
                    </div>

                    <div className="group space-y-2">
                        <label className="text-[10px] uppercase tracking-widest text-gray-400 flex items-center gap-2 group-focus-within:text-red-400 transition-colors">
                            <div className="p-1.5 bg-white/5 rounded-full group-focus-within:bg-red-500/10 transition-colors">
                                <Mail size={12} />
                            </div>
                            Contact Email
                        </label>
                        <input
                            type="email"
                            name="admin_email"
                            value={formData.admin_email}
                            onChange={handleChange}
                            className="w-full bg-zinc-900/50 border border-white/10 p-4 text-white text-sm focus:border-red-500/50 focus:ring-1 focus:ring-red-500/20 outline-none transition-all rounded-sm placeholder:text-zinc-700"
                            placeholder="admin@example.com"
                        />
                    </div>
                </div>

                <div className="space-y-6">
                    <h3 className="text-xs uppercase tracking-widest text-gray-500 border-b border-white/5 pb-2">Contact Details</h3>

                    <div className="group space-y-2">
                        <label className="text-[10px] uppercase tracking-widest text-gray-400 flex items-center gap-2 group-focus-within:text-red-400 transition-colors">
                            <div className="p-1.5 bg-white/5 rounded-full group-focus-within:bg-red-500/10 transition-colors">
                                <Phone size={12} />
                            </div>
                            Contact Phone
                        </label>
                        <input
                            type="text"
                            name="admin_phone"
                            value={formData.admin_phone}
                            onChange={handleChange}
                            className="w-full bg-zinc-900/50 border border-white/10 p-4 text-white text-sm focus:border-red-500/50 focus:ring-1 focus:ring-red-500/20 outline-none transition-all rounded-sm placeholder:text-zinc-700"
                            placeholder="+1 (555) 000-0000"
                        />
                    </div>

                    <div className="group space-y-2">
                        <label className="text-[10px] uppercase tracking-widest text-gray-400 flex items-center gap-2 group-focus-within:text-red-400 transition-colors">
                            <div className="p-1.5 bg-white/5 rounded-full group-focus-within:bg-red-500/10 transition-colors">
                                <Map size={12} />
                            </div>
                            Google Maps Embed
                        </label>
                        <div className="relative">
                            <input
                                type="text"
                                name="google_maps_url"
                                value={formData.google_maps_url}
                                onChange={handleChange}
                                className="w-full bg-zinc-900/50 border border-white/10 p-4 text-white text-sm focus:border-red-500/50 focus:ring-1 focus:ring-red-500/20 outline-none transition-all rounded-sm placeholder:text-zinc-700 pr-10"
                                placeholder="https://www.google.com/maps/embed?pb=..."
                            />
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600 pointer-events-none">
                                <Globe size={16} />
                            </div>
                        </div>
                        <p className="text-[10px] text-gray-600 pl-1">Paste the 'Embed a map' src URL from Google Maps</p>
                    </div>
                </div>
            </div>

            {/* Global Locations Manager */}
            <div className="mb-8">
                <div className="flex items-center justify-between mb-6 border-b border-white/5 pb-2">
                    <h3 className="text-xs uppercase tracking-widest text-gray-500">Global Locations</h3>
                    <button
                        onClick={addLocation}
                        className="text-[10px] bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded text-white flex items-center gap-1 uppercase tracking-wider transition-colors"
                    >
                        <Plus size={12} /> Add Location
                    </button>
                </div>

                <div className="space-y-4">
                    {locations.map((loc, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="flex items-center gap-4 bg-zinc-900 p-4 border border-white/5"
                        >
                            <div className="bg-white/5 p-2 rounded-full text-gray-400">
                                <Globe size={16} />
                            </div>

                            <div className="flex-1 grid grid-cols-2 gap-4">
                                <input
                                    type="text"
                                    value={loc.city}
                                    onChange={(e) => handleLocationChange(index, 'city', e.target.value)}
                                    placeholder="City (e.g. New York)"
                                    className="bg-transparent border-b border-white/10 py-1 text-white text-sm focus:border-red-500 outline-none"
                                />
                                <input
                                    type="text"
                                    value={loc.country}
                                    onChange={(e) => handleLocationChange(index, 'country', e.target.value)}
                                    placeholder="Country (e.g. USA)"
                                    className="bg-transparent border-b border-white/10 py-1 text-white text-sm focus:border-red-500 outline-none"
                                />
                            </div>

                            <button
                                onClick={() => removeLocation(index)}
                                className="text-gray-500 hover:text-red-500 transition-colors p-2"
                            >
                                <Trash2 size={16} />
                            </button>
                        </motion.div>
                    ))}
                    {locations.length === 0 && (
                        <div className="text-center py-8 text-gray-600 text-xs uppercase tracking-widest">
                            No locations added yet.
                        </div>
                    )}
                </div>
            </div>
        </div >
    );
};

export default SettingsManager;
