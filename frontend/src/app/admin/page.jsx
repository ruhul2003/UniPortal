'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Users, 
  ShieldCheck, 
  Search, 
  Crown, 
  Trash2, 
  UserCheck, 
  GraduationCap, 
  Briefcase, 
  Building, 
  AlertCircle, 
  CheckCircle2, 
  Sparkles,
  Filter,
  UserX,
  RefreshCw,
  Eye,
  ChevronLeft,
  ChevronRight,
  Layers,
  Check,
  X,
  Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { fetchUsers, toggleUserCR, updateUserRole, deleteUser, fetchSectionRequests, updateSectionRequestStatus } from '../../lib/api';
import StudentDetailsModal from '../../components/StudentDetailsModal';

export default function AdminPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const isFaculty = user?.role === 'faculty';
  const canManage = isAdmin || isFaculty;

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [sectionFilter, setSectionFilter] = useState('all');
  const [crOnly, setCrOnly] = useState(false);
  const [actionSuccess, setActionSuccess] = useState('');
  const [actionError, setActionError] = useState('');
  const [deletingId, setDeletingId] = useState(null);
  
  // Pagination State (25 items per page)
  const ITEMS_PER_PAGE = 25;
  const [currentPage, setCurrentPage] = useState(1);

  // Reset to Page 1 whenever search or filter controls change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, roleFilter, sectionFilter, crOnly]);

  // Student Details Modal state
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [activeTab, setActiveTab] = useState('users'); // 'users' | 'sectionRequests'
  const [sectionRequests, setSectionRequests] = useState([]);
  const [requestsLoading, setRequestsLoading] = useState(false);

  const loadUsersData = async () => {
    setLoading(true);
    const data = await fetchUsers();
    setUsers(data);
    setLoading(false);
  };

  const loadSectionRequestsData = async () => {
    setRequestsLoading(true);
    const reqs = await fetchSectionRequests();
    setSectionRequests(reqs);
    setRequestsLoading(false);
  };

  useEffect(() => {
    if (canManage) {
      loadUsersData();
      loadSectionRequestsData();
    }
  }, [canManage]);

  const handleUpdateSectionRequestStatus = async (requestId, status) => {
    try {
      setActionError('');
      const res = await updateSectionRequestStatus(requestId, status);
      if (res.request) {
        setSectionRequests(sectionRequests.map(r => r._id === requestId ? res.request : r));
        setActionSuccess(`Section change request ${status === 'approved' ? 'approved & student section updated' : 'rejected/cancelled'}.`);
        if (status === 'approved') {
          loadUsersData();
        }
      }
    } catch (err) {
      setActionError(err.message || 'Failed to update section request');
    }
  };

  const pendingRequestsCount = sectionRequests.filter(r => r.status === 'pending').length;

  const handleOpenDetails = (student) => {
    setSelectedStudent(student);
    setIsModalOpen(true);
  };

  const handleToggleCR = async (targetUser) => {
    try {
      setActionError('');
      const newStatus = !targetUser.isCR;

      // Enforce Max 2 CRs per section on client side before request
      if (newStatus && targetUser.role === 'student') {
        const studentSec = targetUser.section || 'Section A';
        const currentSectionCRs = users.filter(
          u => u.role === 'student' && (u.section || 'Section A') === studentSec && u.isCR && u._id !== targetUser._id
        );
        if (currentSectionCRs.length >= 2) {
          const errMsg = `${studentSec} already has the maximum limit of 2 Class Representatives (CRs). Please revoke an existing CR in ${studentSec} before appointing a new one.`;
          setActionError(errMsg);
          return;
        }
      }

      await toggleUserCR(targetUser._id, newStatus);
      setUsers(users.map(u => u._id === targetUser._id ? { ...u, isCR: newStatus } : u));
      if (selectedStudent && selectedStudent._id === targetUser._id) {
        setSelectedStudent({ ...selectedStudent, isCR: newStatus });
      }
      setActionSuccess(`${targetUser.name} is now ${newStatus ? 'appointed as Class Representative (CR)' : 'removed from CR status'}.`);
      setTimeout(() => setActionSuccess(''), 4000);
    } catch (err) {
      setActionError(err.message || 'Failed to update CR status');
    }
  };

  const handleRoleChange = async (targetUser, newRole) => {
    if (!isAdmin) return;
    try {
      setActionError('');
      await updateUserRole(targetUser._id, newRole);
      setUsers(users.map(u => u._id === targetUser._id ? { ...u, role: newRole } : u));
      setActionSuccess(`Role for ${targetUser.name} updated to ${newRole}.`);
      setTimeout(() => setActionSuccess(''), 4000);
    } catch (err) {
      setActionError(err.message || 'Failed to update user role');
    }
  };

  const handleDeleteUser = async (id, name) => {
    if (!isAdmin) return;
    try {
      setActionError('');
      await deleteUser(id);
      setUsers(users.filter(u => u._id !== id));
      setDeletingId(null);
      setActionSuccess(`User "${name}" deleted successfully.`);
      setTimeout(() => setActionSuccess(''), 4000);
    } catch (err) {
      setActionError(err.message || 'Failed to delete user');
    }
  };

  if (!canManage) {
    return (
      <div className="max-w-md mx-auto py-16 px-4 text-center">
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-100 dark:border-slate-800 shadow-xl space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">Access Restricted</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            You must be logged in as an Administrator or Faculty Member to access the Student Directory, view student details, and assign CR status.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 dark:bg-blue-600 text-white text-xs font-bold shadow-sm"
          >
            Sign In as Admin / Faculty
          </Link>
        </div>
      </div>
    );
  }

  // Filtered Users
  const filteredUsers = users.filter(u => {
    const matchesSearch = 
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase()) ||
      u.department?.toLowerCase().includes(search.toLowerCase()) ||
      u.studentId?.toLowerCase().includes(search.toLowerCase()) ||
      u.facultyId?.toLowerCase().includes(search.toLowerCase());

    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    const matchesCR = !crOnly || u.isCR;
    const matchesSection = sectionFilter === 'all' || (u.role === 'student' && (u.section || 'Section A') === sectionFilter);

    return matchesSearch && matchesRole && matchesCR && matchesSection;
  });

  // Pagination Calculations
  const totalFiltered = filteredUsers.length;
  const totalPages = Math.ceil(totalFiltered / ITEMS_PER_PAGE) || 1;
  const validPage = Math.min(Math.max(1, currentPage), totalPages);
  const startIndex = (validPage - 1) * ITEMS_PER_PAGE;
  const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, totalFiltered);
  const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

  const totalUsers = users.length;
  const studentCount = users.filter(u => u.role === 'student').length;
  const facultyCount = users.filter(u => u.role === 'faculty').length;
  const crCount = users.filter(u => u.isCR).length;

  // Section-wise CR Counts
  const sectionsList = ['Section A', 'Section B', 'Section C', 'Section D'];
  const getSectionCRCount = (sec) => {
    return users.filter(u => u.role === 'student' && (u.section || 'Section A') === sec && u.isCR).length;
  };

  return (
    <div className="space-y-8">
      
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-br from-slate-900 via-slate-850 to-purple-950 p-6 sm:p-8 rounded-3xl text-white shadow-xl relative overflow-hidden">
        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-400/30 text-purple-300 text-xs font-bold">
            <Crown className="w-3.5 h-3.5 text-purple-400" />
            {isAdmin ? 'Admin Control Center' : 'Faculty Student Portal'}
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {isAdmin ? 'User Governance & CR Management' : 'Student Directory & CR Management'}
          </h1>
          <p className="text-xs text-slate-300">
            {isAdmin 
              ? 'Manage user accounts, assign Class Representatives (CR), and update permissions' 
              : 'Browse all student details, filter by department/section, and appoint Class Representatives (CR)'}
          </p>
        </div>

        <button
          onClick={loadUsersData}
          className="self-start md:self-auto px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-xs font-bold flex items-center gap-2 transition-all relative z-10"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh List
        </button>
      </div>

      {/* Stats Counter Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <p className="text-lg font-extrabold text-slate-900 dark:text-white">{totalUsers}</p>
            <p className="text-[11px] text-slate-400 font-medium">Total Registered</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <p className="text-lg font-extrabold text-slate-900 dark:text-white">{studentCount}</p>
            <p className="text-[11px] text-slate-400 font-medium">Students</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
            <Briefcase className="w-5 h-5" />
          </div>
          <div>
            <p className="text-lg font-extrabold text-slate-900 dark:text-white">{facultyCount}</p>
            <p className="text-[11px] text-slate-400 font-medium">Faculty Members</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
            <Crown className="w-5 h-5" />
          </div>
          <div>
            <p className="text-lg font-extrabold text-slate-900 dark:text-white">{crCount}</p>
            <p className="text-[11px] text-slate-400 font-medium">Class Reps (CR)</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-3 col-span-2 lg:col-span-1">
          <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <p className="text-lg font-extrabold text-slate-900 dark:text-white">{pendingRequestsCount}</p>
            <p className="text-[11px] text-slate-400 font-medium">Pending Section Requests</p>
          </div>
        </div>
      </div>

      {/* Navigation Mode Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all ${
            activeTab === 'users'
              ? 'bg-slate-900 dark:bg-indigo-600 text-white shadow-sm'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>User Directory & CR Governance</span>
        </button>

        <button
          onClick={() => setActiveTab('sectionRequests')}
          className={`px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all ${
            activeTab === 'sectionRequests'
              ? 'bg-slate-900 dark:bg-indigo-600 text-white shadow-sm'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Section Change Requests</span>
          {pendingRequestsCount > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-500 text-white font-black animate-pulse">
              {pendingRequestsCount} pending
            </span>
          )}
        </button>
      </div>

      {/* Action Toast Notifications */}
      <AnimatePresence>
        {actionSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-semibold flex items-center gap-3 shadow-xs"
          >
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>{actionSuccess}</span>
          </motion.div>
        )}

        {actionError && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-semibold flex items-center gap-3 shadow-xs"
          >
            <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0" />
            <span>{actionError}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Conditional Active Tab Rendering */}
      {activeTab === 'sectionRequests' ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h2 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                Student Section Transfer Applications
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Review, approve, or cancel/reject student applications for section changes.
              </p>
            </div>

            <button
              onClick={loadSectionRequestsData}
              className="px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center gap-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${requestsLoading ? 'animate-spin' : ''}`} /> Refresh Requests
            </button>
          </div>

          {sectionRequests.length === 0 ? (
            <div className="py-16 text-center text-slate-400">
              <Layers className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p className="text-sm font-semibold">No section transfer applications submitted</p>
              <p className="text-xs text-slate-400 mt-1">Student section transfer requests will appear here when submitted.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
                    <th className="py-3 px-4">Student Info</th>
                    <th className="py-3 px-4">Requested Transfer</th>
                    <th className="py-3 px-4">Reason</th>
                    <th className="py-3 px-4">Application Date</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Admin Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {sectionRequests.map((req) => (
                    <tr key={req._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                      <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-white">
                        <div className="font-bold text-sm">{req.userName}</div>
                        <div className="text-[11px] text-slate-400 font-normal">
                          ID: {req.studentId} • {req.userEmail}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-bold border border-indigo-100 dark:border-indigo-800">
                          {req.currentSection} ➔ {req.requestedSection}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300 max-w-xs">
                        <p className="italic bg-slate-50 dark:bg-slate-800/60 p-2 rounded-xl border border-slate-100 dark:border-slate-800/80">
                          "{req.reason}"
                        </p>
                      </td>
                      <td className="py-3.5 px-4 text-slate-400 whitespace-nowrap">
                        {new Date(req.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${
                          req.status === 'approved'
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200'
                            : req.status === 'rejected'
                            ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 animate-pulse'
                        }`}>
                          {req.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {req.status === 'pending' ? (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleUpdateSectionRequestStatus(req._id, 'approved')}
                              className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center gap-1 shadow-sm transition-all text-xs"
                            >
                              <Check className="w-3.5 h-3.5" /> Approve
                            </button>
                            <button
                              onClick={() => handleUpdateSectionRequestStatus(req._id, 'rejected')}
                              className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold flex items-center gap-1 shadow-sm transition-all text-xs"
                            >
                              <X className="w-3.5 h-3.5" /> Cancel / Reject
                            </button>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-[11px] font-medium italic">Reviewed</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        <>
          {/* Section Filter Quick Pills & CR Capacity Bar */}
          <div className="flex flex-wrap items-center gap-2 p-3 rounded-2xl bg-slate-100/80 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800 text-xs">
            <span className="font-bold text-slate-500 dark:text-slate-400 px-2 flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
              <Building className="w-3.5 h-3.5 text-blue-500" />
              Filter Section:
            </span>
            
            <button
              type="button"
              onClick={() => setSectionFilter('all')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                sectionFilter === 'all'
                  ? 'bg-slate-900 dark:bg-blue-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              All Sections
            </button>

            {sectionsList.map((sec) => {
              const crsInSec = getSectionCRCount(sec);
              const isFull = crsInSec >= 2;
              const isSelected = sectionFilter === sec;
              return (
                <button
                  key={sec}
                  type="button"
                  onClick={() => setSectionFilter(sec)}
                  className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-2 transition-all ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  <span>{sec}</span>
                  <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-black ${
                    isSelected
                      ? 'bg-white/20 text-white'
                      : isFull
                      ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                      : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                  }`}>
                    <Crown className="w-2.5 h-2.5 inline-block mr-0.5 fill-current" />
                    {crsInSec}/2 CRs
                  </span>
                </button>
              );
            })}
          </div>

          {/* Filter Toolbar */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
            
            {/* Search */}
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by name, email, student ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800/50 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
              />
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              {/* Section Filter Dropdown */}
              <div className="flex items-center gap-1.5 text-xs">
                <Building className="w-3.5 h-3.5 text-slate-400" />
                <select
                  value={sectionFilter}
                  onChange={(e) => setSectionFilter(e.target.value)}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200"
                >
                  <option value="all">All Sections</option>
                  <option value="Section A">Section A</option>
                  <option value="Section B">Section B</option>
                  <option value="Section C">Section C</option>
                  <option value="Section D">Section D</option>
                  <option value="Section E">Section E</option>
                </select>
              </div>

              {/* Role Filter */}
              <div className="flex items-center gap-1.5 text-xs">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200"
                >
                  <option value="all">All Roles</option>
                  <option value="student">Students</option>
                  <option value="faculty">Faculty</option>
                  <option value="admin">Admins</option>
                </select>
              </div>

              {/* CR Filter Toggle */}
              <button
                type="button"
                onClick={() => setCrOnly(!crOnly)}
                className={`px-3 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all ${
                  crOnly
                    ? 'bg-amber-500 text-slate-950 shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                <Crown className="w-3.5 h-3.5" />
                {crOnly ? 'CRs Only' : 'Show CRs'}
              </button>
            </div>
          </div>

          {/* User Table Grid */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="py-3.5 px-6">User Name</th>
                    <th className="py-3.5 px-6">System Role</th>
                    <th className="py-3.5 px-6">Section / Dept</th>
                    <th className="py-3.5 px-6">Class Rep (CR)</th>
                    <th className="py-3.5 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-slate-400">
                        <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-600" />
                        Loading users directory...
                      </td>
                    </tr>
                  ) : paginatedUsers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-slate-400">
                        <UserX className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        No users found matching filter criteria
                      </td>
                    </tr>
                  ) : (
                    paginatedUsers.map((u) => (
                      <tr key={u._id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                        
                        {/* User Identity */}
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <img
                              src={u.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                              alt={u.name}
                              className="w-9 h-9 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                            />
                            <div>
                              <p className="font-bold text-slate-900 dark:text-white leading-snug flex items-center gap-1.5">
                                {u.name}
                                {u.isCR && (
                                  <span className="px-1.5 py-0.2 rounded-md bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 text-[10px] font-black uppercase tracking-wide flex items-center gap-0.5">
                                    <Crown className="w-2.5 h-2.5 fill-current" /> CR
                                  </span>
                                )}
                              </p>
                              <p className="text-[11px] text-slate-400">{u.email}</p>
                            </div>
                          </div>
                        </td>

                        {/* System Role */}
                        <td className="py-4 px-6">
                          {isAdmin ? (
                            <select
                              value={u.role || 'student'}
                              onChange={(e) => handleRoleChange(u, e.target.value)}
                              className={`px-3 py-1 rounded-xl text-xs font-bold capitalize border-0 focus:ring-2 focus:ring-purple-500/20 ${
                                u.role === 'admin' 
                                  ? 'bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300' 
                                  : u.role === 'faculty' 
                                  ? 'bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300' 
                                  : 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300'
                              }`}
                            >
                              <option value="student">Student</option>
                              <option value="faculty">Faculty</option>
                              <option value="admin">Admin</option>
                            </select>
                          ) : (
                            <span className={`px-3 py-1 rounded-xl text-[11px] font-extrabold capitalize ${
                              u.role === 'faculty' ? 'bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300' : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                            }`}>
                              {u.role}
                            </span>
                          )}
                        </td>

                        {/* Section / Dept */}
                        <td className="py-4 px-6 font-semibold text-slate-700 dark:text-slate-300">
                          <div>{u.role === 'student' ? (u.section || 'Section A') : (u.designation || 'Lecturer')}</div>
                          <div className="text-[11px] text-slate-400 font-normal">{u.department || 'Computer Science'}</div>
                        </td>

                        {/* CR Toggle */}
                        <td className="py-4 px-6">
                          {u.role === 'student' ? (
                            <button
                              type="button"
                              onClick={() => handleToggleCR(u)}
                              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                                u.isCR
                                  ? 'bg-amber-500 text-slate-950 shadow-xs hover:bg-amber-600'
                                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                              }`}
                            >
                              <Crown className="w-3.5 h-3.5" />
                              {u.isCR ? 'Revoke CR' : 'Appoint CR'}
                            </button>
                          ) : (
                            <span className="text-[11px] text-slate-400 font-medium">—</span>
                          )}
                        </td>

                        {/* View Details / Delete Action */}
                        <td className="py-4 px-6 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => handleOpenDetails(u)}
                              title="View complete student details"
                              className="px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] font-semibold flex items-center gap-1 transition-colors"
                            >
                              <Eye className="w-3.5 h-3.5 text-blue-500" />
                              Details
                            </button>

                            {isAdmin && (
                              deletingId === u._id ? (
                                <div className="flex items-center gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteUser(u._id, u.name)}
                                    className="px-2 py-1 rounded-lg bg-rose-600 text-white font-bold text-[10px]"
                                  >
                                    Confirm
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setDeletingId(null)}
                                    className="px-2 py-1 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium text-[10px]"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => setDeletingId(u._id)}
                                  title="Delete user account"
                                  className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/60 transition-colors"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )
                            )}
                          </div>
                        </td>

                      </tr>
                    ))
                  )}
                </tbody>

              </table>
            </div>

            {/* Pagination Bar (25 items per page) */}
            {filteredUsers.length > 0 && (
              <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
                <div className="text-slate-500 dark:text-slate-400 font-medium">
                  Showing <span className="font-extrabold text-slate-900 dark:text-white">{startIndex + 1}</span> to{' '}
                  <span className="font-extrabold text-slate-900 dark:text-white">{endIndex}</span> of{' '}
                  <span className="font-extrabold text-slate-900 dark:text-white">{totalFiltered}</span> records (25 per page)
                </div>

                {totalPages > 1 && (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={validPage === 1}
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 font-bold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Prev
                    </button>

                    <div className="flex items-center gap-1">
                      {Array.from({ length: totalPages }, (_, idx) => idx + 1).map((pageNum) => (
                        <button
                          key={pageNum}
                          type="button"
                          onClick={() => setCurrentPage(pageNum)}
                          className={`w-8 h-8 rounded-xl text-xs font-extrabold transition-all ${
                            validPage === pageNum
                              ? 'bg-blue-600 text-white shadow-xs'
                              : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                          }`}
                        >
                          {pageNum}
                        </button>
                      ))}
                    </div>

                    <button
                      type="button"
                      disabled={validPage === totalPages}
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 font-bold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1"
                    >
                      Next
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </>
      )}

      {/* Student Details Modal */}
      <StudentDetailsModal
        student={selectedStudent}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedStudent(null);
        }}
        onToggleCR={handleToggleCR}
        canManageCR={canManage}
      />

    </div>
  );
}
