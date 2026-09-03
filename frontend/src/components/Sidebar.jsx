'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  CalendarDays, 
  CheckCircle2, 
  ClipboardList, 
  FolderOpen, 
  MessageSquare, 
  Star, 
  Bell, 
  Crown, 
  Users,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  X,
  Sparkles,
  User,
  LogOut,
  Award,
  FileText,
  BadgeCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Sidebar({ isOpen, onClose, isCollapsed, onToggleCollapse, hasNotices, hasUrgentNotice }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const mainGroup = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Class Routine', href: '/routine', icon: CalendarDays },
  ];

  const academicsGroup = [
    { name: 'Attendance & Marks', href: '/marks', icon: Award },
    { name: 'Exam & Admit Card', href: '/exams', icon: FileText },
    { name: 'One-Day Permits', href: '/permits', icon: BadgeCheck },
    { name: 'Assignments & Tasks', href: '/assignments', icon: ClipboardList },
    { name: 'Resource Locker', href: '/resources', icon: FolderOpen },
  ];

  const communityGroup = [
    { name: 'Course Q&A Forum', href: '/forum', icon: MessageSquare },
    { name: 'Teacher Feedback', href: '/feedback', icon: Star },
    { name: 'Academic Notices', href: '/notices', icon: Bell, hasBadge: true },
  ];

  const adminGroup = user?.role === 'admin'
    ? [{ name: 'Admin Control Panel', href: '/admin', icon: Crown }]
    : user?.role === 'faculty'
    ? [{ name: 'Students & CR Directory', href: '/admin', icon: Users }]
    : [];

  const navGroups = [
    { title: 'MAIN', links: mainGroup },
    { title: 'ACADEMICS', links: academicsGroup },
    { title: 'COMMUNITY & GOVERNANCE', links: communityGroup },
    ...(adminGroup.length > 0 ? [{ title: 'ADMINISTRATION', links: adminGroup }] : []),
  ];

  return (
    <>
      {/* Mobile Drawer Overlay Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar Navigation Panel */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-r border-slate-200 dark:border-slate-800 transition-all duration-300 flex flex-col justify-between ${
          /* Desktop Width */
          isCollapsed ? 'lg:w-20' : 'lg:w-80'
        } ${
          /* Mobile Drawer Positioning */
          isOpen ? 'translate-x-0 w-80' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Top Header: Brand & Collapse Toggle */}
        <div className="h-16 sm:h-20 px-4 flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 shrink-0">
          <Link 
            href="/" 
            onClick={onClose}
            className="flex items-center gap-3 overflow-hidden group"
          >
            <div className="w-10 h-10 rounded-xl bg-slate-900 dark:bg-blue-600 flex items-center justify-center text-white shadow-md shrink-0 group-hover:scale-105 transition-transform">
              <GraduationCap className="w-5 h-5 text-blue-400 dark:text-white" />
            </div>

            {(!isCollapsed || isOpen) && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                className="whitespace-nowrap"
              >
                <div className="flex items-center gap-1.5">
                  <span className="font-black text-lg tracking-tight text-slate-900 dark:text-white">UniPortal</span>
                  <span className="text-[9px] uppercase font-extrabold tracking-wider px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-800">System</span>
                </div>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">Metropolitan University</p>
              </motion.div>
            )}
          </Link>

          {/* Desktop Collapse Toggle / Mobile Close Button */}
          <div className="flex items-center gap-1">
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden transition-colors"
              title="Close menu"
            >
              <X className="w-5 h-5" />
            </button>

            <button
              onClick={onToggleCollapse}
              className="hidden lg:flex p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
              aria-label={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            >
              {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Scrollable Navigation Items */}
        <div className="flex-1 overflow-y-auto py-6 px-3 space-y-6 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800">
          {navGroups.map((group, groupIdx) => (
            <div key={groupIdx} className="space-y-1.5">
              {/* Group Title */}
              {(!isCollapsed || isOpen) ? (
                <h4 className="px-3 text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  {group.title}
                </h4>
              ) : (
                <div className="h-px bg-slate-200 dark:bg-slate-800 mx-2 my-3" />
              )}

              {/* Group Links */}
              {group.links.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={onClose}
                    title={isCollapsed && !isOpen ? link.name : undefined}
                    className={`relative flex items-center gap-3 px-3 py-2.5 rounded-2xl text-xs font-bold transition-all group ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="relative shrink-0">
                      <Icon className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                        isActive ? 'text-white' : 'text-slate-500 dark:text-slate-400'
                      }`} />

                      {link.hasBadge && hasNotices && (
                        <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 bg-blue-500" />
                          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-600" />
                        </span>
                      )}
                    </div>

                    {(!isCollapsed || isOpen) && (
                      <span className="truncate">{link.name}</span>
                    )}

                    {/* Active Route Indicator Bar */}
                    {isActive && (!isCollapsed || isOpen) && (
                      <motion.div
                        layoutId="sidebar-active-indicator"
                        className="absolute right-2 w-1.5 h-4 rounded-full bg-white"
                      />
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </div>

        {/* Sidebar Footer: Profile Quick Status */}
        {user && (!isCollapsed || isOpen) && (
          <div className="p-3 border-t border-slate-100 dark:border-slate-800/80 shrink-0">
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between">
              <div className="flex items-center gap-2.5 overflow-hidden">
                <div className="w-8 h-8 rounded-xl bg-blue-600 text-white font-extrabold flex items-center justify-center text-xs shrink-0 shadow-sm">
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.name} className="w-full h-full object-cover rounded-xl" />
                  ) : (
                    <span>{user.name ? user.name.charAt(0) : 'U'}</span>
                  )}
                </div>
                <div className="truncate text-xs">
                  <p className="font-bold text-slate-900 dark:text-white truncate">{user.name}</p>
                  <p className="text-[10px] text-slate-400 capitalize truncate">
                    {user.isCR ? 'Class Rep' : user.role}
                  </p>
                </div>
              </div>

              <Link
                href="/profile"
                onClick={onClose}
                className="p-1.5 rounded-xl text-slate-400 hover:text-blue-600 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                title="Profile Settings"
              >
                <User className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}
