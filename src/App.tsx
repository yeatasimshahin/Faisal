import React, { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import { useStore } from './store/useStore'
import ScrollToTop from './components/layout/ScrollToTop'
import Home from './pages/Home'
import Login from './pages/Login'
import Signup from './pages/Signup'
import AdminDashboard from './pages/AdminDashboard'
import BlogList from './pages/BlogList'
import BlogDetails from './pages/BlogDetails'
import BlogEditor from './components/blog/BlogEditor'
import ProjectDetails from './pages/ProjectDetails'
import BookNow from './pages/BookNow'
import Profile from './pages/Profile'
import Contact from './pages/Contact'
import About from './pages/About'
import Projects from './pages/Projects'
import Journal from './pages/Journal'
import Subscribe from './pages/Subscribe'

function App() {
    const { fetchSettings, checkUser } = useStore();

    useEffect(() => {
        const init = async () => {
            await Promise.all([fetchSettings(), checkUser()]);
        };
        init();
    }, [fetchSettings, checkUser]);

    return (
        <HelmetProvider>
            <BrowserRouter>
                <ScrollToTop />
                <Routes>
                    {/* Public Routes */}
                    <Route path="/" element={<Home />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<Signup />} />
                    <Route path="/book-now" element={<BookNow />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/contact" element={<Contact />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/projects" element={<Projects />} />
                    <Route path="/journal" element={<Journal />} />
                    <Route path="/subscribe" element={<Subscribe />} />

                    {/* Project Details System */}
                    <Route path="/project/:slug" element={<ProjectDetails />} />

                    {/* Blog System */}
                    <Route path="/blog" element={<BlogList />} />
                    <Route path="/blog/new" element={<BlogEditor />} />
                    <Route path="/blog/:id" element={<BlogDetails />} />

                    {/* Protected Admin Route - Matches /admin and /admin/* */}
                    <Route path="/admin/*" element={<AdminDashboard />} />

                    {/* Catch all */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </BrowserRouter>
        </HelmetProvider>
    )
}

export default App