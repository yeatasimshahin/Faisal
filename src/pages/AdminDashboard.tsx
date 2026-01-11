import React, { useEffect, useState } from 'react';
import { useStore } from '../store/useStore';
import { useNavigate, NavLink, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Settings,
  Ticket,
  MessageSquare,
  LogOut,
  Menu,
  ShieldCheck,
  Mail,
  Calendar,
  ExternalLink
} from 'lucide-react';
import DashboardTabs from '../components/admin/DashboardTabs';

const AdminDashboard = () => {
  const { user, isAdmin, isLoading, checkUser, signOut } = useStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    // Double check authentication on mount
    const verify = async () => {
      await checkUser();
    };
    verify();
  }, []);

  // Redirect if not admin
  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        navigate('/login');
      } else if (!isAdmin) {
        navigate('/');
      }
    }
  }, [user, isAdmin, isLoading, navigate]);

  if (isLoading) return <div className="min-h-screen bg-black flex items-center justify-center text-white">Loading Security...</div>;
  if (!isAdmin) return null;

  const menuItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard, path: '/admin/overview' },
    { id: 'bookings', label: 'Bookings', icon: Calendar, path: '/admin/bookings' },
    { id: 'messages', label: 'Inbox', icon: Mail, path: '/admin/messages' },
    { id: 'users', label: 'User Database', icon: Users, path: '/admin/users' },
    { id: 'content', label: 'Site Content', icon: LayoutDashboard, path: '/admin/content' },
    { id: 'settings', label: 'Settings', icon: Settings, path: '/admin/settings' },
    { id: 'coupons', label: 'Coupons', icon: Ticket, path: '/admin/coupons' },
    { id: 'reviews', label: 'Reviews', icon: MessageSquare, path: '/admin/reviews' },
  ];

  const currentTab = menuItems.find(item => location.pathname.includes(item.id))?.id || 'overview';
  const currentLabel = menuItems.find(item => location.pathname.includes(item.id))?.label || 'Overview';

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex overflow-hidden font-sans">

      {/* Mobile Sidebar Toggle */}
      <div className="md:hidden fixed top-0 left-0 w-full p-4 z-50 flex items-center justify-between bg-black/80 backdrop-blur-md">
        <span className="font-bold tracking-widest uppercase">Admin Panel</span>
        <button onClick={() => setSidebarOpen(!sidebarOpen)}>
          <Menu />
        </button>
      </div>

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-zinc-950 border-r border-white/5 transform transition-transform duration-300 ease-in-out md:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        md:relative
        flex flex-col
      `}>
        <div className="p-8 border-b border-white/5">
          <h1 className="text-xl font-serif flex items-center gap-2">
            <ShieldCheck className="text-red-500" />
            PRECISSION
          </h1>
          <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-2">Master Control</p>
        </div>

        <nav className="p-4 space-y-2 flex-1 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.id}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) => `w-full flex items-center gap-4 px-4 py-3 text-xs uppercase tracking-widest transition-all rounded-sm
                  ${isActive
                    ? 'bg-white text-black font-bold'
                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                  }`}
              >
                <Icon size={16} />
                {item.label}
              </NavLink>
            )
          })}
        </nav>

        <div className="p-4 border-t border-white/5 bg-zinc-900/50">
          <NavLink
            to="/"
            className="w-full flex items-center gap-4 px-4 py-3 text-xs uppercase tracking-widest text-gray-400 hover:text-white hover:bg-white/5 transition-all rounded-sm mb-2"
          >
            <ExternalLink size={16} />
            Back to Website
          </NavLink>
          <button
            onClick={() => {
              signOut();
              navigate('/login');
            }}
            className="w-full flex items-center gap-4 px-4 py-3 text-xs uppercase tracking-widest text-red-500 hover:bg-red-950/30 transition-all rounded-sm"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto h-screen relative bg-[#050505]">
        <div className="p-6 md:p-12 mt-16 md:mt-0 max-w-7xl mx-auto">
          <header className="mb-12">
            <h2 className="text-3xl font-light text-white uppercase tracking-widest mb-2">
              {currentLabel}
            </h2>
            <div className="h-[1px] w-12 bg-red-600" />
          </header>

          <Routes>
            <Route path="/" element={<Navigate to="overview" replace />} />
            <Route path="/:tab" element={<DashboardTabs activeTab={currentTab as any} />} />
          </Routes>
        </div>
      </main>

    </div>
  );
};

export default AdminDashboard;