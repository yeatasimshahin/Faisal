# Portfolio & Management System

A modern, high-performance web application built with React, Vite, and Supabase. This project features a sophisticated portfolio showcase, integrated blog system, and a robust admin dashboard for managing bookings, subscribers, and content.

## 🚀 Features

- **Project Portfolio**: Dynamic showcase of work with detailed views.
- **Journal / Blog**: Integrated blogging platform with rich content management.
- **Booking System**: Streamlined appointment and service booking.
- **Admin Dashboard**: Comprehensive control panel for:
    - User & Subscriber management
    - Content editing
    - Coupon & Discount management
    - Review moderation
    - Analytics tracking
    - Message inbox
- **Performance Optimized**: Built with Vite and Lenis for smooth scrolling and fast load times.
- **Premium Design**: Responsive UI with Framer Motion animations and Tailwind CSS.

## 🛠️ Tech Stack

- **Frontend**: [React 19](https://react.dev/), [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/), [Framer Motion](https://www.framer.com/motion/)
- **Backend/Auth**: [Supabase](https://supabase.com/)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)
- **Routing**: [React Router 7](https://reactrouter.com/)
- **Utilities**: [Lucide React](https://lucide.dev/), [date-fns](https://date-fns.org/), [Lenis](https://lenis.darkroom.engineering/)

## 📦 Getting Started

### Prerequisites

- Node.js (Latest LTS recommended)
- npm or yarn

### Installation

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd <project-folder>
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Environment Setup**:
   Create a `.env.local` file in the root directory and add your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Start the development server**:
   ```bash
   npm run dev
   ```

## 📜 Available Scripts

- `npm run dev`: Starts the development server.
- `npm run build`: Compiles the project for production.
- `npm run preview`: Previews the production build locally.

## 🛡️ Security

This project uses a secured `.gitignore` to prevent sensitive environment variables and build artifacts from being tracked in version control.
