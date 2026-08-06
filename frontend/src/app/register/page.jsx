'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  GraduationCap, 
  UserCheck, 
  AlertCircle, 
  User, 
  Mail, 
  Lock, 
  Building, 
  IdCard,
  Briefcase,
  Award,
  Eye,
  EyeOff,
  Sparkles,
  ShieldCheck,
  ArrowRight,
  School,
  BellRing,
  CalendarDays,
  Megaphone,
  Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { registerUser } from '../../lib/api';

export default function RegisterPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [role, setRole] = useState('student');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [department, setDepartment] = useState('Computer Science & Engineering');
  const [studentId, setStudentId] = useState('');
  const [facultyId, setFacultyId] = useState('');
  const [designation, setDesignation] = useState('Assistant Professor');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (role === 'student' && !studentId.trim()) {
      setError('Please enter your official Student ID (e.g. CSE-2024-042).');
      return;
    }

    if (role === 'faculty' && (!facultyId.trim() || !designation)) {
      setError('Please provide your Faculty Designation and Employee ID.');
      return;
    }

    setLoading(true);

    try {
      const user = await registerUser({
        name,
        email,
        password,
        role,
        department,
        studentId: role === 'student' ? studentId : '',
        facultyId: role === 'faculty' ? facultyId : '',
        designation: role === 'faculty' ? designation : ''
      });
      login(user);
      router.push('/');
    } catch (err) {
      setError(err.message || 'Registration failed. Please verify your information.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center py-10 px-4 sm:px-6 lg:px-8 bg-slate-50/50 dark:bg-slate-950/50">
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden transition-colors">
        
        {/* Left Hero / Brand Panel (Visible on lg screens) */}
        <div className="lg:col-span-5 bg-gradient-to-br from-slate-900 via-slate-850 to-indigo-950 p-8 lg:p-10 text-white flex flex-col justify-between relative overflow-hidden">
          {/* Subtle Ambient Glow */}
          <div className="absolute -top-24 -left-24 w-72 h-72 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />

          {/* Brand Header */}
          <div className="relative z-10 space-y-6">
            <Link href="/" className="inline-flex items-center gap-3 group">
              <div className="w-12 h-12 rounded-2xl bg-blue-600/20 border border-blue-400/30 flex items-center justify-center text-white backdrop-blur-sm group-hover:scale-105 transition-transform">
                <GraduationCap className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <span className="font-extrabold text-xl tracking-tight text-white block">UniPortal</span>
                <span className="text-[11px] text-blue-300 font-medium">Metropolitan Academic Gateway</span>
              </div>
            </Link>

            <div className="space-y-3 pt-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-400/20 text-blue-300 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                Verified Academic Network
              </span>
              <h2 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight leading-tight">
                Empowering Students & Faculty Together
              </h2>
              <p className="text-xs lg:text-sm text-slate-300 leading-relaxed">
                Connect seamlessly with your university ecosystem. Real-time class schedules, official department notices, and campus broadcasts in one portal.
              </p>
            </div>

            {/* Dynamic Role Privileges Showcase */}
            <div className="pt-4 space-y-3">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                {role === 'student' ? 'Student Account Features' : 'Faculty Account Privileges'}
              </p>
              
              <AnimatePresence mode="wait">
                {role === 'student' ? (
                  <motion.div
                    key="student-perks"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-2.5"
                  >
                    <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-800/60 border border-slate-700/50 backdrop-blur-sm">
                      <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                        <CalendarDays className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white">Live Class Timetable</p>
                        <p className="text-[11px] text-slate-400">View daily routines, room numbers & faculty assignments.</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-800/60 border border-slate-700/50 backdrop-blur-sm">
                      <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                        <BellRing className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white">Department Notice Feed</p>
                        <p className="text-[11px] text-slate-400">Stay updated on exam dates, assignments & syllabus changes.</p>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="faculty-perks"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-2.5"
                  >
                    <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-800/60 border border-slate-700/50 backdrop-blur-sm">
                      <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
                        <Megaphone className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white">Official Notice Publishing</p>
                        <p className="text-[11px] text-slate-400">Broadcast important notices directly to department students.</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-800/60 border border-slate-700/50 backdrop-blur-sm">
                      <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
                        <School className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white">Routine & Schedule Manager</p>
                        <p className="text-[11px] text-slate-400">Create, update and manage weekly class session schedules.</p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Footer badge */}
          <div className="relative z-10 pt-6 border-t border-slate-800/80 flex items-center justify-between text-slate-400 text-xs">
            <span className="flex items-center gap-1.5 text-[11px]">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Secure 256-bit Encryption
            </span>
            <span className="text-[11px]">UniPortal v2.4</span>
          </div>
        </div>

        {/* Right Form Panel */}
        <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-center">
          
          <div className="max-w-md mx-auto w-full space-y-6">
            
            {/* Header */}
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Create Account</h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">Select your portal role and complete registration</p>
            </div>

            {/* Interactive Dual Role Picker Cards */}
            <div className="space-y-2">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Account Type *</label>
              <div className="grid grid-cols-2 gap-3">
                
                {/* Student Card */}
                <button
                  type="button"
                  onClick={() => { setRole('student'); setError(''); }}
                  className={`relative p-3.5 rounded-2xl border-2 text-left transition-all flex items-start gap-3 ${
                    role === 'student'
                      ? 'border-blue-600 dark:border-blue-500 bg-blue-50/50 dark:bg-blue-950/40 shadow-sm ring-2 ring-blue-500/20'
                      : 'border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/30 dark:bg-slate-800/30'
                  }`}
                >
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                    role === 'student' ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                  }`}>
                    <GraduationCap className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1">
                      <span className="font-extrabold text-xs text-slate-900 dark:text-white">Student</span>
                      {role === 'student' && <Check className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />}
                    </div>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Undergrad / Postgrad</p>
                  </div>
                </button>

                {/* Faculty Card */}
                <button
                  type="button"
                  onClick={() => { setRole('faculty'); setError(''); }}
                  className={`relative p-3.5 rounded-2xl border-2 text-left transition-all flex items-start gap-3 ${
                    role === 'faculty'
                      ? 'border-indigo-600 dark:border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/40 shadow-sm ring-2 ring-indigo-500/20'
                      : 'border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/30 dark:bg-slate-800/30'
                  }`}
                >
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                    role === 'faculty' ? 'bg-indigo-600 text-white shadow-sm' : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                  }`}>
                    <Award className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1">
                      <span className="font-extrabold text-xs text-slate-900 dark:text-white">Faculty</span>
                      {role === 'faculty' && <Check className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />}
                    </div>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Teacher / Professor</p>
                  </div>
                </button>

              </div>
            </div>

            {/* Error Notification */}
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3.5 rounded-xl bg-rose-50 border border-rose-200/80 text-rose-700 text-xs flex items-center gap-2.5 shadow-sm"
              >
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span className="font-semibold">{error}</span>
              </motion.div>
            )}

            {/* Registration Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Full Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Full Name *</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder={role === 'faculty' ? 'Dr. Sarah Jenkins' : 'Alex Rivera'}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white bg-white dark:bg-slate-900/90 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600"
                    required
                  />
                </div>
              </div>

              {/* University Email */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">University Email *</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    placeholder={role === 'faculty' ? 's.jenkins@univ.edu' : 'a.rivera@student.univ.edu'}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white bg-white dark:bg-slate-900/90 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Password *</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white bg-white dark:bg-slate-900/90 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Department */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Academic Department *</label>
                <div className="relative">
                  <Building className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white bg-white dark:bg-slate-900/90 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all appearance-none"
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

              {/* Role Specific Dynamic Inputs */}
              {role === 'student' ? (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  transition={{ duration: 0.2 }}
                >
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Official Student ID *</label>
                  <div className="relative">
                    <IdCard className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="e.g. CSE-2024-042 or 2024-1-60-042"
                      value={studentId}
                      onChange={(e) => setStudentId(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white bg-white dark:bg-slate-900/90 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600"
                      required
                    />
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  transition={{ duration: 0.2 }}
                  className="grid grid-cols-1 sm:grid-cols-2 gap-3"
                >
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Faculty Designation *</label>
                    <div className="relative">
                      <Award className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <select
                        value={designation}
                        onChange={(e) => setDesignation(e.target.value)}
                        className="w-full pl-10 pr-2 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white bg-white dark:bg-slate-900/90 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all appearance-none"
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
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Employee ID *</label>
                    <div className="relative">
                      <Briefcase className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="e.g. FAC-2024-102"
                        value={facultyId}
                        onChange={(e) => setFacultyId(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white bg-white dark:bg-slate-900/90 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600"
                        required
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3.5 rounded-xl text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md transition-all disabled:opacity-50 mt-2 ${
                  role === 'faculty' 
                    ? 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200 dark:shadow-none' 
                    : 'bg-slate-900 dark:bg-blue-600 hover:bg-slate-800 dark:hover:bg-blue-700 shadow-slate-200 dark:shadow-none'
                }`}
              >
                <UserCheck className="w-4 h-4 text-blue-400" />
                {loading ? 'Creating Account...' : `Register as ${role === 'faculty' ? 'Faculty Member' : 'Student'}`}
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 ml-1" />
              </button>
            </form>

            <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-100">
              Already have an account?{' '}
              <Link href="/login" className="font-bold text-blue-600 hover:text-blue-700 transition-colors">
                Sign In to Portal
              </Link>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
