'use client';

import React, { useState, useEffect } from 'react';
import AppLayout from '../../components/AppLayout';
import { useAuth } from '../../context/AuthContext';
import { 
  FileCheck2, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Plus, 
  Search, 
  Filter, 
  QrCode, 
  ShieldAlert, 
  Sparkles, 
  Building2, 
  UserCheck, 
  Printer, 
  Trash2, 
  AlertTriangle,
  Send,
  BadgeCheck,
  CreditCard,
  DollarSign,
  HelpCircle,
  FileText,
  User
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  fetchPermitRequests, 
  createPermitRequest, 
  updatePermitStatus, 
  deletePermitRequest,
  fetchUsers 
} from '../../lib/api';
import PermissionSlipModal from '../../components/PermissionSlipModal';

export default function PermitsPage() {
  const { user } = useAuth();
  const [permits, setPermits] = useState([]);
  const [faculties, setFaculties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [selectedPermitForSlip, setSelectedPermitForSlip] = useState(null);
  const [isSlipModalOpen, setIsSlipModalOpen] = useState(false);

  // Status update modal (For faculty)
  const [actionModal, setActionModal] = useState({
    isOpen: false,
    permit: null,
    targetStatus: '',
    comment: ''
  });
  const [submittingAction, setSubmittingAction] = useState(false);

  // New Permit Form state (For student)
  const [formData, setFormData] = useState({
    facultyId: '',
    permitDate: new Date().toISOString().split('T')[0],
    reason: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const isFacultyOrAdmin = user?.role === 'faculty' || user?.role === 'admin';
  const studentDueAmount = user?.dueAmount !== undefined ? user?.dueAmount : 28000;
  const isEligible = studentDueAmount > 25000;

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    try {
      setLoading(true);

      // Fetch permits according to user role
      const params = {};
      if (user?.role === 'student') {
        params.studentId = user.studentId || user._id;
        params.email = user.email;
        params.role = 'student';
      } else if (user?.role === 'faculty') {
        params.facultyId = user.facultyId || user._id;
        params.email = user.email;
        params.role = 'faculty';
      }

      const [permitList, userList] = await Promise.all([
        fetchPermitRequests(params),
        fetchUsers()
      ]);

      setPermits(permitList);

      // Filter users with role === 'faculty'
      const facultyList = userList.filter(u => u.role === 'faculty');
      setFaculties(facultyList.length > 0 ? facultyList : [
        { _id: 'f1', name: 'Dr. Sarah Abedin', facultyId: 'SAB', acronym: 'SAB', department: 'CSE' },
        { _id: 'f2', name: 'Prof. Tanvir Ahmed', facultyId: 'TA', acronym: 'TA', department: 'CSE' },
        { _id: 'f3', name: 'Dr. Mahfuzur Rahman', facultyId: 'MR', acronym: 'MR', department: 'EEE' }
      ]);

    } catch (err) {
      console.error('Failed to load permit data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApplySubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!formData.facultyId) {
      setFormError('Please select a faculty member.');
      return;
    }
    if (!formData.permitDate) {
      setFormError('Please select a permit date.');
      return;
    }
    if (!formData.reason.trim()) {
      setFormError('Please enter a valid reason for applying.');
      return;
    }

    try {
      setSubmitting(true);
      const res = await createPermitRequest({
        studentId: user?.studentId || user?._id || 'STUDENT',
        facultyId: formData.facultyId,
        permitDate: formData.permitDate,
        reason: formData.reason
      });

      if (res.success && res.permit) {
        setPermits(prev => [res.permit, ...prev]);
        setIsApplyModalOpen(false);
        setFormData({
          facultyId: '',
          permitDate: new Date().toISOString().split('T')[0],
          reason: ''
        });
        alert('🎉 Permit application submitted successfully!');
      }
    } catch (err) {
      setFormError(err.message || 'Failed to submit application.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenActionModal = (permit, targetStatus) => {
    setActionModal({
      isOpen: true,
      permit,
      targetStatus,
      comment: targetStatus === 'Approved' ? 'Approved for 1-day academic entry.' : 'Application rejected due to invalid request.'
    });
  };

  const handleConfirmAction = async () => {
    if (!actionModal.permit) return;

    try {
      setSubmittingAction(true);
      const res = await updatePermitStatus(
        actionModal.permit._id,
        actionModal.targetStatus,
        actionModal.comment
      );

      if (res.success && res.permit) {
        setPermits(prev => prev.map(p => p._id === res.permit._id ? res.permit : p));
        setActionModal({ isOpen: false, permit: null, targetStatus: '', comment: '' });
      }
    } catch (err) {
      alert(err.message || 'Failed to update permit status.');
    } finally {
      setSubmittingAction(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to retract/delete this permit request?')) return;
    try {
      await deletePermitRequest(id);
      setPermits(prev => prev.filter(p => p._id !== id));
    } catch (err) {
      alert(err.message || 'Failed to delete request.');
    }
  };

  const handleViewSlip = (permit) => {
    setSelectedPermitForSlip(permit);
    setIsSlipModalOpen(true);
  };

  // Filter permits
  const filteredPermits = permits.filter(p => {
    const matchesStatus = filterStatus === 'All' || p.status === filterStatus;
    const q = searchQuery.toLowerCase();
    const matchesSearch = (
      p.studentName?.toLowerCase().includes(q) ||
      p.studentId?.toLowerCase().includes(q) ||
      p.facultyName?.toLowerCase().includes(q) ||
      p.reason?.toLowerCase().includes(q) ||
      p.passCode?.toLowerCase().includes(q)
    );
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="w-full space-y-8 pb-12">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Top Hero Banner */}
        <div className="relative rounded-3xl bg-emerald-950 p-6 sm:p-8 text-white overflow-hidden shadow-2xl border border-emerald-900/60">
          <div className="absolute -right-10 -bottom-10 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold tracking-wide">
                <BadgeCheck className="w-3.5 h-3.5" />
                <span>SPECIAL ACADEMIC PERMIT PORTAL</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
                One-Day Special Permit Portal
              </h1>
              <p className="text-sm text-emerald-100/90 font-medium">
                Students with outstanding tuition payments over <strong>৳25,000 Taka</strong> can apply for a 1-day 
                special academic permit to their respective faculty member. Faculty can review and grant permission slips.
              </p>

              {!isFacultyOrAdmin && (
                <div className="pt-2 flex flex-wrap items-center gap-3">
                  {isEligible ? (
                    <button
                      onClick={() => setIsApplyModalOpen(true)}
                      className="px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-lg shadow-emerald-500/25 flex items-center gap-2.5 transition-all active:scale-95"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Apply for One-Day Permit</span>
                    </button>
                  ) : (
                    <div className="px-4 py-2.5 rounded-2xl bg-rose-500/20 text-rose-200 border border-rose-500/30 text-xs font-bold flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-rose-400" />
                      <span>Not Eligible (Due must exceed ৳25,000 Taka)</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Financial Due Card (For Student) */}
            {!isFacultyOrAdmin && (
              <div className="w-full lg:w-auto shrink-0 p-6 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 shadow-xl text-center min-w-[260px]">
                <p className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-300 mb-1 flex items-center justify-center gap-1">
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>CURRENT TUITION DUE</span>
                </p>
                <h3 className="text-3xl font-black text-white my-1">
                  ৳{studentDueAmount.toLocaleString()} <span className="text-xs font-semibold text-emerald-200">BDT</span>
                </h3>
                
                <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-[11px] font-extrabold border ${
                    isEligible 
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' 
                      : 'bg-slate-500/20 text-slate-300 border-slate-500/30'
                  }`}>
                    {isEligible ? 'Eligible for Permit (> ৳25k)' : 'Standard Dues Status'}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Status Metrics Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-400">Total Applications</p>
              <h4 className="text-xl font-black text-slate-900 dark:text-white">{permits.length}</h4>
            </div>
          </div>

          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-400">Approved Permits</p>
              <h4 className="text-xl font-black text-emerald-600 dark:text-emerald-400">
                {permits.filter(p => p.status === 'Approved').length}
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
                {permits.filter(p => p.status === 'Pending').length}
              </h4>
            </div>
          </div>

          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
              <XCircle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-400">Cancelled / Rejected</p>
              <h4 className="text-xl font-black text-rose-600 dark:text-rose-400">
                {permits.filter(p => p.status === 'Cancelled').length}
              </h4>
            </div>
          </div>
        </div>

        {/* Search & Status Filter Controls */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Search input */}
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search student, faculty, or code..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            {/* Filter buttons */}
            <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
              <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="text-xs font-bold text-slate-500 shrink-0">Status:</span>
              {['All', 'Pending', 'Approved', 'Cancelled'].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all whitespace-nowrap ${
                    filterStatus === status
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Permits List Grid */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-black text-slate-900 dark:text-white">
              {isFacultyOrAdmin ? 'Student Permit Applications' : 'My Permit Applications'} ({filteredPermits.length})
            </h3>
          </div>

          {loading ? (
            <div className="py-16 text-center text-slate-400 font-medium">
              <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p>Loading permit records...</p>
            </div>
          ) : filteredPermits.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPermits.map((permit) => (
                <motion.div
                  key={permit._id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="group relative rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-sm hover:shadow-xl hover:border-emerald-500/40 transition-all duration-300 flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    {/* Status Badge Header */}
                    <div className="flex items-center justify-between">
                      <span className={`px-3 py-1 rounded-xl text-[11px] font-black uppercase tracking-wider border ${
                        permit.status === 'Approved'
                          ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                          : permit.status === 'Cancelled'
                          ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800'
                          : 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800'
                      }`}>
                        {permit.status}
                      </span>

                      <span className="text-[10px] font-mono font-bold text-slate-400">
                        {permit.passCode}
                      </span>
                    </div>

                    {/* Applicant & Faculty info */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white font-extrabold flex items-center justify-center text-sm shadow-sm shrink-0">
                          {permit.studentName ? permit.studentName.charAt(0) : 'S'}
                        </div>
                        <div>
                          <h4 className="font-extrabold text-slate-900 dark:text-white text-sm">
                            {permit.studentName}
                          </h4>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                            ID: {permit.studentId} • {permit.section || 'Sec A'}
                          </p>
                        </div>
                      </div>

                      <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 space-y-2 text-xs">
                        <div className="flex justify-between">
                          <span className="text-slate-500 dark:text-slate-400 font-medium">Assigned Faculty:</span>
                          <span className="font-bold text-slate-900 dark:text-white">{permit.facultyName} ({permit.facultyAcronym})</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500 dark:text-slate-400 font-medium">Permit Date:</span>
                          <span className="font-extrabold text-emerald-600 dark:text-emerald-400">{permit.permitDate}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500 dark:text-slate-400 font-medium">Overdue Amount:</span>
                          <span className="font-black text-rose-600 dark:text-rose-400">৳{permit.dueAmount?.toLocaleString()} BDT</span>
                        </div>
                      </div>

                      {/* Reason */}
                      <div className="text-xs text-slate-600 dark:text-slate-300">
                        <span className="font-bold text-slate-400 text-[10px] uppercase block">Reason:</span>
                        <p className="line-clamp-2 italic text-slate-700 dark:text-slate-300 mt-0.5 font-medium">
                          "{permit.reason}"
                        </p>
                      </div>

                      {/* Faculty comment if available */}
                      {permit.facultyComment && (
                        <div className="p-2.5 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-800/40 text-[11px] text-emerald-800 dark:text-emerald-300">
                          <strong className="font-bold">Faculty Note:</strong> {permit.facultyComment}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                    {permit.status === 'Approved' ? (
                      <button
                        onClick={() => handleViewSlip(permit)}
                        className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all active:scale-95"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>Download Permission Slip (PDF)</span>
                      </button>
                    ) : isFacultyOrAdmin && permit.status === 'Pending' ? (
                      <div className="flex items-center gap-2 w-full">
                        <button
                          onClick={() => handleOpenActionModal(permit, 'Approved')}
                          className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md shadow-emerald-500/20 flex items-center justify-center gap-1 transition-all active:scale-95"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Approve</span>
                        </button>
                        <button
                          onClick={() => handleOpenActionModal(permit, 'Cancelled')}
                          className="flex-1 py-2 px-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs shadow-md shadow-rose-500/20 flex items-center justify-center gap-1 transition-all active:scale-95"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Cancel</span>
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between w-full text-xs">
                        <span className="text-[11px] text-slate-400 font-medium">
                          {permit.status === 'Pending' ? 'Awaiting Faculty Review' : 'Application Processed'}
                        </span>

                        {permit.status === 'Pending' && !isFacultyOrAdmin && (
                          <button
                            onClick={() => handleDelete(permit._id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
                            title="Retract application"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="py-16 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8">
              <FileCheck2 className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
              <h4 className="text-base font-bold text-slate-700 dark:text-slate-300">No Permit Applications Found</h4>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                No permit records match your current filter criteria.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Apply for Permit Modal (For Student) */}
      <AnimatePresence>
        {isApplyModalOpen && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
            >
              <div className="p-6 bg-emerald-950 text-white flex items-center justify-between">
                <div>
                  <h3 className="font-black text-lg">Apply for One-Day Academic Permit</h3>
                  <p className="text-xs text-emerald-200">Special entry permit for tuition dues &gt; ৳25,000 Taka</p>
                </div>
                <button
                  onClick={() => setIsApplyModalOpen(false)}
                  className="p-2 text-white/80 hover:text-white rounded-xl hover:bg-white/10 transition-colors"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleApplySubmit} className="p-6 space-y-4">
                {formError && (
                  <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-300 text-xs font-bold">
                    ⚠️ {formError}
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Select Target Faculty Member *
                  </label>
                  <select
                    value={formData.facultyId}
                    onChange={(e) => setFormData({ ...formData, facultyId: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    required
                  >
                    <option value="">Select Faculty...</option>
                    {faculties.map((fac) => (
                      <option key={fac._id || fac.facultyId} value={fac._id || fac.facultyId}>
                        {fac.name} ({fac.acronym || 'FAC'}) - {fac.department || 'CSE'}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Permit Valid Date *
                  </label>
                  <input
                    type="date"
                    value={formData.permitDate}
                    onChange={(e) => setFormData({ ...formData, permitDate: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Reason & Purpose for Permit *
                  </label>
                  <textarea
                    rows={3}
                    placeholder="E.g., Requesting one-day attendance permit for Lab Exam on Monday despite pending tuition dues..."
                    value={formData.reason}
                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    required
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsApplyModalOpen(false)}
                    className="px-4 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-xs hover:bg-slate-200"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md shadow-emerald-500/20 flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50"
                  >
                    {submitting ? 'Submitting...' : 'Submit Permit Request'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Action Approval/Cancel Modal (For Faculty) */}
      <AnimatePresence>
        {actionModal.isOpen && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden p-6 space-y-4"
            >
              <h3 className="font-black text-lg text-slate-900 dark:text-white">
                {actionModal.targetStatus === 'Approved' ? 'Approve Permit Application' : 'Cancel Permit Application'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Student: <strong>{actionModal.permit?.studentName}</strong> ({actionModal.permit?.studentId})
              </p>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Faculty Comment / Instructions (Optional)
                </label>
                <textarea
                  rows={3}
                  value={actionModal.comment}
                  onChange={(e) => setActionModal({ ...actionModal, comment: e.target.value })}
                  placeholder="Enter remarks for the student..."
                  className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setActionModal({ isOpen: false, permit: null, targetStatus: '', comment: '' })}
                  className="px-4 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-xs"
                >
                  Close
                </button>

                <button
                  type="button"
                  onClick={handleConfirmAction}
                  disabled={submittingAction}
                  className={`px-5 py-2.5 rounded-2xl text-white font-extrabold text-xs shadow-md transition-all active:scale-95 disabled:opacity-50 ${
                    actionModal.targetStatus === 'Approved'
                      ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20'
                      : 'bg-rose-600 hover:bg-rose-700 shadow-rose-500/20'
                  }`}
                >
                  {submittingAction ? 'Processing...' : `Confirm ${actionModal.targetStatus}`}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Permission Slip Printable Modal */}
      <PermissionSlipModal
        isOpen={isSlipModalOpen}
        onClose={() => setIsSlipModalOpen(false)}
        permitData={selectedPermitForSlip}
      />
    </div>
  );
}
