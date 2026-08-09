'use client';

import React, { useState, useEffect } from 'react';
import { X, Plus, CalendarDays, Edit3 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

export default function AddRoutineModal({ isOpen, onClose, onSubmit, routineToEdit = null }) {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    courseCode: '',
    courseTitle: '',
    day: 'Monday',
    startTime: '09:00 AM',
    endTime: '10:30 AM',
    room: 'Lab 402',
    building: 'Academic Building 1',
    semester: 'Spring 2026',
    section: 'A',
    facultyName: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (routineToEdit) {
      setFormData({
        courseCode: routineToEdit.courseCode || '',
        courseTitle: routineToEdit.courseTitle || '',
        day: routineToEdit.day || 'Monday',
        startTime: routineToEdit.startTime || '09:00 AM',
        endTime: routineToEdit.endTime || '10:30 AM',
        room: routineToEdit.room || 'Lab 402',
        building: routineToEdit.building || 'Academic Building 1',
        semester: routineToEdit.semester || 'Spring 2026',
        section: routineToEdit.section || 'A',
        facultyName: routineToEdit.facultyName || user?.name || 'Dr. Sarah Jenkins'
      });
    } else {
      setFormData({
        courseCode: '',
        courseTitle: '',
        day: 'Monday',
        startTime: '09:00 AM',
        endTime: '10:30 AM',
        room: 'Lab 402',
        building: 'Academic Building 1',
        semester: 'Spring 2026',
        section: 'A',
        facultyName: user?.name || 'Dr. Sarah Jenkins'
      });
    }
  }, [routineToEdit, isOpen, user]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.courseCode || !formData.courseTitle) {
      setError('Please fill in Course Code and Title');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await onSubmit({
        ...formData,
        facultyName: formData.facultyName || user?.name || 'Dr. Sarah Jenkins',
      });
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save class schedule');
    } finally {
      setLoading(false);
    }
  };

  const isEditMode = !!routineToEdit;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-modal border border-slate-100 dark:border-slate-800 relative max-h-[90vh] overflow-y-auto"
        >
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                {isEditMode ? <Edit3 className="w-4 h-4" /> : <CalendarDays className="w-4 h-4" />}
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  {isEditMode ? 'Edit Class Schedule' : 'Add Class Schedule'}
                </h2>
                <p className="text-xs text-slate-400">
                  {user?.isCR ? 'Class Representative Timetable Manager' : 'Faculty Timetable Builder'}
                </p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800">
              <X className="w-5 h-5" />
            </button>
          </div>

          {error && <p className="mb-4 text-xs text-rose-600 bg-rose-50 dark:bg-rose-950/40 p-3 rounded-xl border border-rose-100 dark:border-rose-900">{error}</p>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Course Code *</label>
                <input
                  type="text"
                  placeholder="e.g. CSE-3101"
                  value={formData.courseCode}
                  onChange={(e) => setFormData({ ...formData, courseCode: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white text-xs focus:ring-2 focus:ring-indigo-500/20"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Section</label>
                <input
                  type="text"
                  value={formData.section}
                  onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Course Title *</label>
              <input
                type="text"
                placeholder="e.g. Database Management Systems"
                value={formData.courseTitle}
                onChange={(e) => setFormData({ ...formData, courseTitle: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white text-xs focus:ring-2 focus:ring-indigo-500/20"
                required
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Day</label>
                <select
                  value={formData.day}
                  onChange={(e) => setFormData({ ...formData, day: e.target.value })}
                  className="w-full px-2 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white text-xs bg-white"
                >
                  {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Start Time</label>
                <input
                  type="text"
                  placeholder="09:00 AM"
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  className="w-full px-2 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">End Time</label>
                <input
                  type="text"
                  placeholder="10:30 AM"
                  value={formData.endTime}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  className="w-full px-2 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Room / Lab</label>
                <input
                  type="text"
                  placeholder="Lab 402"
                  value={formData.room}
                  onChange={(e) => setFormData({ ...formData, room: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Building</label>
                <input
                  type="text"
                  placeholder="IT Complex"
                  value={formData.building}
                  onChange={(e) => setFormData({ ...formData, building: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Faculty Name</label>
              <input
                type="text"
                placeholder="Dr. Sarah Jenkins"
                value={formData.facultyName}
                onChange={(e) => setFormData({ ...formData, facultyName: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white text-xs"
              />
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
              <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300">Cancel</button>
              <button type="submit" disabled={loading} className="px-5 py-2 rounded-xl bg-slate-900 dark:bg-indigo-600 text-white text-xs font-semibold hover:bg-slate-800 dark:hover:bg-indigo-500">
                {isEditMode ? (loading ? 'Saving...' : 'Save Changes') : (loading ? 'Adding...' : 'Add Slot')}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

