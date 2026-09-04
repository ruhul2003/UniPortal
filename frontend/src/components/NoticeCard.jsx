'use client';

import React, { useState } from 'react';
import { Calendar, Tag, AlertTriangle, Building2, User, ChevronRight, Trash2, Info } from 'lucide-react';
import { motion } from 'framer-motion';
import NoticeModal from './NoticeModal';
import { useAuth } from '../context/AuthContext';

export default function NoticeCard({ notice, onDelete, layout = 'column' }) {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();
  const isFaculty = user?.role === 'faculty' || user?.role === 'admin';

  const badgeStyle = 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700';
  const formattedDate = notice.createdAt 
    ? new Date(notice.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : 'Recent';

  return (
    <>
      <motion.div
        whileHover={{ y: -2, transition: { duration: 0.2 } }}
        className={`group bg-white dark:bg-slate-900 rounded-3xl p-6 border ${
          notice.isUrgent ? 'border-rose-300 dark:border-rose-800/80 shadow-rose-500/5' : 'border-slate-200 dark:border-slate-800'
        } shadow-sm hover:shadow-md transition-all duration-300 relative flex ${
          layout === 'column' ? 'flex-col sm:flex-row sm:items-center justify-between gap-5' : 'flex-col justify-between h-full'
        } w-full`}
      >
        <div className="flex-1 space-y-2.5">
          {/* Header Badges & Actions */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`px-3 py-1 rounded-xl text-xs font-extrabold border ${badgeStyle}`}>
                {notice.category || 'Academic'}
              </span>

              {notice.department && (
                <span className="px-2.5 py-1 rounded-xl text-[11px] font-semibold bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                  {notice.department}
                </span>
              )}

              {notice.isUrgent && (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-600 dark:bg-rose-600 text-white border border-rose-500 flex items-center gap-1 shadow-xs uppercase tracking-wider">
                  <AlertTriangle className="w-3 h-3 text-white fill-white/20" /> URGENT
                </span>
              )}
            </div>

            {isFaculty && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete?.(notice._id);
                }}
                title="Delete Notice"
                aria-label="Delete notice"
                className="opacity-0 group-hover:opacity-100 p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-all shrink-0"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Notice Title */}
          <h3 
            onClick={() => setIsOpen(true)}
            className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors cursor-pointer leading-snug"
          >
            {notice.title}
          </h3>

          {/* Content snippet */}
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed font-normal">
            {notice.content}
          </p>

          {/* Publisher Meta Info */}
          <div className="flex items-center gap-4 text-xs text-slate-400 pt-1">
            <span className="flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-slate-400" />
              <span className="font-semibold text-slate-700 dark:text-slate-300 truncate max-w-[140px] sm:max-w-[200px]">
                {notice.publishedBy}
              </span>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              {formattedDate}
            </span>
          </div>
        </div>

        {/* Details Button */}
        <div className={`flex items-center gap-3 shrink-0 ${layout === 'column' ? 'pt-2 sm:pt-0 self-end sm:self-center' : 'pt-4 border-t border-slate-100 dark:border-slate-800 justify-end'}`}>
          <button
            onClick={() => setIsOpen(true)}
            className="px-5 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs transition-all flex items-center gap-2 shadow-md shadow-blue-500/20 group/btn"
          >
            <span>Details</span>
            <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </motion.div>

      {/* Modal Popup */}
      <NoticeModal notice={notice} isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
