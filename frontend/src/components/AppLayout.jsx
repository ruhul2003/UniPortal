'use client';

import React, { useState, useEffect } from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import Footer from './Footer';
import { fetchNotices } from '../lib/api';

export default function AppLayout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [hasNotices, setHasNotices] = useState(false);
  const [hasUrgentNotice, setHasUrgentNotice] = useState(false);

  useEffect(() => {
    async function checkNotices() {
      try {
        const data = await fetchNotices();
        if (Array.isArray(data) && data.length > 0) {
          setHasNotices(true);
          setHasUrgentNotice(data.some(n => n.isUrgent));
        } else {
          setHasNotices(false);
        }
      } catch (err) {
        console.warn('Notice check error in AppLayout:', err);
      }
    }
    checkNotices();
  }, []);

  const handleToggleSidebar = () => {
    // If mobile, toggle open drawer; if desktop, toggle collapse state
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      setIsSidebarOpen(!isSidebarOpen);
    } else {
      setIsSidebarCollapsed(!isSidebarCollapsed);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50/50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 antialiased selection:bg-blue-100 selection:text-blue-700 transition-colors duration-200">
      
      {/* Sidebar Navigation */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        hasNotices={hasNotices}
        hasUrgentNotice={hasUrgentNotice}
      />

      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${
        isSidebarCollapsed ? 'lg:pl-20' : 'lg:pl-72'
      }`}>
        <Navbar 
          onToggleSidebar={handleToggleSidebar} 
          isSidebarCollapsed={isSidebarCollapsed} 
        />

        <main className="flex-1 max-w-[1700px] w-full mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 py-6 sm:py-8">
          {children}
        </main>

        <Footer />
      </div>

    </div>
  );
}
