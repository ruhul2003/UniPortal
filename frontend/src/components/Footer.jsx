import React from 'react';
import { GraduationCap, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 py-8 sm:py-12 mt-12 sm:mt-20 pb-28 md:pb-12 text-slate-500 text-xs transition-colors">
      <div className="max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-slate-900 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-white shrink-0">
              <GraduationCap className="w-4 h-4 text-blue-400" />
            </div>
            <div>
              <p className="font-bold text-slate-900 dark:text-white text-sm">UniPortal System</p>
              <p className="text-[11px] text-slate-400 dark:text-slate-500">© 2026 Metropolitan University System. All rights reserved.</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 font-medium text-slate-600 dark:text-slate-400">
            <a href="/notices" className="hover:text-slate-900 dark:hover:text-white transition-colors touch-manipulation py-1">Notice Board</a>
            <a href="/routine" className="hover:text-slate-900 dark:hover:text-white transition-colors touch-manipulation py-1">Class Schedule</a>
            <a href="/announcements" className="hover:text-slate-900 dark:hover:text-white transition-colors touch-manipulation py-1">Announcements</a>
          </div>

          <div className="flex items-center gap-1 text-[11px] text-slate-400 dark:text-slate-500">
            <span>Built with modern campus design for</span>
            <span className="font-semibold text-slate-700 dark:text-slate-300">Students & Faculty</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
