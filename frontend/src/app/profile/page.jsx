'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  User, 
  Mail, 
  Building, 
  IdCard, 
  Crown, 
  Camera, 
  Save, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  Layers, 
  Award,
  GraduationCap,
  ShieldCheck,
  RefreshCw,
  Image as ImageIcon,
  Lock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { updateUserProfile, fetchSectionRequests, createSectionRequest, cancelSectionRequest } from '../../lib/api';
import { X } from 'lucide-react';

export default function ProfilePage() {
  const { user, updateUser } = useAuth();

  const [name, setName] = useState('');
  const [department, setDepartment] = useState('');
  const [section, setSection] = useState('Section A');
  const [studentId, setStudentId] = useState('');
  const [facultyId, setFacultyId] = useState('');
  const [designation, setDesignation] = useState('');
  const [avatar, setAvatar] = useState('');

  // Section Change Request State
  const [sectionRequests, setSectionRequests] = useState([]);
  const [requestModalOpen, setRequestModalOpen] = useState(false);
  const [requestedTargetSection, setRequestedTargetSection] = useState('Section B');
  const [transferReason, setTransferReason] = useState('');
  const [requestSubmitting, setRequestSubmitting] = useState(false);

  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMsg('Please select a valid image file (JPG, PNG, WEBP).');
      return;
    }

    const MAX_SIZE_MB = 5;
    const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;
    if (file.size > MAX_SIZE_BYTES) {
      const sizeInMB = (file.size / (1024 * 1024)).toFixed(2);
      setErrorMsg(`File size (${sizeInMB} MB) exceeds the 5 MB limit. Faculty must upload a real photo under 5 MB.`);
      return;
    }

    setErrorMsg('');
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatar(reader.result);
      setSuccessMsg('Real photo loaded successfully! Click "Save Profile Changes" to save.');
      setTimeout(() => setSuccessMsg(''), 4000);
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setDepartment(user.department || 'Computer Science & Engineering');
      setSection(user.section || 'Section A');
      setStudentId(user.studentId || '');
      setFacultyId(user.facultyId || '');
      setDesignation(user.designation || 'Lecturer');
      setAvatar(user.avatar || '');
    }
  }, [user]);

  useEffect(() => {
    async function loadRequests() {
      if (user?._id) {
        const reqs = await fetchSectionRequests(user._id);
        setSectionRequests(reqs);
      }
    }
    loadRequests();
  }, [user]);

  const handleApplySectionTransfer = async (e) => {
    e.preventDefault();
    setRequestSubmitting(true);
    setErrorMsg('');
    try {
      const res = await createSectionRequest({
        userId: user._id,
        userName: user.name,
        studentId: user.studentId || user._id,
        userEmail: user.email,
        currentSection: user.section || 'Section A',
        requestedSection: requestedTargetSection,
        reason: transferReason
      });
      if (res.request) {
        setSectionRequests([res.request, ...sectionRequests]);
        setSuccessMsg('Section transfer application submitted to Admin for review!');
        setRequestModalOpen(false);
        setTransferReason('');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to submit section change request');
    } finally {
      setRequestSubmitting(false);
    }
  };

  const handleCancelRequest = async (requestId) => {
    try {
      await cancelSectionRequest(requestId);
      setSectionRequests(sectionRequests.filter(r => r._id !== requestId));
      setSuccessMsg('Section transfer request cancelled');
    } catch (err) {
      setErrorMsg(err.message || 'Failed to cancel request');
    }
  };

  const pendingRequest = sectionRequests.find(r => r.status === 'pending');

  if (!user) {
    return (
      <div className="max-w-md mx-auto py-16 px-4 text-center">
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-100 dark:border-slate-800 shadow-xl space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto">
            <User className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">Sign In Required</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Please log in to manage your student section, update your profile picture, and view academic details.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 dark:bg-blue-600 text-white text-xs font-bold shadow-sm"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const updateData = {
        name,
        avatar,
        section,
        department,
        studentId: user.role === 'student' ? studentId : '',
        facultyId: user.role === 'faculty' ? facultyId : '',
        designation: user.role === 'faculty' ? designation : ''
      };

      const res = await updateUserProfile(user._id, updateData);
      
      if (res.user) {
        updateUser(res.user);
        setSuccessMsg('Profile updated successfully!');
      } else {
        updateUser(updateData);
        setSuccessMsg('Profile details updated!');
      }

      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      
      {/* Header Banner */}
      <div className="bg-slate-900 p-8 rounded-3xl text-white shadow-xl relative overflow-hidden">
        <div className="absolute -right-20 -top-20 w-72 h-72 rounded-full bg-blue-600/20 blur-3xl pointer-events-none" />
        
        <div className="flex flex-col sm:flex-row items-center gap-6 relative z-10">
          
          {/* Avatar Display */}
          <div className="relative group">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-slate-800 border-2 border-white/20 shadow-2xl overflow-hidden flex items-center justify-center text-3xl font-extrabold text-white">
              {avatar ? (
                <img src={avatar} alt={name} className="w-full h-full object-cover" />
              ) : (
                <span>{name ? name.charAt(0) : 'U'}</span>
              )}
            </div>
            {user.isCR && (
              <span className="absolute -top-2 -right-2 px-2.5 py-1 rounded-full bg-amber-500 text-white font-extrabold text-[10px] flex items-center gap-1 shadow-md">
                <Crown className="w-3.5 h-3.5 fill-white" />
                CR
              </span>
            )}
          </div>

          {/* User Info Overview */}
          <div className="text-center sm:text-left space-y-2">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">{name}</h1>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                user.role === 'admin' 
                  ? 'bg-purple-500/30 border border-purple-400/40 text-purple-200' 
                  : user.role === 'faculty' 
                  ? 'bg-indigo-500/30 border border-indigo-400/40 text-indigo-200' 
                  : 'bg-emerald-500/30 border border-emerald-400/40 text-emerald-200'
              }`}>
                {user.role}
              </span>
            </div>

            <p className="text-xs text-slate-300 flex items-center justify-center sm:justify-start gap-1.5">
              <Mail className="w-3.5 h-3.5 text-blue-400" />
              {user.email}
            </p>

            <div className="pt-1 flex flex-wrap items-center justify-center sm:justify-start gap-3 text-xs font-semibold text-slate-300">
              <span className="flex items-center gap-1">
                <Building className="w-3.5 h-3.5 text-slate-400" />
                {department}
              </span>

              {user.role === 'student' && (
                <span className="px-2.5 py-1 rounded-xl bg-blue-500/20 border border-blue-400/30 text-blue-300 text-[11px] font-extrabold flex items-center gap-1">
                  <Layers className="w-3.5 h-3.5" />
                  {section}
                </span>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* Action Toast Feedback */}
      <AnimatePresence>
        {successMsg && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-semibold flex items-center gap-3 shadow-xs"
          >
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>{successMsg}</span>
          </motion.div>
        )}

        {errorMsg && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-semibold flex items-center gap-3 shadow-xs"
          >
            <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0" />
            <span>{errorMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Profile Edit Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-6 sm:p-8 shadow-xl space-y-8">
        
        <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">Edit Academic Profile</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Update your academic section, profile avatar image and personal details</p>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          
          {/* Section 1: Real Profile Image File Upload (< 5 MB) */}
          <div className="space-y-3">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Camera className="w-4 h-4 text-blue-500" />
              Profile Avatar Image (Real Image File &lt; 5 MB)
            </label>
            
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border-2 border-dashed border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-center gap-5 transition-colors hover:border-blue-500/50">
              {/* Preview Thumbnail */}
              <div className="relative shrink-0">
                <div className="w-20 h-20 rounded-2xl bg-slate-200 dark:bg-slate-700 border-2 border-slate-300 dark:border-slate-600 overflow-hidden flex items-center justify-center text-xl font-black text-slate-500 shadow-sm">
                  {avatar ? (
                    <img src={avatar} alt="Profile Preview" className="w-full h-full object-cover" />
                  ) : (
                    <span>{name ? name.charAt(0) : 'U'}</span>
                  )}
                </div>
                {avatar && (
                  <button
                    type="button"
                    onClick={() => setAvatar('')}
                    className="absolute -top-2 -right-2 p-1 rounded-full bg-rose-600 text-white shadow-md hover:bg-rose-700 transition-colors"
                    title="Remove Photo"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Upload Action */}
              <div className="space-y-2 text-center sm:text-left flex-1">
                <div>
                  <h4 className="text-xs font-extrabold text-slate-900 dark:text-white">
                    {user.role === 'faculty' ? 'Faculty Official Real Photo Upload' : 'Upload Real Profile Photo'}
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Faculty must upload a real photo. Accepted formats: JPG, PNG, WEBP. <strong className="text-blue-600 dark:text-blue-400 font-extrabold">Maximum size: 5 MB</strong>.
                  </p>
                </div>

                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 pt-1">
                  <label className="cursor-pointer px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md flex items-center gap-2 transition-all active:scale-95">
                    <Camera className="w-4 h-4" />
                    <span>Upload Real Image (&lt; 5 MB)</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>

                  {avatar && (
                    <button
                      type="button"
                      onClick={() => setAvatar('')}
                      className="px-3 py-2 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-300 transition-colors"
                    >
                      Clear Image
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Student Section Lock & Transfer Application Workflow (Only for Students) */}
          {user.role === 'student' && (
            <div className="p-5 rounded-2xl bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-800/60 space-y-4 shadow-sm">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-sm">
                    <Layers className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                      Academic Class Section
                      <span className="inline-flex items-center gap-1 text-[10px] text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-800">
                        <Lock className="w-3 h-3" /> Admin Approval Required
                      </span>
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Students cannot change sections directly. Submit a transfer request for Admin review.
                    </p>
                  </div>
                </div>

                <span className="px-3 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-extrabold shadow-sm">
                  Current: {user.section || 'Section A'}
                </span>
              </div>

              {/* Pending Request Active Status Banner */}
              {pendingRequest ? (
                <div className="p-4 rounded-xl bg-amber-50/90 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 space-y-3">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />
                      <span className="text-xs font-bold text-amber-900 dark:text-amber-300 uppercase tracking-wide">
                        Pending Transfer Request
                      </span>
                    </div>
                    <span className="text-[11px] text-amber-700 dark:text-amber-400">
                      Submitted {new Date(pendingRequest.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="text-xs text-slate-700 dark:text-slate-200 space-y-1">
                    <p className="font-semibold">
                      Requested Transfer: <span className="text-indigo-600 dark:text-indigo-400 font-bold">{pendingRequest.currentSection} ➔ {pendingRequest.requestedSection}</span>
                    </p>
                    <p className="text-slate-500 dark:text-slate-400 italic">"{pendingRequest.reason}"</p>
                  </div>

                  <div className="pt-2 border-t border-amber-200/60 dark:border-amber-800/40 flex items-center justify-between">
                    <span className="text-[11px] text-amber-800 dark:text-amber-300 font-medium">
                      Status: Under Administrator Review
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCancelRequest(pendingRequest._id)}
                      className="px-3 py-1 rounded-lg bg-rose-100 dark:bg-rose-950/60 hover:bg-rose-200 text-rose-700 dark:text-rose-300 text-[11px] font-bold transition-colors"
                    >
                      Cancel Application
                    </button>
                  </div>
                </div>
              ) : (
                <div className="pt-2 flex items-center justify-between flex-wrap gap-3">
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    Need to switch to another class section for course schedule conflicts?
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      const defaultTarget = ['Section A', 'Section B', 'Section C', 'Section D', 'Section E'].find(s => s !== (user.section || 'Section A')) || 'Section B';
                      setRequestedTargetSection(defaultTarget);
                      setRequestModalOpen(true);
                    }}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-2 shadow-sm transition-all"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-yellow-300" /> Apply for Section Transfer
                  </button>
                </div>
              )}

              {/* Past Request History */}
              {sectionRequests.filter(r => r.status !== 'pending').length > 0 && (
                <div className="pt-3 border-t border-slate-200/60 dark:border-slate-800/60 space-y-2">
                  <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                    Recent Section Applications
                  </span>
                  <div className="space-y-1.5 max-h-32 overflow-y-auto">
                    {sectionRequests.filter(r => r.status !== 'pending').map((req) => (
                      <div key={req._id} className="p-2.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700 flex items-center justify-between text-xs">
                        <div>
                          <span className="font-semibold text-slate-800 dark:text-slate-200">
                            {req.currentSection} ➔ {req.requestedSection}
                          </span>
                          {req.adminComment && (
                            <span className="block text-[11px] text-slate-400">Note: {req.adminComment}</span>
                          )}
                        </div>
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                          req.status === 'approved' 
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300' 
                            : 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                        }`}>
                          {req.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Section 3: Personal Information Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Full Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Full Name *</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  required
                />
              </div>
            </div>

            {/* Department */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Academic Department</label>
              <div className="relative">
                <Building className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 appearance-none"
                >
                  <option value="Computer Science & Engineering">Computer Science & Engineering</option>
                  <option value="Electrical & Electronic Engineering">Electrical & Electronic Engineering</option>
                  <option value="Software Engineering">Software Engineering</option>
                  <option value="Business Administration">Business Administration</option>
                  <option value="Civil Engineering">Civil Engineering</option>
                  <option value="English & Modern Languages">English & Modern Languages</option>
                  <option value="Department of Law">Department of Law</option>
                </select>
              </div>
            </div>

            {/* Student ID / Faculty Details */}
            {user.role === 'student' ? (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">Official Student ID</label>
                  <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold flex items-center gap-1">
                    <Lock className="w-3 h-3 text-amber-500" />
                    Permanent (Cannot be changed)
                  </span>
                </div>
                <div className="relative">
                  <IdCard className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={studentId}
                    disabled
                    readOnly
                    title="Student ID is permanent and cannot be modified after registration"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-mono font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/80 cursor-not-allowed select-none"
                  />
                </div>
              </div>
            ) : user.role === 'faculty' ? (
              <>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Faculty Designation</label>
                  <div className="relative">
                    <Award className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <select
                      value={designation}
                      onChange={(e) => setDesignation(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 appearance-none"
                    >
                      <option value="Professor">Professor</option>
                      <option value="Associate Professor">Associate Professor</option>
                      <option value="Assistant Professor">Assistant Professor</option>
                      <option value="Senior Lecturer">Senior Lecturer</option>
                      <option value="Lecturer">Lecturer</option>
                      <option value="Head of Department">Head of Department</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Employee ID</label>
                  <div className="relative">
                    <IdCard className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={facultyId}
                      onChange={(e) => setFacultyId(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>
                </div>
              </>
            ) : null}

          </div>

          {/* Submit Save Button */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-2 shadow-md disabled:opacity-50 transition-all"
            >
              {saving ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {saving ? 'Saving Changes...' : 'Save Profile Changes'}
            </button>
          </div>

        </form>

      </div>

      {/* Section Transfer Application Modal */}
      <AnimatePresence>
        {requestModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 dark:border-slate-800 relative"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                    <Layers className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">Apply for Section Transfer</h3>
                    <p className="text-xs text-slate-400">Request Admin review to change your batch section</p>
                  </div>
                </div>
                <button onClick={() => setRequestModalOpen(false)} className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-slate-200">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleApplySectionTransfer} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Current Section
                  </label>
                  <input
                    type="text"
                    value={user.section || 'Section A'}
                    disabled
                    className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 text-xs font-bold cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Target Section *
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {['Section A', 'Section B', 'Section C', 'Section D', 'Section E']
                      .filter(secOption => secOption !== (user.section || 'Section A'))
                      .map((secOption) => (
                        <button
                          key={secOption}
                          type="button"
                          onClick={() => setRequestedTargetSection(secOption)}
                          className={`py-2 px-2.5 rounded-xl border text-center text-xs font-bold transition-all ${
                            requestedTargetSection === secOption
                              ? 'border-indigo-600 bg-indigo-600 text-white shadow-sm'
                              : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200'
                          }`}
                        >
                          {secOption}
                        </button>
                      ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Reason for Transfer Application *
                  </label>
                  <textarea
                    rows={3}
                    placeholder="e.g., Timetable conflict with elective lab, transportation timing, etc."
                    value={transferReason}
                    onChange={(e) => setTransferReason(e.target.value)}
                    required
                    className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white text-xs focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setRequestModalOpen(false)}
                    className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={requestSubmitting}
                    className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm"
                  >
                    {requestSubmitting ? 'Submitting...' : 'Submit Application'}
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
