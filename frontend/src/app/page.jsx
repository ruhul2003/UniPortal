'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Bell, 
  CalendarDays, 
  Megaphone, 
  ArrowRight, 
  Sparkles, 
  Plus, 
  TrendingUp, 
  BookOpen, 
  UserCheck, 
  Pin,
  Clock,
  ShieldAlert
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { fetchNotices, fetchRoutines, fetchAnnouncements, createNotice, deleteNotice } from '../lib/api';
import NoticeCard from '../components/NoticeCard';
import CreateNoticeModal from '../components/CreateNoticeModal';

export default function HomePage() {
  const { user } = useAuth();
  const isFaculty = user?.role === 'faculty' || user?.role === 'admin';

  const [notices, setNotices] = useState([]);
  const [routines, setRoutines] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isNoticeModalOpen, setIsNoticeModalOpen] = useState(false);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const [nData, rData, aData] = await Promise.all([
        fetchNotices(),
        fetchRoutines(),
        fetchAnnouncements()
      ]);
      setNotices(nData);
      setRoutines(rData);
      setAnnouncements(aData);
      setLoading(false);
    }
    loadData();
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

  const urgentNotice = notices.find(n => n.isUrgent);
  const pinnedAnnouncement = announcements.find(a => a.isPinned);

  return (
    <div className="space-y-12">
      {/* Hero Welcome Banner */}
      <section className="relative overflow-hidden rounded-3xl bg-slate-900 text-white p-8 sm:p-12 shadow-xl">
        <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-blue-600/20 blur-3xl" />
        <div className="absolute right-40 -bottom-20 w-80 h-80 rounded-full bg-indigo-600/20 blur-3xl" />
        
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-xs font-semibold text-blue-300">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Welcome to UniPortal • Spring Semester 2026</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
            Seamless Academic Governance for <span className="text-blue-400">Students</span> & <span className="text-indigo-300">Faculty</span>.
          </h1>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Stay updated with real-time academic notices, track class routines dynamically, and receive immediate official university announcements.
          </p>

          {/* Quick Action Badges */}
          <div className="pt-4 flex flex-wrap items-center gap-4 text-xs font-semibold">
            <Link
              href="/notices"
              className="px-5 py-3 rounded-2xl bg-white text-slate-900 hover:bg-slate-100 transition-all flex items-center gap-2 shadow-sm"
            >
              Browse Notices <ArrowRight className="w-4 h-4 text-blue-600" />
            </Link>

            <Link
              href="/routine"
              className="px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/10 text-white transition-all flex items-center gap-2"
            >
              Class Schedule <CalendarDays className="w-4 h-4 text-blue-300" />
            </Link>

            {isFaculty && (
              <button
                onClick={() => setIsNoticeModalOpen(true)}
                className="px-5 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white transition-all flex items-center gap-2 shadow-lg shadow-blue-500/20"
              >
                <Plus className="w-4 h-4" /> Post New Notice
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Urgent Notice Alert Banner */}
      {urgentNotice && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 sm:p-5 rounded-2xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-200 text-amber-900 px-2 py-0.5 rounded">Priority Notice</span>
                <span className="text-xs text-amber-700 font-semibold">{urgentNotice.department}</span>
              </div>
              <h4 className="text-sm font-bold text-slate-900 mt-0.5">{urgentNotice.title}</h4>
            </div>
          </div>
          <Link
            href="/notices"
            className="px-4 py-2 rounded-xl bg-amber-600 text-white text-xs font-semibold hover:bg-amber-700 transition-colors whitespace-nowrap self-end sm:self-center"
          >
            Read Notice
          </Link>
        </motion.div>
      )}

      {/* Stats Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-card flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
            <Bell className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400">Active Notices</p>
            <h3 className="text-2xl font-extrabold text-slate-900">{notices.length}</h3>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-card flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
            <CalendarDays className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400">Scheduled Classes</p>
            <h3 className="text-2xl font-extrabold text-slate-900">{routines.length}</h3>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-card flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
            <Megaphone className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400">Campus Announcements</p>
            <h3 className="text-2xl font-extrabold text-slate-900">{announcements.length}</h3>
          </div>
        </div>
      </section>

      {/* Main Grid: Recent Notices & Pinned Announcements */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Recent Notices (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Recent Notices</h2>
              <p className="text-xs text-slate-400">Latest updates from university department desks</p>
            </div>
            
            <div className="flex items-center gap-3">
              {isFaculty && (
                <button
                  onClick={() => setIsNoticeModalOpen(true)}
                  className="px-3 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-all flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5 text-blue-400" /> Post Notice
                </button>
              )}
              <Link
                href="/notices"
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                View All <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {notices.slice(0, 4).map((notice) => (
              <NoticeCard key={notice._id} notice={notice} onDelete={handleDeleteNotice} />
            ))}
          </div>
        </div>

        {/* Right Column: Pinned Announcements & Today's Schedule Shortcut */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900">Announcements</h2>
            <Link href="/announcements" className="text-xs font-semibold text-blue-600 hover:text-blue-700">
              See All
            </Link>
          </div>

          {pinnedAnnouncement && (
            <div className="bg-gradient-to-br from-blue-900 to-slate-900 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
              <div className="flex items-center gap-2 mb-3">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500 text-white flex items-center gap-1">
                  <Pin className="w-3 h-3 fill-current" /> PINNED
                </span>
                <span className="text-xs text-blue-300">{pinnedAnnouncement.tag}</span>
              </div>
              <h3 className="text-base font-bold text-white mb-2 leading-snug">
                {pinnedAnnouncement.title}
              </h3>
              <p className="text-xs text-slate-300 line-clamp-3 mb-4 leading-relaxed">
                {pinnedAnnouncement.description}
              </p>
              <div className="text-[11px] text-slate-400">
                Published by {pinnedAnnouncement.publishedBy}
              </div>
            </div>
          )}

          {/* Schedule Quick Preview */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-card space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900">Today's Class Preview</h3>
              </div>
              <Link href="/routine" className="text-xs text-blue-600 font-semibold">Full Timetable</Link>
            </div>

            <div className="space-y-3">
              {routines.slice(0, 3).map((r) => (
                <div key={r._id} className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
                  <div>
                    <p className="font-bold text-slate-900">{r.courseCode}</p>
                    <p className="text-[11px] text-slate-500">{r.courseTitle}</p>
                  </div>
                  <div className="text-right">
                    <span className="font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded text-[11px]">
                      {r.startTime}
                    </span>
                    <p className="text-[10px] text-slate-400 mt-0.5">{r.room}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* Modal for Faculty Notice Creation */}
      <CreateNoticeModal
        isOpen={isNoticeModalOpen}
        onClose={() => setIsNoticeModalOpen(false)}
        onSubmit={handlePostNotice}
      />
    </div>
  );
}
