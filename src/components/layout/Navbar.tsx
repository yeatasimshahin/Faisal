import { useState, useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, User, ExternalLink, LogOut, ShieldCheck } from 'lucide-react';

const Navbar = () => {
  const { user, isAdmin, signOut } = useStore();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Journal', path: '/journal' },
    { name: 'Projects', path: '/projects' },
    { name: 'About', path: '/about' },
    { name: 'Contact', path: '/contact' },
  ];

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${mobileMenuOpen
        ? 'bg-neutral-900 border-b border-white/5'
        : scrolled
          ? 'bg-black/80 backdrop-blur-md border-b border-white/5'
          : 'bg-transparent'
        }`}
    >
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">

        {/* Logo */}
        <NavLink to="/" className="text-2xl font-serif text-white tracking-widest z-50">
          {useStore.getState().settings?.navbar_text || 'PRECISSION'}
        </NavLink>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <NavLink
              key={link.name}
              to={link.path}
              className={({ isActive }) => `relative text-xs uppercase tracking-[0.2em] transition-colors duration-300 ${isActive
                ? 'text-white'
                : 'text-gray-400 hover:text-white'
                }`}
            >
              {link.name}
              {/* Gold Underline for Active State */}
              {location.pathname === link.path && (
                <motion.div
                  layoutId="underline"
                  className="absolute -bottom-2 left-0 w-full h-[1px] bg-yellow-600"
                />
              )}
            </NavLink>
          ))}
        </div>

        {/* Desktop Auth & Actions */}
        <div className="hidden md:flex items-center gap-6">
          {user ? (
            <div className="flex items-center gap-4">
              {isAdmin && (
                <NavLink
                  to="/admin"
                  title="Admin Dashboard"
                  className="text-gray-400 hover:text-red-500 transition-colors"
                >
                  <ShieldCheck size={18} />
                </NavLink>
              )}

              <NavLink
                to="/profile"
                className="text-gray-400 hover:text-white transition-colors flex items-center gap-2 text-xs uppercase tracking-widest"
              >
                <User size={16} />
                <span className="hidden lg:inline">Profile</span>
              </NavLink>

              <button
                onClick={handleLogout}
                className="text-gray-400 hover:text-white transition-colors"
                title="Logout"
              >
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <NavLink
              to="/login"
              className="text-xs uppercase tracking-widest text-white hover:text-gray-300 transition-colors"
            >
              Login
            </NavLink>
          )}

          <NavLink
            to="/book-now"
            className="px-6 py-2 bg-white text-black text-xs font-bold uppercase tracking-widest hover:bg-gray-200 transition-colors"
          >
            Book Now
          </NavLink>
        </div>

        {/* Mobile Menu Toggle - Z-Index boosted to sit above overlay */}
        <button
          className="md:hidden text-white z-[51] relative group"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="fixed inset-0 bg-[#050505]/90 backdrop-blur-xl z-50 flex flex-col items-center justify-center md:hidden"
          >
            {/* Decorative Background Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute top-0 left-1/4 w-[1px] h-full bg-white/5" />
              <div className="absolute top-0 right-1/4 w-[1px] h-full bg-white/5" />
            </div>

            <motion.div
              className="flex flex-col items-center space-y-6 relative z-10 w-full"
              initial="hidden"
              animate="visible"
              exit="hidden"
              variants={{
                visible: { transition: { staggerChildren: 0.15, delayChildren: 0.1 } },
                hidden: {}
              }}
            >
              {[
                { name: 'Home', path: '/' },
                { name: 'Projects', path: '/projects' },
                { name: 'Journal', path: '/journal' },
                { name: 'About', path: '/about' },
                { name: 'Contact', path: '/contact' }
              ].map((link) => (
                <motion.div
                  key={link.name}
                  variants={{
                    hidden: { opacity: 0, y: 30, filter: 'blur(10px)' },
                    visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } }
                  }}
                >
                  <NavLink
                    to={link.path}
                    className={({ isActive }) => `text-2xl font-serif uppercase tracking-[0.2em] transition-all duration-500 ${isActive ? 'text-white scale-105' : 'text-zinc-500 hover:text-white hover:scale-105'
                      }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {link.name}
                  </NavLink>
                </motion.div>
              ))}

              {/* Book Now - Special Styling */}
              <motion.div
                variants={{
                  hidden: { opacity: 0, y: 30, filter: 'blur(10px)' },
                  visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } }
                }}
                className="pt-4"
              >
                <NavLink
                  to="/book-now"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-xl font-serif text-white uppercase tracking-[0.2em] flex items-center gap-3 hover:text-red-500 transition-colors"
                >
                  Book Now <span className="text-red-500 text-sm">●</span>
                </NavLink>
              </motion.div>


              <motion.div
                variants={{ hidden: { opacity: 0, scaleX: 0 }, visible: { opacity: 1, scaleX: 1, transition: { duration: 0.8 } } }}
                className="h-[1px] w-12 bg-white/10 my-6"
              />

              <motion.div
                variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { delay: 0.5 } } }}
                className="flex flex-col items-center gap-4"
              >
                {user ? (
                  <>
                    <NavLink
                      to="/profile"
                      className="text-[10px] text-zinc-400 hover:text-white uppercase tracking-widest flex items-center gap-2 transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <User size={12} /> My Profile
                    </NavLink>
                    {isAdmin && (
                      <NavLink
                        to="/admin"
                        className="text-[10px] text-red-500 hover:text-red-400 uppercase tracking-widest flex items-center gap-2 transition-colors"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <ShieldCheck size={12} /> Admin Dashboard
                      </NavLink>
                    )}
                    <button
                      onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
                      className="text-[10px] text-zinc-600 hover:text-white uppercase tracking-widest mt-2 transition-colors"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <NavLink
                    to="/login"
                    className="text-[10px] text-white uppercase tracking-widest hover:text-red-500 transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Login / Register
                  </NavLink>
                )}
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;