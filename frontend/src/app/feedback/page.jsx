'use client';

import React, { useState, useEffect } from 'react';
import { 
  Star, 
  Award, 
  BookOpen, 
  Building2, 
  UserCheck, 
  GraduationCap, 
  Plus, 
  MessageSquare, 
  Trash2, 
  Lock, 
  User, 
  Sparkles, 
  BarChart3,
  Search,
  Filter,
  CheckCircle2,
  TrendingUp,
  ShieldCheck,
  Crown
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { fetchUsers, fetchFeedback, fetchFeedbackSummary, deleteFeedback } from '../../lib/api';
import SubmitFeedbackModal from '../../components/SubmitFeedbackModal';

export default function FeedbackPage() {
  const { user } = useAuth();
  const isStudent = user?.role === 'student';
  const isFaculty = user?.role === 'faculty';
  const isAdmin = user?.role === 'admin';

  const [feedbackList, setFeedbackList] = useState([]);
  const [summary, setSummary] = useState({
    totalReviews: 0,
    averageRating: 0,
    teachingQualityAvg: 0,
    courseContentAvg: 0,
    communicationAvg: 0,
    distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
  });
  const [faculties, setFaculties] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedFacultyFilter, setSelectedFacultyFilter] = useState('all');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [targetFacultyForModal, setTargetFacultyForModal] = useState(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [users, allFeedback] = await Promise.all([
        fetchUsers(),
        fetchFeedback()
      ]);

      const facultyList = users.filter(u => u.role === 'faculty');
      setFaculties(facultyList);
      setFeedbackList(allFeedback);

      // If faculty role, calculate summary for this specific faculty member
      if (isFaculty) {
        const currentFacultyUser = facultyList.find(f => f.email === user?.email || f.name === user?.name);
        const facId = currentFacultyUser?._id || user?._id;
        const facSummary = await fetchFeedbackSummary(facId);
        setSummary(facSummary);
      } else {
        const globalSummary = await fetchFeedbackSummary('');
        setSummary(globalSummary);
      }
    } catch (err) {
      console.error('Error loading feedback page data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const handleFeedbackSubmitted = (newEntry) => {
    setFeedbackList([newEntry, ...feedbackList]);
    loadData(); // refresh summary statistics
  };

  const handleDeleteFeedback = async (id) => {
    if (confirm('Are you sure you want to delete this evaluation review?')) {
      await deleteFeedback(id);
      setFeedbackList(feedbackList.filter(f => f._id !== id));
      loadData();
    }
  };

  const openFeedbackModalForFaculty = (facultyObj) => {
    setTargetFacultyForModal(facultyObj);
    setIsModalOpen(true);
  };

  // Filtered feedback list
  const filteredFeedback = feedbackList.filter(item => {
    const matchesDept = selectedDeptFilter === 'all' || item.department === selectedDeptFilter;
    const matchesFaculty = selectedFacultyFilter === 'all' || item.facultyId === selectedFacultyFilter;
    const matchesSearch = 
      item.courseCode?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.courseTitle?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.facultyName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.comment?.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesDept && matchesFaculty && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      
      {/* Header Banner */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-900 via-slate-900 to-indigo-950 p-8 sm:p-10 text-white shadow-2xl border border-amber-500/20">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-3 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/30 text-amber-300 text-xs font-bold uppercase tracking-wider">
            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
            Academic Governance & Evaluation
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            Course Teacher Feedback & Ratings
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
            Students can rate teaching quality, course content organization, and communication effectiveness after completing courses. Submissions support optional total anonymity.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={() => {
                setTargetFacultyForModal(null);
                setIsModalOpen(true);
              }}
              className="px-5 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-extrabold transition-all flex items-center gap-2 shadow-lg shadow-amber-500/25"
            >
              <Plus className="w-4 h-4" /> Evaluate a Course Teacher
            </button>
          </div>
        </div>
      </section>

      {/* Analytics Overview Section */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-4">
        
        {/* Overall Average Rating Card */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 shadow-xl flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-black text-xl shrink-0 border border-amber-500/20">
            <Star className="w-7 h-7 fill-amber-500" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 dark:text-slate-500">
              {isFaculty ? 'Your Overall Rating' : 'Global Teacher Avg'}
            </p>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-3xl font-black text-slate-900 dark:text-white">
                {summary.averageRating > 0 ? summary.averageRating : '5.0'}
              </span>
              <span className="text-xs font-bold text-slate-400">/ 5.0</span>
            </div>
            <p className="text-[11px] text-amber-600 dark:text-amber-400 font-bold mt-0.5">
              Based on {summary.totalReviews} student reviews
            </p>
          </div>
        </div>

        {/* Teaching Quality Card */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 shadow-xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold shrink-0">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 dark:text-slate-500">Teaching Quality</p>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">
              {summary.teachingQualityAvg > 0 ? summary.teachingQualityAvg : '5.0'} <span className="text-xs text-slate-400">/ 5</span>
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">Clarity & Pedagogy</p>
          </div>
        </div>

        {/* Course Content Card */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 shadow-xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold shrink-0">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 dark:text-slate-500">Course Content</p>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">
              {summary.courseContentAvg > 0 ? summary.courseContentAvg : '5.0'} <span className="text-xs text-slate-400">/ 5</span>
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">Syllabus & Material</p>
          </div>
        </div>

        {/* Communication Card */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 shadow-xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold shrink-0">
            <MessageSquare className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 dark:text-slate-500">Communication</p>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">
              {summary.communicationAvg > 0 ? summary.communicationAvg : '4.8'} <span className="text-xs text-slate-400">/ 5</span>
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">Punctuality & Helpfulness</p>
          </div>
        </div>

      </section>

      {/* Control Bar: Filters & Search */}
      <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
        
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by course code, teacher, or keyword..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800/50 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
          />
        </div>

        {/* Faculty & Department Filter dropdowns */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <select
            value={selectedDeptFilter}
            onChange={(e) => setSelectedDeptFilter(e.target.value)}
            className="px-3 py-2 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs font-bold bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none"
          >
            <option value="all">All Departments</option>
            <option value="Computer Science & Engineering">Computer Science & Eng.</option>
            <option value="Software Engineering">Software Engineering</option>
            <option value="Electrical & Electronic Engineering">Electrical & Electronic Eng.</option>
          </select>

          <select
            value={selectedFacultyFilter}
            onChange={(e) => setSelectedFacultyFilter(e.target.value)}
            className="px-3 py-2 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs font-bold bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none"
          >
            <option value="all">All Faculty Teachers</option>
            {faculties.map(f => (
              <option key={f._id} value={f._id}>{f.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Student Feedback Reviews List (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h2 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-amber-500" />
              Student Evaluation Reviews ({filteredFeedback.length})
            </h2>
            <span className="text-xs text-slate-500 font-medium">Sorted by latest</span>
          </div>

          {loading ? (
            <div className="py-12 text-center text-slate-400">
              <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-xs font-semibold">Loading course teacher evaluations...</p>
            </div>
          ) : filteredFeedback.length === 0 ? (
            <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 text-slate-400 text-xs shadow-sm">
              No evaluation reviews found matching the current criteria.
            </div>
          ) : (
            <div className="space-y-4">
              {filteredFeedback.map((item) => (
                <FeedbackCard 
                  key={item._id} 
                  item={item} 
                  currentUser={user} 
                  onDelete={handleDeleteFeedback} 
                />
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Faculty Evaluation Directory & Quick Evaluate */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-indigo-500" />
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">Department Faculty List</h3>
              </div>
              <span className="text-[11px] font-bold text-slate-400">{faculties.length} Teachers</span>
            </div>

            <div className="space-y-3">
              {faculties.slice(0, 5).map((fac) => (
                <div 
                  key={fac._id} 
                  className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-center justify-between"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-extrabold text-xs">
                      {fac.name ? fac.name.charAt(0) : 'F'}
                    </div>
                    <div>
                      <p className="font-bold text-xs text-slate-900 dark:text-white">{fac.name}</p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400">{fac.designation || 'Faculty'}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => openFeedbackModalForFaculty(fac)}
                    className="px-3 py-1 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-[10px] font-extrabold hover:bg-amber-500 hover:text-slate-950 transition-all flex items-center gap-1"
                  >
                    <Star className="w-3 h-3 fill-current" /> Rate Teacher
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* Submit Evaluation Modal */}
      <SubmitFeedbackModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmitSuccess={handleFeedbackSubmitted}
        initialFaculty={targetFacultyForModal}
      />
    </div>
  );
}

/* Individual Feedback Card Component */
function FeedbackCard({ item, currentUser, onDelete }) {
  const isAuthor = currentUser?.studentId && currentUser?.studentId === item.studentId;
  const isAdmin = currentUser?.role === 'admin';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 shadow-xl space-y-4 relative overflow-hidden"
    >
      {/* Top Bar: Course Code Badge, Faculty Name, Date & Rating */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 font-extrabold text-[11px]">
              {item.courseCode}
            </span>
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
              {item.courseTitle}
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-semibold">
            Instructor: <span className="text-slate-900 dark:text-white font-extrabold">{item.facultyName}</span> ({item.semester})
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Star Rating Badge */}
          <div className="px-3 py-1 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 font-black text-xs flex items-center gap-1">
            <Star className="w-3.5 h-3.5 fill-amber-500" />
            <span>{item.rating}.0</span>
          </div>

          {(isAuthor || isAdmin) && (
            <button
              onClick={() => onDelete(item._id)}
              className="p-1.5 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
              title="Delete evaluation review"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Sub Criteria Scores */}
      <div className="grid grid-cols-3 gap-2 py-1 text-[11px] bg-slate-50 dark:bg-slate-800/40 rounded-2xl p-3">
        <div>
          <span className="text-slate-400 font-medium block">Teaching Quality</span>
          <span className="font-extrabold text-slate-800 dark:text-slate-200">{item.teachingQuality || item.rating} / 5</span>
        </div>
        <div>
          <span className="text-slate-400 font-medium block">Course Content</span>
          <span className="font-extrabold text-slate-800 dark:text-slate-200">{item.courseContent || item.rating} / 5</span>
        </div>
        <div>
          <span className="text-slate-400 font-medium block">Communication</span>
          <span className="font-extrabold text-slate-800 dark:text-slate-200">{item.communication || item.rating} / 5</span>
        </div>
      </div>

      {/* Comment */}
      {item.comment && (
        <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-normal italic bg-amber-500/5 p-3 rounded-2xl border border-amber-500/10">
          "{item.comment}"
        </p>
      )}

      {/* Footer: Submitter info & Anonymity status */}
      <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
        <div className="flex items-center gap-1.5">
          {item.isAnonymous ? (
            <>
              <Lock className="w-3 h-3 text-emerald-500" />
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">Anonymous Student Submission</span>
            </>
          ) : (
            <>
              <User className="w-3 h-3 text-blue-500" />
              <span className="font-semibold text-slate-700 dark:text-slate-300">{item.studentName || 'Student'}</span>
            </>
          )}
        </div>

        <span>
          {new Date(item.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
        </span>
      </div>
    </motion.div>
  );
}
