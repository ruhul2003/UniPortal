'use client';

import React, { useState } from 'react';
import { Calendar, Tag, AlertTriangle, Building2, User, ChevronRight, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import NoticeModal from './NoticeModal';
import { useAuth } from '../context/AuthContext';

export default function NoticeCard({ notice, onDelete }) {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();
  const isFaculty = user?.role === 'faculty' || user?.role === 'admin';

  const categoryColors = {
    Academic: 'bg-blue-50 text-blue-700 border-blue-100',
    Exam: 'bg-amber-50 text-amber-700 border-amber-100',
    Administrative: 'bg-purple-50 text-purple-700 border-purple-100',
    Event: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    General: 'bg-slate-100 text-slate-700 border-slate-200',
  };

  const badgeStyle = categoryColors[notice.category] || categoryColors.General;
  const formattedDate = notice.createdAt 
    ? new Date(notice.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : 'Recent';

  return (
    <>
      <motion.div
        whileHover={{ y: -3, transition: { duration: 0.2 } }}
        className={`group bg-white rounded-2xl p-6 border ${
          notice.isUrgent ? 'border-amber-200 shadow-amber-500/5' : 'border-slate-100'
        } shadow-card hover:shadow-xl transition-all duration-300 relative flex flex-col justify-between`}
      >
        <div>
          {/* Header Badges */}
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${badgeStyle}`}>
                {notice.category || 'Academic'}
              </span>

              {notice.isUrgent && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-white flex items-center gap-1 shadow-xs">
                  <AlertTriangle className="w-3 h-3" /> URGENT
                </span>
              )}
            </div>

            {/* Faculty Quick Action: Delete */}
            {isFaculty && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete?.(notice._id);
                }}
                title="Faculty Delete Notice"
                className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Title */}
          <h3 
            onClick={() => setIsOpen(true)}
            className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors cursor-pointer line-clamp-2 mb-2 leading-snug"
          >
            {notice.title}
          </h3>

          {/* Content snippet */}
          <p className="text-sm text-slate-500 line-clamp-3 mb-4 leading-relaxed font-normal">
            {notice.content}
          </p>
        </div>

        {/* Footer info */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <User className="w-3.5 h-3.5 text-slate-400" />
              <span className="font-medium text-slate-600 truncate max-w-[120px] sm:max-w-[160px]">
                {notice.publishedBy}
              </span>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              {formattedDate}
            </span>
          </div>

          <button
            onClick={() => setIsOpen(true)}
            className="flex items-center gap-1 text-xs font-semibold text-blue-600 group-hover:translate-x-1 transition-transform"
          >
            Read <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </motion.div>

      {/* Modal Popup */}
      <NoticeModal notice={notice} isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
