'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { fetchAttendanceSummary, fetchAttendanceSessions, submitAttendanceSession, fetchUsers } from '../../lib/api';
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  AlertTriangle, 
  Calendar, 
  Users, 
  BookOpen, 
  Check, 
  ShieldAlert, 
  ShieldCheck,
  Plus, 
  UserCheck,
  TrendingUp,
  Sparkles,
  Lock,
  Search,
  Filter
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const MOCK_COURSES = [
  { courseCode: 'CSE-101', courseTitle: 'Structured Programming Language', section: 'Section A' },
  { courseCode: 'CSE-102', courseTitle: 'Data Structures & Algorithms', section: 'Section A' },
  { courseCode: 'MAT-105', courseTitle: 'Differential Calculus & Geometry', section: 'Section A' },
  { courseCode: 'EEE-101', courseTitle: 'Basic Electrical Engineering', section: 'Section A' },
];

const SECTIONS = ['Section A', 'Section B', 'Section C', 'Section D', 'Section E'];

export default function AttendancePage() {
  const { user } = useAuth();
  const isFaculty = user?.role === 'faculty';
  const isAdmin = user?.role === 'admin';
  const isFacultyOrCR = isFaculty || isAdmin || user?.isCR;

  // Active view tab: 'summary' (Course Summary) | 'students' (Section Students Breakdown) | 'sessions' (Register Logs)
  const [activeTab, setActiveTab] = useState(isFaculty ? 'students' : 'summary');
  
  // Section filter - Faculty is restricted strictly to their assigned section
  const [selectedSection, setSelectedSection] = useState(user?.section || 'Section A');
  const [summaryList, setSummaryList] = useState([]);
  const [studentSummaries, setStudentSummaries] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [studentSearch, setStudentSearch] = useState('');

  // Modal state for marking attendance
  const [showMarkModal, setShowMarkModal] = useState(false);
  const [modalCourse, setModalCourse] = useState(MOCK_COURSES[0]);
  const [modalSection, setModalSection] = useState(user?.section || 'Section A');
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [studentRoster, setStudentRoster] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState('');

  // Keep selected section in sync with user section for Faculty
  useEffect(() => {
    if (isFaculty && user?.section) {
      setSelectedSection(user.section);
      setModalSection(user.section);
    }
  }, [user, isFaculty]);

  // Load attendance data
  useEffect(() => {
    loadData();
  }, [user, selectedSection]);

  async function loadData() {
    setLoading(true);
    try {
      const activeSection = isFaculty ? (user?.section || 'Section A') : selectedSection;
      const studentId = user?.role === 'student' ? (user?.studentId || '') : '';
      const studentName = user?.role === 'student' ? (user?.name || '') : '';

      const [summaryRes, sessionData] = await Promise.all([
        fetchAttendanceSummary({ studentId, studentName, section: activeSection }),
        fetchAttendanceSessions({ section: activeSection })
      ]);

      if (summaryRes.summary && summaryRes.summary.length > 0) {
        setSummaryList(summaryRes.summary);
      } else {
        setSummaryList([
          { courseCode: 'CSE-101', courseTitle: 'Structured Programming Language', totalClasses: 12, present: 10, absent: 1, late: 1, percentage: 92, statusLabel: 'Good' },
          { courseCode: 'CSE-102', courseTitle: 'Data Structures & Algorithms', totalClasses: 10, present: 8, absent: 1, late: 1, percentage: 85, statusLabel: 'Good' },
          { courseCode: 'MAT-105', courseTitle: 'Differential Calculus & Geometry', totalClasses: 14, present: 10, absent: 3, late: 1, percentage: 75, statusLabel: 'Average' },
          { courseCode: 'EEE-101', courseTitle: 'Basic Electrical Engineering', totalClasses: 15, present: 9, absent: 5, late: 1, percentage: 67, statusLabel: 'Average' },
        ]);
      }

      if (summaryRes.studentSummaries && summaryRes.studentSummaries.length > 0) {
        setStudentSummaries(summaryRes.studentSummaries);
      } else {
        // Fallback roster for demonstration if no db records yet
        setStudentSummaries([
          { studentId: '2026-CSE-001', studentName: 'Ruhul Amin', section: activeSection, totalClasses: 12, present: 11, absent: 1, late: 0, percentage: 92, statusLabel: 'Good' },
          { studentId: '2026-CSE-002', studentName: 'Sabbir Ahmed', section: activeSection, totalClasses: 12, present: 10, absent: 2, late: 0, percentage: 83, statusLabel: 'Good' },
          { studentId: '2026-CSE-003', studentName: 'Tariqul Islam', section: activeSection, totalClasses: 12, present: 9, absent: 2, late: 1, percentage: 75, statusLabel: 'Average' },
          { studentId: '2026-CSE-004', studentName: 'Nusrat Jahan', section: activeSection, totalClasses: 12, present: 8, absent: 3, late: 1, percentage: 71, statusLabel: 'Average' },
          { studentId: '2026-CSE-005', studentName: 'Tanvir Hossain', section: activeSection, totalClasses: 12, present: 7, absent: 5, late: 0, percentage: 58, statusLabel: 'Low' }
        ]);
      }

      setSessions(sessionData);
    } catch (err) {
      console.warn('Attendance load error:', err);
    } finally {
      setLoading(false);
    }
  }

  // Fetch student roster when opening modal
  const handleOpenMarkModal = async () => {
    const targetSection = isFaculty ? (user?.section || 'Section A') : modalSection;
    setModalSection(targetSection);
    setShowMarkModal(true);
    setSubmitSuccess('');

    try {
      const allUsers = await fetchUsers();
      const sectionStudents = allUsers.filter(u => u.role === 'student' && (u.section === targetSection || !u.section));
      
      if (sectionStudents.length > 0) {
        setStudentRoster(sectionStudents.map(s => ({
          studentId: s.studentId || s._id,
          studentName: s.name,
          status: 'Present'
        })));
      } else {
        setStudentRoster([
          { studentId: '2026-CSE-001', studentName: 'Ruhul Amin', status: 'Present' },
          { studentId: '2026-CSE-002', studentName: 'Sabbir Ahmed', status: 'Present' },
          { studentId: '2026-CSE-003', studentName: 'Tariqul Islam', status: 'Present' },
          { studentId: '2026-CSE-004', studentName: 'Nusrat Jahan', status: 'Present' },
          { studentId: '2026-CSE-005', studentName: 'Tanvir Hossain', status: 'Present' }
        ]);
      }
    } catch (err) {
      console.warn('Failed to load roster:', err);
    }
  };

  const toggleStudentStatus = (index, newStatus) => {
    const updated = [...studentRoster];
    updated[index].status = newStatus;
    setStudentRoster(updated);
  };

  const toggleStudentCheckbox = (index, isChecked) => {
    const updated = [...studentRoster];
    updated[index].status = isChecked ? 'Present' : 'Absent';
    setStudentRoster(updated);
  };

  const setAllStudentStatus = (status) => {
    setStudentRoster(prev => prev.map(s => ({ ...s, status })));
  };

  const handleSubmitAttendance = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const targetSection = isFaculty ? (user?.section || 'Section A') : modalSection;
      await submitAttendanceSession({
        courseCode: modalCourse.courseCode,
        courseTitle: modalCourse.courseTitle,
        section: targetSection,
        date: attendanceDate,
        timeSlot: '09:00 AM - 10:30 AM',
        markedBy: user?.name || 'Faculty Member',
        markedByRole: user?.role || 'faculty',
        records: studentRoster
      });
      setSubmitSuccess('Attendance recorded successfully!');
      setTimeout(() => {
        setShowMarkModal(false);
        loadData();
      }, 1200);
    } catch (err) {
      alert('Failed to submit attendance: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const activeSection = isFaculty ? (user?.section || 'Section A') : selectedSection;

  // Filter students roster by search term
  const filteredStudentSummaries = studentSummaries.filter(s => 
    s.studentName.toLowerCase().includes(studentSearch.toLowerCase()) ||
    s.studentId.toLowerCase().includes(studentSearch.toLowerCase())
  );

  const overallTotal = summaryList.reduce((acc, c) => acc + c.totalClasses, 0);
  const overallAttended = summaryList.reduce((acc, c) => acc + (c.present + c.late), 0);
  const overallPercentage = overallTotal > 0 ? Math.round((overallAttended / overallTotal) * 100) : 100;

  return (
    <div className="space-y-8">
        
        {/* Header Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-emerald-800 p-6 sm:p-10 text-white shadow-xl">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 flex-wrap mb-3">
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-bold uppercase tracking-wider">
                  <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                  <span>Attendance Portal</span>
                </span>
                
                {isFaculty ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/20 backdrop-blur-md border border-amber-300/40 text-xs font-extrabold text-amber-200">
                    <Lock className="w-3.5 h-3.5" />
                    <span>Faculty Section Bound: {activeSection}</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-xs font-bold text-emerald-100">
                    <Users className="w-3.5 h-3.5 text-teal-300" />
                    <span>Section: {activeSection}</span>
                  </span>
                )}
              </div>

              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                {isFaculty ? `${activeSection} Student Attendance 📊` : 'Class Attendance & Metrics 📊'}
              </h1>
              <p className="mt-2 text-emerald-100 text-sm sm:text-base max-w-2xl">
                {isFaculty 
                  ? `Access attendance registers and track student metrics for your assigned ${activeSection}.`
                  : 'Track your course attendance percentages, view course statistics, and log daily class registers.'
                }
              </p>
            </div>

            {isFacultyOrCR && (
              <button
                onClick={handleOpenMarkModal}
                className="px-6 py-3.5 rounded-2xl bg-white text-slate-900 font-bold hover:bg-emerald-50 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2.5 group shrink-0"
              >
                <UserCheck className="w-5 h-5 text-emerald-600 group-hover:scale-110 transition-transform" />
                <span>Mark {activeSection} Register</span>
              </button>
            )}
          </div>
        </div>

        {/* Controls Bar: Section Selector (For Admin) & Tabs */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
          
          {/* Tab Navigation */}
          <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl">
            {isFaculty && (
              <button
                onClick={() => setActiveTab('students')}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
                  activeTab === 'students'
                    ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>{activeSection} Students ({studentSummaries.length})</span>
              </button>
            )}

            <button
              onClick={() => setActiveTab('summary')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === 'summary'
                  ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Course Summaries</span>
            </button>

            {!isFaculty && (
              <button
                onClick={() => setActiveTab('students')}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
                  activeTab === 'students'
                    ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>Section Students</span>
              </button>
            )}
          </div>

          {/* Section Selector Filter */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            {isFaculty ? (
              <div className="px-3.5 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-xs font-bold text-emerald-700 dark:text-emerald-300 flex items-center gap-2 w-full sm:w-auto justify-center">
                <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Assigned Section: {user.section || 'Section A'}</span>
              </div>
            ) : isAdmin ? (
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Filter className="w-4 h-4 text-slate-400 shrink-0" />
                <label className="text-xs font-bold text-slate-500 shrink-0">Filter Section:</label>
                <select
                  value={selectedSection}
                  onChange={(e) => setSelectedSection(e.target.value)}
                  className="px-3 py-2 rounded-xl text-xs font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                >
                  {SECTIONS.map(sec => (
                    <option key={sec} value={sec}>{sec}</option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-600" />
                <span>Your Section: {activeSection}</span>
              </div>
            )}
          </div>
        </div>

        {/* Overview Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                {isFaculty ? `${activeSection} Average` : 'Overall Attendance'}
              </span>
              <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
                <TrendingUp className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold">{overallPercentage}%</span>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300">
                Active
              </span>
            </div>
            <div className="mt-3 w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
              <div 
                className="h-full rounded-full bg-emerald-500"
                style={{ width: `${Math.min(overallPercentage, 100)}%` }}
              />
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Classes Held</span>
              <div className="p-2 rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">
                <BookOpen className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3 text-3xl font-extrabold">{overallTotal}</div>
            <p className="mt-1 text-xs text-slate-400">Recorded in {activeSection}</p>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                {isFaculty ? 'Total Enrolled Students' : 'Attended Classes'}
              </span>
              <div className="p-2 rounded-xl bg-teal-50 text-teal-600 dark:bg-teal-950/60 dark:text-teal-400">
                <Users className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3 text-3xl font-extrabold">
              {isFaculty ? studentSummaries.length : overallAttended}
            </div>
            <p className="mt-1 text-xs text-teal-600 dark:text-teal-400 font-medium">
              {isFaculty ? `Registered in ${activeSection}` : 'Present or Late entry'}
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Academic Status</span>
              <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3 text-xl font-bold text-slate-800 dark:text-slate-200">
              Live Registers
            </div>
            <p className="mt-1 text-xs text-slate-400">Real-time attendance tracking</p>
          </div>
        </div>

        {/* TAB 1: SECTION STUDENTS ATTENDANCE BREAKDOWN (FACULTY / ADMIN) */}
        {activeTab === 'students' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold tracking-tight">
                  {activeSection} Students Attendance Roster 👥
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Detailed attendance percentages for students in {activeSection}.
                </p>
              </div>

              {/* Student Search */}
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search student by name or ID..."
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
            </div>

            {loading ? (
              <div className="p-12 text-center text-slate-400 text-xs font-semibold">
                Loading student records for {activeSection}...
              </div>
            ) : filteredStudentSummaries.length === 0 ? (
              <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-2">
                <Users className="w-8 h-8 text-slate-400 mx-auto" />
                <p className="text-sm font-bold text-slate-700 dark:text-slate-300">No student records found</p>
                <p className="text-xs text-slate-400">No registered students found matching your search in {activeSection}.</p>
              </div>
            ) : (
              <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider border-b border-slate-200/80 dark:border-slate-800">
                      <tr>
                        <th className="px-6 py-4">Student Details</th>
                        <th className="px-6 py-4">Section</th>
                        <th className="px-6 py-4 text-center">Classes</th>
                        <th className="px-6 py-4 text-center">Present</th>
                        <th className="px-6 py-4 text-center">Absent</th>
                        <th className="px-6 py-4 text-center">Late</th>
                        <th className="px-6 py-4">Attendance Ratio</th>
                        <th className="px-6 py-4 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {filteredStudentSummaries.map((st) => {
                        return (
                          <tr key={st.studentId} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                            <td className="px-6 py-4">
                              <div className="font-bold text-slate-900 dark:text-white">{st.studentName}</div>
                              <div className="text-[11px] font-mono text-slate-400">{st.studentId}</div>
                            </td>
                            <td className="px-6 py-4">
                              <span className="px-2.5 py-1 rounded-lg text-[11px] font-extrabold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                                {st.section || activeSection}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-center font-semibold text-slate-700 dark:text-slate-300">
                              {st.totalClasses}
                            </td>
                            <td className="px-6 py-4 text-center font-bold text-emerald-600 dark:text-emerald-400">
                              {st.present}
                            </td>
                            <td className="px-6 py-4 text-center font-bold text-rose-500">
                              {st.absent}
                            </td>
                            <td className="px-6 py-4 text-center font-bold text-amber-500">
                              {st.late}
                            </td>
                            <td className="px-6 py-4 w-48">
                              <div className="space-y-1">
                                <div className="flex justify-between text-[11px] font-bold">
                                  <span>{st.percentage}%</span>
                                  <span className="text-slate-400">{st.present + st.late}/{st.totalClasses}</span>
                                </div>
                                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                                  <div
                                    className="h-full rounded-full bg-emerald-500"
                                    style={{ width: `${Math.min(st.percentage, 100)}%` }}
                                  />
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                {st.statusLabel || 'Active'}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: COURSE ATTENDANCE SUMMARY */}
        {activeTab === 'summary' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold tracking-tight">
                {isFaculty ? `${activeSection} Course Registers` : 'Course Attendance Summary'}
              </h2>
              <div className="text-xs text-slate-400 font-medium">Auto-updated from live registers</div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {summaryList.map((course) => {
                return (
                  <div 
                    key={course.courseCode}
                    className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md transition-all space-y-4"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-800">
                          {course.courseCode}
                        </span>
                        <h3 className="mt-2 text-base font-bold text-slate-900 dark:text-white">
                          {course.courseTitle}
                        </h3>
                      </div>

                      <div className="text-right">
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          {course.percentage}%
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
                        <span>Attendance Ratio</span>
                        <span className="font-semibold">{course.present + course.late} / {course.totalClasses} Classes</span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-800 h-3 rounded-full overflow-hidden">
                        <div 
                          className="h-full rounded-full transition-all duration-500 bg-emerald-500"
                          style={{ width: `${Math.min(course.percentage, 100)}%` }}
                        />
                      </div>
                    </div>

                    {/* Breakdown pill badges */}
                    <div className="flex items-center gap-3 pt-2 text-xs font-semibold">
                      <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> {course.present} Present
                      </span>
                      <span className="text-rose-500 flex items-center gap-1">
                        <XCircle className="w-3.5 h-3.5" /> {course.absent} Absent
                      </span>
                      <span className="text-amber-500 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" /> {course.late} Late
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 2: Students Breakdown */}
        {activeTab === 'students' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input 
                  type="text"
                  placeholder="Search student name or ID..."
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="text-xs font-bold text-slate-500">
                Showing {filteredStudentSummaries.length} Students in {activeSection}
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800/60 text-slate-400 uppercase tracking-wider font-bold border-b border-slate-100 dark:border-slate-800">
                      <th className="py-3.5 px-4">Student</th>
                      <th className="py-3.5 px-4">Section</th>
                      <th className="py-3.5 px-4 text-center">Classes</th>
                      <th className="py-3.5 px-4 text-center">Present</th>
                      <th className="py-3.5 px-4 text-center">Absent</th>
                      <th className="py-3.5 px-4 text-center">Attendance %</th>
                      <th className="py-3.5 px-4 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                    {filteredStudentSummaries.map((st) => {
                      const isGood = st.percentage >= 75;
                      return (
                        <tr key={st.studentId} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                          <td className="py-3.5 px-4">
                            <div className="font-bold text-slate-900 dark:text-white">{st.studentName}</div>
                            <div className="text-[10px] text-slate-400 font-mono">{st.studentId}</div>
                          </td>
                          <td className="py-3.5 px-4 font-semibold text-slate-700 dark:text-slate-300">{st.section}</td>
                          <td className="py-3.5 px-4 text-center font-bold">{st.totalClasses}</td>
                          <td className="py-3.5 px-4 text-center font-bold text-emerald-600">{st.present}</td>
                          <td className="py-3.5 px-4 text-center font-bold text-rose-500">{st.absent}</td>
                          <td className="py-3.5 px-4 text-center">
                            <span className={`font-black text-sm ${isGood ? 'text-emerald-600' : 'text-amber-600'}`}>
                              {st.percentage}%
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <span className={`px-2.5 py-1 rounded-full text-[11px] font-extrabold ${
                              isGood 
                                ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60' 
                                : 'bg-rose-50 text-rose-600 dark:bg-rose-950/60'
                            }`}>
                              {isGood ? 'Regular' : 'At Risk'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Register Logs */}
        {activeTab === 'sessions' && (
          <div className="space-y-4">
            {sessions.length === 0 ? (
              <div className="p-12 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl space-y-2">
                <Calendar className="w-12 h-12 text-slate-300 mx-auto" />
                <h4 className="text-base font-bold text-slate-800 dark:text-slate-200">No Attendance Sessions Logged Yet</h4>
                <p className="text-xs text-slate-500">Click "Take Class Attendance" above to record a lecture register.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {sessions.map((sess) => (
                  <div key={sess._id} className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xs space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">{sess.courseCode}</span>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">{sess.courseTitle}</h4>
                        <span className="text-[11px] text-slate-400 block">{sess.date} • {sess.timeSlot}</span>
                      </div>
                      <span className="px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 font-bold text-xs text-slate-600 dark:text-slate-300">
                        {sess.section}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs font-bold pt-2 border-t border-slate-100 dark:border-slate-800">
                      <span className="text-slate-500">Marked by: {sess.markedBy}</span>
                      <span className="text-emerald-600">{sess.records?.filter(r => r.status === 'Present').length || 0} / {sess.records?.length || 0} Present</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Mark Attendance Modal */}
        <AnimatePresence>
          {showMarkModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden"
              >
                <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold">Mark Class Attendance 📋</h3>
                    <p className="text-xs text-slate-400">
                      {isFaculty ? `Faculty Register for ${activeSection}` : 'Class Representative Register'}
                    </p>
                  </div>
                  <button 
                    onClick={() => setShowMarkModal(false)}
                    className="p-1 rounded-full text-slate-400 hover:text-white"
                  >
                    <XCircle className="w-6 h-6" />
                  </button>
                </div>

                <form onSubmit={handleSubmitAttendance} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
                  {submitSuccess && (
                    <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-700 font-bold text-xs flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>{submitSuccess}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Select Course</label>
                      <select 
                        value={modalCourse.courseCode}
                        onChange={(e) => {
                          const found = MOCK_COURSES.find(c => c.courseCode === e.target.value);
                          if (found) setModalCourse(found);
                        }}
                        className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold"
                      >
                        {MOCK_COURSES.map(c => (
                          <option key={c.courseCode} value={c.courseCode}>{c.courseCode} - {c.courseTitle}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Academic Section
                      </label>
                      {isFaculty ? (
                        <div className="px-3 py-2 rounded-xl text-xs bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 font-extrabold flex items-center gap-1.5">
                          <Lock className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{activeSection}</span>
                        </div>
                      ) : (
                        <select 
                          value={modalSection}
                          onChange={(e) => setModalSection(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold"
                        >
                          {SECTIONS.map(sec => (
                            <option key={sec} value={sec}>{sec}</option>
                          ))}
                        </select>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Session Date</label>
                      <input 
                        type="date"
                        value={attendanceDate}
                        onChange={(e) => setAttendanceDate(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold"
                      />
                    </div>
                  </div>

                  {/* Student Roster Checkbox List */}
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
                      <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                          {activeSection} Student Roster ({studentRoster.length})
                        </h4>
                        <p className="text-[11px] text-slate-400">Check box for Present students. Unchecked boxes count as Absent.</p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setAllStudentStatus('Present')}
                          className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 text-[11px] font-bold hover:bg-emerald-100 transition-colors"
                        >
                          Check All (Present)
                        </button>
                        <button
                          type="button"
                          onClick={() => setAllStudentStatus('Absent')}
                          className="px-2.5 py-1 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 text-[11px] font-bold hover:bg-rose-100 transition-colors"
                        >
                          Uncheck All (Absent)
                        </button>
                      </div>
                    </div>

                    <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
                      {studentRoster.map((student, idx) => {
                        const isPresent = student.status === 'Present';
                        return (
                          <div key={student.studentId} className="p-3.5 bg-white dark:bg-slate-900 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                            <label className="flex items-center gap-3.5 cursor-pointer select-none">
                              <input
                                type="checkbox"
                                checked={isPresent}
                                onChange={(e) => toggleStudentCheckbox(idx, e.target.checked)}
                                className="w-5 h-5 accent-emerald-600 rounded cursor-pointer transition-transform active:scale-95"
                              />
                              <div>
                                <p className={`text-xs font-bold transition-colors ${isPresent ? 'text-slate-900 dark:text-white' : 'text-slate-500 line-through'}`}>
                                  {student.studentName}
                                </p>
                                <p className="text-[10px] text-slate-400 font-mono">{student.studentId}</p>
                              </div>
                            </label>

                            <div>
                              {isPresent ? (
                                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-xs">
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  Present
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 font-bold text-xs">
                                  <XCircle className="w-3.5 h-3.5" />
                                  Absent
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={() => setShowMarkModal(false)}
                      className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-6 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-all shadow-md"
                    >
                      {isSubmitting ? 'Saving Register...' : 'Save & Submit Register'}
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </div>
  );
}
