'use client';

import React, { useState, useEffect } from 'react';
import { Megaphone, Plus, Search, Tag } from 'lucide-react';
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
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
              <Megaphone className="w-4 h-4" />
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Campus Announcements</h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500">
            Broadcasting events, seminars, holidays, and official updates across campus.
          </p>
        </div>

        {isFaculty && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center gap-2 shadow-sm transition-all whitespace-nowrap"
          >
            <Plus className="w-4 h-4 text-emerald-400" /> Post Announcement
          </button>
        )}
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-card flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search announcements..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto max-w-full w-full md:w-auto scrollbar-none py-1">
          {tags.map((t) => (
            <button
              key={t}
              onClick={() => setSelectedTag(t)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedTag === t
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-100'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center">
          <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-xs text-slate-400 font-medium">Loading announcements...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-20 text-center bg-slate-50/50 rounded-3xl border border-dashed border-slate-200">
          <Megaphone className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-slate-700">No announcements match your search</h3>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filtered.map((item) => (
            <AnnouncementCard key={item._id} announcement={item} onDelete={handleDeleteAnnouncement} />
          ))}
        </div>
      )}

      <CreateAnnouncementModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handlePostAnnouncement}
      />
    </div>
  );
}
