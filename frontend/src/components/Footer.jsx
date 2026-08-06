import React from 'react';
import { GraduationCap, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-slate-100 py-12 mt-20 text-slate-500 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-white">
              <GraduationCap className="w-4 h-4 text-blue-400" />
            </div>
            <div>
              <p className="font-bold text-slate-900 text-sm">UniPortal System</p>
              <p className="text-[11px] text-slate-400">© 2026 Metropolitan University System. All rights reserved.</p>
            </div>
          </div>

          <div className="flex items-center gap-6 font-medium text-slate-600">
            <a href="/notices" className="hover:text-slate-900 transition-colors">Notice Board</a>
            <a href="/routine" className="hover:text-slate-900 transition-colors">Class Schedule</a>
            <a href="/announcements" className="hover:text-slate-900 transition-colors">Announcements</a>
          </div>

          <div className="flex items-center gap-1 text-[11px] text-slate-400">
            <span>Built with white minimal aesthetic for</span>
            <span className="font-semibold text-slate-700">Students & Faculty</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
