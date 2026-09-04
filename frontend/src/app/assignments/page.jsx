'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { fetchAssignments, createAssignment, updateAssignment, submitAssignmentSolution, deleteAssignment } from '../../lib/api';
import { 
  ClipboardList, 
  Clock, 
  Calendar, 
  CheckCircle2, 
  AlertCircle, 
  Plus, 
  FileText, 
  Link as LinkIcon, 
  Upload, 
  Trash2, 
  User,
  Send,
  XCircle,
  ExternalLink,
  Crown,
  Pencil,
  Eye
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AssignmentsPage() {
  const { user } = useAuth();
  const isFacultyOrAdmin = user?.role === 'faculty' || user?.role === 'admin';
  const isFacultyOrCR = isFacultyOrAdmin || user?.isCR;
  const isStudent = user?.role === 'student' || (!user?.role && !user);

  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All'); // 'All', 'Pending', 'Submitted'

  // Post / Edit modal state
  const [showPostModal, setShowPostModal] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState(null);
  const [newTitle, setNewTitle] = useState('');
  const [newCourseCode, setNewCourseCode] = useState('CSE-102');
  const [newCourseTitle, setNewCourseTitle] = useState('Data Structures & Algorithms');
  const [newSection, setNewSection] = useState(user?.section || 'Section A');
  const [newDescription, setNewDescription] = useState('');
  const [newDueDate, setNewDueDate] = useState('');
  const [newTotalPoints, setNewTotalPoints] = useState(100);
  const [newAttachmentUrl, setNewAttachmentUrl] = useState('');
  const [isPosting, setIsPosting] = useState(false);

  // Submit modal state
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [submissionUrl, setSubmissionUrl] = useState('');
  const [submissionNotes, setSubmissionNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeSubmissionsView, setActiveSubmissionsView] = useState(null);

  useEffect(() => {
    loadAssignments();
  }, [user]);

  async function loadAssignments() {
    setLoading(true);
    try {
      const data = await fetchAssignments(user?.section || 'Section A');
      if (data.length > 0) {
        setAssignments(data);
      } else {
        // Initial fallback assignments for demonstration
        setAssignments([
          {
            _id: 'demo-1',
            title: 'Lab Assignment 1: Linked List Implementation',
            courseCode: 'CSE-102',
            courseTitle: 'Data Structures & Algorithms',
            section: 'Section A',
            description: 'Implement a doubly linked list in C++ with functions for insertion, deletion, and reverse traversal.',
            dueDate: new Date(Date.now() + 86400000 * 2).toISOString(), // Due in 2 days
            totalPoints: 100,
            attachmentUrl: 'https://drive.google.com',
            createdBy: 'Sarah Ahmed (Faculty)',
            createdByRole: 'faculty',
            submissions: []
          },
          {
            _id: 'demo-2',
            title: 'Assignment 2: Calculus Problems Set 4',
            courseCode: 'MAT-105',
            courseTitle: 'Differential Calculus & Geometry',
            section: 'Section A',
            description: 'Solve questions 1 through 15 from Chapter 4 on optimization and partial derivatives.',
            dueDate: new Date(Date.now() + 86400000 * 5).toISOString(),
            totalPoints: 50,
            attachmentUrl: '',
            createdBy: 'CR Sabbir',
            createdByRole: 'cr',
            submissions: [
              { studentId: user?.studentId || '2026-CSE-001', studentName: user?.name || 'Ruhul Amin', submissionUrl: 'https://github.com', submittedAt: new Date() }
            ]
          }
        ]);
      }
    } catch (err) {
      console.warn('Assignments fetch error:', err);
    } finally {
      setLoading(false);
    }
  }

  const handleOpenCreateModal = () => {
    setEditingAssignment(null);
    resetForm();
    setShowPostModal(true);
  };

  const handleOpenEditModal = (item) => {
    setEditingAssignment(item);
    setNewTitle(item.title || '');
    setNewCourseCode(item.courseCode || 'CSE-102');
    setNewCourseTitle(item.courseTitle || 'Data Structures & Algorithms');
    setNewSection(item.section || user?.section || 'Section A');
    setNewDescription(item.description || '');

    // Format ISO string to datetime-local string format YYYY-MM-DDTHH:mm
    if (item.dueDate) {
      try {
        const d = new Date(item.dueDate);
        const isoStr = new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
        setNewDueDate(isoStr);
      } catch (e) {
        setNewDueDate('');
      }
    } else {
      setNewDueDate('');
    }

    setNewTotalPoints(item.totalPoints || 100);
    setNewAttachmentUrl(item.attachmentUrl || '');
    setShowPostModal(true);
  };

  const handleSaveAssignment = async (e) => {
    e.preventDefault();
    if (!newTitle || !newDueDate) return;

    setIsPosting(true);
    try {
      if (editingAssignment) {
        await updateAssignment(editingAssignment._id, {
          title: newTitle,
          courseCode: newCourseCode,
          courseTitle: newCourseTitle,
          section: newSection,
          description: newDescription,
          dueDate: newDueDate,
          totalPoints: Number(newTotalPoints),
          attachmentUrl: newAttachmentUrl
        });
      } else {
        await createAssignment({
          title: newTitle,
          courseCode: newCourseCode,
          courseTitle: newCourseTitle,
          section: newSection,
          description: newDescription,
          dueDate: newDueDate,
          totalPoints: Number(newTotalPoints),
          attachmentUrl: newAttachmentUrl,
          createdBy: user?.name || 'Faculty / CR',
          createdByRole: user?.role === 'student' ? 'cr' : user?.role || 'faculty'
        });
      }
      setShowPostModal(false);
      setEditingAssignment(null);
      resetForm();
      loadAssignments();
    } catch (err) {
      alert(`Failed to ${editingAssignment ? 'update' : 'post'} assignment: ` + err.message);
    } finally {
      setIsPosting(false);
    }
  };

  const resetForm = () => {
    setNewTitle('');
    setNewDescription('');
    setNewDueDate('');
    setNewAttachmentUrl('');
  };

  const handleSubmitSolution = async (e) => {
    e.preventDefault();
    if (!submissionUrl || !selectedAssignment) return;

    setIsSubmitting(true);
    try {
      await submitAssignmentSolution(selectedAssignment._id, {
        studentId: user?.studentId || user?._id || '2026-CSE-001',
        studentName: user?.name || 'Student User',
        submissionUrl,
        notes: submissionNotes
      });
      setSelectedAssignment(null);
      setSubmissionUrl('');
      setSubmissionNotes('');
      loadAssignments();
    } catch (err) {
      alert('Failed to submit solution: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteAssignment = async (id) => {
    if (!confirm('Are you sure you want to delete this assignment?')) return;
    try {
      await deleteAssignment(id);
      loadAssignments();
    } catch (err) {
      alert('Failed to delete assignment: ' + err.message);
    }
  };

  // Helper for computing countdown text
  const getCountdownBadge = (dueDateStr) => {
    const due = new Date(dueDateStr).getTime();
    const now = new Date().getTime();
    const diffMs = due - now;

    if (diffMs <= 0) {
      return { label: 'Overdue', color: 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border-rose-200' };
    }

    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) {
      return { label: `Due in ${diffDays} day${diffDays > 1 ? 's' : ''}`, color: 'bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border-blue-200' };
    }
    return { label: `Due in ${diffHours} hour${diffHours > 1 ? 's' : ''}`, color: 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border-amber-200 animate-pulse' };
  };

  const filteredAssignments = assignments.filter(item => {
    const hasSubmitted = item.submissions?.some(s => s.studentId === (user?.studentId || user?._id || '2026-CSE-001'));
    if (filter === 'Pending') return !hasSubmitted;
    if (filter === 'Submitted') return hasSubmitted;
    return true;
  });

  return (
    <div className="space-y-8">
        
        {/* Header Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-10 text-white shadow-xl">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-bold uppercase tracking-wider mb-3 text-blue-400">
                <ClipboardList className="w-4 h-4 text-blue-400" />
                <span>Assignments & Tasks</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
                Assignments & Deadline Hub 📝
              </h1>
              <p className="mt-2 text-slate-300 text-sm sm:text-base max-w-xl">
                Stay updated on upcoming coursework deadlines, submit homework solutions, and track graded tasks.
              </p>
            </div>

            {isFacultyOrCR && (
              <button
                onClick={handleOpenCreateModal}
                className="px-6 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition-all shadow-md flex items-center justify-center gap-2.5 group shrink-0 text-xs"
              >
                <Plus className="w-5 h-5 text-white group-hover:scale-110 transition-transform" />
                <span>Create New Assignment</span>
              </button>
            )}
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            {['All', 'Pending', 'Submitted'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  filter === f
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {f} Tasks
              </button>
            ))}
          </div>
          <div className="text-xs font-semibold text-slate-400">
            Showing {filteredAssignments.length} Assignments
          </div>
        </div>

        {/* Assignments Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredAssignments.map((item) => {
            const countdown = getCountdownBadge(item.dueDate);
            const userSubmission = item.submissions?.find(s => s.studentId === (user?.studentId || user?._id || '2026-CSE-001'));
            const isSubmitted = !!userSubmission;

            return (
              <div 
                key={item._id}
                className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4 h-full w-full"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <span className="px-3 py-1 rounded-xl text-xs font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/60">
                      {item.courseCode} • {item.section}
                    </span>

                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${countdown.color}`}>
                      {countdown.label}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-snug">
                    {item.title}
                  </h3>

                  <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-3">
                    {item.description}
                  </p>

                  <div className="flex items-center gap-4 text-xs font-medium text-slate-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-blue-500" />
                      Due: {new Date(item.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span className="flex items-center gap-1">
                      <FileText className="w-3.5 h-3.5 text-blue-500" />
                      {item.totalPoints} Marks
                    </span>
                  </div>

                  {item.attachmentUrl && (
                    <a
                      href={item.attachmentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-blue-500 transition-colors"
                    >
                      <LinkIcon className="w-3.5 h-3.5 text-blue-500" />
                      <span>Attachment Link</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>

                {/* Submissions & Footer Action */}
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    {!isFacultyOrAdmin && (
                      isSubmitted ? (
                        <span className="px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold text-xs flex items-center gap-1 border border-emerald-200">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                          Submitted
                        </span>
                      ) : (
                        <span className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 font-medium text-xs flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
                          Pending
                        </span>
                      )
                    )}
                    {isFacultyOrAdmin && (
                      <span className="px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-bold text-xs flex items-center gap-1 border border-blue-200 dark:border-blue-800">
                        <Crown className="w-3.5 h-3.5 text-blue-500" />
                        Instructor View
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {isFacultyOrCR && (
                      <>
                        <button
                          onClick={() => setActiveSubmissionsView(item)}
                          className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1"
                          title="View Student Submissions"
                        >
                          <Eye className="w-3.5 h-3.5 text-slate-500" />
                          Submissions ({item.submissions?.length || 0})
                        </button>

                        <button
                          onClick={() => handleOpenEditModal(item)}
                          className="px-3 py-1.5 rounded-xl border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 text-xs font-semibold hover:bg-blue-50 dark:hover:bg-blue-950/40 flex items-center gap-1"
                          title="Edit Assignment Details & Due Date"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                          Edit / Due Date
                        </button>

                        <button
                          onClick={() => handleDeleteAssignment(item._id)}
                          className="p-1.5 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                          title="Delete Assignment"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}

                    {/* Only Students can submit solutions */}
                    {!isFacultyOrAdmin && (
                      !isSubmitted ? (
                        <button
                          onClick={() => setSelectedAssignment(item)}
                          className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
                        >
                          <Send className="w-3.5 h-3.5" />
                          Submit Work
                        </button>
                      ) : (
                        <button
                          onClick={() => setSelectedAssignment(item)}
                          className="px-4 py-2 rounded-xl border border-emerald-500 text-emerald-600 dark:text-emerald-400 text-xs font-bold hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
                        >
                          Update Submission
                        </button>
                      )
                    )}
                  </div>
                </div>

              </div>
            );
          })}
        </div>

        {/* Post / Edit Assignment Modal */}
        <AnimatePresence>
          {showPostModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden"
              >
                <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
                  <h3 className="text-lg font-bold">
                    {editingAssignment ? 'Edit Assignment & Due Date 📝' : 'Post New Assignment 📝'}
                  </h3>
                  <button onClick={() => setShowPostModal(false)} className="text-slate-400 hover:text-white">
                    <XCircle className="w-6 h-6" />
                  </button>
                </div>

                <form onSubmit={handleSaveAssignment} className="p-6 space-y-4">
                  <div>
                    <label className="block text-xs font-bold mb-1">Assignment Title</label>
                    <input 
                      type="text"
                      required
                      placeholder="e.g. Lab 2: Binary Search Trees"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold mb-1">Course Code</label>
                      <input 
                        type="text"
                        required
                        value={newCourseCode}
                        onChange={(e) => setNewCourseCode(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold mb-1">Section</label>
                      <select
                        value={newSection}
                        onChange={(e) => setNewSection(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium"
                      >
                        <option value="Section A">Section A</option>
                        <option value="Section B">Section B</option>
                        <option value="Section C">Section C</option>
                        <option value="Section D">Section D</option>
                        <option value="Section E">Section E</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold mb-1">Description & Instructions</label>
                    <textarea 
                      rows={3}
                      placeholder="Specify problem statement, rules, and submission guidelines..."
                      value={newDescription}
                      onChange={(e) => setNewDescription(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold mb-1">Due Date & Time *</label>
                      <input 
                        type="datetime-local"
                        required
                        value={newDueDate}
                        onChange={(e) => setNewDueDate(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold mb-1">Total Points</label>
                      <input 
                        type="number"
                        value={newTotalPoints}
                        onChange={(e) => setNewTotalPoints(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold mb-1">Attachment Link (Optional)</label>
                    <input 
                      type="url"
                      placeholder="https://drive.google.com/..."
                      value={newAttachmentUrl}
                      onChange={(e) => setNewAttachmentUrl(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium"
                    />
                  </div>

                  <div className="flex justify-end gap-3 pt-3">
                    <button
                      type="button"
                      onClick={() => setShowPostModal(false)}
                      className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isPosting}
                      className="px-6 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition-colors"
                    >
                      {isPosting ? 'Saving...' : editingAssignment ? 'Save Changes' : 'Publish Assignment'}
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Submissions List Modal */}
        <AnimatePresence>
          {activeSubmissionsView && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden p-6 space-y-4 max-h-[85vh] flex flex-col"
              >
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">Student Submissions</h3>
                    <p className="text-xs text-slate-400">{activeSubmissionsView.title} ({activeSubmissionsView.courseCode})</p>
                  </div>
                  <button onClick={() => setActiveSubmissionsView(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white">
                    <XCircle className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                  {!activeSubmissionsView.submissions || activeSubmissionsView.submissions.length === 0 ? (
                    <div className="py-12 text-center text-xs text-slate-400 font-medium">
                      No student submissions recorded for this assignment yet.
                    </div>
                  ) : (
                    activeSubmissionsView.submissions.map((sub, idx) => (
                      <div key={idx} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                          <p className="text-xs font-bold text-slate-900 dark:text-white">{sub.studentName}</p>
                          <p className="text-[11px] text-slate-400 font-mono">ID: {sub.studentId}</p>
                          {sub.notes && (
                            <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 italic">"{sub.notes}"</p>
                          )}
                          <p className="text-[10px] text-slate-400 mt-1">
                            Submitted: {new Date(sub.submittedAt).toLocaleString()}
                          </p>
                        </div>

                        {sub.submissionUrl && (
                          <a
                            href={sub.submissionUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition-colors inline-flex items-center gap-1.5 shrink-0"
                          >
                            <span>Open Submission</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                    ))
                  )}
                </div>

                <div className="flex justify-end pt-2 border-t border-slate-100 dark:border-slate-800">
                  <button
                    onClick={() => setActiveSubmissionsView(null)}
                    className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-200"
                  >
                    Close
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Submit Solution Modal */}
        <AnimatePresence>
          {selectedAssignment && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden p-6 space-y-4"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold">Submit Assignment Solution</h3>
                  <button onClick={() => setSelectedAssignment(null)} className="text-slate-400 hover:text-white">
                    <XCircle className="w-5 h-5" />
                  </button>
                </div>

                <div className="p-3 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-100 dark:border-blue-800 text-xs">
                  <p className="font-bold text-blue-900 dark:text-blue-200">{selectedAssignment.title}</p>
                  <p className="text-[11px] text-blue-600 dark:text-blue-400">{selectedAssignment.courseCode}</p>
                </div>

                <form onSubmit={handleSubmitSolution} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold mb-1">Submission File / Repository Link *</label>
                    <input 
                      type="url"
                      required
                      placeholder="e.g. Google Drive PDF link or GitHub repo URL"
                      value={submissionUrl}
                      onChange={(e) => setSubmissionUrl(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold mb-1">Submission Notes (Optional)</label>
                    <textarea 
                      rows={2}
                      placeholder="Add any comments for the instructor..."
                      value={submissionNotes}
                      onChange={(e) => setSubmissionNotes(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium"
                    />
                  </div>

                  <div className="flex justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setSelectedAssignment(null)}
                      className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-6 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700"
                    >
                      {isSubmitting ? 'Submitting...' : 'Confirm Submission'}
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
