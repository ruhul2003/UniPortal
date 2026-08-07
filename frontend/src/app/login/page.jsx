'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { GraduationCap, LogIn, Sparkles, User, Lock, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { loginUser } from '../../lib/api';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await loginUser(email, password);
      login(user);
      router.push('/');
    } catch (err) {
      setError(err.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const setDemoRole = (role) => {
    if (role === 'admin') {
      setEmail('admin@gmail.com');
      setPassword('admin123');
    } else if (role === 'faculty') {
      setEmail('sarah.jenkins@univ.edu');
      setPassword('password123');
    } else {
      setEmail('alex.rivera@student.univ.edu');
      setPassword('password123');
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="max-w-md mx-auto py-12"
    >
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-100 dark:border-slate-800 shadow-xl space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <motion.div 
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className="w-12 h-12 rounded-2xl bg-slate-900 dark:bg-blue-600 text-white flex items-center justify-center mx-auto shadow-md"
          >
            <GraduationCap className="w-6 h-6 text-blue-400 dark:text-white" />
          </motion.div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">Sign In to UniPortal</h1>
          <p className="text-xs text-slate-400 dark:text-slate-500">Access student notices, class schedules & admin management</p>
        </div>

        {/* Quick Demo Credentials Autofill */}
        <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-xs space-y-2">
          <p className="font-semibold text-slate-700 dark:text-slate-300 text-center text-[11px] uppercase tracking-wider">Quick Demo Autofill</p>
          <div className="grid grid-cols-3 gap-1.5">
            <motion.button
              type="button"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setDemoRole('student')}
              className="py-1.5 px-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-blue-500 text-slate-700 dark:text-slate-200 font-medium text-center text-[11px] shadow-sm transition-colors"
            >
              👨‍🎓 Student
            </motion.button>
            <motion.button
              type="button"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setDemoRole('faculty')}
              className="py-1.5 px-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-indigo-500 text-slate-700 dark:text-slate-200 font-medium text-center text-[11px] shadow-sm transition-colors"
            >
              👩‍🏫 Faculty
            </motion.button>
            <motion.button
              type="button"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setDemoRole('admin')}
              className="py-1.5 px-2 rounded-xl bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800/60 hover:border-purple-500 text-purple-700 dark:text-purple-300 font-bold text-center text-[11px] shadow-sm transition-colors"
            >
              👑 Admin
            </motion.button>
          </div>
        </div>

        <AnimatePresence>
          {error && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="p-3 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 text-xs flex items-center gap-2 overflow-hidden"
            >
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
              <span>{error}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">University Email</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@student.univ.edu"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                required
              />
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-slate-900 dark:bg-blue-600 hover:bg-slate-800 dark:hover:bg-blue-500 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-sm transition-all disabled:opacity-50"
          >
            <LogIn className="w-4 h-4 text-blue-400 dark:text-white" />
            {loading ? 'Authenticating...' : 'Sign In'}
          </motion.button>
        </form>

        <div className="text-center text-xs text-slate-400 dark:text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800">
          Don't have an account?{' '}
          <Link href="/register" className="font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700">
            Register here
          </Link>
        </div>

      </div>
    </motion.div>
  );
}

