'use client';

import React, { useState, useEffect } from 'react';
import AppLayout from '../../components/AppLayout';
import { useAuth } from '../../context/AuthContext';
import Link from 'next/link';
import { 
  FileCheck2, 
  Calendar, 
  Clock, 
  MapPin, 
  Plus, 
  Search, 
  Filter, 
  QrCode, 
  ShieldAlert, 
  Sparkles, 
  BookOpen, 
  Building, 
  UserCheck, 
  Printer, 
  Trash2, 
  Edit3, 
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  FolderOpen
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchExams, fetchAdmitCard, deleteExam } from '../../lib/api';
import AdmitCardModal from '../../components/AdmitCardModal';
import AddExamModal from '../../components/AddExamModal';
import UploadQuestionModal from '../../components/UploadQuestionModal';

export default function ExamsPage() {
  const { user } = useAuth();
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSection, setSelectedSection] = useState('All');
  const [selectedExamType, setSelectedExamType] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modals state
  const [isAdmitCardOpen, setIsAdmitCardOpen] = useState(false);
  const [admitCardData, setAdmitCardData] = useState(null);
  const [isAddExamOpen, setIsAddExamOpen] = useState(false);
  const [isUploadQuestionOpen, setIsUploadQuestionOpen] = useState(false);

  // Countdown timer state
  const [nextExam, setNextExam] = useState(null);
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  const isFacultyOrAdmin = user?.role === 'admin' || user?.role === 'faculty' || user?.isCR;

  useEffect(() => {
    loadExams();
  }, [selectedSection, selectedExamType]);

  const loadExams = async () => {
    try {
      setLoading(true);
      const data = await fetchExams({
        section: selectedSection,
        examType: selectedExamType
      });
      setExams(data);
      calculateNextExam(data);
    } catch (err) {
      console.error('Failed to load exams:', err);
    } finally {
      setLoading(false);
    }
  };

  const calculateNextExam = (examList) => {
    if (!examList || examList.length === 0) {
      setNextExam(null);
      return;
    }

    const now = new Date();
    // Sort upcoming exams
    const sorted = [...examList].sort((a, b) => new Date(a.examDate) - new Date(b.examDate));
    const upcoming = sorted.find(e => new Date(`${e.examDate} ${e.startTime || '09:00 AM'}`) >= now) || sorted[0];

    setNextExam(upcoming);
  };

  // Live countdown ticker
  useEffect(() => {
    if (!nextExam || !nextExam.examDate) return;

    const timer = setInterval(() => {
      const examTime = new Date(`${nextExam.examDate} ${nextExam.startTime || '09:00 AM'}`).getTime();
      const now = new Date().getTime();
      const diff = examTime - now;

      if (diff > 0) {
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeLeft({ days, hours, minutes, seconds });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [nextExam]);

  const handleOpenAdmitCard = async () => {
    try {
      const data = await fetchAdmitCard(user?.studentId, user?.email);
      if (data) {
        setAdmitCardData(data);
      } else {
        // Fallback metadata
        setAdmitCardData({
          studentName: user?.name || 'Student',
          studentId: user?.studentId || 'N/A',
          department: user?.department || 'Computer Science & Engineering',
          section: user?.section || 'Section A',
          avatar: user?.avatar || '',
          verificationCode: `MPU-${(user?.studentId || 'STUDENT').replace(/[^a-zA-Z0-9]/g, '')}-2026`,
          exams: exams
        });
      }
      setIsAdmitCardOpen(true);
    } catch (err) {
      console.error('Error fetching admit card:', err);
    }
  };

  const handleDeleteExam = async (id) => {
    if (!window.confirm('Are you sure you want to delete this exam slot?')) return;
    try {
      await deleteExam(id);
      setExams(prev => prev.filter(e => e._id !== id));
    } catch (err) {
      alert(err.message || 'Failed to delete exam.');
    }
  };

  const handleExamAdded = (newExam) => {
    setExams(prev => [newExam, ...prev]);
    calculateNextExam([newExam, ...exams]);
  };

  // Filter exams by search query
  const filteredExams = exams.filter(exam => {
    const q = searchQuery.toLowerCase();
    return (
      exam.courseCode?.toLowerCase().includes(q) ||
      exam.courseTitle?.toLowerCase().includes(q) ||
      exam.room?.toLowerCase().includes(q) ||
      exam.invigilator?.toLowerCase().includes(q)
    );
  });

  // Check for clashes (multiple exams on same date)
  const dateCounts = {};
  exams.forEach(e => {
    if (e.examDate) {
      dateCounts[e.examDate] = (dateCounts[e.examDate] || 0) + 1;
    }
  });
  const hasClashes = Object.values(dateCounts).some(count => count > 1);

  return (
    <div className="w-full space-y-8 pb-12">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Top Hero Banner */}
        <div className="relative rounded-3xl bg-slate-900 p-6 sm:p-8 text-white overflow-hidden shadow-2xl border border-slate-800">
          <div className="absolute -right-10 -bottom-10 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 text-xs font-bold tracking-wide">
                <Sparkles className="w-3.5 h-3.5" />
                <span>SPRING SEMESTER 2026 ASSESSMENT HUB</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
                Exam Center & Digital Admit Card Pass
              </h1>
              <p className="text-sm text-slate-300 font-medium">
                View course schedules, exam room assignments, hall rules, and access your official verified 
                <strong className="text-white"> Digital Admit Card</strong> with one-click print functionality.
              </p>

              <div className="pt-2 flex flex-wrap items-center gap-3">
                <button
                  onClick={handleOpenAdmitCard}
                  className="px-5 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs shadow-lg shadow-blue-500/25 flex items-center gap-2.5 transition-all active:scale-95"
                >
                  <QrCode className="w-4 h-4" />
                  <span>View My Digital Admit Card</span>
                </button>

                {isFacultyOrAdmin && (
                  <button
                    onClick={() => setIsUploadQuestionOpen(true)}
                    className="px-5 py-3 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs transition-all shadow-md flex items-center gap-2 active:scale-95"
                  >
                    <ShieldCheck className="w-4 h-4 text-slate-950" />
                    <span>Upload Past CT / Mid / Final Paper</span>
                  </button>
                )}

                {isFacultyOrAdmin && (
                  <button
                    onClick={() => setIsAddExamOpen(true)}
                    className="px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-extrabold text-xs border border-white/20 flex items-center gap-2 transition-all active:scale-95"
                  >
                    <Plus className="w-4 h-4 text-blue-400" />
                    <span>Schedule New Exam</span>
                  </button>
                )}

                <Link
                  href="/resources"
                  className="px-5 py-3 rounded-2xl bg-slate-800/80 hover:bg-slate-800 text-slate-200 font-bold text-xs border border-slate-700/80 flex items-center gap-2 transition-all"
                >
                  <FolderOpen className="w-4 h-4 text-purple-400" />
                  <span>Browse Question Bank</span>
                </Link>
              </div>
            </div>

            {/* Countdown Box */}
            {nextExam && (
              <div className="w-full lg:w-auto shrink-0 p-5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 shadow-xl text-center">
                <p className="text-[10px] font-extrabold uppercase tracking-widest text-blue-300 mb-1">
                  NEXT EXAM COUNTDOWN
                </p>
                <h3 className="text-base font-black text-white truncate max-w-[240px] mx-auto">
                  {nextExam.courseCode}: {nextExam.courseTitle}
                </h3>
                <p className="text-xs text-slate-300 font-medium mb-3">{nextExam.examDate} @ {nextExam.startTime}</p>

                <div className="grid grid-cols-4 gap-2 text-center">
                  <div className="p-2 rounded-xl bg-slate-900/60 border border-white/10">
                    <span className="block text-lg font-black text-blue-400">{timeLeft.days}</span>
                    <span className="text-[9px] text-slate-400 uppercase font-bold">Days</span>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-900/60 border border-white/10">
                    <span className="block text-lg font-black text-blue-400">{timeLeft.hours}</span>
                    <span className="text-[9px] text-slate-400 uppercase font-bold">Hrs</span>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-900/60 border border-white/10">
                    <span className="block text-lg font-black text-blue-400">{timeLeft.minutes}</span>
                    <span className="text-[9px] text-slate-400 uppercase font-bold">Min</span>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-900/60 border border-white/10">
                    <span className="block text-lg font-black text-rose-400 animate-pulse">{timeLeft.seconds}</span>
                    <span className="text-[9px] text-slate-400 uppercase font-bold">Sec</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Quick Analytics & Conflict Detector */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-400">Total Exams</p>
              <h4 className="text-xl font-black text-slate-900 dark:text-white">{exams.length}</h4>
            </div>
          </div>

          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-400">Hall Pass Status</p>
              <h4 className="text-sm font-black text-emerald-600 dark:text-emerald-400">Active & Verified</h4>
            </div>
          </div>

          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-400">Target Section</p>
              <h4 className="text-base font-black text-slate-900 dark:text-white">{user?.section || 'Section A'}</h4>
            </div>
          </div>

          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
              hasClashes 
                ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400'
                : 'bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400'
            }`}>
              {hasClashes ? <AlertTriangle className="w-6 h-6" /> : <ShieldAlert className="w-6 h-6" />}
            </div>
            <div>
              <p className="text-xs font-medium text-slate-400">Conflict Detector</p>
              <h4 className={`text-sm font-black ${hasClashes ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-white'}`}>
                {hasClashes ? 'Warning: Same-Day Exam' : 'No Schedule Clashes'}
              </h4>
            </div>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Search input */}
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search by course or room..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            {/* Section & Exam Type Selectors */}
            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              <div className="flex items-center gap-2">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-xs font-bold text-slate-500">Section:</span>
                <select
                  value={selectedSection}
                  onChange={(e) => setSelectedSection(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white focus:outline-none"
                >
                  <option value="All">All Sections</option>
                  <option value="Section A">Section A</option>
                  <option value="Section B">Section B</option>
                  <option value="Section C">Section C</option>
                  <option value="Section D">Section D</option>
                  <option value="Section E">Section E</option>
                  <option value="Section 9A">Section 9A</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500">Type:</span>
                <select
                  value={selectedExamType}
                  onChange={(e) => setSelectedExamType(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white focus:outline-none"
                >
                  <option value="All">All Types</option>
                  <option value="Midterm Exam">Midterm Exam</option>
                  <option value="Final Exam">Final Exam</option>
                  <option value="Quiz / Lab Exam">Quiz / Lab Exam</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Exam Cards Grid */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-black text-slate-900 dark:text-white">
              Scheduled Exam Routine ({filteredExams.length})
            </h3>
            {searchQuery && (
              <span className="text-xs text-slate-400">Filtering by "{searchQuery}"</span>
            )}
          </div>

          {loading ? (
            <div className="py-16 text-center text-slate-400 font-medium">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p>Loading exam schedules...</p>
            </div>
          ) : filteredExams.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredExams.map((exam) => (
                <motion.div
                  key={exam._id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="group relative rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-sm hover:shadow-xl hover:border-blue-500/40 transition-all duration-300 flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    {/* Header Badge */}
                    <div className="flex items-center justify-between">
                      <span className="px-3 py-1 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-extrabold text-[11px] uppercase tracking-wider border border-blue-100 dark:border-blue-800">
                        {exam.examType || 'Midterm Exam'}
                      </span>

                      <div className="flex items-center gap-1.5">
                        <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-[10px]">
                          {exam.section}
                        </span>

                        {isFacultyOrAdmin && (
                          <button
                            onClick={() => handleDeleteExam(exam._id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
                            title="Delete exam"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Course Title */}
                    <div>
                      <h4 className="text-xl font-black text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {exam.courseCode}
                      </h4>
                      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 line-clamp-1">
                        {exam.courseTitle}
                      </p>
                    </div>

                    {/* Date & Time info */}
                    <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 space-y-2 text-xs">
                      <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200 font-bold">
                        <Calendar className="w-4 h-4 text-blue-500 shrink-0" />
                        <span>{exam.examDate}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 font-medium">
                        <Clock className="w-4 h-4 text-indigo-500 shrink-0" />
                        <span>{exam.startTime} - {exam.endTime}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-900 dark:text-white font-extrabold">
                        <MapPin className="w-4 h-4 text-rose-500 shrink-0" />
                        <span>Room {exam.room} ({exam.building || 'Main Bldg'})</span>
                      </div>
                    </div>

                    {/* Invigilator */}
                    <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-1">
                      <span className="flex items-center gap-1.5 font-medium">
                        <UserCheck className="w-3.5 h-3.5 text-emerald-500" />
                        <span>{exam.invigilator || 'Faculty Member'}</span>
                      </span>
                    </div>
                  </div>

                  {/* Instructions snippet */}
                  {exam.instructions && (
                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 italic line-clamp-1">
                      💡 {exam.instructions}
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="py-16 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8">
              <BookOpen className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
              <h4 className="text-base font-bold text-slate-700 dark:text-slate-300">No Exam Schedules Found</h4>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                No exam dates match your selected section or search query. Try choosing "All Sections".
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <AdmitCardModal
        isOpen={isAdmitCardOpen}
        onClose={() => setIsAdmitCardOpen(false)}
        admitCardData={admitCardData}
        user={user}
      />

      <AddExamModal
        isOpen={isAddExamOpen}
        onClose={() => setIsAddExamOpen(false)}
        onExamAdded={handleExamAdded}
        currentUser={user}
      />

      <UploadQuestionModal
        isOpen={isUploadQuestionOpen}
        onClose={() => setIsUploadQuestionOpen(false)}
        currentUser={user}
      />
    </div>
  );
}
