'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
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
  ArrowRightLeft
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function Navbar() {
  const pathname = usePathname();
  const { user, logout, toggleRole } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const navLinks = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Notices', href: '/notices', icon: Bell },
    { name: 'Class Routine', href: '/routine', icon: CalendarDays },
    { name: 'Announcements', href: '/announcements', icon: Megaphone },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-100 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Logo & Brand */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white shadow-md shadow-slate-200 group-hover:scale-105 transition-transform">
              <GraduationCap className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-lg sm:text-xl tracking-tight text-slate-900">UniPortal</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-blue-50 text-blue-600 border border-blue-100">Academic</span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">Metropolitan University System</p>
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
                      ? 'text-slate-900 font-semibold' 
                      : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                  {link.name}
                  {isActive && (
                    <motion.div
                      layoutId="nav-active-indicator"
                      className="absolute inset-0 rounded-xl bg-slate-100 -z-10"
                      transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* User Controls & Role Quick Switch */}
          <div className="flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-2">
                {/* Role Switcher Pill */}
                <button
                  onClick={toggleRole}
                  title="Click to toggle between Student and Faculty role view"
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 hover:border-slate-300 transition-all shadow-xs"
                >
                  <ArrowRightLeft className="w-3 h-3 text-blue-500" />
                  <span className="capitalize">{user.role} View</span>
                  <span className={`w-2 h-2 rounded-full ${user.role === 'faculty' ? 'bg-indigo-500' : 'bg-emerald-500'}`} />
                </button>

                {/* Profile Pill Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                    className="flex items-center gap-2.5 p-1.5 sm:px-3 sm:py-1.5 rounded-full border border-slate-200 hover:border-slate-300 bg-white transition-all text-left"
                  >
                    <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-700 text-xs">
                      {user.name ? user.name.charAt(0) : 'U'}
                    </div>
                    <div className="hidden sm:block text-xs">
                      <p className="font-bold text-slate-800 line-clamp-1">{user.name}</p>
                      <p className="text-[10px] text-slate-400 capitalize">{user.role}</p>
                    </div>
                  </button>

                  {/* Dropdown Menu */}
                  {showProfileMenu && (
                    <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white border border-slate-100 shadow-xl py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                      <div className="px-4 py-2 border-b border-slate-100">
                        <p className="text-xs font-bold text-slate-900">{user.name}</p>
                        <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
                        <div className="mt-1.5 flex items-center gap-1">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${
                            user.role === 'faculty' ? 'bg-indigo-50 text-indigo-700' : 'bg-emerald-50 text-emerald-700'
                          }`}>
                            {user.role}
                          </span>
                          <span className="text-[10px] text-slate-400">• {user.department || 'CSE'}</span>
                        </div>
                      </div>

                      <button
                        onClick={toggleRole}
                        className="w-full px-4 py-2 text-left text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 transition-colors"
                      >
                        <UserCheck className="w-3.5 h-3.5 text-blue-600" />
                        Switch to {user.role === 'student' ? 'Faculty' : 'Student'} Mode
                      </button>

                      <div className="my-1 border-t border-slate-100" />

                      <button
                        onClick={() => {
                          logout();
                          setShowProfileMenu(false);
                        }}
                        className="w-full px-4 py-2 text-left text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2 transition-colors font-medium"
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
                  className="px-4 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-all shadow-sm"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="flex md:hidden items-center justify-around py-2.5 border-t border-slate-100 text-xs">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex flex-col items-center gap-1 ${
                  isActive ? 'text-blue-600 font-bold' : 'text-slate-500'
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
