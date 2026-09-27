'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  CalendarDays, 
  Award, 
  FileText, 
  Menu, 
  Crown, 
  Star, 
  ClipboardList, 
  Bell 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function MobileBottomNav({ onOpenMenu, hasNotices, hasUrgentNotice }) {
  const pathname = usePathname();
  const { user } = useAuth();

  // Role-based quick nav items for mobile
  const getMobileTabs = () => {
    if (!user) {
      return [
        { name: 'Home', href: '/', icon: LayoutDashboard },
        { name: 'Routine', href: '/routine', icon: CalendarDays },
        { name: 'Notices', href: '/notices', icon: Bell, hasBadge: true },
        { name: 'Exams', href: '/exams', icon: FileText },
        { name: 'Menu', isAction: true, icon: Menu, action: onOpenMenu },
      ];
    }

    if (user.role === 'admin') {
      return [
        { name: 'Home', href: '/', icon: LayoutDashboard },
        { name: 'Admin', href: '/admin', icon: Crown },
        { name: 'Marks', href: '/marks', icon: Award },
        { name: 'Notices', href: '/notices', icon: Bell, hasBadge: true },
        { name: 'Menu', isAction: true, icon: Menu, action: onOpenMenu },
      ];
    }

    if (user.role === 'faculty') {
      return [
        { name: 'Home', href: '/', icon: LayoutDashboard },
        { name: 'Marks', href: '/marks', icon: Award },
        { name: 'Routine', href: '/routine', icon: CalendarDays },
        { name: 'Feedback', href: '/feedback', icon: Star },
        { name: 'Menu', isAction: true, icon: Menu, action: onOpenMenu },
      ];
    }

    if (user.isCR) {
      return [
        { name: 'Home', href: '/', icon: LayoutDashboard },
        { name: 'Routine', href: '/routine', icon: CalendarDays },
        { name: 'Marks', href: '/marks', icon: Award },
        { name: 'Tasks', href: '/assignments', icon: ClipboardList },
        { name: 'Menu', isAction: true, icon: Menu, action: onOpenMenu },
      ];
    }

    // Default Student
    return [
      { name: 'Home', href: '/', icon: LayoutDashboard },
      { name: 'Routine', href: '/routine', icon: CalendarDays },
      { name: 'Marks', href: '/marks', icon: Award },
      { name: 'Exams', href: '/exams', icon: FileText },
      { name: 'Menu', isAction: true, icon: Menu, action: onOpenMenu },
    ];
  };

  const tabs = getMobileTabs();

  return (
    <nav 
      aria-label="Mobile Bottom Navigation"
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-t border-slate-200/80 dark:border-slate-800/80 pb-safe transition-colors"
    >
      <div className="flex items-center justify-around px-2 py-1.5 h-16 max-w-lg mx-auto">
        {tabs.map((tab, idx) => {
          const Icon = tab.icon;
          const isActive = !tab.isAction && pathname === tab.href;

          if (tab.isAction) {
            return (
              <button
                key={idx}
                type="button"
                onClick={tab.action}
                className="relative flex-1 flex flex-col items-center justify-center py-1 min-h-[48px] text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 active:scale-95 transition-all touch-manipulation group"
                aria-label="Open Navigation Menu"
              >
                <div className="relative flex items-center justify-center w-8 h-8 rounded-full group-hover:bg-slate-100 dark:group-hover:bg-slate-800 transition-colors">
                  <Icon className="w-5 h-5 transition-transform group-hover:scale-110" />
                  {hasNotices && (
                    <span className="absolute top-1 right-1 flex h-2 w-2">
                      <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${hasUrgentNotice ? 'bg-rose-500' : 'bg-blue-500'}`} />
                      <span className={`relative inline-flex rounded-full h-2 w-2 ${hasUrgentNotice ? 'bg-rose-600' : 'bg-blue-600'}`} />
                    </span>
                  )}
                </div>
                <span className="text-[10px] font-semibold mt-0.5 tracking-tight">{tab.name}</span>
              </button>
            );
          }

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`relative flex-1 flex flex-col items-center justify-center py-1 min-h-[48px] active:scale-95 transition-all touch-manipulation group ${
                isActive 
                  ? 'text-blue-600 dark:text-blue-400 font-bold' 
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 font-medium'
              }`}
            >
              <div className="relative flex items-center justify-center w-8 h-8 rounded-full">
                {isActive && (
                  <motion.div
                    layoutId="mobile-nav-active-pill"
                    className="absolute inset-0 bg-blue-50 dark:bg-blue-950/60 rounded-xl"
                    transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                  />
                )}
                <Icon className={`relative z-10 w-5 h-5 transition-transform group-hover:scale-110 ${
                  isActive ? 'text-blue-600 dark:text-blue-400' : ''
                }`} />

                {tab.hasBadge && hasNotices && (
                  <span className="absolute top-1 right-1 z-20 flex h-2 w-2">
                    <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${hasUrgentNotice ? 'bg-rose-500' : 'bg-blue-500'}`} />
                    <span className={`relative inline-flex rounded-full h-2 w-2 ${hasUrgentNotice ? 'bg-rose-600' : 'bg-blue-600'}`} />
                  </span>
                )}
              </div>

              <span className="text-[10px] mt-0.5 tracking-tight truncate max-w-[64px]">
                {tab.name}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
