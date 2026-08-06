'use client';

import React from 'react';
import { X, Calendar, User, Building2, Tag, AlertTriangle, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function NoticeModal({ notice, isOpen, onClose }) {
  if (!isOpen || !notice) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-modal border border-slate-100 max-h-[85vh] overflow-y-auto relative"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-6 right-6 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Badges */}
          <div className="flex items-center gap-2 mb-4">
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100">
              {notice.category || 'Academic'}
            </span>
            {notice.isUrgent && (
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500 text-white flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" /> URGENT NOTICE
              </span>
            )}
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
              {notice.department || 'All Departments'}
            </span>
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold text-slate-900 mb-4 leading-snug">
            {notice.title}
          </h2>

          {/* Author Meta */}
          <div className="flex flex-wrap items-center gap-4 py-3 px-4 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-600 mb-6">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-blue-600" />
              <div>
                <p className="font-bold text-slate-900">{notice.publishedBy}</p>
                <p className="text-[10px] text-slate-400">{notice.facultyRole || 'Faculty'}</p>
              </div>
            </div>

            <div className="h-6 w-[1px] bg-slate-200 hidden sm:block" />

            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-slate-400" />
              <span>{new Date(notice.createdAt || Date.now()).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</span>
            </div>
          </div>

          {/* Notice Body */}
          <div className="prose max-w-none text-slate-700 text-sm leading-relaxed whitespace-pre-line mb-8">
            {notice.content}
          </div>

          {/* Close Action */}
          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-all shadow-sm"
            >
              Done Reading
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
