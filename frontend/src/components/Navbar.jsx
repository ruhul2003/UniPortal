'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { 
  GraduationCap, 
  Bell, 
  Menu,
  User, 
  LogOut, 
  UserCheck, 
  ArrowRightLeft,
  Sun,
  Moon,
  Crown,
  Users,
  PanelLeft
} from 'lucide-react';
import { motion } from 'framer-motion';
import { fetchNotices } from '../lib/api';

export default function Navbar({ onToggleSidebar, isSidebarCollapsed }) {
  const pathname = usePathname();
  const { user, logout, switchRole } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showRoleMenu, setShowRoleMenu] = useState(false);

  // Notice signal state
  const [hasNotices, setHasNotices] = useState(false);
  const [hasUrgentNotice, setHasUrgentNotice] = useState(false);

  useEffect(() => {
    async function checkNotices() {
      try {
        const data = await fetchNotices();
        if (Array.isArray(data) && data.length > 0) {
          setHasNotices(true);
          setHasUrgentNotice(data.some(n => n.isUrgent));
        } else {
          setHasNotices(false);
        }
      } catch (err) {
        console.warn('Navbar notice check error:', err);
      }
    }
    checkNotices();
  }, [pathname]);

  const getCurrentRoleBadge = () => {
    if (!user) return { label: 'Guest', color: 'bg-slate-400' };
    if (user.role === 'admin') return { label: 'Admin View', color: 'bg-purple-500' };
    if (user.role === 'faculty') return { label: 'Faculty View', color: 'bg-indigo-500' };
    if (user.isCR) return { label: 'CR View', color: 'bg-amber-500' };
    return { label: 'Student View', color: 'bg-emerald-500' };
  };

  const currentBadge = getCurrentRoleBadge();

  return (
    <header className="sticky top-0 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 transition-colors">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Left Controls: Sidebar Toggle & Brand Logo */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Sidebar Toggle Button */}
            <button
              onClick={onToggleSidebar}
              className="p-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all shadow-xs flex items-center justify-center"
              title="Toggle Sidebar Navigation"
            >
              <PanelLeft className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </button>

            {/* Brand Title */}
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-slate-900 dark:bg-blue-600 flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
                <GraduationCap className="w-5 h-5 text-blue-400 dark:text-white" />
              </div>
              <div className="hidden xs:block">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-lg sm:text-xl tracking-tight text-slate-900 dark:text-white">UniPortal</span>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-800/60">Academic</span>
                </div>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 hidden sm:block">Metropolitan University System</p>
              </div>
            </Link>
          </div>

          {/* Right Controls: View Mode Switcher, Theme & Profile */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              className="p-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all shadow-xs"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400 fill-amber-400/20" />
              ) : (
                <Moon className="w-4 h-4 text-slate-600" />
              )}
            </button>

            {user ? (
              <div className="flex items-center gap-2">
                
                {/* 4-Way Role View Switcher Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => {
                      setShowRoleMenu(!showRoleMenu);
                      setShowProfileMenu(false);
                    }}
                    title="Switch portal view mode (Student, CR, Faculty, Admin)"
                    className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all shadow-xs"
                  >
                    <ArrowRightLeft className="w-3.5 h-3.5 text-blue-500" />
                    <span className="hidden sm:inline">{currentBadge.label}</span>
                    <span className={`w-2 h-2 rounded-full ${currentBadge.color}`} />
                  </button>

                  {/* Role Picker Menu */}
                  {showRoleMenu && (
                    <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xl py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                      <div className="px-3 py-1.5 border-b border-slate-100 dark:border-slate-800 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Select Portal View Mode
                      </div>

                      <button
                        onClick={() => {
                          switchRole('student');
                          setShowRoleMenu(false);
                        }}
                        className={`w-full px-3.5 py-2 text-left text-xs font-semibold flex items-center justify-between transition-colors ${
                          user.role === 'student' && !user.isCR 
                            ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 font-bold' 
                            : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <GraduationCap className="w-4 h-4 text-emerald-500" />
                          Student View
                        </span>
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      </button>

                      <button
                        onClick={() => {
                          switchRole('cr');
                          setShowRoleMenu(false);
                        }}
                        className={`w-full px-3.5 py-2 text-left text-xs font-semibold flex items-center justify-between transition-colors ${
                          user.role === 'student' && user.isCR 
                            ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 font-bold' 
                            : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <Crown className="w-4 h-4 text-amber-500 fill-amber-400/20" />
                          CR View (Class Rep)
                        </span>
                        <span className="w-2 h-2 rounded-full bg-amber-500" />
                      </button>

                      <button
                        onClick={() => {
                          switchRole('faculty');
                          setShowRoleMenu(false);
                        }}
                        className={`w-full px-3.5 py-2 text-left text-xs font-semibold flex items-center justify-between transition-colors ${
                          user.role === 'faculty' 
                            ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 font-bold' 
                            : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <UserCheck className="w-4 h-4 text-indigo-500" />
                          Faculty View
                        </span>
                        <span className="w-2 h-2 rounded-full bg-indigo-500" />
                      </button>

                      <button
                        onClick={() => {
                          switchRole('admin');
                          setShowRoleMenu(false);
                        }}
                        className={`w-full px-3.5 py-2 text-left text-xs font-semibold flex items-center justify-between transition-colors ${
                          user.role === 'admin' 
                            ? 'bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 font-bold' 
                            : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <Crown className="w-4 h-4 text-purple-500 fill-purple-400/20" />
                          Admin View
                        </span>
                        <span className="w-2 h-2 rounded-full bg-purple-500" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Profile Pill Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => {
                      setShowProfileMenu(!showProfileMenu);
                      setShowRoleMenu(false);
                    }}
                    className="flex items-center gap-2.5 p-1.5 sm:px-3 sm:py-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900 transition-all text-left"
                  >
                    <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center font-bold text-slate-700 dark:text-slate-200 text-xs relative overflow-visible">
                      {user.avatar ? (
                        <img src={user.avatar} alt={user.name} className="w-full h-full rounded-xl object-cover" />
                      ) : (
                        <span>{user.name ? user.name.charAt(0) : 'U'}</span>
                      )}
                      {user.isCR && (
                        <Crown className="w-3.5 h-3.5 text-amber-500 fill-amber-400 absolute -top-1 -right-1 z-10" />
                      )}
                    </div>
                    <div className="hidden sm:block text-xs">
                      <div className="flex items-center gap-1">
                        <p className="font-bold text-slate-800 dark:text-slate-100 line-clamp-1">{user.name}</p>
                        {user.isCR && <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400">CR</span>}
                      </div>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 capitalize">
                        {user.isCR ? 'Class Rep' : user.role} {user.role === 'student' && user.section ? `• ${user.section}` : ''}
                      </p>
                    </div>
                  </button>

                  {/* Dropdown Menu */}
                  {showProfileMenu && (
                    <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xl py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                      <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-bold text-slate-900 dark:text-white">{user.name}</p>
                          {user.isCR && (
                            <span className="px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 font-extrabold text-[9px] flex items-center gap-0.5">
                              <Crown className="w-3 h-3 text-amber-500 fill-amber-400" />
                              CR
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate">{user.email}</p>
                        <div className="mt-1.5 flex items-center gap-1">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${
                            user.role === 'admin' ? 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300' : user.role === 'faculty' ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300' : user.isCR ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300' : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                          }`}>
                            {user.isCR ? 'Class Rep (CR)' : user.role}
                          </span>
                          {user.role === 'student' && user.section && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
                              {user.section}
                            </span>
                          )}
                        </div>
                      </div>

                      <Link
                        href="/profile"
                        onClick={() => setShowProfileMenu(false)}
                        className="w-full px-4 py-2 text-left text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2 transition-colors"
                      >
                        <User className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                        My Profile Settings
                      </Link>

                      {user.role === 'admin' && (
                        <Link
                          href="/admin"
                          onClick={() => setShowProfileMenu(false)}
                          className="w-full px-4 py-2 text-left text-xs font-semibold text-purple-700 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-950/40 flex items-center gap-2 transition-colors"
                        >
                          <Crown className="w-3.5 h-3.5 text-purple-500" />
                          Admin Control Center
                        </Link>
                      )}

                      {user.role === 'faculty' && (
                        <Link
                          href="/admin"
                          onClick={() => setShowProfileMenu(false)}
                          className="w-full px-4 py-2 text-left text-xs font-semibold text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-950/40 flex items-center gap-2 transition-colors"
                        >
                          <Users className="w-3.5 h-3.5 text-blue-500" />
                          Student Directory & CRs
                        </Link>
                      )}

                      <div className="my-1 border-t border-slate-100 dark:border-slate-800" />

                      <button
                        onClick={() => {
                          logout();
                          setShowProfileMenu(false);
                        }}
                        className="w-full px-4 py-2 text-left text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-2 transition-colors font-medium"
                      >
                        <LogOut className="w-3.5 h-3.5 text-rose-500" />
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-blue-600 hover:bg-slate-800 dark:hover:bg-blue-700 text-white text-xs font-semibold transition-all shadow-sm"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
