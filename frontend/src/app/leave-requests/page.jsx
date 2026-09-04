'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  Stethoscope, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Plus, 
  Search, 
  Filter, 
  FileText, 
  ExternalLink, 
  Trash2, 
  User, 
  ShieldAlert, 
  Building2,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function LeaveRequestsPage() {
  const { user } = useAuth();
  const isFacultyOrAdmin = user?.role === 'faculty' || user?.role === 'admin';

  const [leaveRequests, setLeaveRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Apply Modal state (For Student)
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    courseCode: 'All Courses',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    reasonCategory: 'Sick Leave',
    reason: '',
    documentUrl: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // Action Modal state (For Faculty/Admin review)
  const [actionModal, setActionModal] = useState({
    isOpen: false,
    request: null,
    targetStatus: '',
    comment: ''
  });
  const [submittingAction, setSubmittingAction] = useState(false);

  useEffect(() => {
    fetchRequests();
  }, [user, filterStatus]);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      let url = 'http://localhost:5000/api/leave-requests?';
      if (!isFacultyOrAdmin && user?.studentId) {
        url += `studentId=${user.studentId}&`;
      }
      if (filterStatus !== 'All') {
        url += `status=${filterStatus}&`;
      }

      const res = await fetch(url);
      const data = await res.json();
      if (data.success && data.requests) {
        setLeaveRequests(data.requests);
      } else {
        throw new Error('Fallback dataset');
      }
    } catch (err) {
      console.warn('Using fallback leave request records:', err);
      setLeaveRequests([
        {
          _id: 'lr-1',
          studentId: user?.studentId || 'CSE-2024-042',
          studentName: user?.name || 'Rahim Chowdhury',
          department: 'Computer Science & Engineering',
          section: 'Section A',
          courseCode: 'CSE-3101',
          startDate: '2026-03-01',
          endDate: '2026-03-03',
          reasonCategory: 'Sick Leave',
          reason: 'Severe viral fever and Doctor prescribed 3 days rest.',
          documentUrl: 'https://drive.google.com',
          status: 'Approved',
          facultyComment: 'Excused for 3 days. Please catch up on Lab 4.',
          reviewedBy: 'Dr. Sarah Abedin',
          createdAt: new Date()
        },
        {
          _id: 'lr-2',
          studentId: 'CSE-2024-088',
          studentName: 'Tariqul Islam',
          department: 'Computer Science & Engineering',
          section: 'Section A',
          courseCode: 'All Courses',
          startDate: '2026-03-05',
          endDate: '2026-03-06',
          reasonCategory: 'Medical Emergency',
          reason: 'Emergency dental surgery.',
          documentUrl: 'https://drive.google.com',
          status: 'Pending',
          facultyComment: '',
          reviewedBy: '',
          createdAt: new Date()
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleApplySubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!formData.reason.trim()) {
      setFormError('Please state a valid reason for your absence.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('http://localhost:5000/api/leave-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: user?.studentId || user?._id || 'STUDENT',
          studentName: user?.name || 'Student',
          studentEmail: user?.email || '',
          department: user?.department || 'Computer Science & Engineering',
          section: user?.section || 'Section A',
          ...formData
        })
      });

      const data = await res.json();
      if (data.success && data.request) {
        setLeaveRequests(prev => [data.request, ...prev]);
        setIsApplyModalOpen(false);
        setFormData({
          courseCode: 'All Courses',
          startDate: new Date().toISOString().split('T')[0],
          endDate: new Date().toISOString().split('T')[0],
          reasonCategory: 'Sick Leave',
          reason: '',
          documentUrl: ''
        });
        alert('🎉 Sick Leave application submitted successfully!');
      } else {
        throw new Error(data.error || 'Failed to submit application');
      }
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmAction = async () => {
    if (!actionModal.request) return;

    setSubmittingAction(true);
    try {
      const res = await fetch(`http://localhost:5000/api/leave-requests/${actionModal.request._id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: actionModal.targetStatus,
          facultyComment: actionModal.comment,
          reviewedBy: user?.name || 'Faculty'
        })
      });

      const data = await res.json();
      if (data.success && data.request) {
        setLeaveRequests(prev => prev.map(r => r._id === data.request._id ? data.request : r));
        setActionModal({ isOpen: false, request: null, targetStatus: '', comment: '' });
      }
    } catch (err) {
      alert('Failed to update leave status: ' + err.message);
    } finally {
      setSubmittingAction(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to retract this leave request?')) return;
    try {
      await fetch(`http://localhost:5000/api/leave-requests/${id}`, { method: 'DELETE' });
      setLeaveRequests(prev => prev.filter(r => r._id !== id));
    } catch (err) {
      alert('Failed to delete request');
    }
  };

  const filteredRequests = leaveRequests.filter(r => {
    const query = searchQuery.toLowerCase();
    return (
      r.studentName?.toLowerCase().includes(query) ||
      r.studentId?.toLowerCase().includes(query) ||
      r.reasonCategory?.toLowerCase().includes(query) ||
      r.reason?.toLowerCase().includes(query)
    );
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-teal-600/10 text-teal-600 dark:text-teal-400 flex items-center justify-center border border-teal-500/20 shadow-inner">
              <Stethoscope className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                  Sick Leave & Absence Request Desk
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-100 dark:bg-teal-950/80 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                  Exemption Desk
                </span>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Submit medical certificates and formal leave applications to excuse class absence.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {!isFacultyOrAdmin && (
              <button
                onClick={() => setIsApplyModalOpen(true)}
                className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-xs transition-all shadow-md shadow-teal-500/20"
              >
                <Plus className="w-4 h-4" />
                Apply for Sick Leave
              </button>
            )}
          </div>
        </div>

        {/* Stats Metrics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-400">Total Applications</p>
              <h4 className="text-xl font-black text-slate-900 dark:text-white">{leaveRequests.length}</h4>
            </div>
          </div>

          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-400">Approved Exemptions</p>
              <h4 className="text-xl font-black text-emerald-600 dark:text-emerald-400">
                {leaveRequests.filter(r => r.status === 'Approved').length}
              </h4>
            </div>
          </div>

          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-400">Pending Review</p>
              <h4 className="text-xl font-black text-amber-600 dark:text-amber-400">
                {leaveRequests.filter(r => r.status === 'Pending').length}
              </h4>
            </div>
          </div>

          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
              <XCircle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-400">Rejected Applications</p>
              <h4 className="text-xl font-black text-rose-600 dark:text-rose-400">
                {leaveRequests.filter(r => r.status === 'Rejected').length}
              </h4>
            </div>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search by student name, ID, or reason..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
              <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="text-xs font-bold text-slate-500 shrink-0">Filter Status:</span>
              {['All', 'Pending', 'Approved', 'Rejected'].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all whitespace-nowrap ${
                    filterStatus === status
                      ? 'bg-teal-600 text-white shadow-md shadow-teal-500/20'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Applications List Grid */}
        <div>
          {loading ? (
            <div className="py-16 text-center text-slate-400 font-medium">
              <div className="w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p>Loading leave applications desk...</p>
            </div>
          ) : filteredRequests.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRequests.map((req) => (
                <motion.div
                  key={req._id}
                  layout
                  className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    {/* Header Badges */}
                    <div className="flex items-center justify-between">
                      <span className={`px-3 py-1 rounded-xl text-[11px] font-black uppercase tracking-wider border ${
                        req.status === 'Approved'
                          ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                          : req.status === 'Rejected'
                          ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800'
                          : 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800'
                      }`}>
                        {req.status}
                      </span>

                      <span className="px-2.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[10px] font-extrabold text-slate-600 dark:text-slate-300">
                        {req.reasonCategory}
                      </span>
                    </div>

                    {/* Student Info */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-teal-600 text-white font-extrabold flex items-center justify-center text-sm shadow-sm shrink-0">
                          {req.studentName ? req.studentName.charAt(0) : 'S'}
                        </div>
                        <div>
                          <h4 className="font-extrabold text-slate-900 dark:text-white text-sm">
                            {req.studentName}
                          </h4>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                            {req.studentId} • {req.section || 'Sec A'}
                          </p>
                        </div>
                      </div>

                      {/* Dates & Course */}
                      <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 space-y-1.5 text-xs">
                        <div className="flex justify-between">
                          <span className="text-slate-400">Course Scope:</span>
                          <span className="font-bold text-slate-800 dark:text-slate-200">{req.courseCode}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Leave Duration:</span>
                          <span className="font-bold text-teal-600 dark:text-teal-400">
                            {req.startDate} to {req.endDate}
                          </span>
                        </div>
                      </div>

                      {/* Reason text */}
                      <div className="text-xs text-slate-600 dark:text-slate-300">
                        <span className="font-bold text-slate-400 text-[10px] uppercase block">Absence Reason:</span>
                        <p className="line-clamp-3 italic text-slate-700 dark:text-slate-300 mt-0.5 font-medium">
                          "{req.reason}"
                        </p>
                      </div>

                      {/* Document Link */}
                      {req.documentUrl && (
                        <a
                          href={req.documentUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-600 dark:text-teal-400 hover:underline pt-1"
                        >
                          <ExternalLink className="w-3.5 h-3.5" /> View Medical Certificate / Prescription
                        </a>
                      )}

                      {/* Faculty note */}
                      {req.facultyComment && (
                        <div className="p-2.5 rounded-xl bg-teal-50/60 dark:bg-teal-950/40 border border-teal-100 dark:border-teal-800/40 text-[11px] text-teal-800 dark:text-teal-300">
                          <strong className="font-bold">Faculty Remarks:</strong> {req.facultyComment}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                    {isFacultyOrAdmin && req.status === 'Pending' ? (
                      <div className="flex items-center gap-2 w-full">
                        <button
                          onClick={() => setActionModal({ isOpen: true, request: req, targetStatus: 'Approved', comment: 'Approved. Absence marked as Excused.' })}
                          className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md flex items-center justify-center gap-1 transition-all"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                        </button>
                        <button
                          onClick={() => setActionModal({ isOpen: true, request: req, targetStatus: 'Rejected', comment: 'Rejected. Insufficient medical proof provided.' })}
                          className="flex-1 py-2 px-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs shadow-md flex items-center justify-center gap-1 transition-all"
                        >
                          <XCircle className="w-3.5 h-3.5" /> Reject
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between w-full text-xs text-slate-400 font-medium">
                        <span>{req.status === 'Pending' ? 'Awaiting Faculty Approval' : `Processed by ${req.reviewedBy || 'Faculty'}`}</span>
                        {req.status === 'Pending' && !isFacultyOrAdmin && (
                          <button
                            onClick={() => handleDelete(req._id)}
                            className="p-1 text-slate-400 hover:text-rose-500"
                            title="Retract application"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="py-16 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 space-y-2">
              <Stethoscope className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto" />
              <h4 className="text-base font-bold text-slate-700 dark:text-slate-300">No Leave Applications Found</h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">No absence requests match your current search criteria.</p>
            </div>
          )}
        </div>

        {/* Student Apply Modal */}
        <AnimatePresence>
          {isApplyModalOpen && (
            <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
              >
                <div className="p-6 bg-teal-950 text-white flex items-center justify-between">
                  <div>
                    <h3 className="font-black text-lg">Apply for Sick Leave / Absence</h3>
                    <p className="text-xs text-teal-200">Submit medical excuse to faculty</p>
                  </div>
                  <button onClick={() => setIsApplyModalOpen(false)} className="p-1 text-white/80 hover:text-white">
                    <XCircle className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleApplySubmit} className="p-6 space-y-4">
                  {formError && (
                    <div className="p-3 rounded-2xl bg-rose-50 text-rose-600 text-xs font-bold">
                      ⚠️ {formError}
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Course Scope</label>
                      <input
                        type="text"
                        value={formData.courseCode}
                        onChange={(e) => setFormData({ ...formData, courseCode: e.target.value })}
                        placeholder="e.g. CSE-3101 or All Courses"
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Category</label>
                      <select
                        value={formData.reasonCategory}
                        onChange={(e) => setFormData({ ...formData, reasonCategory: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold"
                      >
                        <option value="Sick Leave">Sick Leave</option>
                        <option value="Medical Emergency">Medical Emergency</option>
                        <option value="Family Emergency">Family Emergency</option>
                        <option value="Academic Event">Academic Event</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Start Date *</label>
                      <input
                        type="date"
                        value={formData.startDate}
                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">End Date *</label>
                      <input
                        type="date"
                        value={formData.endDate}
                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Absence Reason Details *</label>
                    <textarea
                      rows={3}
                      placeholder="Specify medical illness or reason..."
                      value={formData.reason}
                      onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Prescription / Certificate Link (Optional)</label>
                    <input
                      type="url"
                      placeholder="https://drive.google.com/..."
                      value={formData.documentUrl}
                      onChange={(e) => setFormData({ ...formData, documentUrl: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium"
                    />
                  </div>

                  <div className="flex justify-end gap-3 pt-3">
                    <button
                      type="button"
                      onClick={() => setIsApplyModalOpen(false)}
                      className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-xs shadow-md"
                    >
                      {submitting ? 'Submitting...' : 'Submit Application'}
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Action Review Modal (For Faculty) */}
        <AnimatePresence>
          {actionModal.isOpen && (
            <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 space-y-4"
              >
                <h3 className="font-black text-lg text-slate-900 dark:text-white">
                  {actionModal.targetStatus === 'Approved' ? 'Approve Absence Request' : 'Reject Absence Request'}
                </h3>
                <p className="text-xs text-slate-500">Student: {actionModal.request?.studentName} ({actionModal.request?.studentId})</p>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Faculty Remarks</label>
                  <textarea
                    rows={3}
                    value={actionModal.comment}
                    onChange={(e) => setActionModal({ ...actionModal, comment: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    onClick={() => setActionModal({ isOpen: false, request: null, targetStatus: '', comment: '' })}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmAction}
                    disabled={submittingAction}
                    className={`px-5 py-2 rounded-xl text-white font-extrabold text-xs shadow-md ${
                      actionModal.targetStatus === 'Approved' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'
                    }`}
                  >
                    {submittingAction ? 'Processing...' : `Confirm ${actionModal.targetStatus}`}
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
