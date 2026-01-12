import React from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import { Home } from 'lucide-react';

const NotFound = () => {
    return (
        <Layout>
            <div className="min-h-[80vh] flex flex-col items-center justify-center bg-[#050505] text-white px-6 text-center">
                <h1 className="text-9xl font-serif mb-4 text-white/10 select-none">404</h1>
                <h2 className="text-3xl font-serif mb-6">Page Not Found</h2>
                <p className="text-gray-400 mb-8 max-w-md">
                    The page you are looking for does not exist or has been moved.
                    Let's guide you back to the familiar.
                </p>
                <Link
                    to="/"
                    className="flex items-center gap-2 px-6 py-3 border border-white/20 hover:bg-white hover:text-black transition-all text-xs uppercase tracking-widest"
                >
                    <Home size={16} /> Return Home
                </Link>
            </div>
        </Layout>
    );
};

export default NotFound;
