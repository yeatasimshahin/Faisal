import React, { useEffect } from 'react';
import Navbar from './Navbar';
import SmoothScroll from './SmoothScroll';
import { useStore } from '../../store/useStore';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { fetchSettings, checkUser } = useStore();

  useEffect(() => {
    // Initialize app data on mount
    const init = async () => {
      await Promise.all([fetchSettings(), checkUser()]);
    };
    init();
  }, [fetchSettings, checkUser]);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans selection:bg-white selection:text-black">
      <Navbar />
      <SmoothScroll>
        <main className="relative flex flex-col w-full">
          {children}
        </main>
      </SmoothScroll>

      {/* Footer Placeholder */}
      <footer className="w-full py-12 border-t border-white/10 mt-auto bg-black">
        <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-center md:text-left">
            <h4 className="text-white font-serif text-lg mb-2">Precission Architecture</h4>
            <p className="text-gray-500 text-xs uppercase tracking-widest">
              &copy; {new Date().getFullYear()} All Rights Reserved.
            </p>
          </div>

          <div className="flex flex-col items-center md:items-end gap-2">
            <span className="text-gray-500 text-xs uppercase tracking-widest">Stay Connected</span>
            <a href="/subscribe" className="text-white hover:text-red-500 transition-colors text-sm border-b border-white/20 pb-0.5 hover:border-red-500">
              Join Our Inner Circle
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
