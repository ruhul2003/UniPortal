'use client';

import React from 'react';
import { Pin, Calendar, Tag, Trash2, Megaphone } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

export default function AnnouncementCard({ announcement, onDelete }) {
  const { user } = useAuth();
  const isFaculty = user?.role === 'faculty' || user?.role === 'admin';

  const tagStyle = 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700';
  const formattedDate = announcement.date
    ? new Date(announcement.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : 'Recent';

  return (
    <motion.div
      whileHover={{ y: -2 }}
      className={`bg-white dark:bg-slate-900 rounded-2xl p-6 border ${
        announcement.isPinned ? 'border-slate-400 dark:border-slate-700' : 'border-slate-200 dark:border-slate-800'
      } shadow-sm hover:shadow-md transition-all duration-200 relative group`}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          {announcement.isPinned && (
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-900 dark:bg-slate-800 text-white border border-slate-700 flex items-center gap-1">
              <Pin className="w-3 h-3 fill-current" /> PINNED
            </span>
          )}
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${tagStyle}`}>
            {announcement.tag || 'General'}
          </span>
        </div>

        {isFaculty && (
          <button
            onClick={() => onDelete?.(announcement._id)}
            className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-600 transition-opacity"
            title="Delete Announcement"
            aria-label="Delete Announcement"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      <h3 className="text-lg font-bold text-slate-900 mb-2 leading-snug">
        {announcement.title}
      </h3>

      <p className="text-sm text-slate-600 leading-relaxed mb-4">
        {announcement.description}
      </p>

      <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400 font-medium">
        <span>By {announcement.publishedBy}</span>
        <span className="flex items-center gap-1">
          <Calendar className="w-3.5 h-3.5" />
          {formattedDate}
        </span>
      </div>
    </motion.div>
  );
}
