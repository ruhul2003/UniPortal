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
  Plus, 
  UserCheck,
  TrendingUp,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const MOCK_COURSES = [
  { courseCode: 'CSE-101', courseTitle: 'Structured Programming Language', section: 'Section A' },
  { courseCode: 'CSE-102', courseTitle: 'Data Structures & Algorithms', section: 'Section A' },
  { courseCode: 'MAT-105', courseTitle: 'Differential Calculus & Geometry', section: 'Section A' },
  { courseCode: 'EEE-101', courseTitle: 'Basic Electrical Engineering', section: 'Section A' },
];

export default function AttendancePage() {
  const { user } = useAuth();
  const isFacultyOrCR = user?.role === 'faculty' || user?.role === 'admin' || user?.isCR;

  const [activeTab, setActiveTab] = useState('summary'); // 'summary' or 'sessions'
  const [summaryList, setSummaryList] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal state for marking attendance
  const [showMarkModal, setShowMarkModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(MOCK_COURSES[0]);
  const [selectedSection, setSelectedSection] = useState(user?.section || 'Section A');
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [studentRoster, setStudentRoster] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState('');

  // Load attendance data
  useEffect(() => {
    loadData();
  }, [user]);

  async function loadData() {
    setLoading(true);
    try {
      const studentId = user?.studentId || '';
      const studentName = user?.name || '';
      const section = user?.section || 'Section A';

      const [summaryData, sessionData] = await Promise.all([
        fetchAttendanceSummary({ studentId, studentName, section }),
        fetchAttendanceSessions({ section })
      ]);

      if (summaryData.length > 0) {
        setSummaryList(summaryData);
      } else {
        // Fallback demo summary data if fresh database
        setSummaryList([
          { courseCode: 'CSE-101', courseTitle: 'Structured Programming Language', totalClasses: 12, present: 10, absent: 1, late: 1, percentage: 92, statusLabel: 'Safe' },
          { courseCode: 'CSE-102', courseTitle: 'Data Structures & Algorithms', totalClasses: 10, present: 8, absent: 1, late: 1, percentage: 85, statusLabel: 'Safe' },
          { courseCode: 'MAT-105', courseTitle: 'Differential Calculus & Geometry', totalClasses: 14, present: 10, absent: 3, late: 1, percentage: 75, statusLabel: 'Safe' },
          { courseCode: 'EEE-101', courseTitle: 'Basic Electrical Engineering', totalClasses: 15, present: 9, absent: 5, late: 1, percentage: 67, statusLabel: 'Danger' },
        ]);
      }

      setSessions(sessionData);
    } catch (err) {
      console.warn('Attendance load error:', err);
    } finally {
      setLoading(false);
    }
  }

  // Fetch student roster when open modal
  const handleOpenMarkModal = async () => {
    setShowMarkModal(true);
    setSubmitSuccess('');
    try {
      const allUsers = await fetchUsers();
      const sectionStudents = allUsers.filter(u => u.role === 'student' && (u.section === selectedSection || !u.section));
      
      if (sectionStudents.length > 0) {
        setStudentRoster(sectionStudents.map(s => ({
          studentId: s.studentId || s._id,
          studentName: s.name,
          status: 'Present'
        })));
      } else {
        // Default roster if no registered users in section
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

  const handleSubmitAttendance = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await submitAttendanceSession({
        courseCode: selectedCourse.courseCode,
        courseTitle: selectedCourse.courseTitle,
        section: selectedSection,
        date: attendanceDate,
        timeSlot: '09:00 AM - 10:30 AM',
        markedBy: user?.name || 'Class Representative',
        markedByRole: user?.role || 'cr',
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

  const overallTotal = summaryList.reduce((acc, c) => acc + c.totalClasses, 0);
  const overallAttended = summaryList.reduce((acc, c) => acc + (c.present + c.late), 0);
  const overallPercentage = overallTotal > 0 ? Math.round((overallAttended / overallTotal) * 100) : 100;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-700 p-6 sm:p-10 text-white shadow-xl">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-bold uppercase tracking-wider mb-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                <span>Attendance System</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                Class Attendance & Metrics 📊
              </h1>
              <p className="mt-2 text-emerald-100 text-sm sm:text-base max-w-xl">
                Track your course attendance percentage, monitor minimum 75% compliance requirements, and log daily class registers.
              </p>
            </div>

            {isFacultyOrCR && (
              <button
                onClick={handleOpenMarkModal}
                className="px-6 py-3.5 rounded-2xl bg-white text-slate-900 font-bold hover:bg-emerald-50 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2.5 group shrink-0"
              >
                <UserCheck className="w-5 h-5 text-emerald-600 group-hover:scale-110 transition-transform" />
                <span>Mark Today's Attendance</span>
              </button>
            )}
          </div>
        </div>

        {/* Overview Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Overall Attendance</span>
              <div className={`p-2 rounded-xl ${overallPercentage >= 75 ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400' : 'bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400'}`}>
                <TrendingUp className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold">{overallPercentage}%</span>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${overallPercentage >= 75 ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300' : 'bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300'}`}>
                {overallPercentage >= 75 ? 'Safe' : 'Danger'}
              </span>
            </div>
            <div className="mt-3 w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full ${overallPercentage >= 75 ? 'bg-emerald-500' : 'bg-rose-500'}`}
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
            <p className="mt-1 text-xs text-slate-400">Across all registered courses</p>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Attended Classes</span>
              <div className="p-2 rounded-xl bg-teal-50 text-teal-600 dark:bg-teal-950/60 dark:text-teal-400">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3 text-3xl font-extrabold">{overallAttended}</div>
            <p className="mt-1 text-xs text-teal-600 dark:text-teal-400 font-medium">Present or Late entry</p>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Compliance Status</span>
              <div className="p-2 rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400">
                <ShieldAlert className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3 text-xl font-bold text-slate-800 dark:text-slate-200">
              Min 75% Rule
            </div>
            <p className="mt-1 text-xs text-slate-400">Exam eligibility threshold</p>
          </div>

        </div>

        {/* Course Percentage Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold tracking-tight">Course Attendance Summary</h2>
            <div className="text-xs text-slate-400 font-medium">Auto-updated from live registers</div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {summaryList.map((course) => {
              const isSafe = course.percentage >= 75;
              const isWarning = course.percentage >= 70 && course.percentage < 75;
              
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
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${
                        isSafe 
                          ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                          : isWarning
                          ? 'bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                          : 'bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 animate-pulse'
                      }`}>
                        {isSafe ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
                        {course.percentage}% — {course.statusLabel}
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
                        className={`h-full rounded-full transition-all duration-500 ${
                          isSafe ? 'bg-emerald-500' : isWarning ? 'bg-amber-500' : 'bg-rose-500'
                        }`}
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

                  {!isSafe && (
                    <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-100 dark:border-rose-900/50 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 shrink-0 text-rose-500" />
                      <span>Warning: Your attendance is below 75%. Attend upcoming classes to remain exam eligible.</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

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
                    <p className="text-xs text-slate-400">Class Representative & Faculty Register</p>
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
                        value={selectedCourse.courseCode}
                        onChange={(e) => {
                          const found = MOCK_COURSES.find(c => c.courseCode === e.target.value);
                          if (found) setSelectedCourse(found);
                        }}
                        className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold"
                      >
                        {MOCK_COURSES.map(c => (
                          <option key={c.courseCode} value={c.courseCode}>{c.courseCode} - {c.courseTitle}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Academic Section</label>
                      <select 
                        value={selectedSection}
                        onChange={(e) => setSelectedSection(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold"
                      >
                        <option value="Section A">Section A</option>
                        <option value="Section B">Section B</option>
                        <option value="Section C">Section C</option>
                        <option value="Section D">Section D</option>
                        <option value="Section E">Section E</option>
                      </select>
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

                  {/* Student Roster Table */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Student Roster ({studentRoster.length})</h4>
                      <span className="text-[11px] text-slate-400">Click badges to toggle status</span>
                    </div>

                    <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
                      {studentRoster.map((student, idx) => (
                        <div key={student.studentId} className="p-3.5 bg-white dark:bg-slate-900 flex items-center justify-between">
                          <div>
                            <p className="text-xs font-bold text-slate-900 dark:text-white">{student.studentName}</p>
                            <p className="text-[10px] text-slate-400">{student.studentId}</p>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => toggleStudentStatus(idx, 'Present')}
                              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                                student.status === 'Present' 
                                  ? 'bg-emerald-500 text-white shadow-xs' 
                                  : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-emerald-50'
                              }`}
                            >
                              Present
                            </button>
                            <button
                              type="button"
                              onClick={() => toggleStudentStatus(idx, 'Absent')}
                              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                                student.status === 'Absent' 
                                  ? 'bg-rose-500 text-white shadow-xs' 
                                  : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-rose-50'
                              }`}
                            >
                              Absent
                            </button>
                            <button
                              type="button"
                              onClick={() => toggleStudentStatus(idx, 'Late')}
                              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                                student.status === 'Late' 
                                  ? 'bg-amber-500 text-white shadow-xs' 
                                  : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-amber-50'
                              }`}
                            >
                              Late
                            </button>
                          </div>
                        </div>
                      ))}
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
    </div>
  );
}
