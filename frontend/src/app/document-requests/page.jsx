'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import DocumentCertificateModal from '../../components/DocumentCertificateModal';
import { 
  FileCheck, 
  GraduationCap, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Plus, 
  Search, 
  Filter, 
  FileText, 
  Download, 
  Trash2, 
  ShieldCheck, 
  AlertCircle,
  ExternalLink,
  Sparkles,
  Zap,
  Building2,
  Printer,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function DocumentRequestsPage() {
  const { user } = useAuth();
  const isFacultyOrAdmin = user?.role === 'admin' || user?.role === 'faculty';

  const [documentRequests, setDocumentRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Digital Document Preview Modal State
  const [previewModal, setPreviewModal] = useState({
    isOpen: false,
    request: null
  });

  // Apply Modal state (For Student)
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    documentType: 'Official Transcript & Grade Sheet',
    purpose: 'Higher Education Application',
    deliveryMode: 'Digital PDF Download',
    isUrgent: false,
    reason: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // Admin Status Update Modal State
  const [actionModal, setActionModal] = useState({
    isOpen: false,
    request: null,
    targetStatus: 'Approved',
    remarks: ''
  });
  const [submittingAction, setSubmittingAction] = useState(false);

  useEffect(() => {
    fetchRequests();
  }, [user, filterStatus]);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      let url = 'http://localhost:5000/api/document-requests?';
      if (!isFacultyOrAdmin && user?.studentId) {
        url += `studentId=${user.studentId}&`;
      }
      if (filterStatus !== 'All') {
        url += `status=${filterStatus}&`;
      }

      const res = await fetch(url);
      const data = await res.json();
      if (data.success && data.requests) {
        setDocumentRequests(data.requests);
      } else {
        throw new Error('Using fallback dataset');
      }
    } catch (err) {
      console.warn('Using fallback document requests dataset:', err);
      setDocumentRequests([
        {
          _id: 'doc-1',
          trackingCode: 'DOC-2026-X89B',
          studentId: user?.studentId || 'CSE-2024-042',
          studentName: user?.name || 'Rahim Chowdhury',
          department: 'Computer Science & Engineering',
          section: 'Section A',
          documentType: 'Official Transcript & Grade Sheet',
          purpose: 'Higher Education Application',
          deliveryMode: 'Digital PDF Download',
          isUrgent: true,
          reason: 'Application deadline for Master Program is March 15.',
          status: 'Approved',
          adminRemarks: 'Verified and signed by Controller of Examinations.',
          reviewedBy: 'Exam Controller Office',
          approvedAt: new Date().toISOString(),
          createdAt: new Date().toISOString()
        },
        {
          _id: 'doc-2',
          trackingCode: 'DOC-2026-M421',
          studentId: user?.studentId || 'CSE-2024-042',
          studentName: user?.name || 'Rahim Chowdhury',
          department: 'Computer Science & Engineering',
          section: 'Section A',
          documentType: 'Clearance Certificate',
          purpose: 'Library & Financial Clearance',
          deliveryMode: 'Digital PDF Download',
          isUrgent: false,
          reason: 'Clearance required for term registration.',
          status: 'In Processing',
          adminRemarks: 'Accounts verified. Awaiting library sign-off.',
          reviewedBy: 'Registrar Desk',
          createdAt: new Date().toISOString()
        },
        {
          _id: 'doc-3',
          trackingCode: 'DOC-2026-K902',
          studentId: 'CSE-2024-088',
          studentName: 'Tariqul Islam',
          department: 'Computer Science & Engineering',
          section: 'Section B',
          documentType: 'Testimonial & Character Certificate',
          purpose: 'Job Application',
          deliveryMode: 'Physical Campus Pickup',
          isUrgent: false,
          reason: 'Submitting to IT firm recruitment desk.',
          status: 'Pending',
          adminRemarks: '',
          reviewedBy: '',
          createdAt: new Date().toISOString()
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleApplySubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!formData.purpose.trim()) {
      setFormError('Please specify the purpose of your document request.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('http://localhost:5000/api/document-requests', {
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
        setDocumentRequests(prev => [data.request, ...prev]);
        setIsApplyModalOpen(false);
        setFormData({
          documentType: 'Official Transcript & Grade Sheet',
          purpose: 'Higher Education Application',
          deliveryMode: 'Digital PDF Download',
          isUrgent: false,
          reason: ''
        });
        alert(`🎉 Document request submitted successfully!\nTracking Code: ${data.request.trackingCode}`);
      } else {
        throw new Error(data.error || 'Failed to submit request');
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
      const res = await fetch(`http://localhost:5000/api/document-requests/${actionModal.request._id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: actionModal.targetStatus,
          adminRemarks: actionModal.remarks,
          reviewedBy: user?.name || 'Exam Controller / Admin'
        })
      });

      const data = await res.json();
      if (data.success && data.request) {
        setDocumentRequests(prev => prev.map(r => r._id === data.request._id ? data.request : r));
        setActionModal({ isOpen: false, request: null, targetStatus: 'Approved', remarks: '' });
      }
    } catch (err) {
      alert('Failed to update status: ' + err.message);
    } finally {
      setSubmittingAction(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to retract this document application?')) return;
    try {
      await fetch(`http://localhost:5000/api/document-requests/${id}`, { method: 'DELETE' });
      setDocumentRequests(prev => prev.filter(r => r._id !== id));
    } catch (err) {
      alert('Failed to delete request');
    }
  };

  const filteredRequests = documentRequests.filter(r => {
    const query = searchQuery.toLowerCase();
    return (
      r.studentName?.toLowerCase().includes(query) ||
      r.studentId?.toLowerCase().includes(query) ||
      r.trackingCode?.toLowerCase().includes(query) ||
      r.documentType?.toLowerCase().includes(query) ||
      r.purpose?.toLowerCase().includes(query)
    );
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-indigo-600/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-500/20 shadow-inner">
              <FileCheck className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                  Academic Documents & Result Requests
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                  Controller Desk
                </span>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Request official transcripts, grade sheets, clearance certificates, and testimonials with live status tracking.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {!isFacultyOrAdmin && (
              <button
                onClick={() => setIsApplyModalOpen(true)}
                className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs transition-all shadow-md shadow-indigo-500/20"
              >
                <Plus className="w-4 h-4" />
                Request New Document
              </button>
            )}
          </div>
        </div>

        {/* Metrics Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-400">Total Applications</p>
              <h4 className="text-xl font-black text-slate-900 dark:text-white">{documentRequests.length}</h4>
            </div>
          </div>

          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-400">Pending Review</p>
              <h4 className="text-xl font-black text-amber-600 dark:text-amber-400">
                {documentRequests.filter(r => r.status === 'Pending').length}
              </h4>
            </div>
          </div>

          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-400">In Processing</p>
              <h4 className="text-xl font-black text-indigo-600 dark:text-indigo-400">
                {documentRequests.filter(r => r.status === 'In Processing').length}
              </h4>
            </div>
          </div>

          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-400">Issued & Approved</p>
              <h4 className="text-xl font-black text-emerald-600 dark:text-emerald-400">
                {documentRequests.filter(r => r.status === 'Approved').length}
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
                placeholder="Search by code, document, or student..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
              <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="text-xs font-bold text-slate-500 shrink-0">Status:</span>
              {['All', 'Pending', 'In Processing', 'Approved', 'Rejected'].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all whitespace-nowrap ${
                    filterStatus === status
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Applications Grid */}
        <div>
          {loading ? (
            <div className="py-16 text-center text-slate-400 font-medium">
              <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p>Loading document applications...</p>
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
                    {/* Top Badges */}
                    <div className="flex items-center justify-between gap-2">
                      <span className={`px-3 py-1 rounded-xl text-[11px] font-black uppercase tracking-wider border ${
                        req.status === 'Approved'
                          ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                          : req.status === 'In Processing'
                          ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800'
                          : req.status === 'Rejected'
                          ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800'
                          : 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800'
                      }`}>
                        {req.status}
                      </span>

                      <div className="flex items-center gap-1.5">
                        {req.isUrgent && (
                          <span className="px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400 font-extrabold text-[10px] flex items-center gap-1">
                            <Zap className="w-3 h-3 fill-rose-500 text-rose-500" /> Urgent
                          </span>
                        )}
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(req.trackingCode);
                            alert(`📋 Tracking code ${req.trackingCode} copied to clipboard!`);
                          }}
                          title="Click to copy tracking code"
                          className="px-2.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 font-mono text-[10px] font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                        >
                          {req.trackingCode}
                        </button>
                      </div>
                    </div>

                    {/* Document Title & Student */}
                    <div className="space-y-2">
                      <div>
                        <h4 className="font-extrabold text-slate-900 dark:text-white text-base leading-tight">
                          {req.documentType}
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
                          Purpose: {req.purpose}
                        </p>
                      </div>

                      {/* Student Info Box */}
                      <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-xs">
                        <div>
                          <p className="font-bold text-slate-800 dark:text-slate-200">{req.studentName}</p>
                          <p className="text-[10px] text-slate-400">{req.studentId} • {req.section || 'Sec A'}</p>
                        </div>
                        <span className="px-2 py-1 rounded-lg bg-white dark:bg-slate-700 font-extrabold text-[10px] text-indigo-600 dark:text-indigo-400 border border-slate-200 dark:border-slate-600">
                          {req.deliveryMode}
                        </span>
                      </div>

                      {/* Special Instructions / Reason */}
                      {req.reason && (
                        <div className="text-xs text-slate-600 dark:text-slate-300">
                          <span className="font-bold text-slate-400 text-[10px] uppercase block">Special Notes:</span>
                          <p className="italic text-slate-700 dark:text-slate-300 mt-0.5 line-clamp-2">
                            "{req.reason}"
                          </p>
                        </div>
                      )}

                      {/* Controller Remarks */}
                      {req.adminRemarks && (
                        <div className="p-2.5 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-800/40 text-[11px] text-indigo-800 dark:text-indigo-300">
                          <strong className="font-bold">Controller Note:</strong> {req.adminRemarks}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                    {req.status === 'Approved' ? (
                      <button
                        onClick={() => setPreviewModal({ isOpen: true, request: req })}
                        className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all"
                      >
                        <ShieldCheck className="w-4 h-4" /> View & Print Digital Document
                      </button>
                    ) : isFacultyOrAdmin ? (
                      <div className="flex items-center gap-2 w-full">
                        <button
                          onClick={() => setActionModal({ isOpen: true, request: req, targetStatus: 'Approved', remarks: 'Verified and approved by Controller.' })}
                          className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md flex items-center justify-center gap-1 transition-all"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                        </button>
                        <button
                          onClick={() => setActionModal({ isOpen: true, request: req, targetStatus: 'In Processing', remarks: 'Under verification by accounts & central library.' })}
                          className="flex-1 py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs shadow-md flex items-center justify-center gap-1 transition-all"
                        >
                          <Clock className="w-3.5 h-3.5" /> Process
                        </button>
                        <button
                          onClick={() => setActionModal({ isOpen: true, request: req, targetStatus: 'Rejected', remarks: 'Incomplete clearance requirements.' })}
                          className="p-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs shadow-md transition-all"
                          title="Reject"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between w-full text-xs text-slate-400 font-medium">
                        <span>Status: <strong className="text-slate-700 dark:text-slate-300">{req.status}</strong></span>
                        {req.status === 'Pending' && (
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
              <FileCheck className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto" />
              <h4 className="text-base font-bold text-slate-700 dark:text-slate-300">No Document Applications Found</h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">No records match your selected filter or search query.</p>
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
                <div className="p-6 bg-indigo-950 text-white flex items-center justify-between">
                  <div>
                    <h3 className="font-black text-lg">Request Academic Document</h3>
                    <p className="text-xs text-indigo-200">Office of the Controller of Examinations</p>
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

                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Document Type *</label>
                    <select
                      value={formData.documentType}
                      onChange={(e) => setFormData({ ...formData, documentType: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white"
                    >
                      <option value="Official Transcript & Grade Sheet">Official Transcript & Grade Sheet</option>
                      <option value="Clearance Certificate">Clearance Certificate</option>
                      <option value="Testimonial & Character Certificate">Testimonial & Character Certificate</option>
                      <option value="Provisional Degree Certificate">Provisional Degree Certificate</option>
                      <option value="Semester Result Sheet">Semester Result Sheet</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Purpose *</label>
                      <input
                        type="text"
                        value={formData.purpose}
                        onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                        placeholder="e.g. Higher Education, Job"
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Delivery Mode</label>
                      <select
                        value={formData.deliveryMode}
                        onChange={(e) => setFormData({ ...formData, deliveryMode: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold"
                      >
                        <option value="Digital PDF Download">Digital PDF Download</option>
                        <option value="Physical Campus Pickup">Physical Campus Pickup</option>
                        <option value="Express Courier Delivery">Express Courier Delivery</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 rounded-2xl bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800">
                    <input
                      type="checkbox"
                      id="isUrgentCheck"
                      checked={formData.isUrgent}
                      onChange={(e) => setFormData({ ...formData, isUrgent: e.target.checked })}
                      className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                    />
                    <label htmlFor="isUrgentCheck" className="text-xs font-bold text-amber-900 dark:text-amber-200 cursor-pointer">
                      Mark as Urgent Processing (Priority Tag)
                    </label>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Additional Remarks (Optional)</label>
                    <textarea
                      rows={3}
                      placeholder="Specify deadline or notes..."
                      value={formData.reason}
                      onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium"
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
                      className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs shadow-md"
                    >
                      {submitting ? 'Submitting...' : 'Submit Request'}
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Action Review Modal (For Admin/Faculty) */}
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
                  Update Document Request Status
                </h3>
                <p className="text-xs text-slate-500">Student: {actionModal.request?.studentName} ({actionModal.request?.studentId})</p>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Set Status</label>
                  <select
                    value={actionModal.targetStatus}
                    onChange={(e) => setActionModal({ ...actionModal, targetStatus: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white mt-1"
                  >
                    <option value="Approved">Approved & Issued</option>
                    <option value="In Processing">In Processing</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Controller Remarks</label>
                  <textarea
                    rows={3}
                    value={actionModal.remarks}
                    onChange={(e) => setActionModal({ ...actionModal, remarks: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium mt-1"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    onClick={() => setActionModal({ isOpen: false, request: null, targetStatus: 'Approved', remarks: '' })}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmAction}
                    disabled={submittingAction}
                    className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs shadow-md"
                  >
                    {submittingAction ? 'Processing...' : 'Confirm Status Update'}
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Digital Document Certificate Modal */}
        <DocumentCertificateModal
          isOpen={previewModal.isOpen}
          onClose={() => setPreviewModal({ isOpen: false, request: null })}
          requestData={previewModal.request}
          studentData={user}
        />

      </div>
    </div>
  );
}
