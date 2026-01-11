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
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${scrolled || mobileMenuOpen ? 'bg-black/80 backdrop-blur-md border-b border-white/5' : 'bg-transparent'
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

        {/* Mobile Menu Toggle */}
        <button
          className="md:hidden text-white z-50"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 bg-black/95 backdrop-blur-xl z-40 flex flex-col items-center justify-center space-y-8 md:hidden"
          >
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.path}
                className="text-2xl font-serif text-white uppercase tracking-widest hover:text-red-500 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.name}
              </a>
            ))}

            <div className="h-[1px] w-12 bg-white/10 my-4" />

            {user ? (
              <div className="flex flex-col items-center gap-6">
                <NavLink
                  to="/profile"
                  className="text-lg text-gray-400 hover:text-white uppercase tracking-widest"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  My Profile
                </NavLink>
                {isAdmin && (
                  <NavLink
                    to="/admin"
                    className="text-lg text-red-500 hover:text-red-400 uppercase tracking-widest"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Admin Dashboard
                  </NavLink>
                )}
                <button
                  onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
                  className="text-lg text-gray-500 hover:text-white uppercase tracking-widest"
                >
                  Logout
                </button>
              </div>
            ) : (
              <NavLink
                to="/login"
                className="text-lg text-white uppercase tracking-widest hover:text-red-500"
                onClick={() => setMobileMenuOpen(false)}
              >
                Login / Register
              </NavLink>
            )}

            <NavLink
              to="/book-now"
              className="mt-4 px-8 py-3 bg-white text-black font-bold uppercase tracking-widest"
              onClick={() => setMobileMenuOpen(false)}
            >
              Book Now
            </NavLink>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;