'use client';

import React from 'react';
import { 
  X, 
  Crown, 
  Mail, 
  Building, 
  Shield, 
  IdCard,
  Hash
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function StudentDetailsModal({ student, isOpen, onClose, onToggleCR, canManageCR }) {
  if (!isOpen || !student) return null;

  const isStudentRole = student.role === 'student';

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden"
        >
          {/* Header Banner */}
          <div className="h-28 bg-indigo-900 p-6 flex items-start justify-between relative">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-[11px] font-bold uppercase tracking-wider">
                {student.role || 'Student'} Profile
              </span>
              {student.isCR && (
                <span className="px-2.5 py-1 rounded-full bg-amber-400 text-slate-900 text-[11px] font-black flex items-center gap-1 shadow-sm">
                  <Crown className="w-3.5 h-3.5 fill-slate-900" />
                  CR (Class Representative)
                </span>
              )}
            </div>
            
            <button
              onClick={onClose}
              className="p-1.5 rounded-full bg-black/20 hover:bg-black/40 text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Profile Avatar & Primary Info */}
          <div className="px-6 pb-6 pt-0 relative">
            <div className="flex items-end justify-between -mt-12 mb-4">
              <div className="w-24 h-24 rounded-2xl bg-white dark:bg-slate-900 p-1.5 shadow-xl">
                <div className="w-full h-full rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-200 text-2xl font-black relative overflow-hidden">
                  {student.avatar ? (
                    <img src={student.avatar} alt={student.name} className="w-full h-full object-cover rounded-xl" />
                  ) : (
                    <span>{student.name ? student.name.charAt(0) : 'S'}</span>
                  )}
                </div>
              </div>

              {canManageCR && isStudentRole && (
                <button
                  onClick={() => onToggleCR(student)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-md ${
                    student.isCR
                      ? 'bg-amber-500 hover:bg-amber-600 text-white'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  <Crown className="w-4 h-4" />
                  {student.isCR ? 'Revoke CR Appointment' : 'Make Class CR'}
                </button>
              )}
            </div>

            <div className="space-y-1 mb-6">
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                {student.name}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-blue-500" />
                {student.email}
              </p>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800/80">
                <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500 mb-1">
                  <IdCard className="w-4 h-4 text-indigo-500" />
                  <span className="text-[11px] font-semibold uppercase">Student ID</span>
                </div>
                <p className="text-sm font-bold font-mono text-slate-900 dark:text-white">
                  {student.studentId || 'N/A'}
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800/80">
                <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500 mb-1">
                  <Hash className="w-4 h-4 text-purple-500" />
                  <span className="text-[11px] font-semibold uppercase">Section</span>
                </div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">
                  {student.section || 'Section A'}
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800/80 col-span-2 sm:col-span-1">
                <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500 mb-1">
                  <Building className="w-4 h-4 text-emerald-500" />
                  <span className="text-[11px] font-semibold uppercase">Department</span>
                </div>
                <p className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">
                  {student.department || 'Computer Science & Engineering'}
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800/80 col-span-2 sm:col-span-1">
                <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500 mb-1">
                  <Crown className="w-4 h-4 text-amber-500" />
                  <span className="text-[11px] font-semibold uppercase">CR Status</span>
                </div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">
                  {student.isCR ? 'Active Class Rep (CR)' : 'Standard Student'}
                </p>
              </div>

            </div>

            {/* Governance note */}
            <div className="p-3.5 rounded-2xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40 text-xs text-blue-800 dark:text-blue-300 flex items-start gap-2.5">
              <Shield className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Academic Governance Policy</p>
                <p className="text-[11px] text-blue-600/80 dark:text-blue-300/70 mt-0.5">
                  Faculty members and Administrators can appoint or revoke Class Representative (CR) status for any student.
                </p>
              </div>
            </div>

          </div>

          <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex justify-end">
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-white text-xs font-bold transition-all"
            >
              Close
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
