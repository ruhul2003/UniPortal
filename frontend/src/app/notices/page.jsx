'use client';

import React, { useState, useEffect } from 'react';
import { Search, Filter, Plus, Bell, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import NoticeCard from '../../components/NoticeCard';
import CreateNoticeModal from '../../components/CreateNoticeModal';
import { useAuth } from '../../context/AuthContext';
import { fetchNotices, createNotice, deleteNotice } from '../../lib/api';

export default function NoticesPage() {
  const { user } = useAuth();
  const isFaculty = user?.role === 'faculty' || user?.role === 'admin';

  const [notices, setNotices] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedDepartment, setSelectedDepartment] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadNotices() {
      setLoading(true);
      const data = await fetchNotices();
      setNotices(data);
      setLoading(false);
    }
    loadNotices();
  }, []);

  const handlePostNotice = async (noticeData) => {
    const res = await createNotice(noticeData);
    if (res.notice) {
      setNotices([res.notice, ...notices]);
    }
  };

  const handleDeleteNotice = async (id) => {
    await deleteNotice(id);
    setNotices(notices.filter(n => n._id !== id));
  };

  const categories = ['All', 'Academic', 'Exam', 'Administrative', 'Event', 'General'];

  const filteredNotices = notices.filter(n => {
    const matchesSearch = (n.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (n.content || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || n.category === selectedCategory;
    const matchesDepartment = selectedDepartment === 'All' || n.department === selectedDepartment || n.department === 'All Departments';
    return matchesSearch && matchesCategory && matchesDepartment;
  });

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-8"
    >
      {/* Header section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
              <Bell className="w-4 h-4" />
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">University Notice Board</h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Official announcements, examination schedules, and academic circulars.
          </p>
        </div>

        {isFaculty && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setIsModalOpen(true)}
            className="px-5 py-2.5 rounded-xl bg-slate-900 dark:bg-blue-600 hover:bg-slate-800 dark:hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-2 shadow-sm transition-all whitespace-nowrap"
          >
            <Plus className="w-4 h-4 text-blue-400 dark:text-white" /> Post New Notice
          </motion.button>
        )}
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 shadow-card flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search notices by keyword..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto max-w-full w-full md:w-auto scrollbar-none py-1">
          {categories.map((cat) => (
            <motion.button
              key={cat}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-100 dark:border-slate-700'
              }`}
            >
              {cat}
            </motion.button>
          ))}
        </div>

      </div>

      {/* Notices Grid */}
      {loading ? (
        <div className="py-20 text-center">
          <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-xs text-slate-400 font-medium">Loading university notices...</p>
        </div>
      ) : filteredNotices.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="py-20 text-center bg-slate-50/50 dark:bg-slate-900/50 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800"
        >
          <Bell className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">No notices found</h3>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Try adjusting your search criteria or category filter.</p>
        </motion.div>
      ) : (
        <motion.div 
          initial="hidden"
          animate="show"
          variants={{
            hidden: { opacity: 0 },
            show: {
              opacity: 1,
              transition: { staggerChildren: 0.05 }
            }
          }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <AnimatePresence>
            {filteredNotices.map((notice) => (
              <motion.div
                key={notice._id}
                variants={{
                  hidden: { opacity: 0, y: 15 },
                  show: { opacity: 1, y: 0 }
                }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
              >
                <NoticeCard notice={notice} onDelete={handleDeleteNotice} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Modal */}
      <CreateNoticeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handlePostNotice}
      />
    </motion.div>
  );
}

