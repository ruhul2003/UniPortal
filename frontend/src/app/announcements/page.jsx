'use client';

import React, { useState, useEffect } from 'react';
import { Megaphone, Plus, Search, Tag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import AnnouncementCard from '../../components/AnnouncementCard';
import CreateAnnouncementModal from '../../components/CreateAnnouncementModal';
import { useAuth } from '../../context/AuthContext';
import { fetchAnnouncements, createAnnouncement, deleteAnnouncement } from '../../lib/api';

export default function AnnouncementsPage() {
  const { user } = useAuth();
  const isFaculty = user?.role === 'faculty' || user?.role === 'admin';

  const [announcements, setAnnouncements] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAnnouncements() {
      setLoading(true);
      const data = await fetchAnnouncements();
      setAnnouncements(data);
      setLoading(false);
    }
    loadAnnouncements();
  }, []);

  const handlePostAnnouncement = async (data) => {
    const res = await createAnnouncement(data);
    if (res.announcement) {
      setAnnouncements([res.announcement, ...announcements]);
    }
  };

  const handleDeleteAnnouncement = async (id) => {
    await deleteAnnouncement(id);
    setAnnouncements(announcements.filter(a => a._id !== id));
  };

  const tags = ['All', 'Urgent', 'Holiday', 'Seminar', 'Workshop', 'Admission', 'General'];

  const filtered = announcements.filter(a => {
    const matchesSearch = (a.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (a.description || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTag = selectedTag === 'All' || a.tag === selectedTag;
    return matchesSearch && matchesTag;
  });

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-8"
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <Megaphone className="w-4 h-4" />
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Campus Announcements</h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Broadcasting events, seminars, holidays, and official updates across campus.
          </p>
        </div>

        {isFaculty && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setIsModalOpen(true)}
            className="px-5 py-2.5 rounded-xl bg-slate-900 dark:bg-emerald-600 hover:bg-slate-800 dark:hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-2 shadow-sm transition-all whitespace-nowrap"
          >
            <Plus className="w-4 h-4 text-emerald-400 dark:text-white" /> Post Announcement
          </motion.button>
        )}
      </div>

      {/* Filter Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 shadow-card flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search announcements..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto max-w-full w-full md:w-auto scrollbar-none py-1">
          {tags.map((t) => (
            <motion.button
              key={t}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => setSelectedTag(t)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedTag === t
                  ? 'bg-slate-900 dark:bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-100 dark:border-slate-700'
              }`}
            >
              {t}
            </motion.button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center">
          <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-xs text-slate-400 font-medium">Loading announcements...</p>
        </div>
      ) : filtered.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="py-20 text-center bg-slate-50/50 dark:bg-slate-900/50 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800"
        >
          <Megaphone className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">No announcements match your search</h3>
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
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          <AnimatePresence>
            {filtered.map((item) => (
              <motion.div
                key={item._id}
                variants={{
                  hidden: { opacity: 0, y: 15 },
                  show: { opacity: 1, y: 0 }
                }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
              >
                <AnnouncementCard announcement={item} onDelete={handleDeleteAnnouncement} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      <CreateAnnouncementModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handlePostAnnouncement}
      />
    </motion.div>
  );
}

