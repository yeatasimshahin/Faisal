import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import { Loader2 } from 'lucide-react';

const AdminRoute = () => {
    const { user, isAdmin, isLoading } = useStore();
    const location = useLocation();

    if (isLoading) {
        return (
            <div className="min-h-screen w-full flex items-center justify-center bg-[#0a0a0a]">
                <Loader2 className="animate-spin text-white" size={32} />
            </div>
        );
    }

    // If not authenticated or not admin, redirect to login but save the location they were trying to access
    if (!user || !isAdmin) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // If authenticated, render the child route (AdminDashboard)
    return <Outlet />;
};

export default AdminRoute;