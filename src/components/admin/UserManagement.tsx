import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Trash2, Shield, User, Search, Loader2, Edit2, CheckCircle, AlertCircle } from 'lucide-react';
import Modal from '../ui/Modal';

interface Profile {
  id: string;
  email: string | null;
  full_name: string | null;
  role: 'admin' | 'user';
  created_at: string;
}

const UserManagement = () => {
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Modals
  const [editingUser, setEditingUser] = useState<Profile | null>(null);
  const [deletingUser, setDeletingUser] = useState<Profile | null>(null);
  const [feedback, setFeedback] = useState<{ open: boolean; type: 'success' | 'error'; message: string }>({
    open: false, type: 'success', message: ''
  });

  const fetchUsers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setUsers(data as Profile[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: editingUser.full_name,
        role: editingUser.role,
        email: editingUser.email
      })
      .eq('id', editingUser.id);

    if (error) {
      setFeedback({ open: true, type: 'error', message: error.message });
    } else {
      setUsers(users.map(u => u.id === editingUser.id ? editingUser : u));
      setEditingUser(null);
      setFeedback({ open: true, type: 'success', message: 'User profile updated.' });
    }
  };

  const confirmDelete = async () => {
    if (!deletingUser) return;

    const { error } = await supabase.from('profiles').delete().eq('id', deletingUser.id);

    if (error) {
      setFeedback({ open: true, type: 'error', message: 'Failed to delete user: ' + error.message });
    } else {
      setUsers(users.filter(u => u.id !== deletingUser.id));
      setFeedback({ open: true, type: 'success', message: 'User permanently deleted.' });
    }
    setDeletingUser(null);
  };

  const filteredUsers = users.filter(u =>
    (u.full_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (u.email?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    u.id.includes(searchTerm)
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">

      {/* Feedback Modal */}
      <Modal isOpen={feedback.open} onClose={() => setFeedback({ ...feedback, open: false })} title={feedback.type === 'success' ? 'Success' : 'Error'}>
        <div className="flex flex-col items-center gap-4 text-center">
          {feedback.type === 'success' ? <CheckCircle className="text-green-500" size={40} /> : <AlertCircle className="text-red-500" size={40} />}
          <p className="text-white text-lg">{feedback.message}</p>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={!!deletingUser} onClose={() => setDeletingUser(null)} title="Confirm Deletion">
        <div className="text-center space-y-6">
          <p className="text-gray-300">
            Are you sure you want to delete <strong className="text-white">{deletingUser?.full_name || deletingUser?.email}</strong>?<br />
            This action cannot be undone.
          </p>
          <div className="flex gap-4 justify-center">
            <button onClick={() => setDeletingUser(null)} className="px-6 py-2 border border-white/20 text-white hover:bg-white/10 uppercase text-xs tracking-widest">Cancel</button>
            <button onClick={confirmDelete} className="px-6 py-2 bg-red-600 text-white hover:bg-red-700 uppercase text-xs tracking-widest font-bold">Delete User</button>
          </div>
        </div>
      </Modal>

      {/* Edit User Modal (CRM) */}
      <Modal isOpen={!!editingUser} onClose={() => setEditingUser(null)} title="User CRM Profile">
        {editingUser && (
          <form onSubmit={handleUpdateUser} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-gray-500">Full Name</label>
              <input
                value={editingUser.full_name || ''}
                onChange={e => setEditingUser({ ...editingUser, full_name: e.target.value })}
                className="w-full bg-black border border-white/10 p-3 text-white focus:border-white/50 outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-gray-500">Email Address (Profile Record)</label>
              <input
                value={editingUser.email || ''}
                onChange={e => setEditingUser({ ...editingUser, email: e.target.value })}
                className="w-full bg-black border border-white/10 p-3 text-white focus:border-white/50 outline-none"
              />
              <p className="text-[10px] text-yellow-500/80">Note: Updating this does not change their login credentials, only the profile display.</p>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-gray-500">System Role</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="role" checked={editingUser.role === 'user'} onChange={() => setEditingUser({ ...editingUser, role: 'user' })} className="accent-white" />
                  <span className="text-sm">User</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="role" checked={editingUser.role === 'admin'} onChange={() => setEditingUser({ ...editingUser, role: 'admin' })} className="accent-red-500" />
                  <span className="text-sm text-red-500">Administrator</span>
                </label>
              </div>
            </div>

            <div className="pt-4 border-t border-white/10 flex justify-end gap-4">
              <button type="button" onClick={() => setEditingUser(null)} className="text-xs uppercase tracking-widest text-gray-500 hover:text-white">Cancel</button>
              <button type="submit" className="px-6 py-2 bg-white text-black uppercase text-xs font-bold tracking-widest hover:bg-gray-200">Save Changes</button>
            </div>
          </form>
        )}
      </Modal>

      {/* Controls */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-zinc-900/30 p-6 border border-white/5 backdrop-blur-md">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
          <input
            type="text"
            placeholder="Search by name, email or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-black/50 border border-white/10 pl-10 pr-4 py-3 text-sm text-white focus:border-white/50 outline-none transition-colors"
          />
        </div>
        <div className="flex items-center gap-4 text-xs uppercase tracking-widest text-gray-400">
          <span>Total Users: <b className="text-white">{users.length}</b></span>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto border border-white/5 bg-black/20">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-white/5 text-[10px] uppercase tracking-widest text-gray-400">
              <th className="py-4 px-6 font-normal">User Details</th>
              <th className="py-4 px-6 font-normal">Role Status</th>
              <th className="py-4 px-6 font-normal">Joined</th>
              <th className="py-4 px-6 font-normal text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-sm">
            {loading ? (
              <tr>
                <td colSpan={4} className="py-8 text-center text-gray-500">
                  <Loader2 className="animate-spin mx-auto mb-2" /> Loading Database...
                </td>
              </tr>
            ) : filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-8 text-center text-gray-500 italic">No users found.</td>
              </tr>
            ) : (
              filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-white/5 transition-colors group">
                  <td className="py-4 px-6">
                    <div className="flex flex-col cursor-pointer" onClick={() => setEditingUser(user)}>
                      <span className="font-medium text-white group-hover:text-red-500 transition-colors flex items-center gap-2">
                        {user.full_name || 'Anonymous User'}
                        <Edit2 size={10} className="opacity-0 group-hover:opacity-100" />
                      </span>
                      <span className="text-xs text-gray-500 font-mono">{user.email || 'No Email'}</span>
                      <span className="text-[10px] text-gray-700 font-mono mt-1">ID: {user.id}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex items-center gap-2 px-3 py-1.5 border rounded-full text-[10px] uppercase tracking-wider ${user.role === 'admin'
                        ? 'border-red-500/50 text-red-500 bg-red-500/10'
                        : 'border-white/20 text-gray-400'
                      }`}>
                      {user.role === 'admin' ? <Shield size={12} /> : <User size={12} />}
                      {user.role}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-xs text-gray-500">
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setEditingUser(user)}
                        className="p-2 text-gray-600 hover:text-white transition-colors"
                        title="Edit Profile"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => setDeletingUser(user)}
                        className="p-2 text-gray-600 hover:text-red-500 transition-colors"
                        title="Delete User"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserManagement;