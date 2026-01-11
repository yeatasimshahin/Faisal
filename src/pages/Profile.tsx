import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { supabase } from '../lib/supabaseClient';
import Layout from '../components/layout/Layout';
import MyBookings from '../components/profile/MyBookings';
import { Loader2, Upload, User, Mail, Phone, Save, Camera } from 'lucide-react';
import { motion } from 'framer-motion';

const Profile = () => {
    const { user } = useStore();
    const navigate = useNavigate();

    // Form state
    const [fullName, setFullName] = useState('');
    const [phone, setPhone] = useState('');
    const [avatarUrl, setAvatarUrl] = useState('');

    // UI states
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    // Auth guard and data loading
    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }

        // Load user data
        setFullName(user.full_name || '');
        setPhone(user.phone || '');
        setAvatarUrl(user.avatar_url || '');
        setLoading(false);
    }, [user, navigate]);

    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || !e.target.files[0] || !user) return;

        setUploading(true);
        setMessage(null);
        const file = e.target.files[0];

        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${user.id}-${Date.now()}.${fileExt}`;
            const filePath = `avatars/${fileName}`;

            // Upload to Supabase storage
            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, file, {
                    cacheControl: '3600',
                    upsert: true
                });

            if (uploadError) throw uploadError;

            // Get public URL
            const { data } = supabase.storage
                .from('avatars')
                .getPublicUrl(filePath);

            setAvatarUrl(data.publicUrl);
            setMessage({ type: 'success', text: 'Avatar uploaded successfully' });

        } catch (error: any) {
            console.error('Avatar upload error:', error);
            setMessage({ type: 'error', text: error.message || 'Failed to upload avatar' });
        } finally {
            setUploading(false);
        }
    };

    const handleSaveProfile = async () => {
        if (!user) return;

        setSaving(true);
        setMessage(null);

        try {
            const { error } = await supabase
                .from('profiles')
                .update({
                    full_name: fullName,
                    phone: phone,
                    avatar_url: avatarUrl
                })
                .eq('id', user.id);

            if (error) throw error;

            setMessage({ type: 'success', text: 'Profile updated successfully' });

            // Refresh user data in store
            await useStore.getState().checkUser();

        } catch (error: any) {
            console.error('Profile update error:', error);
            setMessage({ type: 'error', text: error.message || 'Failed to update profile' });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <Layout>
                <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
                    <Loader2 className="animate-spin text-white" size={32} />
                </div>
            </Layout>
        );
    }

    if (!user) return null;

    return (
        <Layout>
            <div className="min-h-screen bg-[#0a0a0a] pt-32 pb-24 px-6 md:px-12">
                <div className="max-w-5xl mx-auto">

                    {/* Header */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-12 border-b border-white/10 pb-8"
                    >
                        <h1 className="text-4xl md:text-6xl font-serif text-white mb-4">My Profile</h1>
                        <p className="text-gray-400 font-light text-sm leading-relaxed max-w-md">
                            Manage your account information and view your booking history.
                        </p>
                    </motion.div>

                    {/* Message Display */}
                    {message && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`mb-8 p-4 border ${message.type === 'success'
                                    ? 'bg-green-500/10 border-green-500/20 text-green-400'
                                    : 'bg-red-500/10 border-red-500/20 text-red-400'
                                } text-xs uppercase tracking-wider`}
                        >
                            {message.text}
                        </motion.div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

                        {/* Left Column - Avatar */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 }}
                            className="space-y-6"
                        >
                            <div className="bg-zinc-900/30 border border-white/5 p-8 backdrop-blur-md">
                                <h3 className="text-xs uppercase tracking-widest text-gray-500 mb-6">Profile Picture</h3>

                                <div className="relative w-48 h-48 mx-auto mb-6 group">
                                    {avatarUrl ? (
                                        <img
                                            src={avatarUrl}
                                            alt="Profile"
                                            className="w-full h-full object-cover rounded-full border-2 border-white/10"
                                        />
                                    ) : (
                                        <div className="w-full h-full rounded-full bg-zinc-800 border-2 border-white/10 flex items-center justify-center">
                                            <User size={64} className="text-gray-600" />
                                        </div>
                                    )}

                                    {/* Upload Overlay */}
                                    <label className="absolute inset-0 rounded-full bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer flex items-center justify-center">
                                        <div className="text-center">
                                            {uploading ? (
                                                <Loader2 className="animate-spin text-white mx-auto" size={24} />
                                            ) : (
                                                <>
                                                    <Camera size={24} className="text-white mx-auto mb-2" />
                                                    <span className="text-xs uppercase tracking-widest text-white">Change</span>
                                                </>
                                            )}
                                        </div>
                                        <input
                                            type="file"
                                            className="hidden"
                                            accept="image/*"
                                            onChange={handleAvatarUpload}
                                            disabled={uploading}
                                        />
                                    </label>
                                </div>

                                <p className="text-[10px] text-gray-500 text-center uppercase tracking-widest">
                                    Click to upload new photo
                                </p>
                            </div>
                        </motion.div>

                        {/* Right Column - User Information */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                            className="lg:col-span-2 space-y-8"
                        >
                            <div className="bg-zinc-900/30 border border-white/5 p-8 backdrop-blur-md">
                                <h3 className="text-xs uppercase tracking-widest text-gray-500 mb-8">Account Information</h3>

                                <div className="space-y-6">
                                    {/* Full Name */}
                                    <div className="space-y-2">
                                        <label className="text-[10px] uppercase tracking-widest text-gray-500 flex items-center gap-2">
                                            <User size={12} /> Full Name
                                        </label>
                                        <input
                                            type="text"
                                            value={fullName}
                                            onChange={(e) => setFullName(e.target.value)}
                                            className="w-full bg-transparent border-b border-white/20 py-3 text-white focus:border-red-500 outline-none transition-colors"
                                            placeholder="Your full name"
                                        />
                                    </div>

                                    {/* Email (Read-only) */}
                                    <div className="space-y-2 opacity-50">
                                        <label className="text-[10px] uppercase tracking-widest text-gray-500 flex items-center gap-2">
                                            <Mail size={12} /> Email Address
                                        </label>
                                        <input
                                            type="email"
                                            value={user.email || ''}
                                            disabled
                                            className="w-full bg-zinc-900/50 border-b border-white/10 py-3 text-gray-400 outline-none cursor-not-allowed"
                                        />
                                        <p className="text-[10px] text-gray-600 italic">Email cannot be changed</p>
                                    </div>

                                    {/* Phone */}
                                    <div className="space-y-2">
                                        <label className="text-[10px] uppercase tracking-widest text-gray-500 flex items-center gap-2">
                                            <Phone size={12} /> Phone Number
                                        </label>
                                        <input
                                            type="tel"
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value)}
                                            className="w-full bg-transparent border-b border-white/20 py-3 text-white focus:border-red-500 outline-none transition-colors"
                                            placeholder="+1 (555) 000-0000"
                                        />
                                    </div>
                                </div>

                                {/* Save Button */}
                                <button
                                    onClick={handleSaveProfile}
                                    disabled={saving}
                                    className="w-full mt-8 py-4 bg-white text-black text-xs font-bold uppercase tracking-[0.2em] hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    {saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                                    <span>Save Changes</span>
                                </button>
                            </div>
                        </motion.div>
                    </div>

                    {/* My Bookings Section */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="mt-16"
                    >
                        <MyBookings userId={user.id} />
                    </motion.div>

                </div>
            </div>
        </Layout>
    );
};

export default Profile;
