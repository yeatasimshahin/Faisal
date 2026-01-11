import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Users, FileText, MessageSquare, Ticket, TrendingUp, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

const StatCard = ({ title, value, icon: Icon, color, delay }: any) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.5 }}
    className="bg-zinc-900/30 border border-white/5 p-8 backdrop-blur-sm relative overflow-hidden group hover:border-white/20 transition-all"
  >
    <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity ${color}`}>
      <Icon size={64} />
    </div>

    <div className="relative z-10">
      <div className={`flex items-center gap-2 mb-4 text-xs font-bold uppercase tracking-widest ${color}`}>
        <Icon size={16} />
        <span>{title}</span>
      </div>
      <h3 className="text-4xl md:text-5xl font-serif text-white mb-2">{value}</h3>
      <p className="text-[10px] text-gray-500 uppercase tracking-wider">Updated Real-time</p>
    </div>
  </motion.div>
);

const AnalyticsHome = () => {
  const [stats, setStats] = useState({
    users: 0,
    projects: 0,
    pendingReviews: 0,
    couponUsage: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      // Parallel requests for efficiency
      const [usersRes, projectsRes, reviewsRes, couponsRes] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('projects').select('*', { count: 'exact', head: true }),
        supabase.from('reviews').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('coupons').select('used_count')
      ]);

      // Calculate total coupon usage
      const totalCouponsUsed = couponsRes.data?.reduce((acc, curr) => acc + (curr.used_count || 0), 0) || 0;

      setStats({
        users: usersRes.count || 0,
        projects: projectsRes.count || 0,
        pendingReviews: reviewsRes.count || 0,
        couponUsage: totalCouponsUsed
      });
      setLoading(false);
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="animate-spin text-white/20" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-light text-white uppercase tracking-widest mb-2">Performance Overview</h2>
        <p className="text-gray-500 text-sm">System metrics and pending actions.</p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Users"
          value={stats.users}
          icon={Users}
          color="text-blue-500"
          delay={0}
        />
        <StatCard
          title="Active Projects"
          value={stats.projects}
          icon={FileText}
          color="text-emerald-500"
          delay={0.1}
        />
        <StatCard
          title="Pending Reviews"
          value={stats.pendingReviews}
          icon={MessageSquare}
          color="text-yellow-500"
          delay={0.2}
        />
        <StatCard
          title="Coupons Redeemed"
          value={stats.couponUsage}
          icon={Ticket}
          color="text-red-500"
          delay={0.3}
        />
      </div>

      {/* Secondary Chart / Visual Area (Placeholder for Chart.js implementation) */}
      <div className="bg-zinc-900/20 border border-white/5 p-8 relative">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-lg font-serif text-white">Engagement Growth</h3>
          <TrendingUp className="text-green-500" />
        </div>
        <div className="h-48 flex items-end gap-2">
          {[35, 45, 30, 60, 75, 50, 65, 80, 70, 90, 85, 100].map((h, i) => (
            <div key={i} className="flex-1 bg-white/5 hover:bg-white/20 transition-colors relative group" style={{ height: `${h}%` }}>
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 text-[10px] text-white bg-black px-2 py-1 rounded border border-white/10 transition-opacity">
                {h}%
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 flex justify-between text-[10px] uppercase text-gray-500 tracking-widest">
          <span>Jan</span>
          <span>Dec</span>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsHome;