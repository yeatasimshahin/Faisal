import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Mail, Trash2, MailOpen, Loader2, RefreshCw } from 'lucide-react';
import Modal from '../ui/Modal';

interface Message {
   id: string;
   full_name: string;
   email: string;
   subject: string;
   message: string;
   is_read: boolean;
   created_at: string;
}

const MessageCenter = () => {
   const [messages, setMessages] = useState<Message[]>([]);
   const [loading, setLoading] = useState(true);
   const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);

   const fetchMessages = async () => {
      setLoading(true);
      const { data } = await supabase
         .from('contact_messages')
         .select('*')
         .order('created_at', { ascending: false });

      if (data) setMessages(data);
      setLoading(false);
   };

   useEffect(() => {
      fetchMessages();
   }, []);

   const handleDelete = async (e: React.MouseEvent, id: string) => {
      e.stopPropagation();
      if (!confirm('Delete this message?')) return;

      await supabase.from('contact_messages').delete().eq('id', id);
      setMessages(prev => prev.filter(m => m.id !== id));
      if (selectedMessage?.id === id) setSelectedMessage(null);
   };

   const openMessage = async (msg: Message) => {
      setSelectedMessage(msg);
      if (!msg.is_read) {
         // Mark as read in DB
         await supabase.from('contact_messages').update({ is_read: true }).eq('id', msg.id);
         // Update local state
         setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, is_read: true } : m));
      }
   };

   return (
      <div className="animate-in fade-in duration-500 h-[600px] flex gap-6">

         {/* List Column */}
         <div className="w-1/3 bg-zinc-900/30 border border-white/5 flex flex-col">
            <div className="p-4 border-b border-white/5 flex justify-between items-center bg-zinc-900/50">
               <h3 className="text-xs font-bold uppercase tracking-widest text-white">Inbox</h3>
               <button onClick={fetchMessages} className="text-gray-500 hover:text-white"><RefreshCw size={14} /></button>
            </div>

            <div className="flex-1 overflow-y-auto">
               {loading ? (
                  <div className="flex justify-center py-8"><Loader2 className="animate-spin text-gray-500" /></div>
               ) : messages.length === 0 ? (
                  <div className="p-8 text-center text-gray-500 text-sm">No messages.</div>
               ) : (
                  messages.map(msg => (
                     <div
                        key={msg.id}
                        onClick={() => openMessage(msg)}
                        className={`p-4 border-b border-white/5 cursor-pointer hover:bg-white/5 transition-colors group relative ${selectedMessage?.id === msg.id ? 'bg-white/10' : ''}`}
                     >
                        {!msg.is_read && (
                           <div className="absolute top-4 right-4 w-2 h-2 bg-red-600 rounded-full shadow-[0_0_10px_rgba(220,38,38,0.5)]" />
                        )}
                        <h4 className={`text-sm mb-1 ${!msg.is_read ? 'text-white font-bold' : 'text-gray-400'}`}>
                           {msg.full_name}
                        </h4>
                        <p className="text-xs text-gray-500 truncate mb-2">{msg.subject}</p>
                        <div className="flex justify-between items-center">
                           <span className="text-[10px] text-gray-600 uppercase">{new Date(msg.created_at).toLocaleDateString()}</span>
                           <button onClick={(e) => handleDelete(e, msg.id)} className="text-gray-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Trash2 size={12} />
                           </button>
                        </div>
                     </div>
                  ))
               )}
            </div>
         </div>

         {/* Detail View */}
         <div className="flex-1 bg-zinc-900/30 border border-white/5 p-8 relative">
            {selectedMessage ? (
               <div className="h-full flex flex-col animate-in fade-in">
                  <div className="mb-8 pb-8 border-b border-white/5">
                     <div className="flex justify-between items-start mb-4">
                        <h2 className="text-2xl font-serif text-white">{selectedMessage.subject}</h2>
                        <span className="text-xs text-gray-500 uppercase tracking-widest">{new Date(selectedMessage.created_at).toLocaleString()}</span>
                     </div>

                     <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white font-bold">
                           {selectedMessage.full_name.charAt(0)}
                        </div>
                        <div>
                           <p className="text-sm text-white font-bold">{selectedMessage.full_name}</p>
                           <p className="text-xs text-gray-500">{selectedMessage.email}</p>
                        </div>
                     </div>
                  </div>

                  <div className="flex-1 overflow-y-auto prose prose-invert max-w-none text-gray-300 font-light">
                     {selectedMessage.message}
                  </div>

                  <div className="mt-8 pt-4 border-t border-white/5 flex justify-end gap-4">
                     <a href={`mailto:${selectedMessage.email}`} className="px-6 py-2 bg-white text-black text-xs font-bold uppercase tracking-widest hover:bg-gray-200">
                        Reply via Email
                     </a>
                  </div>
               </div>
            ) : (
               <div className="h-full flex flex-col items-center justify-center text-gray-600">
                  <MailOpen size={48} className="mb-4 opacity-50" />
                  <p className="uppercase tracking-widest text-xs">Select a message to read</p>
               </div>
            )}
         </div>

      </div>
   );
};

export default MessageCenter;