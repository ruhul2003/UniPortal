'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { 
  GraduationCap, 
  Bell, 
  CalendarDays, 
  Megaphone, 
  LayoutDashboard, 
  User, 
  LogOut, 
  LogIn, 
  UserCheck, 
  Sparkles,
  ArrowRightLeft,
  Sun,
  Moon,
  Crown,
  Users
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function Navbar() {
  const pathname = usePathname();
  const { user, logout, toggleRole } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const baseNavLinks = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Faculty Members', href: '/faculty', icon: GraduationCap },
    { name: 'Notices', href: '/notices', icon: Bell },
    { name: 'Class Routine', href: '/routine', icon: CalendarDays },
    { name: 'Announcements', href: '/announcements', icon: Megaphone },
  ];

  const navLinks = user?.role === 'admin' 
    ? [...baseNavLinks, { name: 'Admin Panel', href: '/admin', icon: Crown }] 
    : user?.role === 'faculty'
    ? [...baseNavLinks, { name: 'Students & CRs', href: '/admin', icon: Users }]
    : baseNavLinks;

  return (
    <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 transition-colors">
      <div className="max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Logo & Brand */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-slate-900 dark:bg-blue-600 flex items-center justify-center text-white shadow-md shadow-slate-200 dark:shadow-none group-hover:scale-105 transition-transform">
              <GraduationCap className="w-5 h-5 text-blue-400 dark:text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-lg sm:text-xl tracking-tight text-slate-900 dark:text-white">UniPortal</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-800/60">Academic</span>
              </div>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 hidden sm:block">Metropolitan University System</p>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
                    isActive 
                      ? 'text-slate-900 dark:text-white font-semibold' 
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500'}`} />
                  {link.name}
                  {isActive && (
                    <motion.div
                      layoutId="nav-active-indicator"
                      className="absolute inset-0 rounded-xl bg-slate-100 dark:bg-slate-800 -z-10"
                      transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* User Controls, Theme Toggle & Role Quick Switch */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              className="p-2 rounded-full border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all shadow-xs"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400 fill-amber-400/20" />
              ) : (
                <Moon className="w-4 h-4 text-slate-600" />
              )}
            </button>

            {user ? (
              <div className="flex items-center gap-2">
                {/* Role Switcher Pill */}
                <button
                  onClick={toggleRole}
                  title="Click to toggle between Student and Faculty role view"
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all shadow-xs"
                >
                  <ArrowRightLeft className="w-3 h-3 text-blue-500" />
                  <span className="capitalize">{user.role} View</span>
                  <span className={`w-2 h-2 rounded-full ${user.role === 'admin' ? 'bg-purple-500' : user.role === 'faculty' ? 'bg-indigo-500' : 'bg-emerald-500'}`} />
                </button>

                {/* Profile Pill Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                    className="flex items-center gap-2.5 p-1.5 sm:px-3 sm:py-1.5 rounded-full border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900 transition-all text-left"
                  >
                    <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center font-bold text-slate-700 dark:text-slate-200 text-xs relative overflow-visible">
                      {user.avatar ? (
                        <img src={user.avatar} alt={user.name} className="w-full h-full rounded-full object-cover" />
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
                        {user.role} {user.role === 'student' && user.section ? `• ${user.section}` : ''}
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
                            user.role === 'admin' ? 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300' : user.role === 'faculty' ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300' : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                          }`}>
                            {user.role}
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

                      <button
                        onClick={toggleRole}
                        className="w-full px-4 py-2 text-left text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2 transition-colors"
                      >
                        <UserCheck className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                        Switch to {user.role === 'student' ? 'Faculty' : 'Student'} Mode
                      </button>

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

        {/* Mobile Navigation bar */}
        <div className="flex md:hidden items-center justify-around py-2.5 border-t border-slate-100 dark:border-slate-800 text-xs">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex flex-col items-center gap-1 ${
                  isActive ? 'text-blue-600 dark:text-blue-400 font-bold' : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-[10px]">{link.name}</span>
              </Link>
            );
          })}
        </div>

      </div>
    </header>
  );
}
