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
  ShieldAlert,
  Layers,
  Award,
  Filter,
  CheckCircle2,
  Mail,
  School,
  Users,
  ClipboardList,
  FolderOpen,
  MessageSquare,
  Star
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { fetchNotices, fetchRoutines, fetchAnnouncements, fetchUsers, createNotice, deleteNotice } from '../lib/api';
import NoticeCard from '../components/NoticeCard';
import CreateNoticeModal from '../components/CreateNoticeModal';

export default function HomePage() {
  const { user } = useAuth();
  const isFaculty = user?.role === 'faculty' || user?.role === 'admin';
  const isStudent = user?.role === 'student';

  const [notices, setNotices] = useState([]);
  const [routines, setRoutines] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [facultyMembers, setFacultyMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isNoticeModalOpen, setIsNoticeModalOpen] = useState(false);

  // Section Filter state (defaults to student's section or 'Section A')
  const [selectedSection, setSelectedSection] = useState('All');

  useEffect(() => {
    if (user?.section) {
      setSelectedSection(user.section);
    } else if (isStudent) {
      setSelectedSection('Section A');
    } else {
      setSelectedSection('All');
    }
  }, [user]);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const [nData, rData, aData, uData] = await Promise.all([
        fetchNotices(),
        fetchRoutines(),
        fetchAnnouncements(),
        fetchUsers()
      ]);
      setNotices(nData);
      setRoutines(rData);
      setAnnouncements(aData);

      // Filter faculty members for Faculty List section
      const facultyList = uData.filter(u => u.role === 'faculty');
      // If db has fallback/empty, provide sample faculty list
      if (facultyList.length === 0) {
        setFacultyMembers([
          {
            _id: 'f_1',
            name: 'Dr. Sarah Jenkins',
            email: 'sarah.jenkins@univ.edu',
            designation: 'Associate Professor',
            department: 'Computer Science & Engineering',
            avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
          },
          {
            _id: 'f_2',
            name: 'Prof. Alan Vance',
            email: 'a.vance@univ.edu',
            designation: 'Head of Department',
            department: 'Computer Science & Engineering',
            avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
          },
          {
            _id: 'f_3',
            name: 'Dr. Marcus Thorne',
            email: 'm.thorne@univ.edu',
            designation: 'Assistant Professor',
            department: 'Software Engineering',
            avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80'
          }
        ]);
      } else {
        setFacultyMembers(facultyList);
      }
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

  // Section-Filtered Notices
  const filteredNotices = notices.filter(n => {
    if (selectedSection === 'All') return true;
    if (!n.section || n.section === 'All' || n.department === 'All Departments') return true;
    return n.section === selectedSection || n.section.includes(selectedSection);
  });

  // Section-Filtered Class Routines
  const filteredRoutines = routines.filter(r => {
    if (selectedSection === 'All') return true;
    if (!r.section || r.section === 'All') return true;
    return r.section === selectedSection || r.section.toLowerCase().includes(selectedSection.toLowerCase());
  });

  const urgentNotice = notices.find(n => n.isUrgent);
  const pinnedAnnouncement = announcements.find(a => a.isPinned);

  return (
    <div className="space-y-10">
      
      {/* Hero Welcome Banner */}
      <section className="relative overflow-hidden rounded-3xl bg-slate-900 text-white p-8 sm:p-12 shadow-xl">
        <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-blue-600/20 blur-3xl pointer-events-none" />
        <div className="absolute right-40 -bottom-20 w-80 h-80 rounded-full bg-indigo-600/20 blur-3xl pointer-events-none" />
        
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-xs font-semibold text-blue-300">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Welcome to UniPortal • Spring Semester 2026</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
            Seamless Academic Governance for <span className="text-blue-400">Students</span> & <span className="text-indigo-300">Faculty</span>.
          </h1>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Stay updated with real-time academic notices, track section class routines dynamically, manage attendance, and evaluate course teachers.
          </p>

          {/* Quick Action Badges */}
          <div className="pt-4 flex flex-wrap items-center gap-4 text-xs font-semibold">
            <Link
              href="/feedback"
              className="px-5 py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold transition-all flex items-center gap-2 shadow-lg shadow-amber-500/20"
            >
              Teacher Feedback <Star className="w-4 h-4 fill-slate-950" />
            </Link>

            <Link
              href="/attendance"
              className="px-5 py-3 rounded-2xl bg-emerald-500 text-white hover:bg-emerald-600 transition-all flex items-center gap-2 shadow-lg shadow-emerald-500/20"
            >
              Attendance Tracker <CheckCircle2 className="w-4 h-4" />
            </Link>

            <Link
              href="/assignments"
              className="px-5 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white transition-all flex items-center gap-2 shadow-lg shadow-blue-500/20"
            >
              Assignments & Tasks <ClipboardList className="w-4 h-4" />
            </Link>

            <Link
              href="/resources"
              className="px-5 py-3 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white transition-all flex items-center gap-2 shadow-lg shadow-purple-500/20"
            >
              Study Resources <FolderOpen className="w-4 h-4" />
            </Link>

            <Link
              href="/forum"
              className="px-5 py-3 rounded-2xl bg-teal-600 hover:bg-teal-500 text-white transition-all flex items-center gap-2 shadow-lg shadow-teal-500/20"
            >
              Q&A Forum <MessageSquare className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Feature Hub Quick Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        
        <Link 
          href="/feedback" 
          className="p-6 rounded-3xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/60 shadow-xs hover:shadow-md transition-all group"
        >
          <div className="w-12 h-12 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center shadow-md shadow-amber-500/20 group-hover:scale-110 transition-transform">
            <Star className="w-6 h-6 fill-slate-950" />
          </div>
          <h3 className="mt-4 text-base font-bold text-slate-900 dark:text-white flex items-center justify-between">
            <span>Teacher Evaluation</span>
            <ArrowRight className="w-4 h-4 text-amber-600 group-hover:translate-x-1 transition-transform" />
          </h3>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Submit anonymous ratings & evaluation feedback for course faculty.
          </p>
        </Link>

        
        <Link 
          href="/attendance" 
          className="p-6 rounded-3xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/60 shadow-xs hover:shadow-md transition-all group"
        >
          <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/20 group-hover:scale-110 transition-transform">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h3 className="mt-4 text-base font-bold text-slate-900 dark:text-white flex items-center justify-between">
            <span>Attendance Tracker</span>
            <ArrowRight className="w-4 h-4 text-emerald-600 group-hover:translate-x-1 transition-transform" />
          </h3>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Monitor course percentages & class attendance metrics.
          </p>
        </Link>

        <Link 
          href="/assignments" 
          className="p-6 rounded-3xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-800/60 shadow-xs hover:shadow-md transition-all group"
        >
          <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20 group-hover:scale-110 transition-transform">
            <ClipboardList className="w-6 h-6" />
          </div>
          <h3 className="mt-4 text-base font-bold text-slate-900 dark:text-white flex items-center justify-between">
            <span>Assignments Hub</span>
            <ArrowRight className="w-4 h-4 text-blue-600 group-hover:translate-x-1 transition-transform" />
          </h3>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Submit coursework solutions & view deadline countdown timers.
          </p>
        </Link>

        <Link 
          href="/resources" 
          className="p-6 rounded-3xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200/80 dark:border-purple-800/60 shadow-xs hover:shadow-md transition-all group"
        >
          <div className="w-12 h-12 rounded-2xl bg-purple-600 text-white flex items-center justify-center shadow-md shadow-purple-500/20 group-hover:scale-110 transition-transform">
            <FolderOpen className="w-6 h-6" />
          </div>
          <h3 className="mt-4 text-base font-bold text-slate-900 dark:text-white flex items-center justify-between">
            <span>Resource Locker</span>
            <ArrowRight className="w-4 h-4 text-purple-600 group-hover:translate-x-1 transition-transform" />
          </h3>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Access slides, lecture notes, lab manuals & solved PYQs.
          </p>
        </Link>

        <Link 
          href="/forum" 
          className="p-6 rounded-3xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200/80 dark:border-teal-800/60 shadow-xs hover:shadow-md transition-all group"
        >
          <div className="w-12 h-12 rounded-2xl bg-teal-600 text-white flex items-center justify-center shadow-md shadow-teal-500/20 group-hover:scale-110 transition-transform">
            <MessageSquare className="w-6 h-6" />
          </div>
          <h3 className="mt-4 text-base font-bold text-slate-900 dark:text-white flex items-center justify-between">
            <span>Course Q&A Forum</span>
            <ArrowRight className="w-4 h-4 text-teal-600 group-hover:translate-x-1 transition-transform" />
          </h3>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Ask questions & receive instructor-verified answers.
          </p>
        </Link>

      </div>

      {/* Section Filter Control Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold shrink-0">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm text-slate-900 dark:text-white">Section View:</span>
              <span className="px-2.5 py-0.5 rounded-full bg-blue-600 text-white text-[11px] font-extrabold">
                {selectedSection}
              </span>
              {isStudent && user?.section === selectedSection && (
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800">
                  ✓ Your Assigned Section
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
              Showing notices, class schedule & faculty list relevant to {selectedSection}
            </p>
          </div>
        </div>

        {/* Interactive Section Filter Switcher */}
        <div className="flex items-center gap-2 self-stretch sm:self-auto">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={selectedSection}
            onChange={(e) => setSelectedSection(e.target.value)}
            className="w-full sm:w-auto px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="All">All Sections View</option>
            <option value="Section 9A">Section 9A (9th Sem)</option>
            <option value="Section A">Section A</option>
            <option value="Section B">Section B</option>
            <option value="Section C">Section C</option>
            <option value="Section D">Section D</option>
            <option value="Section E">Section E</option>
          </select>

        </div>
      </div>

      {/* Urgent Notice Alert Banner */}
      {urgentNotice && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 sm:p-5 rounded-2xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-200 px-2 py-0.5 rounded">Priority Notice</span>
                <span className="text-xs text-amber-700 dark:text-amber-300 font-semibold">{urgentNotice.department}</span>
              </div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">{urgentNotice.title}</h4>
            </div>
          </div>
          <Link
            href="/notices"
            className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold transition-colors whitespace-nowrap self-end sm:self-center"
          >
            Read Notice
          </Link>
        </motion.div>
      )}

      {/* Stats Overview Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800 shadow-card flex items-center gap-4 transition-colors">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-100 dark:border-blue-800/60">
            <Bell className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 dark:text-slate-500">{selectedSection} Notices</p>
            <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white">{filteredNotices.length}</h3>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800 shadow-card flex items-center gap-4 transition-colors">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-100 dark:border-indigo-800/60">
            <CalendarDays className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 dark:text-slate-500">{selectedSection} Routine Slots</p>
            <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white">{filteredRoutines.length}</h3>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800 shadow-card flex items-center gap-4 transition-colors">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-100 dark:border-emerald-800/60">
            <School className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 dark:text-slate-500">Department Faculty</p>
            <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white">{facultyMembers.length}</h3>
          </div>
        </div>
      </section>

      {/* Main Grid: Recent Notices & Pinned Announcements */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Section Notices (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                {selectedSection !== 'All' ? `${selectedSection} Notices` : 'Recent Department Notices'}
              </h2>
              <p className="text-xs text-slate-400 dark:text-slate-500">Official updates for your batch section</p>
            </div>
            
            <div className="flex items-center gap-3">
              {isFaculty && (
                <button
                  onClick={() => setIsNoticeModalOpen(true)}
                  className="px-3 py-1.5 rounded-xl bg-slate-900 dark:bg-blue-600 text-white text-xs font-semibold hover:bg-slate-800 dark:hover:bg-blue-700 transition-all flex items-center gap-1.5 shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5 text-blue-400 dark:text-white" /> Post Notice
                </button>
              )}
              <Link
                href="/notices"
                className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
              >
                View All <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredNotices.length === 0 ? (
              <div className="col-span-2 p-8 text-center bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 text-slate-400 text-xs">
                No notices published specifically for {selectedSection} yet.
              </div>
            ) : (
              filteredNotices.slice(0, 4).map((notice) => (
                <NoticeCard key={notice._id} notice={notice} onDelete={handleDeleteNotice} />
              ))
            )}
          </div>
        </div>

        {/* Right Column: Pinned Announcements & Section Class Routine Preview */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Announcements</h2>
            <Link href="/announcements" className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline">
              See All
            </Link>
          </div>

          {pinnedAnnouncement && (
            <div className="bg-slate-900 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
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

          {/* Section Routine Quick Preview */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 shadow-card space-y-4 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">{selectedSection} Class Schedule</h3>
              </div>
              <Link href="/routine" className="text-xs text-blue-600 dark:text-blue-400 font-semibold">Full Timetable</Link>
            </div>

            <div className="space-y-3">
              {filteredRoutines.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-400">
                  No classes scheduled for {selectedSection}.
                </div>
              ) : (
                filteredRoutines.slice(0, 3).map((r) => (
                  <div key={r._id} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white">{r.courseCode}</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">{r.courseTitle}</p>
                    </div>
                    <div className="text-right">
                      <span className="font-semibold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded text-[11px]">
                        {r.startTime}
                      </span>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">{r.room}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

      </div>

      {/* Quick Link Banner to Faculty Directory */}
      <section className="bg-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6 border border-indigo-500/20">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center shrink-0 border border-white/10 text-blue-300">
            <School className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-extrabold text-white">Department Faculty Directory</h3>
            <p className="text-xs text-slate-300 mt-0.5">Looking for professors, lecturers, and faculty contact details?</p>
          </div>
        </div>
        <Link
          href="/faculty"
          className="px-5 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all flex items-center gap-2 shadow-md shadow-blue-500/20 shrink-0"
        >
          View Faculty Members <ArrowRight className="w-4 h-4" />
        </Link>
      </section>

      {/* Modal for Faculty Notice Creation */}
      <CreateNoticeModal
        isOpen={isNoticeModalOpen}
        onClose={() => setIsNoticeModalOpen(false)}
        onSubmit={handlePostNotice}
      />
    </div>
  );
}
