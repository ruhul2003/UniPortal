'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { fetchMarks, fetchStudentMarks, saveMarks, bulkPublishMarks, updateCTRule, deleteMarkRecord } from '../../lib/api';
import MarksFormModal from '../../components/MarksFormModal';
import AttendancePage from '../attendance/page';
import {
  Award,
  BookOpen,
  CheckCircle2,
  Clock,
  Filter,
  Plus,
  Send,
  Trash2,
  Edit3,
  Search,
  Sparkles,
  TrendingUp,
  UserCheck,
  AlertCircle,
  FileSpreadsheet,
  BarChart3,
  Layers,
  ChevronRight,
  Calendar,
  Calculator
} from 'lucide-react';
import { motion } from 'framer-motion';

function MarksPageContent() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const initialTab = searchParams.get('tab') === 'attendance' ? 'attendance' : 'marks';
  const [activeSectionTab, setActiveSectionTab] = useState(initialTab);

  const isFacultyOrAdmin = user?.role === 'faculty' || user?.role === 'admin';

  // Filters state
  const [selectedSection, setSelectedSection] = useState('Section A');
  const [selectedCourse, setSelectedCourse] = useState('All');
  const [selectedCTRule, setSelectedCTRule] = useState('best');
  const [searchQuery, setSearchQuery] = useState('');

  // Data state
  const [marksList, setMarksList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      if (isFacultyOrAdmin) {
        const data = await fetchMarks({
          section: selectedSection,
          courseCode: selectedCourse
        });
        setMarksList(data);
      } else {
        // Student view
        const studentId = user?.studentId || 'CSE-2024-042';
        const data = await fetchStudentMarks(studentId);
        setMarksList(data);
      }
    } catch (err) {
      console.error('Error loading marks data:', err);
      setError('Failed to load marks. Please check database connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user, selectedSection, selectedCourse]);

  // Bulk actions
  const handleBulkPublish = async (shouldPublish) => {
    try {
      setError('');
      setSuccessMessage('');
      await bulkPublishMarks({
        courseCode: selectedCourse,
        section: selectedSection,
        published: shouldPublish,
        publishedBy: user?.name || 'Faculty'
      });
      setSuccessMessage(`Marks successfully ${shouldPublish ? 'published' : 'saved as drafts'}!`);
      setTimeout(() => setSuccessMessage(''), 4000);
      loadData();
    } catch (err) {
      setError(err.message || 'Failed to update publication status');
    }
  };

  // Bulk CT calculation rule update
  const handleApplyCTRule = async (newRule) => {
    setSelectedCTRule(newRule);
    try {
      setError('');
      setSuccessMessage('');
      const res = await updateCTRule({
        courseCode: selectedCourse,
        section: selectedSection,
        ctRule: newRule
      });
      const ruleLabel = newRule === 'best' ? 'Best CT Score' : newRule === 'average' ? 'Average of CTs' : 'Sum of CTs';
      setSuccessMessage(`CT calculation strategy updated to '${ruleLabel}' for all matching records (${res.modifiedCount || 0} updated)!`);
      setTimeout(() => setSuccessMessage(''), 4000);
      loadData();
    } catch (err) {
      setError(err.message || 'Failed to update CT calculation strategy');
    }
  };

  // Delete record
  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this marks entry?')) return;
    try {
      await deleteMarkRecord(id);
      setSuccessMessage('Marks record deleted');
      setTimeout(() => setSuccessMessage(''), 3000);
      loadData();
    } catch (err) {
      setError('Failed to delete mark record');
    }
  };

  // Save single record from modal
  const handleSaveModalRecord = async (recordData) => {
    try {
      await saveMarks({
        ...recordData,
        publishedBy: user?.name || 'Dr. Sarah Abedin'
      });
      setSuccessMessage('Student marks updated successfully');
      setTimeout(() => setSuccessMessage(''), 3000);
      loadData();
    } catch (err) {
      throw err;
    }
  };

  // Filtered marks for table
  const filteredMarks = marksList.filter(item => {
    const query = searchQuery.toLowerCase();
    return (
      item.studentName?.toLowerCase().includes(query) ||
      item.studentId?.toLowerCase().includes(query) ||
      item.courseCode?.toLowerCase().includes(query)
    );
  });

  // Calculate summary metrics for faculty header
  const totalEntries = marksList.length;
  const publishedCount = marksList.filter(m => m.published).length;
  const draftCount = totalEntries - publishedCount;
  const avgMarks = totalEntries > 0
    ? (marksList.reduce((acc, curr) => acc + (curr.totalMarks || 0), 0) / totalEntries).toFixed(1)
    : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner & Header */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-900 border border-slate-200 dark:border-slate-800 text-white p-6 sm:p-10 shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-semibold tracking-wider text-blue-400 mb-3">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              {isFacultyOrAdmin ? 'FACULTY MARKS PUBLISHING PORTAL' : 'STUDENT ACADEMIC GRADEBOOK'}
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
              {isFacultyOrAdmin ? 'Publish & Manage Course Marks' : 'My Academic Marks & Performance'}
            </h1>
            <p className="mt-2 text-slate-300 text-sm sm:text-base max-w-2xl">
              {isFacultyOrAdmin
                ? 'Publish class tests (CT1, CT2), midterms, finals, assignment scores, and attendance marks directly to student portals.'
                : 'Review your semester scores across CT1, CT2, Midterm, Final Exams, Assignments, and Attendance.'}
            </p>
          </div>

          {/* Role badge */}
          <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/15">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center font-bold">
              <Award className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-xs text-slate-300 block uppercase font-bold tracking-wider">
                Current Mode
              </span>
              <span className="text-sm font-bold text-white">
                {user?.role === 'admin' ? 'Admin Portal' : user?.role === 'faculty' ? 'Faculty Member' : 'Student Portal'}
              </span>
            </div>
          </div>
        </div>

        {/* Decorative background glow circles */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Unified Section Navigation Tabs (Attendance & Marks) */}
      <div className="flex items-center gap-3 p-1.5 rounded-2xl bg-slate-200/80 dark:bg-slate-800/80 w-fit">
        <button
          onClick={() => setActiveSectionTab('marks')}
          className={`flex items-center gap-2.5 px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all ${
            activeSectionTab === 'marks'
              ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-md'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>Course Marks & Gradebook</span>
        </button>

        <button
          onClick={() => setActiveSectionTab('attendance')}
          className={`flex items-center gap-2.5 px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all ${
            activeSectionTab === 'attendance'
              ? 'bg-white dark:bg-slate-900 text-teal-600 dark:text-teal-400 shadow-md'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>Daily Class Attendance Tracker</span>
        </button>
      </div>

      {/* Render Attendance Tab content if selected */}
      {activeSectionTab === 'attendance' ? (
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-white dark:bg-slate-900 p-2">
          <AttendancePage />
        </div>
      ) : (
        <>

      {/* Notifications */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 flex items-center gap-3 text-rose-700 dark:text-rose-300 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {successMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center gap-3 text-emerald-700 dark:text-emerald-300 text-sm">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* ========================================================= */}
      {/* FACULTY / ADMIN VIEW                                       */}
      {/* ========================================================= */}
      {isFacultyOrAdmin ? (
        <div className="space-y-6">
          {/* Summary Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Total Graded
                </span>
                <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <FileSpreadsheet className="w-4 h-4" />
                </div>
              </div>
              <p className="text-3xl font-black text-slate-900 dark:text-white mt-3">{totalEntries}</p>
              <span className="text-xs text-slate-500 mt-1 block">Student records in sheet</span>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Published Live
                </span>
                <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              </div>
              <p className="text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-3">{publishedCount}</p>
              <span className="text-xs text-slate-500 mt-1 block">Visible on student portals</span>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Draft Entries
                </span>
                <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                  <Clock className="w-4 h-4" />
                </div>
              </div>
              <p className="text-3xl font-black text-amber-600 dark:text-amber-400 mt-3">{draftCount}</p>
              <span className="text-xs text-slate-500 mt-1 block">Awaiting publication</span>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Class Average
                </span>
                <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                  <BarChart3 className="w-4 h-4" />
                </div>
              </div>
              <p className="text-3xl font-black text-slate-900 dark:text-white mt-3">{avgMarks} <span className="text-xs font-normal text-slate-500">/ 100</span></p>
              <span className="text-xs text-slate-500 mt-1 block">Overall average score</span>
            </div>
          </div>

          {/* Action Bar & Filters */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 sm:p-5 rounded-3xl shadow-xs space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              {/* Left Filters */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-600 dark:text-slate-300">
                  <Filter className="w-4 h-4 text-indigo-500" />
                  <span>FILTERS:</span>
                </div>

                {/* Section filter */}
                <select
                  value={selectedSection}
                  onChange={(e) => setSelectedSection(e.target.value)}
                  className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-semibold outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="All">All Sections</option>
                  <option value="Section A">Section A</option>
                  <option value="Section B">Section B</option>
                  <option value="Section C">Section C</option>
                  <option value="Section D">Section D</option>
                  <option value="Section 9A">Section 9A</option>
                </select>

                {/* Course filter */}
                <select
                  value={selectedCourse}
                  onChange={(e) => setSelectedCourse(e.target.value)}
                  className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-semibold outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="All">All Courses</option>
                  <option value="CSE-3101">CSE-3101 (Database Management)</option>
                  <option value="CN">CN (Computer Networks)</option>
                  <option value="MACS">MACS (Math & Simulation)</option>
                  <option value="SD3">SD3 (Software Dev 3)</option>
                </select>

                {/* Search query */}
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search student or ID..."
                    className="pl-9 pr-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-semibold outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                {/* CT Calculation Strategy Selector */}
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800/80">
                  <Calculator className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <span className="text-xs font-bold text-indigo-900 dark:text-indigo-200">CT Strategy:</span>
                  <select
                    value={selectedCTRule}
                    onChange={(e) => handleApplyCTRule(e.target.value)}
                    className="px-2 py-1 rounded-lg border border-indigo-300 dark:border-indigo-700 bg-white dark:bg-slate-800 text-indigo-950 dark:text-white text-xs font-bold outline-none cursor-pointer focus:ring-2 focus:ring-indigo-500"
                    title="Change CT Calculation Strategy for this Section/Course"
                  >
                    <option value="best">⚡ Best CT Score (Max)</option>
                    <option value="average">📊 Average of CTs</option>
                    <option value="sum">➕ Sum of CTs</option>
                  </select>
                </div>
              </div>

              {/* Right Action buttons */}
              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => handleBulkPublish(true)}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-2 transition-all shadow-md shadow-emerald-600/20"
                >
                  <Send className="w-3.5 h-3.5" />
                  Publish All
                </button>

                <button
                  onClick={() => handleBulkPublish(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs flex items-center gap-2 transition-all"
                >
                  <Clock className="w-3.5 h-3.5" />
                  Unpublish / Draft
                </button>

                <button
                  onClick={() => {
                    setEditingRecord(null);
                    setIsModalOpen(true);
                  }}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-2 transition-all shadow-md shadow-indigo-600/20"
                >
                  <Plus className="w-4 h-4" />
                  New Student Marks
                </button>
              </div>
            </div>
          </div>

          {/* Interactive Marks Table */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Student Marks Sheet ({filteredMarks.length})
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Showing scores for CT1 (15), CT2 (15), CT Contribution (Best / Average / Sum), Mid (25), Final (40), Assignment (10), Attendance (10)
                </p>
              </div>

              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
                {selectedSection} • {selectedCourse}
              </span>
            </div>

            {loading ? (
              <div className="p-12 text-center text-slate-500 dark:text-slate-400 text-sm">
                Loading class marks dataset...
              </div>
            ) : filteredMarks.length === 0 ? (
              <div className="p-12 text-center space-y-3">
                <FileSpreadsheet className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto" />
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  No marks recorded for this section/course criteria.
                </p>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Click "+ New Student Marks" above to enter scores for CT1, CT2, Mid, Final, Assignment, and Attendance.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-bold border-b border-slate-100 dark:border-slate-800">
                      <th className="py-3.5 px-4">Student</th>
                      <th className="py-3.5 px-4">Course</th>
                      <th className="py-3.5 px-3 text-center">CT 1 <span className="text-[10px] font-normal text-slate-400">(15)</span></th>
                      <th className="py-3.5 px-3 text-center">CT 2 <span className="text-[10px] font-normal text-slate-400">(15)</span></th>
                      <th className="py-3.5 px-3 text-center">CT Mark <span className="text-[10px] font-normal text-slate-400">(Calculated)</span></th>
                      <th className="py-3.5 px-3 text-center">Mid <span className="text-[10px] font-normal text-slate-400">(25)</span></th>
                      <th className="py-3.5 px-3 text-center">Final <span className="text-[10px] font-normal text-slate-400">(40)</span></th>
                      <th className="py-3.5 px-3 text-center">Assign <span className="text-[10px] font-normal text-slate-400">(10)</span></th>
                      <th className="py-3.5 px-3 text-center">Attend <span className="text-[10px] font-normal text-slate-400">(10)</span></th>
                      <th className="py-3.5 px-4 text-center">Total</th>
                      <th className="py-3.5 px-3 text-center">Grade</th>
                      <th className="py-3.5 px-3 text-center">Status</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-700 dark:text-slate-300 font-medium">
                    {filteredMarks.map((row) => {
                      const effCT = row.effectiveCT !== undefined
                        ? row.effectiveCT
                        : row.ctRule === 'average'
                          ? ((row.ct1 || 0) + (row.ct2 || 0)) / 2
                          : row.ctRule === 'sum'
                            ? (row.ct1 || 0) + (row.ct2 || 0)
                            : Math.max(row.ct1 || 0, row.ct2 || 0);

                      const ruleName = row.ctRule === 'average' ? 'Avg' : row.ctRule === 'sum' ? 'Sum' : 'Best';

                      return (
                      <tr key={row._id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-900 dark:text-white">{row.studentName || 'Student'}</div>
                          <div className="text-[11px] text-slate-400 font-mono">{row.studentId} • {row.section}</div>
                        </td>

                        <td className="py-3.5 px-4 font-semibold text-slate-800 dark:text-slate-200">
                          {row.courseCode}
                        </td>

                        <td className="py-3.5 px-3 text-center font-semibold text-indigo-600 dark:text-indigo-400">
                          {row.ct1 ?? 0}
                        </td>

                        <td className="py-3.5 px-3 text-center font-semibold text-indigo-600 dark:text-indigo-400">
                          {row.ct2 ?? 0}
                        </td>

                        <td className="py-3.5 px-3 text-center">
                          <span className="font-black text-indigo-600 dark:text-indigo-400 block">{effCT}</span>
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-300 font-bold uppercase">
                            {ruleName}
                          </span>
                        </td>

                        <td className="py-3.5 px-3 text-center font-semibold text-purple-600 dark:text-purple-400">
                          {row.mid ?? 0}
                        </td>

                        <td className="py-3.5 px-3 text-center font-semibold text-blue-600 dark:text-blue-400">
                          {row.final ?? 0}
                        </td>

                        <td className="py-3.5 px-3 text-center font-semibold text-teal-600 dark:text-teal-400">
                          {row.assignment ?? 0}
                        </td>

                        <td className="py-3.5 px-3 text-center font-semibold text-amber-600 dark:text-amber-400">
                          {row.attendence ?? 0}
                        </td>

                        <td className="py-3.5 px-4 text-center">
                          <span className="text-sm font-black text-slate-900 dark:text-white">
                            {row.totalMarks ?? 0}
                          </span>
                          <span className="text-[10px] text-slate-400 block">/ 100</span>
                        </td>

                        <td className="py-3.5 px-3 text-center">
                          <span className="inline-block px-2.5 py-0.5 rounded-lg bg-indigo-600 text-white font-black text-xs shadow-xs">
                            {row.letterGrade || 'F'}
                          </span>
                        </td>

                        <td className="py-3.5 px-3 text-center">
                          {row.published ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-[11px]">
                              <CheckCircle2 className="w-3 h-3" />
                              Published
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold text-[11px]">
                              <Clock className="w-3 h-3" />
                              Draft
                            </span>
                          )}
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => {
                                setEditingRecord(row);
                                setIsModalOpen(true);
                              }}
                              title="Edit Marks"
                              className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>

                            <button
                              onClick={() => handleDelete(row._id)}
                              title="Delete Entry"
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* ========================================================= */
        /* STUDENT VIEW                                               */
        /* ========================================================= */
        <div className="space-y-6">
          {/* Performance Overview Banner */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white font-black text-2xl flex items-center justify-center shadow-lg shadow-indigo-600/30">
                <Award className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Academic Performance Summary
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Student ID: <span className="font-mono text-slate-700 dark:text-slate-300 font-bold">{user?.studentId || 'CSE-2024-042'}</span> • {user?.name || 'Rahim Chowdhury'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-6 bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
              <div className="text-center px-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">Courses Graded</span>
                <span className="text-xl font-black text-slate-900 dark:text-white">{marksList.length}</span>
              </div>
              <div className="h-8 w-px bg-slate-200 dark:bg-slate-700" />
              <div className="text-center px-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">Average GPA</span>
                <span className="text-xl font-black text-indigo-600 dark:text-indigo-400">
                  {marksList.length > 0
                    ? (marksList.reduce((acc, curr) => acc + (curr.gpa || 0), 0) / marksList.length).toFixed(2)
                    : '4.00'}
                </span>
              </div>
            </div>
          </div>

          {/* Student Grade Cards List */}
          {loading ? (
            <div className="p-12 text-center text-slate-500 text-sm">
              Loading your academic marks...
            </div>
          ) : marksList.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-12 rounded-3xl text-center space-y-3">
              <Award className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto" />
              <h4 className="text-base font-bold text-slate-800 dark:text-slate-200">
                No Published Marks Yet
              </h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Your course instructors have not published marks for your section yet. Once CT1, CT2, Mid, Final, Assignment or Attendance scores are published, they will appear here.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {marksList.map((course) => (
                <motion.div
                  key={course._id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between"
                >
                  {/* Top Header */}
                  <div>
                    <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                      <div>
                        <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 tracking-wide uppercase block">
                          {course.courseCode}
                        </span>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                          {course.courseTitle || course.courseCode}
                        </h3>
                        <span className="text-xs text-slate-400 block mt-0.5">
                          Published by: {course.publishedBy || 'Faculty Member'}
                        </span>
                      </div>

                      {/* Grade Badge */}
                      <div className="text-center">
                        <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white font-black text-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
                          {course.letterGrade || 'A+'}
                        </div>
                        <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 mt-1 block">
                          GPA: {course.gpa?.toFixed(2)}
                        </span>
                      </div>
                    </div>

                    {/* Overall Progress Bar */}
                    <div className="my-5 space-y-1.5">
                      <div className="flex items-center justify-between text-xs font-bold">
                        <span className="text-slate-600 dark:text-slate-400">Total Score Percentage</span>
                        <span className="text-indigo-600 dark:text-indigo-400">{course.totalMarks || 0} / 100 Marks</span>
                      </div>
                      <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden p-0.5">
                        <div
                          className="h-full rounded-full bg-indigo-600 transition-all duration-500"
                          style={{ width: `${Math.min(100, course.totalMarks || 0)}%` }}
                        />
                      </div>
                    </div>

                    {/* Score Breakdown Grid */}
                    <div className="grid grid-cols-3 gap-2.5 pt-2">
                      <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-center">
                        <span className="text-[10px] font-bold text-slate-400 uppercase block">CT 1</span>
                        <span className="text-sm font-black text-indigo-600 dark:text-indigo-400">{course.ct1 ?? 0}</span>
                        <span className="text-[9px] text-slate-400 block">/ 15</span>
                      </div>

                      <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-center">
                        <span className="text-[10px] font-bold text-slate-400 uppercase block">CT 2</span>
                        <span className="text-sm font-black text-indigo-600 dark:text-indigo-400">{course.ct2 ?? 0}</span>
                        <span className="text-[9px] text-slate-400 block">/ 15</span>
                      </div>

                      <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-center">
                        <span className="text-[10px] font-bold text-slate-400 uppercase block">Midterm</span>
                        <span className="text-sm font-black text-purple-600 dark:text-purple-400">{course.mid ?? 0}</span>
                        <span className="text-[9px] text-slate-400 block">/ 25</span>
                      </div>

                      <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-center">
                        <span className="text-[10px] font-bold text-slate-400 uppercase block">Final</span>
                        <span className="text-sm font-black text-blue-600 dark:text-blue-400">{course.final ?? 0}</span>
                        <span className="text-[9px] text-slate-400 block">/ 40</span>
                      </div>

                      <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-center">
                        <span className="text-[10px] font-bold text-slate-400 uppercase block">Assignment</span>
                        <span className="text-sm font-black text-teal-600 dark:text-teal-400">{course.assignment ?? 0}</span>
                        <span className="text-[9px] text-slate-400 block">/ 10</span>
                      </div>

                      <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-center">
                        <span className="text-[10px] font-bold text-slate-400 uppercase block">Attendance</span>
                        <span className="text-sm font-black text-amber-600 dark:text-amber-400">{course.attendence ?? 0}</span>
                        <span className="text-[9px] text-slate-400 block">/ 10</span>
                      </div>
                    </div>

                    {/* CT Calculation Strategy Badge for Students */}
                    <div className="mt-3 p-2.5 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-800/60 flex items-center justify-between text-xs">
                      <span className="font-semibold text-indigo-700 dark:text-indigo-300 flex items-center gap-1.5">
                        <Calculator className="w-3.5 h-3.5 text-indigo-500" />
                        CT Calculation Strategy:
                      </span>
                      <span className="font-bold text-indigo-900 dark:text-indigo-200">
                        {course.ctRule === 'average' ? 'Average of CTs' : course.ctRule === 'sum' ? 'Sum of CTs' : 'Best CT Score'} 
                        ({course.effectiveCT !== undefined ? `${course.effectiveCT} marks` : `${course.ctRule === 'average' ? ((course.ct1||0)+(course.ct2||0))/2 : course.ctRule === 'sum' ? (course.ct1||0)+(course.ct2||0) : Math.max(course.ct1||0, course.ct2||0)} marks`})
                      </span>
                    </div>
                  </div>

                  {/* Remarks Footer */}
                  {course.remarks && (
                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 italic bg-indigo-50/50 dark:bg-indigo-950/20 p-2.5 rounded-xl">
                      "{course.remarks}"
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}
      </>
      )}

      {/* Marks Input/Edit Modal */}
      <MarksFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingRecord(null);
        }}
        initialData={editingRecord}
        onSave={handleSaveModalRecord}
        isFaculty={isFacultyOrAdmin}
      />
    </div>
  );
}

export default function MarksPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-slate-500">Loading Attendance & Marks...</div>}>
      <MarksPageContent />
    </Suspense>
  );
}
