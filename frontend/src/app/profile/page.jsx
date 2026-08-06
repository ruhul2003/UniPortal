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
import { updateUserProfile } from '../../lib/api';

// Curated avatar presets
const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80'
];

export default function ProfilePage() {
  const { user, updateUser } = useAuth();

  const [name, setName] = useState('');
  const [department, setDepartment] = useState('');
  const [section, setSection] = useState('Section A');
  const [studentId, setStudentId] = useState('');
  const [facultyId, setFacultyId] = useState('');
  const [designation, setDesignation] = useState('');
  const [avatar, setAvatar] = useState('');

  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

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
    <div className="max-w-4xl mx-auto space-y-8">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-850 to-blue-950 p-8 rounded-3xl text-white shadow-xl relative overflow-hidden">
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
          
          {/* Section 1: Avatar Image Picker */}
          <div className="space-y-3">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Camera className="w-4 h-4 text-blue-500" />
              Profile Avatar Image
            </label>
            
            {/* Preset Avatars */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              {PRESET_AVATARS.map((url, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setAvatar(url)}
                  className={`w-12 h-12 rounded-2xl border-2 overflow-hidden transition-all relative ${
                    avatar === url 
                      ? 'border-blue-600 ring-2 ring-blue-500/20 scale-105 shadow-sm' 
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-400'
                  }`}
                >
                  <img src={url} alt={`Avatar ${i+1}`} className="w-full h-full object-cover" />
                </button>
              ))}

              <button
                type="button"
                onClick={() => setAvatar('')}
                className={`h-12 px-3 rounded-2xl border text-xs font-semibold transition-all ${
                  !avatar 
                    ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400' 
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                }`}
              >
                Initials Circle
              </button>
            </div>

            {/* Custom Image URL Input */}
            <div className="pt-2">
              <label className="block text-[11px] text-slate-400 dark:text-slate-500 mb-1">Or enter Custom Image URL</label>
              <div className="relative">
                <ImageIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="url"
                  placeholder="https://example.com/my-photo.jpg"
                  value={avatar}
                  onChange={(e) => setAvatar(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Student Section Selector (Only for Students) */}
          {user.role === 'student' && (
            <div className="p-5 rounded-2xl bg-blue-50/50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-800/50 space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold uppercase tracking-wider text-blue-900 dark:text-blue-300 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  Academic Class Section *
                </label>
                <span className="px-2.5 py-0.5 rounded-full bg-blue-600 text-white text-[10px] font-extrabold">
                  Current: {section}
                </span>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-400">
                Select your designated batch section to receive class-specific routines and notices.
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 pt-1">
                {['Section A', 'Section B', 'Section C', 'Section D', 'Section E'].map((secOption) => (
                  <button
                    key={secOption}
                    type="button"
                    onClick={() => setSection(secOption)}
                    className={`py-2.5 px-3 rounded-xl border-2 text-center text-xs font-bold transition-all ${
                      section === secOption
                        ? 'border-blue-600 bg-blue-600 text-white shadow-sm'
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:border-slate-300 dark:hover:border-slate-600'
                    }`}
                  >
                    {secOption}
                  </button>
                ))}
              </div>
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

    </div>
  );
}
