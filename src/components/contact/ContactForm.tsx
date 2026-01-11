import React, { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { motion } from 'framer-motion';
import { MapPin, Phone, Mail, Send, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import Modal from '../ui/Modal';

const ContactForm = () => {
   const [formData, setFormData] = useState({
      full_name: '',
      email: '',
      subject: 'Architecture Inquiry',
      message: ''
   });
   const [loading, setLoading] = useState(false);
   const [modalState, setModalState] = useState<{ open: boolean; type: 'success' | 'error'; message: string }>({
      open: false, type: 'success', message: ''
   });

   const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setLoading(true);

      try {
         const { error } = await supabase
            .from('contact_messages')
            .insert([formData]);

         if (error) throw error;

         setModalState({ open: true, type: 'success', message: 'Message sent successfully. We will be in touch shortly.' });
         setFormData({ full_name: '', email: '', subject: 'Architecture Inquiry', message: '' });
      } catch (err: any) {
         setModalState({ open: true, type: 'error', message: err.message || 'Failed to send message.' });
      } finally {
         setLoading(false);
      }
   };

   return (
      <section id="contact" className="min-h-screen bg-[#0a0a0a] border-t border-white/5 relative z-10 flex flex-col md:flex-row">

         <Modal
            isOpen={modalState.open}
            onClose={() => setModalState({ ...modalState, open: false })}
            title={modalState.type === 'success' ? 'Sent' : 'Error'}
         >
            <div className="flex flex-col items-center text-center gap-4">
               {modalState.type === 'success' ? <CheckCircle className="text-green-500" size={48} /> : <AlertCircle className="text-red-500" size={48} />}
               <p className="text-white text-lg">{modalState.message}</p>
            </div>
         </Modal>

         {/* Left: Info Section */}
         <div className="w-full md:w-1/3 bg-zinc-900/30 p-12 md:p-24 flex flex-col justify-between border-r border-white/5">
            <div>
               <h2 className="text-4xl md:text-6xl font-serif text-white uppercase tracking-tighter leading-none mb-8">
                  Get in <br /><span className="text-red-600">Touch</span>
               </h2>
               <p className="text-gray-400 font-light text-sm leading-relaxed max-w-xs">
                  We are currently accepting new projects for Q3 2024. Reach out to discuss your architectural vision.
               </p>
            </div>

            <div className="space-y-8 mt-12 md:mt-0">
               <div className="flex items-start gap-4 group">
                  <div className="p-3 bg-white/5 rounded-full group-hover:bg-red-600 group-hover:text-white transition-colors text-gray-400">
                     <MapPin size={20} />
                  </div>
                  <div>
                     <h4 className="text-xs uppercase tracking-widest text-white mb-1">Studio</h4>
                     <p className="text-gray-500 text-sm">104 Architectural Ave<br />New York, NY 10012</p>
                  </div>
               </div>

               <div className="flex items-start gap-4 group">
                  <div className="p-3 bg-white/5 rounded-full group-hover:bg-red-600 group-hover:text-white transition-colors text-gray-400">
                     <Phone size={20} />
                  </div>
                  <div>
                     <h4 className="text-xs uppercase tracking-widest text-white mb-1">Phone</h4>
                     <p className="text-gray-500 text-sm">+1 (212) 555-0199</p>
                  </div>
               </div>

               <div className="flex items-start gap-4 group">
                  <div className="p-3 bg-white/5 rounded-full group-hover:bg-red-600 group-hover:text-white transition-colors text-gray-400">
                     <Mail size={20} />
                  </div>
                  <div>
                     <h4 className="text-xs uppercase tracking-widest text-white mb-1">Email</h4>
                     <p className="text-gray-500 text-sm">hello@precission.com</p>
                  </div>
               </div>
            </div>
         </div>

         {/* Right: Form Section */}
         <div className="w-full md:w-2/3 p-12 md:p-24 flex items-center">
            <form onSubmit={handleSubmit} className="w-full max-w-2xl space-y-12">

               <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  <div className="group relative">
                     <input
                        type="text"
                        required
                        value={formData.full_name}
                        onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                        className="w-full bg-transparent border-b border-white/20 py-4 text-white text-lg focus:outline-none focus:border-red-600 transition-colors peer placeholder-transparent"
                        placeholder="Full Name"
                        id="name"
                     />
                     <label htmlFor="name" className="absolute left-0 top-4 text-gray-500 text-xs uppercase tracking-widest transition-all peer-focus:-top-4 peer-focus:text-red-500 peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-[&:not(:placeholder-shown)]:-top-4 peer-[&:not(:placeholder-shown)]:text-red-500 pointer-events-none">
                        Full Name
                     </label>
                  </div>

                  <div className="group relative">
                     <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full bg-transparent border-b border-white/20 py-4 text-white text-lg focus:outline-none focus:border-red-600 transition-colors peer placeholder-transparent"
                        placeholder="Email Address"
                        id="email"
                     />
                     <label htmlFor="email" className="absolute left-0 top-4 text-gray-500 text-xs uppercase tracking-widest transition-all peer-focus:-top-4 peer-focus:text-red-500 peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-[&:not(:placeholder-shown)]:-top-4 peer-[&:not(:placeholder-shown)]:text-red-500 pointer-events-none">
                        Email Address
                     </label>
                  </div>
               </div>

               <div className="group relative">
                  <label className="text-xs uppercase tracking-widest text-gray-500 mb-2 block">Subject</label>
                  <select
                     value={formData.subject}
                     onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                     className="w-full bg-transparent border-b border-white/20 py-4 text-white text-lg focus:outline-none focus:border-red-600 transition-colors appearance-none"
                  >
                     <option className="bg-zinc-900" value="Architecture Inquiry">Architecture Inquiry</option>
                     <option className="bg-zinc-900" value="Interior Design">Interior Design</option>
                     <option className="bg-zinc-900" value="Consulting">Consulting</option>
                     <option className="bg-zinc-900" value="Press / Media">Press / Media</option>
                  </select>
               </div>

               <div className="group relative">
                  <textarea
                     required
                     rows={4}
                     value={formData.message}
                     onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                     className="w-full bg-transparent border-b border-white/20 py-4 text-white text-lg focus:outline-none focus:border-red-600 transition-colors resize-none peer placeholder-transparent"
                     placeholder="Message"
                     id="message"
                  />
                  <label htmlFor="message" className="absolute left-0 top-4 text-gray-500 text-xs uppercase tracking-widest transition-all peer-focus:-top-4 peer-focus:text-red-500 peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-[&:not(:placeholder-shown)]:-top-4 peer-[&:not(:placeholder-shown)]:text-red-500 pointer-events-none">
                     Project Details
                  </label>
               </div>

               <button
                  type="submit"
                  disabled={loading}
                  className="group px-10 py-5 bg-white text-black text-xs font-bold uppercase tracking-[0.2em] hover:bg-zinc-200 transition-all flex items-center gap-4 disabled:opacity-50"
               >
                  <span>{loading ? 'Sending...' : 'Send Message'}</span>
                  {loading ? <Loader2 className="animate-spin" size={16} /> : <Send size={16} className="group-hover:translate-x-1 transition-transform" />}
               </button>

            </form>
         </div>
      </section>
   );
};

export default ContactForm;